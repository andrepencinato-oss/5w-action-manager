# Configurações do Servidor
$port = 3000
$url = "http://localhost:$port/"

# Cria o listener HTTP do Windows
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  Servidor do Monitor de Ações 5W2H / FCA Iniciado!" -ForegroundColor Green
    Write-Host "  Rodando em: $url" -ForegroundColor Yellow
    Write-Host "  Para desligar o servidor, basta fechar esta janela." -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan
    
    # Abre o navegador padrão do usuário automaticamente no link
    Start-Process $url
} catch {
    Write-Host "Erro ao iniciar o servidor: $_" -ForegroundColor Red
    Write-Host "Certifique-se de que a porta $port não está em uso por outro programa." -ForegroundColor LightRed
    Read-Host "Pressione Enter para sair..."
    exit
}

# Loop de escuta de requisições
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        
        # Resolve o caminho do arquivo solicitado
        $urlPath = $req.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        # Corrige caminhos relativos no Windows
        $urlPath = $urlPath -replace "/", "\"
        $filePath = Join-Path $PSScriptRoot $urlPath
        
        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            
            # Define o tipo MIME correto baseado na extensão
            if ($filePath.EndsWith(".html")) { $res.ContentType = "text/html; charset=UTF-8" }
            elseif ($filePath.EndsWith(".css")) { $res.ContentType = "text/css; charset=UTF-8" }
            elseif ($filePath.EndsWith(".js")) { $res.ContentType = "application/javascript; charset=UTF-8" }
            elseif ($filePath.EndsWith(".png")) { $res.ContentType = "image/png" }
            elseif ($filePath.EndsWith(".jpg") -or $filePath.EndsWith(".jpeg")) { $res.ContentType = "image/jpeg" }
            elseif ($filePath.EndsWith(".svg")) { $res.ContentType = "image/svg+xml" }
            
            # Escreve a resposta
            $res.ContentLength64 = $content.Length
            $res.OutputStream.Write($content, 0, $content.Length)
        } else {
            # Arquivo não encontrado (404)
            $res.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("Arquivo nao encontrado")
            $res.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $res.Close()
    } catch {
        # Ignora erros de conexão fechada abruptamente pelo navegador
    }
}
