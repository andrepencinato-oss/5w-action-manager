# 5W2H Action Monitor & Módulo FCA

Um sistema web corporativo premium para monitoramento de planos de ação utilizando a metodologia **5W2H** integrado a uma tela de análise de desvios operacionais **FCA (Fato, Causa, Ação)**. 

O sistema é construído como um Single Page Application (SPA) responsivo, com design premium em modo escuro/claro e conexão automática ao Google Sheets como banco de dados na nuvem (Google Drive API v3 e Google Sheets API v4).

---

## 🚀 Principais Recursos

- **📊 Dashboard de Gráficos (Chart.js):** 4 gráficos interativos para monitorar custos por setor, volume de ações por área, responsáveis ativos e a distribuição de status de forma visual.
- **📋 Planos de Ação (5W2H):** Cadastro, edição e acompanhamento completo de ações (O que, Por que, Onde, Quem, Quando, Como, Quanto, Área e Evidência).
  - *Múltiplos Responsáveis:* Digite nomes separados por vírgula para gerar tags individuais na tabela.
  - *Justificativa de Status:* Selecionar status como `Cancelado` ou `Parado` exige um motivo obrigatório, que é exibido abaixo do badge correspondente na listagem.
- **⚠️ Módulo FCA (Fato, Causa, Ação):** Cadastro de ocorrências operacionais com ferramenta reativa para **"Criar Ação 5W"** que pré-preenche o formulário e amarra o vínculo relacional automaticamente.
- **📁 Integração de Upload com Google Drive:** Um botão "Enviar p/ Drive" no campo de evidências permite subir imagens, PDFs ou planilhas diretamente para a pasta corporativa compartilhada no Google Drive e vincula o link gerado à ação correspondente.
- **🌓 Alternador de Tema Claro e Escuro:** Suporte visual para alternar de tema em tempo real com adaptação automática de cores de contraste nos gráficos e persistência no navegador (`localStorage`).
- **🛡️ Modo de Contingência Local:** Caso o login seja travado pelas diretivas de segurança corporativa do Google Workspace (GSuite), o sistema ativa automaticamente o banco de dados local (`localStorage`) para que você não perca nenhum dado e continue operando offline.

---

## 💻 Como Rodar o Projeto Localmente (Sem instalar nada!)

Este projeto foi otimizado para rodar em qualquer Windows sem a necessidade de instalar Node.js, Python ou servidores web complexos. Ele utiliza o PowerShell nativo do Windows para subir um servidor local seguro na porta `3000`.

1. **Baixe ou clone** este repositório no seu computador.
2. Dê **dois cliques** no arquivo **`iniciar-sistema.bat`**.
3. O servidor local iniciará e seu navegador padrão abrirá automaticamente em:
   👉 `http://localhost:3000`

---

## 🌐 Publicação no GitHub Pages

Por ser um aplicativo 100% estático de front-end, ele pode ser hospedado de forma totalmente gratuita no GitHub Pages:

### 1. Ativar o Pages no GitHub
1. Crie um repositório público no GitHub com os arquivos deste projeto.
2. Vá em **Settings** > **Pages** no menu superior do repositório.
3. Sob a opção **Build and deployment**, selecione a branch `main` (ou `master`) e a pasta `/ (root)`.
4. Clique em **Save**. Seu link público estará ativo em instantes (ex: `https://seu-usuario.github.io/5w-action-manager/`).

### 2. Configurar o Google OAuth (Obrigatório para o login funcionar na nuvem)
Para que o login com o Google Drive funcione no seu link do GitHub Pages:
1. Acesse o **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Vá em **APIs e Serviços** > **Credenciais**.
3. Edite o ID do cliente OAuth correspondente.
4. Na seção **Origens JavaScript autorizadas**, clique em **Adicionar URI** e insira:
   - `https://seu-usuario.github.io`
5. Salve as alterações e aguarde cerca de 10 a 15 minutos para a propagação da segurança do Google.
