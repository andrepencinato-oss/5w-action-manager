/**
 * 5W2H Action Manager - Google Drive & Sheets Database Connector
 * 
 * Este script lida com a autenticação OAuth 2.0 usando o Google Identity Services (GIS)
 * e faz chamadas diretas às APIs REST do Google Drive v3 e Google Sheets v4.
 */

// =========================================================================
// CONFIGURAÇÕES GLOBAIS - PARÂMETROS MANDATÓRIOS E FIXOS
// =========================================================================
const CLIENT_ID = '947815600895-61vcmpsp59hp57vdsrfgk1spsndha9l3.apps.googleusercontent.com';
const TARGET_FOLDER_ID = '18ri71QSAQQccc-ACHB7dAfs-e3UApQJ-';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';
// =========================================================================

class GoogleDriveDB {
  static tokenClient = null;
  static accessToken = null;
  static spreadsheetId = null;
  static sheetName = null; // Armazena o nome da primeira aba dinamicamente (ex: "Sheet1" ou "Página1")

  /**
   * Inicializa o cliente de token do Google Identity Services (GIS).
   * @param {Function} onTokenReceived - Callback executado quando o token é recebido.
   * @param {Function} onError - Callback executado em caso de erro.
   */
  static init(onTokenReceived, onError) {
    if (!window.google) {
      onError(new Error("Biblioteca do Google Identity Services não carregada. Verifique sua conexão."));
      return;
    }

    try {
      // Configura o cliente de token OAuth 2.0 usando as constantes fixas
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.getClientId(),
        scope: SCOPES,
        callback: async (response) => {
          if (response.error) {
            console.error("Erro na autenticação:", response);
            onError(new Error(response.error_description || response.error));
            return;
          }
          
          this.accessToken = response.access_token;
          
          // Salva o token temporariamente na sessão
          sessionStorage.setItem('oauth_token', this.accessToken);
          sessionStorage.setItem('oauth_token_expiry', Date.now() + (response.expires_in * 1000));
          
          onTokenReceived(this.accessToken);
        },
      });
    } catch (err) {
      console.error("Erro ao inicializar GIS:", err);
      onError(err);
    }
  }

  /**
   * Obtém o Client ID configurado (constante estática no topo do arquivo).
   */
  static getClientId() {
    return CLIENT_ID;
  }

  /**
   * Obtém o Folder ID configurado (constante estática no topo do arquivo).
   */
  static getFolderId() {
    return TARGET_FOLDER_ID;
  }

  /**
   * Removemos o salvamento de configurações já que elas estão fixadas no código.
   */
  static saveConfig(clientId, folderId) {
    // Não aplicável, chaves fixadas no código
  }

  /**
   * Carrega token salvo na sessão se ele ainda for válido
   */
  static loadSavedToken() {
    const token = sessionStorage.getItem('oauth_token');
    const expiry = sessionStorage.getItem('oauth_token_expiry');
    if (token && expiry && Date.now() < parseInt(expiry)) {
      this.accessToken = token;
      return token;
    }
    this.accessToken = null;
    return null;
  }

  /**
   * Inicia o fluxo de login solicitando autorização do usuário.
   */
  static login() {
    if (!this.tokenClient) {
      throw new Error("Cliente OAuth não inicializado. Chame GoogleDriveDB.init() primeiro.");
    }
    // Solicita consentimento. prompt: 'consent' garante que o usuário possa selecionar contas.
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  /**
   * Limpa os dados de login.
   */
  static logout() {
    this.accessToken = null;
    this.spreadsheetId = null;
    this.sheetName = null;
    sessionStorage.removeItem('oauth_token');
    sessionStorage.removeItem('oauth_token_expiry');
    if (window.google && this.accessToken) {
      google.accounts.oauth2.revokeToken(this.accessToken, () => {});
    }
  }

  /**
   * Retorna os cabeçalhos padrão para requisições fetch autenticadas.
   */
  static getHeaders() {
    if (!this.accessToken) {
      throw new Error("Usuário não autenticado no Google.");
    }
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Executa a busca ou criação da planilha dentro da pasta alvo.
   * Contém tratamento de contingência robusto para bloqueios de TI corporativa.
   */
  static async connect() {
    try {
      this.loadSavedToken();
      if (!this.accessToken) {
        throw new Error("Token de acesso não disponível. Por favor, conecte sua conta.");
      }

      const folderId = this.getFolderId();
      if (!folderId || folderId.includes('SUA_PASTA_ID_AQUI')) {
        throw new Error("ID de pasta inválido. Configure o ID da pasta alvo corporativa no topo do código ou na tela de configurações.");
      }

      console.log(`Buscando banco de dados 5W2H na pasta: ${folderId}`);

      // 1. Procurar pela planilha existente na pasta corporativa
      // A query verifica o nome do arquivo, se ele não está no lixo, se é planilha e se está contido na pasta parents
      const query = encodeURIComponent(`name = '5W2H_Action_Plan_Database' and '${folderId}' in parents and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
      const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;
      
      let response;
      try {
        response = await fetch(searchUrl, {
          method: 'GET',
          headers: this.getHeaders()
        });
      } catch (fetchErr) {
        // Erro de rede ou CORS
        throw new Error("Não foi possível conectar aos servidores do Google. Verifique sua conexão de rede.");
      }

      // Tratamento específico de erros HTTP (ex: Bloqueios de Administrador da TI GSuite / 403 Forbidden)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        
        console.error("Erro da API do Google Drive:", errorData);

        if (response.status === 403) {
          // Tipicamente bloqueado por políticas de segurança corporativa ou escopos restritos
          throw new Error(
            "BLOQUEIO_TI_WORKSPACE: O acesso a aplicativos de terceiros foi bloqueado pelo administrador de TI da sua empresa. " +
            "Seu Workspace corporativo restringe o uso destas APIs por segurança. " +
            `Detalhes: ${errorMessage}`
          );
        } else if (response.status === 404) {
          throw new Error(`Pasta pai (ID: ${folderId}) não encontrada no Google Drive. Verifique se o ID está correto.`);
        }
        
        throw new Error(`Erro na conexão com o Google Drive (${response.status}): ${errorMessage}`);
      }

      const searchResult = await response.json();
      
      if (searchResult.files && searchResult.files.length > 0) {
        // Planilha encontrada!
        this.spreadsheetId = searchResult.files[0].id;
        console.log(`Planilha existente encontrada! ID: ${this.spreadsheetId}`);
        await this.detectSheetName();
        await this.ensureFcaSheetExists();
        await this.ensureHeadcountSheetExists();
        await this.initializeHeaders(); // Garante cabeçalhos atualizados
      } else {
        // Planilha não encontrada! Vamos criá-la dentro da pasta corporativa correspondente
        console.log("Planilha não encontrada. Criando nova planilha na pasta do projeto...");
        await this.createSpreadsheet(folderId);
      }
      
      return this.spreadsheetId;

    } catch (err) {
      console.error("Erro em GoogleDriveDB.connect:", err);
      throw err; // Propaga o erro para ser tratado na UI
    }
  }

  /**
   * Detecta o nome real da primeira aba da planilha para evitar falhas de localização (ex: "Sheet1" vs "Página1").
   */
  static async detectSheetName() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}?fields=sheets.properties`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error("Falha ao recuperar metadados da planilha.");
    }

    const data = await response.json();
    if (data.sheets && data.sheets.length > 0) {
      this.sheetName = data.sheets[0].properties.title;
      console.log(`Aba ativa identificada: "${this.sheetName}"`);
    } else {
      this.sheetName = 'Sheet1';
    }
  }

  /**
   * Cria uma nova planilha no Google Drive especificando a pasta pai (parents).
   */
  static async createSpreadsheet(folderId) {
    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const metadata = {
      name: '5W2H_Action_Plan_Database',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      parents: [folderId] // Requisito mandatório: Cria na pasta corporativa correspondente e NÃO na raiz
    };

    let response;
    try {
      response = await fetch(createUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(metadata)
      });
    } catch (fetchErr) {
      throw new Error("Erro de conexão ao tentar criar a planilha no Drive.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      
      if (response.status === 403) {
        throw new Error(
          "BLOQUEIO_TI_WORKSPACE: O administrador do Google Workspace bloqueou a criação de arquivos por este app na pasta compartilhada. " +
          `Detalhes: ${errorMessage}`
        );
      }
      throw new Error(`Falha ao criar planilha no Google Drive (${response.status}): ${errorMessage}`);
    }

    const file = await response.json();
    this.spreadsheetId = file.id;
    console.log(`Planilha criada com sucesso! ID: ${this.spreadsheetId}`);
    
    // Aguarda um momento para que a planilha seja totalmente indexada
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Detecta o nome padrão da aba
    await this.detectSheetName();
    
    // Inicializa a planilha com os cabeçalhos das ações 5W2H
    await this.initializeHeaders();
    
    // Garante que a aba de FCA também seja criada
    await this.ensureFcaSheetExists();
    await this.ensureHeadcountSheetExists();
  }

  /**
   * Garante que a aba FCA_Database exista na planilha, criando-a se necessário.
   */
  static async ensureFcaSheetExists() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}?fields=sheets.properties`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error("Falha ao recuperar metadados da planilha para verificar aba FCA.");
    }

    const data = await response.json();
    const fcaSheet = data.sheets.find(s => s.properties.title === 'FCA_Database');
    
    if (!fcaSheet) {
      console.log("Aba FCA_Database não encontrada. Criando...");
      const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`;
      const batchBody = {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'FCA_Database'
              }
            }
          }
        ]
      };

      const addResponse = await fetch(batchUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(batchBody)
      });

      if (!addResponse.ok) {
        throw new Error("Falha ao criar a aba FCA_Database na planilha.");
      }

      console.log("Aba FCA_Database criada. Inicializando cabeçalhos...");
      // Inicializa os cabeçalhos do FCA
      const headerUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/FCA_Database!A1:F1?valueInputOption=USER_ENTERED`;
      const headers = [
        ["ID", "Fato", "Causa", "Ação Proposta", "ID da Ação 5W2H", "Criado Em"]
      ];

      const headerResponse = await fetch(headerUrl, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ values: headers })
      });

      if (!headerResponse.ok) {
        throw new Error("Falha ao inicializar cabeçalhos da aba FCA_Database.");
      }
    } else {
      console.log("Aba FCA_Database já existe.");
    }
  }

  /**
   * Garante que a aba Headcount_Database exista na planilha, criando-a se necessário.
   */
  static async ensureHeadcountSheetExists() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}?fields=sheets.properties`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error("Falha ao recuperar metadados da planilha para verificar aba Headcount.");
    }

    const data = await response.json();
    const hcSheet = data.sheets.find(s => s.properties.title === 'Headcount_Database');
    
    if (!hcSheet) {
      console.log("Aba Headcount_Database não encontrada. Criando...");
      const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}:batchUpdate`;
      const batchBody = {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Headcount_Database'
              }
            }
          }
        ]
      };

      const addResponse = await fetch(batchUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(batchBody)
      });

      if (!addResponse.ok) {
        throw new Error("Falha ao criar a aba Headcount_Database na planilha.");
      }

      console.log("Aba Headcount_Database criada. Inicializando cabeçalhos...");
      // Inicializa os cabeçalhos do Headcount
      const headerUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Headcount_Database!A1:M1?valueInputOption=USER_ENTERED`;
      const headers = [
        ["ID", "Cadastro", "Nome", "Admissao", "Cargo", "Area", "Salario", "Custo", "Status", "Conhecimentos", "Habilidades", "Atitudes", "AtualizadoEm"]
      ];

      const headerResponse = await fetch(headerUrl, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ values: headers })
      });

      if (!headerResponse.ok) {
        throw new Error("Falha ao inicializar cabeçalhos da aba Headcount_Database.");
      }
    } else {
      console.log("Aba Headcount_Database já existe.");
    }
  }

  /**
   * Escreve os cabeçalhos na primeira linha da planilha de ações (até coluna V).
   */
  static async initializeHeaders() {
    const range = `${this.sheetName}!A1:V1`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
    
    const headers = [
      ["ID", "What (O que)", "Why (Por que)", "Where (Onde)", "When (Quando)", "Who (Quem)", "How (Como)", "How Much (Quanto)", "Status", "Created At", "Area (Área)", "Evidence (Evidência)", "FcaId", "StatusReason (Motivo)", "HasCashImpact (Impacto no Caixa?)", "CashImpactValue (Valor do Impacto)", "Project (Projeto)", "PeopleAction (Contratação/Redução/Migrar PJ)", "PeopleName (Nome Colaborador)", "PeopleCost (Custo Movimentação)", "PeopleRole (Cargo)", "PeopleList (Lista Colaboradores JSON)"]
    ];

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ values: headers })
    });

    if (!response.ok) {
      throw new Error("Falha ao inicializar cabeçalhos da planilha.");
    }
    console.log("Cabeçalhos do 5W2H criados com sucesso.");
  }

  /**
   * Carrega todas as ações registradas na planilha do Sheets (colunas A a V).
   */
  static async loadActions() {
    if (!this.spreadsheetId || !this.sheetName) {
      throw new Error("Não conectado ao banco de dados do Drive. Conecte primeiro.");
    }

    const range = `${this.sheetName}!A2:V`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Falha ao ler dados da planilha (${response.status}).`);
    }

    const data = await response.json();
    const rows = data.values || [];
    
    // Mapeia as linhas para objetos Javascript estruturados
    return rows.map(row => ({
      id: row[0] || '',
      what: row[1] || '',
      why: row[2] || '',
      where: row[3] || '',
      when: row[4] || '',
      who: row[5] || '',
      how: row[6] || '',
      howMuch: parseFloat(row[7]) || 0,
      status: row[8] || 'Não Iniciado',
      createdAt: row[9] || new Date().toISOString(),
      area: row[10] || '',
      evidence: row[11] || '',
      fcaId: row[12] || '',
      statusReason: row[13] || '',
      hasCashImpact: row[14] || 'Não',
      cashImpactValue: parseFloat(row[15]) || 0,
      project: row[16] || '',
      peopleAction: row[17] || 'Não',
      peopleName: row[18] || '',
      peopleCost: parseFloat(row[19]) || 0,
      peopleRole: row[20] || '',
      peopleList: row[21] || ''
    }));
  }

  /**
   * Sobrescreve toda a lista de ações na planilha para sincronização total simplificada (colunas A a V).
   * @param {Array} actions - Lista completa de ações atualizada.
   */
  static async saveActions(actions) {
    if (!this.spreadsheetId || !this.sheetName) {
      throw new Error("Não conectado ao banco de dados do Drive. Conecte primeiro.");
    }

    // 1. Limpar as linhas anteriores a partir da linha 2
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${this.sheetName}!A2:V:clear`;
    const clearResponse = await fetch(clearUrl, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!clearResponse.ok) {
      throw new Error("Falha ao limpar dados antigos na sincronização.");
    }

    if (actions.length === 0) {
      console.log("Banco de dados sincronizado: Nenhuma ação pendente.");
      return;
    }

    // 2. Formata os objetos como linhas de array ordenadas para o Sheets
    const values = actions.map(act => [
      act.id,
      act.what,
      act.why,
      act.where,
      act.when,
      act.who,
      act.how,
      act.howMuch,
      act.status,
      act.createdAt,
      act.area || '',
      act.evidence || '',
      act.fcaId || '',
      act.statusReason || '',
      act.hasCashImpact || 'Não',
      act.cashImpactValue || 0,
      act.project || '',
      act.peopleAction || 'Não',
      act.peopleName || '',
      act.peopleCost || 0,
      act.peopleRole || '',
      act.peopleList || ''
    ]);

    // 3. Grava o novo bloco de dados
    const updateRange = `${this.sheetName}!A2:V${actions.length + 1}`;
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`;

    const writeResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ values })
    });

    if (!writeResponse.ok) {
      throw new Error("Falha ao gravar novos dados durante a sincronização.");
    }

    console.log(`Sincronização completa. ${actions.length} ações gravadas com sucesso no Google Sheets.`);
  }

  /**
   * Carrega todos os FCAs registrados na planilha.
   */
  static async loadFCAs() {
    if (!this.spreadsheetId) {
      throw new Error("Não conectado ao banco de dados do Drive. Conecte primeiro.");
    }

    const range = 'FCA_Database!A2:F';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Falha ao ler dados dos FCAs (${response.status}).`);
    }

    const data = await response.json();
    const rows = data.values || [];
    
    return rows.map(row => ({
      id: row[0] || '',
      fact: row[1] || '',
      cause: row[2] || '',
      proposedAction: row[3] || '',
      actionId: row[4] || '',
      createdAt: row[5] || new Date().toISOString()
    }));
  }

  /**
   * Sobrescreve toda a lista de FCAs na planilha.
   * @param {Array} fcas - Lista completa de FCAs atualizada.
   */
  static async saveFCAs(fcas) {
    if (!this.spreadsheetId) {
      throw new Error("Não conectado ao banco de dados do Drive. Conecte primeiro.");
    }

    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/FCA_Database!A2:F:clear`;
    const clearResponse = await fetch(clearUrl, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!clearResponse.ok) {
      throw new Error("Falha ao limpar FCAs antigos na sincronização.");
    }

    if (fcas.length === 0) {
      return;
    }

    const values = fcas.map(fca => [
      fca.id,
      fca.fact,
      fca.cause,
      fca.proposedAction,
      fca.actionId || '',
      fca.createdAt
    ]);

    const updateRange = `FCA_Database!A2:F${fcas.length + 1}`;
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`;

    const writeResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ values })
    });

    if (!writeResponse.ok) {
      throw new Error("Falha ao gravar novos FCAs durante a sincronização.");
    }
  }

  /**
   * Carrega todos os colaboradores do headcount registrados na planilha.
   */
  static async loadHeadcount() {
    if (!this.spreadsheetId) {
      throw new Error("Não conectado ao banco de dados do Drive. Conecte primeiro.");
    }

    const range = 'Headcount_Database!A2:M';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${range}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Falha ao ler dados do Headcount (${response.status}).`);
    }

    const data = await response.json();
    const rows = data.values || [];
    
    return rows.map(row => ({
      id: row[0] || '',
      cadastro: row[1] || '',
      name: row[2] || '',
      admission: row[3] || '',
      role: row[4] || '',
      area: row[5] || '',
      salary: parseFloat(row[6]) || 0,
      cost: parseFloat(row[7]) || 0,
      status: row[8] || 'Ativo',
      conhecimentos: row[9] || '',
      habilidades: row[10] || '',
      atitudes: row[11] || '',
      updatedAt: row[12] || new Date().toISOString()
    }));
  }

  /**
   * Sobrescreve toda a lista de headcount na planilha.
   * @param {Array} headcountList - Lista completa de headcount.
   */
  static async saveHeadcount(headcountList) {
    if (!this.spreadsheetId) {
      throw new Error("Não conectado ao banco de dados do Drive. Conecte primeiro.");
    }

    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Headcount_Database!A2:M:clear`;
    const clearResponse = await fetch(clearUrl, {
      method: 'POST',
      headers: this.getHeaders()
    });

    if (!clearResponse.ok) {
      throw new Error("Falha ao limpar headcount antigo na sincronização.");
    }

    if (headcountList.length === 0) {
      return;
    }

    const values = headcountList.map(hc => [
      hc.id,
      hc.cadastro || '',
      hc.name || '',
      hc.admission || '',
      hc.role || '',
      hc.area || '',
      hc.salary || 0,
      hc.cost || 0,
      hc.status || 'Ativo',
      hc.conhecimentos || '',
      hc.habilidades || '',
      hc.atitudes || '',
      hc.updatedAt || new Date().toISOString()
    ]);

    const updateRange = `Headcount_Database!A2:M${headcountList.length + 1}`;
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/${updateRange}?valueInputOption=USER_ENTERED`;

    const writeResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ values })
    });

    if (!writeResponse.ok) {
      throw new Error("Falha ao gravar novos dados do Headcount durante a sincronização.");
    }
  }

  /**
   * Envia um arquivo binário para a pasta corporativa do Google Drive.
   * @param {File} fileObject - Arquivo selecionado no input HTML.
   * @returns {Promise<string>} - Retorna o webViewLink do arquivo carregado.
   */
  static async uploadEvidenceFile(fileObject) {
    if (!this.accessToken) {
      throw new Error("Usuário não autenticado no Google.");
    }

    const folderId = this.getFolderId();
    const metadata = {
      name: fileObject.name,
      parents: [folderId]
    };

    const boundary = 'foo_bar_boundary';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileReader = new FileReader();
    const fileLoadPromise = new Promise((resolve, reject) => {
      fileReader.onload = (e) => resolve(e.target.result);
      fileReader.onerror = (err) => reject(err);
      fileReader.readAsArrayBuffer(fileObject);
    });

    const arrayBuffer = await fileLoadPromise;
    const uint8Array = new Uint8Array(arrayBuffer);

    const metadataString = JSON.stringify(metadata);
    const headerString = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${metadataString}${delimiter}Content-Type: ${fileObject.type || 'application/octet-stream'}\r\n\r\n`;

    const encoder = new TextEncoder();
    const headerBytes = encoder.encode(headerString);
    const footerBytes = encoder.encode(closeDelimiter);

    const bodyBytes = new Uint8Array(headerBytes.length + uint8Array.length + footerBytes.length);
    bodyBytes.set(headerBytes, 0);
    bodyBytes.set(uint8Array, headerBytes.length);
    bodyBytes.set(footerBytes, headerBytes.length + uint8Array.length);

    const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: bodyBytes
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro de rede no upload (${response.status}): ${errText}`);
    }

    const result = await response.json();
    console.log("Upload concluído com sucesso:", result);
    return result.webViewLink;
  }
}
window.GoogleDriveDB = GoogleDriveDB;
