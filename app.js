/**
 * 5W2H Action Monitor - Controlador Principal da Aplicação
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // ESTADO DA APLICAÇÃO
  // =========================================================================
  let actions = [];
  let fcas = [];
  let dbConnected = false;
  let isSaving = false;

  // Instâncias dos gráficos para evitar vazamento de memória ao recriá-los
  let chartStatusInst = null;
  let chartCostsInst = null;
  let chartResponsibleInst = null;
  let chartSectorsInst = null;

  // =========================================================================
  // SELETORES DOM
  // =========================================================================
  const connectionDot = document.getElementById('connection-dot');
  const connectionText = document.getElementById('connection-text');
  const btnConnect = document.getElementById('btn-connect');
  const btnDisconnect = document.getElementById('btn-disconnect');
  
  const tabButtons = document.querySelectorAll('.tab-btn');
  const viewPanels = document.querySelectorAll('.view-panel');
  
  const actionsListBody = document.getElementById('actions-list-body');
  const actionsEmptyState = document.getElementById('actions-empty-state');
  const actionSearch = document.getElementById('action-search');
  const filterStatus = document.getElementById('filter-status');
  const btnNewAction = document.getElementById('btn-new-action');
  
  const modalAction = document.getElementById('modal-action');
  const formAction = document.getElementById('form-action');
  const modalTitle = document.getElementById('modal-title');
  const btnModalClose = document.getElementById('btn-modal-close');
  const btnFormCancel = document.getElementById('btn-form-cancel');
  
  const actionIdField = document.getElementById('action-id-field');
  const fieldWhat = document.getElementById('field-what');
  const fieldWhy = document.getElementById('field-why');
  const fieldWho = document.getElementById('field-who');
  const fieldWhere = document.getElementById('field-where');
  const fieldWhen = document.getElementById('field-when');
  const fieldHow = document.getElementById('field-how');
  const fieldHowMuch = document.getElementById('field-how-much');
  const fieldStatus = document.getElementById('field-status');
  
  // Elementos de Tema
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');

  // Elementos do Motivo de Status
  const statusReasonGroup = document.getElementById('status-reason-group');
  const statusReasonLabel = document.getElementById('status-reason-label');
  const fieldStatusReason = document.getElementById('field-status-reason');

  // Elementos de Evidência/Upload
  const btnUploadEvidence = document.getElementById('btn-upload-evidence');
  const evidenceFilePicker = document.getElementById('evidence-file-picker');
  const evidenceUploadStatus = document.getElementById('evidence-upload-status');

  // Elementos do Excel (Import/Download)
  const btnImportXlsx = document.getElementById('btn-import-xlsx');
  const btnDownloadTemplate = document.getElementById('btn-download-template');
  const xlsxFilePicker = document.getElementById('xlsx-file-picker');

  // Contingency Modal Elements
  const modalContingency = document.getElementById('modal-contingency');
  const btnContingencyClose = document.getElementById('btn-contingency-close');
  const btnContingencyOk = document.getElementById('btn-contingency-ok');
  const contingencyErrorMsg = document.getElementById('contingency-error-msg');

  // FCA Selectors [NEW]
  const fcasListBody = document.getElementById('fcas-list-body');
  const fcasEmptyState = document.getElementById('fcas-empty-state');
  const btnNewFca = document.getElementById('btn-new-fca');
  const fcaSearch = document.getElementById('fca-search');
  
  const modalFca = document.getElementById('modal-fca');
  const formFca = document.getElementById('form-fca');
  const fcaModalTitle = document.getElementById('fca-modal-title');
  const btnFcaModalClose = document.getElementById('btn-fca-modal-close');
  const btnFcaCancel = document.getElementById('btn-fca-cancel');
  const fcaIdField = document.getElementById('fca-id-field');
  const fieldFcaFact = document.getElementById('field-fca-fact');
  const fieldFcaCause = document.getElementById('field-fca-cause');
  const fieldFcaAction = document.getElementById('field-fca-action');

  // Novos elementos do formulário de ação [NEW]
  const actionFcaIdField = document.getElementById('action-fca-id-field');
  const fcaLinkNotice = document.getElementById('fca-link-notice');
  const fieldArea = document.getElementById('field-area');
  const fieldEvidence = document.getElementById('field-evidence');
  
  // Elementos do Impacto no Caixa
  const fieldHasCashImpact = document.getElementById('field-has-cash-impact');
  const cashImpactValueGroup = document.getElementById('cash-impact-value-group');
  const fieldCashImpactValue = document.getElementById('field-cash-impact-value');
  
  // Elementos do Projeto e Movimentação de Pessoas
  const fieldProject = document.getElementById('field-project');
  const projectCustomGroup = document.getElementById('project-custom-group');
  const fieldProjectCustom = document.getElementById('field-project-custom');
  const fieldAreaGroup = document.getElementById('field-area-group');
  const fieldHowMuchGroup = document.getElementById('field-how-much-group');
  const peopleActionContainer = document.getElementById('people-action-container');
  const fieldPeopleAction = document.getElementById('field-people-action');
  const fieldPeopleName = document.getElementById('field-people-name');
  const fieldPeopleRole = document.getElementById('field-people-role');
  const fieldPeopleArea = document.getElementById('field-people-area');
  const fieldPeopleCost = document.getElementById('field-people-cost');
  const projectSummaryBody = document.getElementById('project-summary-body');

  // Stats Elements
  const statTotal = document.getElementById('stat-total');
  const statProgress = document.getElementById('stat-progress');
  const statProgressPct = document.getElementById('stat-progress-pct');
  const statCompleted = document.getElementById('stat-completed');
  const statCompletedPct = document.getElementById('stat-completed-pct');
  const statDelayed = document.getElementById('stat-delayed');
  const statDelayedPct = document.getElementById('stat-delayed-pct');

  // =========================================================================
  // INICIALIZAÇÃO
  // =========================================================================
  function init() {
    // 1. Inicializa o Tema Claro/Escuro
    initTheme();

    // 2. Carrega dados do localStorage
    loadLocalActions();
    loadLocalFCAs();
    
    // 3. Registra os ícones do Lucide
    lucide.createIcons();

    // 4. Desenha UI Inicial
    renderActionsTable();
    renderFCAsTable();
    updateDashboard();

    // 5. Tenta conectar automaticamente se já houver um token válido salvo em sessão
    const savedToken = GoogleDriveDB.loadSavedToken();
    if (savedToken) {
      handleAutoConnect();
    } else {
      updateConnectionStatus(false, 'local');
    }
  }

  // =========================================================================
  // GERENCIAMENTO DE TEMAS
  // =========================================================================
  function initTheme() {
    const savedTheme = localStorage.getItem('5w2h_theme') || 'dark';
    applyTheme(savedTheme);
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.setAttribute('data-theme', 'light');
      themeIconSun.style.display = 'block';
      themeIconMoon.style.display = 'none';
    } else {
      document.body.removeAttribute('data-theme');
      themeIconSun.style.display = 'none';
      themeIconMoon.style.display = 'block';
    }
    localStorage.setItem('5w2h_theme', theme);
  }

  function getChartTextColor() {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    return isLight ? '#4b5563' : '#9ca3af';
  }

  btnThemeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    updateDashboard();
  });

  // =========================================================================
  // GERENCIAMENTO DE DADOS (LOCAL E REMOTO)
  // =========================================================================
  function loadLocalActions() {
    const raw = localStorage.getItem('5w2h_actions');
    if (raw) {
      try {
        actions = JSON.parse(raw);
      } catch (e) {
        console.error("Erro ao carregar ações do localStorage:", e);
        actions = [];
      }
    } else {
      actions = [];
    }
  }

  function saveLocalActions() {
    localStorage.setItem('5w2h_actions', JSON.stringify(actions));
  }

  function loadLocalFCAs() {
    const raw = localStorage.getItem('5w2h_fcas');
    if (raw) {
      try {
        fcas = JSON.parse(raw);
      } catch (e) {
        console.error("Erro ao carregar FCAs do localStorage:", e);
        fcas = [];
      }
    } else {
      fcas = [];
    }
  }

  function saveLocalFCAs() {
    localStorage.setItem('5w2h_fcas', JSON.stringify(fcas));
  }

  async function syncWithDrive() {
    if (!dbConnected) return;
    
    isSaving = true;
    showToast("Sincronizando dados com o Drive...", "warning");
    
    try {
      await GoogleDriveDB.saveActions(actions);
      await GoogleDriveDB.saveFCAs(fcas);
      showToast("Dados sincronizados com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao sincronizar com Google Sheets:", err);
      showToast("Falha ao sincronizar com Google Sheets. Operando localmente.", "error");
      updateConnectionStatus(false, 'local');
    } finally {
      isSaving = false;
    }
  }

  // =========================================================================
  // LOGIN / OAUTH & CONECTIVIDADE DO DRIVE
  // =========================================================================
  btnConnect.addEventListener('click', () => {
    showToast("Abrindo fluxo de autenticação do Google...", "info");
    
    // Inicializa o Google Drive DB com tratamento de erros de token
    GoogleDriveDB.init(
      async (token) => {
        // Callback de token recebido com sucesso
        showToast("Autenticado! Conectando à planilha...", "info");
        await establishDriveConnection();
      },
      (err) => {
        // Callback de erro na autenticação (ex: Client ID inválido)
        console.error("Erro OAuth:", err);
        showToast(`Erro na autenticação: ${err.message}`, "error");
        handleTIAdminBlock(err.message);
      }
    );
    
    // Dispara a janela de login
    try {
      GoogleDriveDB.login();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  btnDisconnect.addEventListener('click', () => {
    GoogleDriveDB.logout();
    updateConnectionStatus(false, 'local');
    loadLocalActions(); // Retorna aos dados locais
    loadLocalFCAs();
    renderActionsTable();
    renderFCAsTable();
    updateDashboard();
    showToast("Desconectado da conta Google. Modo offline ativo.", "info");
  });

  async function handleAutoConnect() {
    GoogleDriveDB.init(
      async () => {
        await establishDriveConnection();
      },
      (err) => {
        console.warn("Auto-connect falhou no token:", err);
        updateConnectionStatus(false, 'local');
      }
    );
  }

  async function establishDriveConnection() {
    try {
      // Conecta/Cria a planilha na pasta corporativa alvo
      await GoogleDriveDB.connect();
      
      // Carrega ações e FCAs da nuvem
      showToast("Lendo banco de dados do Sheets...", "info");
      const cloudActions = await GoogleDriveDB.loadActions();
      const cloudFCAs = await GoogleDriveDB.loadFCAs();
      
      // Sincroniza Ações
      if (cloudActions.length === 0 && actions.length > 0) {
        if (confirm("Identificamos que sua planilha na nuvem está vazia de ações, mas você possui ações salvas localmente. Deseja enviar seus dados locais para a nuvem?")) {
          dbConnected = true;
          await syncWithDrive();
        } else {
          actions = [];
          saveLocalActions();
        }
      } else {
        actions = cloudActions;
        saveLocalActions();
      }

      // Sincroniza FCAs
      if (cloudFCAs.length === 0 && fcas.length > 0) {
        // Se a nuvem estiver vazia, o local será sincronizado na primeira gravação
      } else {
        fcas = cloudFCAs;
        saveLocalFCAs();
      }

      dbConnected = true;
      updateConnectionStatus(true, 'connected');
      
      renderActionsTable();
      renderFCAsTable();
      updateDashboard();
      showToast("Conexão ao Google Drive estabelecida com sucesso!", "success");

    } catch (err) {
      console.error("Erro ao estabelecer conexão:", err);
      showToast(err.message, "error");
      updateConnectionStatus(false, 'local');
      handleTIAdminBlock(err.message);
    }
  }

  function updateConnectionStatus(isConnected, mode) {
    dbConnected = isConnected;
    if (isConnected) {
      connectionDot.className = "status-dot connected";
      connectionText.innerText = "Conectado ao Google Drive";
      btnConnect.style.display = 'none';
      btnDisconnect.style.display = 'flex';
    } else {
      btnConnect.style.display = 'flex';
      btnDisconnect.style.display = 'none';
      
      if (mode === 'local') {
        connectionDot.className = "status-dot local";
        connectionText.innerText = "Desconectado (Modo Local)";
      } else {
        connectionDot.className = "status-dot";
        connectionText.innerText = "Sem Conexão";
      }
    }
  }

  /**
   * Trata o erro de autenticação/conexão e exibe o modal de contingência local.
   */
  function handleTIAdminBlock(errorMessage) {
    // 1. Garante que a conexão com o Drive esteja desativada e em modo local
    updateConnectionStatus(false, 'local');
    
    // 2. Garante que os dados locais estão ativos
    loadLocalActions();
    renderActionsTable();
    updateDashboard();

    // 3. Preenche e exibe o Modal de Contingência na tela
    let isTIBlock = errorMessage && errorMessage.includes('BLOQUEIO_TI_WORKSPACE');
    let displayMsg = isTIBlock ? errorMessage.replace('BLOQUEIO_TI_WORKSPACE: ', '') : errorMessage;

    contingencyErrorMsg.innerText = displayMsg;
    modalContingency.classList.add('active');
  }

  // =========================================================================
  // LÓGICA DE DETECÇÃO DE STATUS E UPLOAD DE EVIDÊNCIA
  // =========================================================================
  function handleStatusChange() {
    const currentStatus = fieldStatus.value;
    if (currentStatus === 'Cancelado' || currentStatus === 'Parado') {
      statusReasonGroup.style.display = 'block';
      fieldStatusReason.setAttribute('required', 'required');
      if (currentStatus === 'Cancelado') {
        statusReasonLabel.innerHTML = 'Motivo do Cancelamento <span>*</span>';
        fieldStatusReason.setAttribute('placeholder', 'Explique o motivo do cancelamento da ação...');
      } else {
        statusReasonLabel.innerHTML = 'Motivo da Parada <span>*</span>';
        fieldStatusReason.setAttribute('placeholder', 'Explique por que esta ação foi parada/suspensa...');
      }
    } else {
      statusReasonGroup.style.display = 'none';
      fieldStatusReason.removeAttribute('required');
      fieldStatusReason.value = '';
    }
  }

  function handleCashImpactChange() {
    const hasImpact = fieldHasCashImpact.value === 'Sim';
    if (hasImpact) {
      cashImpactValueGroup.style.display = 'block';
      fieldCashImpactValue.setAttribute('required', 'required');
    } else {
      cashImpactValueGroup.style.display = 'none';
      fieldCashImpactValue.removeAttribute('required');
      fieldCashImpactValue.value = '';
    }
  }

  function handleProjectChange() {
    const projType = fieldProject.value;
    const isPeopleProj = projType === 'Pessoas';
    const isCustomProj = projType === 'Outro';
    
    // Toggle projeto customizado
    if (isCustomProj) {
      projectCustomGroup.style.display = 'block';
      fieldProjectCustom.setAttribute('required', 'required');
    } else {
      projectCustomGroup.style.display = 'none';
      fieldProjectCustom.removeAttribute('required');
      fieldProjectCustom.value = '';
    }
    
    // Toggle layout Pessoas vs Normal
    if (isPeopleProj) {
      // Oculta Area e Custo naturais
      fieldAreaGroup.style.display = 'none';
      fieldArea.removeAttribute('required');
      fieldArea.value = '';
      
      fieldHowMuchGroup.style.display = 'none';
      fieldHowMuch.value = '';
      
      // Exibe container de Pessoas
      peopleActionContainer.style.display = 'grid';
      fieldPeopleAction.setAttribute('required', 'required');
      fieldPeopleName.setAttribute('required', 'required');
      fieldPeopleRole.setAttribute('required', 'required');
      fieldPeopleArea.setAttribute('required', 'required');
      fieldPeopleCost.setAttribute('required', 'required');
    } else {
      // Exibe Area e Custo naturais
      fieldAreaGroup.style.display = 'block';
      fieldArea.setAttribute('required', 'required');
      
      fieldHowMuchGroup.style.display = 'block';
      
      // Oculta container de Pessoas
      peopleActionContainer.style.display = 'none';
      fieldPeopleAction.removeAttribute('required');
      fieldPeopleName.removeAttribute('required');
      fieldPeopleRole.removeAttribute('required');
      fieldPeopleArea.removeAttribute('required');
      fieldPeopleCost.removeAttribute('required');
      
      fieldPeopleName.value = '';
      fieldPeopleRole.value = '';
      fieldPeopleArea.value = '';
      fieldPeopleCost.value = '';
    }
  }

  fieldStatus.addEventListener('change', handleStatusChange);
  fieldHasCashImpact.addEventListener('change', handleCashImpactChange);
  fieldProject.addEventListener('change', handleProjectChange);

  btnUploadEvidence.addEventListener('click', () => {
    evidenceFilePicker.click();
  });

  evidenceFilePicker.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!dbConnected) {
      showToast("Você precisa conectar ao Google Drive para enviar arquivos diretamente.", "warning");
      evidenceFilePicker.value = '';
      return;
    }

    btnUploadEvidence.disabled = true;
    btnUploadEvidence.style.opacity = '0.7';
    evidenceUploadStatus.style.display = 'block';
    evidenceUploadStatus.innerText = 'Enviando arquivo para o Drive...';

    try {
      const link = await GoogleDriveDB.uploadEvidenceFile(file);
      fieldEvidence.value = link;
      showToast("Arquivo enviado e vinculado com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showToast(`Falha no upload: ${err.message}`, "error");
    } finally {
      btnUploadEvidence.disabled = false;
      btnUploadEvidence.style.opacity = '1';
      evidenceUploadStatus.style.display = 'none';
      evidenceFilePicker.value = '';
    }
  });

  // =========================================================================
  // LÓGICA DE IMPORTAÇÃO E EXPORTAÇÃO EXCEL
  // =========================================================================
  btnDownloadTemplate.addEventListener('click', downloadExcelTemplate);
  btnImportXlsx.addEventListener('click', () => {
    xlsxFilePicker.click();
  });

  xlsxFilePicker.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importExcelFile(file);
    xlsxFilePicker.value = ''; // Reseta picker
  });

  function downloadExcelTemplate() {
    const actionsHeader = [
      ["ID", "What (O que)", "Why (Por que)", "Where (Onde)", "Area (Área)", "When (Quando)", "Who (Quem)", "How (Como)", "How Much (Quanto)", "Status", "StatusReason (Motivo)", "Evidence (Evidência)", "FcaId", "HasCashImpact (Impacto no Caixa?)", "CashImpactValue (Valor do Impacto)", "Project (Projeto)", "PeopleAction (Contratação/Redução/Migrar PJ)", "PeopleName (Nome Colaborador)", "PeopleCost (Custo Movimentação)", "PeopleRole (Cargo)"]
    ];
    const actionsSample = [
      ["1001", "Exemplo de Ação 5W2H", "Exemplo de Justificativa", "Setor de Operações", "Operações", "2026-12-31", "André, Carlos", "Exemplo de Como Fazer", 150.00, "Não Iniciado", "", "", "", "Sim", 5000.00, "Pessoas", "Contratação", "Mariana Santos", 3500.00, "Analista Financeiro"]
    ];
    
    const fcasHeader = [
      ["ID", "Fact (Fato/Problema)", "Cause (Causa Raiz)", "Proposed Action (Ação Proposta)", "ActionId"]
    ];
    const fcasSample = [
      ["FCA1001", "Exemplo de desvio ou problema", "Exemplo de causa analisada", "Exemplo de ação para bloquear causa", "1001"]
    ];

    const wb = XLSX.utils.book_new();
    const wsActions = XLSX.utils.aoa_to_sheet(actionsHeader.concat(actionsSample));
    const wsFCAs = XLSX.utils.aoa_to_sheet(fcasHeader.concat(fcasSample));

    XLSX.utils.book_append_sheet(wb, wsActions, "Planos_5W2H");
    XLSX.utils.book_append_sheet(wb, wsFCAs, "Analises_FCA");

    XLSX.writeFile(wb, "modelo_importacao_5w2h_fca.xlsx");
    showToast("Modelo de importação Excel baixado com sucesso!", "success");
  }

  async function importExcelFile(file) {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let importedActionsCount = 0;
        let importedFcasCount = 0;
        
        // 1. Processar aba Planos_5W2H
        const sheetActions = workbook.Sheets["Planos_5W2H"];
        if (sheetActions) {
          const rows = XLSX.utils.sheet_to_json(sheetActions, { header: 1 });
          if (rows.length > 1) {
            const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
            
            const colMap = {
              id: headers.indexOf("id"),
              what: headers.findIndex(h => h.includes("what") || h.includes("o que")),
              why: headers.findIndex(h => h.includes("why") || h.includes("por que")),
              where: headers.findIndex(h => h.includes("where") || h.includes("onde")),
              area: headers.findIndex(h => h.includes("area") || h.includes("área")),
              when: headers.findIndex(h => h.includes("when") || h.includes("quando")),
              who: headers.findIndex(h => h.includes("who") || h.includes("quem")),
              how: headers.findIndex(h => h.includes("how") || h.includes("como")),
              howmuch: headers.findIndex(h => h.includes("how much") || h.includes("quanto") || h.includes("custo")),
              status: headers.indexOf("status"),
              statusreason: headers.findIndex(h => h.includes("statusreason") || h.includes("motivo")),
              evidence: headers.findIndex(h => h.includes("evidence") || h.includes("evidência")),
              fcaid: headers.indexOf("fcaid"),
              hascashimpact: headers.findIndex(h => h.includes("cashimpact") || h.includes("impacto no caixa") || h.includes("impacto")),
              cashimpactvalue: headers.findIndex(h => h.includes("impactvalue") || h.includes("valor do impacto") || h.includes("valor impacto")),
              project: headers.findIndex(h => h.includes("project") || h.includes("projeto")),
              peopleaction: headers.findIndex(h => h.includes("peopleaction") || h.includes("contratação") || h.includes("movimentação")),
              peoplename: headers.findIndex(h => h.includes("peoplename") || h.includes("nome colaborador") || h.includes("nome da pessoa")),
              peoplecost: headers.findIndex(h => h.includes("peoplecost") || h.includes("custo movimentação") || h.includes("custo da pessoa")),
              peoplerole: headers.findIndex(h => h.includes("peoplerole") || h.includes("cargo"))
            };
            
            for (let i = 1; i < rows.length; i++) {
              const row = rows[i];
              if (!row || row.length === 0) continue;
              
              const whatVal = colMap.what !== -1 ? String(row[colMap.what] || '').trim() : '';
              if (!whatVal) continue;
              
              const idVal = colMap.id !== -1 && row[colMap.id] ? String(row[colMap.id]).trim() : String(Date.now() + i);
              const costVal = colMap.howmuch !== -1 ? parseFloat(row[colMap.howmuch]) || 0 : 0;
              const whenVal = colMap.when !== -1 && row[colMap.when] ? String(row[colMap.when]).trim() : new Date().toISOString().slice(0, 10);
              
              const hasCashImpactVal = colMap.hascashimpact !== -1 && row[colMap.hascashimpact] ? String(row[colMap.hascashimpact]).trim() : 'Não';
              const cashImpactVal = colMap.cashimpactvalue !== -1 ? parseFloat(row[colMap.cashimpactvalue]) || 0 : 0;
              const projectVal = colMap.project !== -1 && row[colMap.project] ? String(row[colMap.project]).trim() : '';
              const peopleActionVal = colMap.peopleaction !== -1 && row[colMap.peopleaction] ? String(row[colMap.peopleaction]).trim() : 'Não';
              const peopleNameVal = colMap.peoplename !== -1 && row[colMap.peoplename] ? String(row[colMap.peoplename]).trim() : '';
              const peopleCostVal = colMap.peoplecost !== -1 ? parseFloat(row[colMap.peoplecost]) || 0 : 0;
              const peopleRoleVal = colMap.peoplerole !== -1 && row[colMap.peoplerole] ? String(row[colMap.peoplerole]).trim() : '';
              
              const actionData = {
                id: idVal,
                what: whatVal,
                why: colMap.why !== -1 ? String(row[colMap.why] || '').trim() : '',
                where: colMap.where !== -1 ? String(row[colMap.where] || '').trim() : '',
                area: colMap.area !== -1 ? String(row[colMap.area] || '').trim() : '',
                when: whenVal,
                who: colMap.who !== -1 ? String(row[colMap.who] || '').trim() : '',
                how: colMap.how !== -1 ? String(row[colMap.how] || '').trim() : '',
                howMuch: costVal,
                status: colMap.status !== -1 ? String(row[colMap.status] || 'Não Iniciado').trim() : 'Não Iniciado',
                statusReason: colMap.statusreason !== -1 ? String(row[colMap.statusreason] || '').trim() : '',
                evidence: colMap.evidence !== -1 ? String(row[colMap.evidence] || '').trim() : '',
                fcaId: colMap.fcaid !== -1 ? String(row[colMap.fcaid] || '').trim() : '',
                hasCashImpact: hasCashImpactVal,
                cashImpactValue: cashImpactVal,
                project: projectVal,
                peopleAction: peopleActionVal,
                peopleName: peopleNameVal,
                peopleCost: peopleCostVal,
                peopleRole: peopleRoleVal,
                createdAt: new Date().toISOString()
              };
              
              const existingIndex = actions.findIndex(a => a.id === idVal);
              if (existingIndex !== -1) {
                actionData.createdAt = actions[existingIndex].createdAt || actionData.createdAt;
                actions[existingIndex] = actionData;
              } else {
                actions.unshift(actionData);
              }
              importedActionsCount++;
            }
          }
        }
        
        // 2. Processar aba Analises_FCA
        const sheetFCAs = workbook.Sheets["Analises_FCA"];
        if (sheetFCAs) {
          const rows = XLSX.utils.sheet_to_json(sheetFCAs, { header: 1 });
          if (rows.length > 1) {
            const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
            
            const colMap = {
              id: headers.indexOf("id"),
              fact: headers.findIndex(h => h.includes("fact") || h.includes("fato") || h.includes("problema")),
              cause: headers.findIndex(h => h.includes("cause") || h.includes("causa")),
              proposedaction: headers.findIndex(h => h.includes("proposed") || h.includes("ação") || h.includes("proposta")),
              actionid: headers.indexOf("actionid")
            };
            
            for (let i = 1; i < rows.length; i++) {
              const row = rows[i];
              if (!row || row.length === 0) continue;
              
              const factVal = colMap.fact !== -1 ? String(row[colMap.fact] || '').trim() : '';
              const causeVal = colMap.cause !== -1 ? String(row[colMap.cause] || '').trim() : '';
              if (!factVal && !causeVal) continue;
              
              const idVal = colMap.id !== -1 && row[colMap.id] ? String(row[colMap.id]).trim() : String(Date.now() + 1000 + i);
              
              const fcaData = {
                id: idVal,
                fact: factVal,
                cause: causeVal,
                proposedAction: colMap.proposedaction !== -1 ? String(row[colMap.proposedaction] || '').trim() : '',
                actionId: colMap.actionid !== -1 ? String(row[colMap.actionid] || '').trim() : '',
                createdAt: new Date().toISOString()
              };
              
              const existingIndex = fcas.findIndex(f => f.id === idVal);
              if (existingIndex !== -1) {
                fcaData.createdAt = fcas[existingIndex].createdAt || fcaData.createdAt;
                fcas[existingIndex] = fcaData;
              } else {
                fcas.unshift(fcaData);
              }
              importedFcasCount++;
            }
          }
        }
        
        saveLocalActions();
        saveLocalFCAs();
        renderActionsTable();
        renderFCAsTable();
        updateDashboard();
        
        if (dbConnected) {
          await syncWithDrive();
        }
        
        showToast(`Importação Concluída! ${importedActionsCount} ações e ${importedFcasCount} FCAs importados.`, "success");
        
      } catch (err) {
        console.error(err);
        showToast(`Erro ao importar planilha: ${err.message}`, "error");
      }
    };
    
    reader.readAsArrayBuffer(file);
  }

  // =========================================================================
  // NAVEGAÇÃO DE ABAS SPA
  // =========================================================================
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      switchTab(target);
    });
  });

  function switchTab(targetId) {
    tabButtons.forEach(b => {
      if (b.getAttribute('data-target') === targetId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    viewPanels.forEach(panel => {
      if (panel.id === targetId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Se estiver mudando para o dashboard, redesenha os gráficos para garantir que caibam no container
    if (targetId === 'dashboard-view') {
      setTimeout(updateDashboard, 50);
    }
  }

  // =========================================================================
  // GESTÃO DO MODAL DE CADASTRO / EDIÇÃO
  // =========================================================================
  btnNewAction.addEventListener('click', () => {
    openModal();
  });

  btnModalClose.addEventListener('click', closeModal);
  btnFormCancel.addEventListener('click', closeModal);
  
  // Modais não fecham mais ao clicar fora (evita perda acidental de dados)

  // Ouvintes para o modal de contingência
  btnContingencyClose.addEventListener('click', closeContingencyModal);
  btnContingencyOk.addEventListener('click', closeContingencyModal);
  // O modal de contingência não fecha ao clicar fora

  function closeContingencyModal() {
    modalContingency.classList.remove('active');
  }

  function openModal(actionToEdit = null) {
    formAction.reset();
    fcaLinkNotice.style.display = 'none';
    actionFcaIdField.value = '';
    
    if (actionToEdit) {
      modalTitle.innerText = "Editar Ação 5W2H";
      actionIdField.value = actionToEdit.id;
      fieldWhat.value = actionToEdit.what;
      fieldWhy.value = actionToEdit.why;
      fieldWho.value = actionToEdit.who;
      fieldWhere.value = actionToEdit.where;
      fieldArea.value = actionToEdit.area || '';
      fieldWhen.value = actionToEdit.when;
      fieldHow.value = actionToEdit.how;
      fieldHowMuch.value = actionToEdit.howMuch || 0;
      fieldStatus.value = actionToEdit.status;
      fieldStatusReason.value = actionToEdit.statusReason || '';
      fieldEvidence.value = actionToEdit.evidence || '';
      actionFcaIdField.value = actionToEdit.fcaId || '';
      
      // Impacto no Caixa
      fieldHasCashImpact.value = actionToEdit.hasCashImpact || 'Não';
      fieldCashImpactValue.value = actionToEdit.cashImpactValue || '';
      
      // Projeto e Movimentação de Pessoas
      if (actionToEdit.project === 'Pessoas') {
        fieldProject.value = 'Pessoas';
        fieldProjectCustom.value = '';
      } else if (!actionToEdit.project || actionToEdit.project === 'Sem Projeto') {
        fieldProject.value = 'Sem Projeto';
        fieldProjectCustom.value = '';
      } else {
        fieldProject.value = 'Outro';
        fieldProjectCustom.value = actionToEdit.project;
      }
      
      fieldPeopleAction.value = actionToEdit.peopleAction || 'Contratação';
      fieldPeopleName.value = actionToEdit.peopleName || '';
      fieldPeopleRole.value = actionToEdit.peopleRole || '';
      fieldPeopleArea.value = actionToEdit.area || ''; // usa a própria área do card
      fieldPeopleCost.value = actionToEdit.peopleCost || '';
      
      handleStatusChange();
      handleCashImpactChange();
      handleProjectChange();

      if (actionToEdit.fcaId) {
        fcaLinkNotice.style.display = 'block';
      }
    } else {
      modalTitle.innerText = "Nova Ação 5W2H";
      actionIdField.value = '';
      fieldStatus.value = 'Não Iniciado';
      fieldStatusReason.value = '';
      
      // Impacto no Caixa
      fieldHasCashImpact.value = 'Não';
      fieldCashImpactValue.value = '';
      
      // Projeto e Movimentação de Pessoas - Padroniza para "Pessoas" por padrão
      fieldProject.value = 'Pessoas';
      fieldProjectCustom.value = '';
      fieldPeopleAction.value = 'Contratação';
      fieldPeopleName.value = '';
      fieldPeopleRole.value = '';
      fieldPeopleArea.value = '';
      fieldPeopleCost.value = '';
      
      handleStatusChange();
      handleCashImpactChange();
      handleProjectChange();
      
      // Preenche data padrão com amanhã
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      fieldWhen.value = tomorrow.toISOString().slice(0, 10);
    }

    modalAction.classList.add('active');
  }

  function closeModal() {
    modalAction.classList.remove('active');
  }

  // =========================================================================
  // SALVAR AÇÃO (CREATE / UPDATE)
  // =========================================================================
  formAction.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = actionIdField.value;
    const fcaId = actionFcaIdField.value;
    const isEdit = id !== '';
    
    let finalProject = '';
    if (fieldProject.value === 'Outro') {
      finalProject = fieldProjectCustom.value.trim();
    } else if (fieldProject.value === 'Pessoas') {
      finalProject = 'Pessoas';
    } else {
      finalProject = 'Sem Projeto';
    }

    const isPessoasProj = finalProject === 'Pessoas';

    const actionData = {
      id: isEdit ? id : String(Date.now()),
      what: fieldWhat.value.trim(),
      why: fieldWhy.value.trim(),
      who: fieldWho.value.trim(),
      where: fieldWhere.value.trim(),
      area: isPessoasProj ? fieldPeopleArea.value.trim() : fieldArea.value.trim(),
      when: fieldWhen.value,
      how: fieldHow.value.trim(),
      howMuch: isPessoasProj ? (parseFloat(fieldPeopleCost.value) || 0) : (parseFloat(fieldHowMuch.value) || 0),
      status: fieldStatus.value,
      evidence: fieldEvidence.value.trim(),
      fcaId: fcaId,
      statusReason: (fieldStatus.value === 'Cancelado' || fieldStatus.value === 'Parado') ? fieldStatusReason.value.trim() : '',
      hasCashImpact: fieldHasCashImpact.value,
      cashImpactValue: fieldHasCashImpact.value === 'Sim' ? (parseFloat(fieldCashImpactValue.value) || 0) : 0,
      project: finalProject,
      peopleAction: isPessoasProj ? fieldPeopleAction.value : 'Não',
      peopleName: isPessoasProj ? fieldPeopleName.value.trim() : '',
      peopleRole: isPessoasProj ? fieldPeopleRole.value.trim() : '',
      peopleCost: isPessoasProj ? (parseFloat(fieldPeopleCost.value) || 0) : 0,
      createdAt: isEdit ? (actions.find(a => a.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    if (isEdit) {
      // Atualiza
      actions = actions.map(a => a.id === id ? actionData : a);
      showToast("Ação atualizada localmente!", "success");
    } else {
      // Cria
      actions.unshift(actionData);
      showToast("Nova ação criada localmente!", "success");
    }

    // Se houver vínculo com FCA, atualiza a relação no array de FCAs
    if (fcaId) {
      fcas = fcas.map(f => f.id === fcaId ? { ...f, actionId: actionData.id } : f);
      saveLocalFCAs();
      renderFCAsTable();
    }

    // Salva local e tenta sincronizar
    saveLocalActions();
    renderActionsTable();
    updateDashboard();
    closeModal();

    if (dbConnected) {
      await syncWithDrive();
    }
  });

  // =========================================================================
  // EXCLUIR AÇÃO (DELETE)
  // =========================================================================
  window.deleteAction = async function(id) {
    if (confirm("Tem certeza que deseja excluir esta ação do seu plano de monitoramento?")) {
      actions = actions.filter(a => a.id !== id);
      saveLocalActions();
      renderActionsTable();
      updateDashboard();
      showToast("Ação removida!", "info");

      if (dbConnected) {
        await syncWithDrive();
      }
    }
  };

  window.editAction = function(id) {
    const act = actions.find(a => a.id === id);
    if (act) {
      openModal(act);
    }
  };

  // =========================================================================
  // FILTRAGEM E BUSCA DA TABELA
  // =========================================================================
  actionSearch.addEventListener('input', renderActionsTable);
  filterStatus.addEventListener('change', renderActionsTable);

  function getFilteredActions() {
    const searchVal = actionSearch.value.toLowerCase().trim();
    const statusVal = filterStatus.value;

    return actions.filter(act => {
      const matchesSearch = 
        act.what.toLowerCase().includes(searchVal) ||
        act.who.toLowerCase().includes(searchVal) ||
        act.where.toLowerCase().includes(searchVal) ||
        act.why.toLowerCase().includes(searchVal) ||
        act.how.toLowerCase().includes(searchVal);

      const matchesStatus = (statusVal === 'all') || (act.status === statusVal);

      return matchesSearch && matchesStatus;
    });
  }

  // =========================================================================
  // RENDERIZAÇÃO DA TABELA DE AÇÕES
  // =========================================================================
  function renderActionsTable() {
    const filtered = getFilteredActions();
    
    actionsListBody.innerHTML = '';
    
    if (filtered.length === 0) {
      actionsEmptyState.style.display = 'block';
      return;
    }
    
    actionsEmptyState.style.display = 'none';
    
    filtered.forEach(act => {
      const tr = document.createElement('tr');
      
      const formattedCost = act.howMuch.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      let costCellContent = `<span class="cost-tag">${formattedCost}</span>`;
      if (act.hasCashImpact === 'Sim') {
        const formattedImpact = (act.cashImpactValue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        costCellContent += `
          <div style="font-size: 11px; color: var(--color-cyan); margin-top: 4px; font-weight: 600; display: flex; align-items: center; gap: 4px;" title="Impacto financeiro no caixa">
            <i data-lucide="trending-down" style="width: 12px; height: 12px;"></i> Caixa: ${formattedImpact}
          </div>
        `;
      }
      if (act.peopleAction === 'Contratação' || act.peopleAction === 'Redução' || act.peopleAction === 'Migrar PJ') {
        const formattedPeopleCost = (act.peopleCost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let iconName = 'users';
        let colorStyle = 'var(--color-cyan)';
        if (act.peopleAction === 'Contratação') {
          iconName = 'user-plus';
          colorStyle = 'var(--status-completed)';
        } else if (act.peopleAction === 'Redução') {
          iconName = 'user-minus';
          colorStyle = 'var(--status-delayed)';
        } else if (act.peopleAction === 'Migrar PJ') {
          iconName = 'user-check';
          colorStyle = '#ff9800'; // Orange
        }
        
        let roleHtml = act.peopleRole ? `<div style="font-size: 10px; color: var(--text-muted); margin-top: 1px;">Cargo: ${escapeHtml(act.peopleRole)}</div>` : '';
        
        costCellContent += `
          <div style="font-size: 11px; color: ${colorStyle}; margin-top: 6px; font-weight: 600; display: flex; flex-direction: column; gap: 2px;" title="${act.peopleAction} de Colaborador">
            <span style="display: flex; align-items: center; gap: 4px;">
              <i data-lucide="${iconName}" style="width: 12px; height: 12px;"></i> ${act.peopleAction}: ${escapeHtml(act.peopleName)}
            </span>
            ${roleHtml}
            <span style="font-size:10px; color: var(--text-muted); font-weight:500;">Custo: ${formattedPeopleCost}</span>
          </div>
        `;
      }
      const formattedDate = act.when.split('-').reverse().join('/');
      
      let badgeClass = 'badge-pending';
      if (act.status === 'Iniciado') badgeClass = 'badge-progress';
      else if (act.status === 'Concluído') badgeClass = 'badge-completed';
      else if (act.status === 'Atrasado') badgeClass = 'badge-delayed';
      else if (act.status === 'Cancelado') badgeClass = 'badge-cancelled';
      else if (act.status === 'Parado') badgeClass = 'badge-stopped';

      // Separa múltiplos responsáveis por vírgula e renderiza tags individuais
      const whoNames = act.who ? act.who.split(',').map(n => n.trim()).filter(n => n.length > 0) : [];
      const whoTags = whoNames.map(name => `<span class="responsible-tag">${escapeHtml(name)}</span>`).join('');
      const whoContainer = `<div class="responsibles-container">${whoTags || '<span class="responsible-tag" style="background:rgba(255,255,255,0.03);color:var(--text-muted);border:none;">Não definido</span>'}</div>`;

      // Renderiza link ou texto da evidência
      let evidenceCell = '';
      if (act.evidence && act.evidence.trim() !== '') {
        const trimmedEvidence = act.evidence.trim();
        if (trimmedEvidence.startsWith('http://') || trimmedEvidence.startsWith('https://')) {
          evidenceCell = `<a href="${trimmedEvidence}" target="_blank" class="evidence-link"><i data-lucide="external-link"></i> Ver Evidência</a>`;
        } else {
          evidenceCell = `<span style="font-size: 13px; color: var(--text-muted); word-break: break-word;">${escapeHtml(trimmedEvidence)}</span>`;
        }
      } else {
        evidenceCell = `<span style="font-size: 12px; color: var(--text-muted); font-style: italic;">Pendente</span>`;
      }

      tr.innerHTML = `
        <td>
          <span class="action-title">${escapeHtml(act.what)}</span>
          <span class="action-detail"><strong>Por quê:</strong> ${escapeHtml(act.why)}</span>
          ${act.project ? `<span class="action-detail" style="color: var(--color-cyan); font-weight:600;"><i data-lucide="folder" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Projeto: ${escapeHtml(act.project)}</span>` : ''}
          ${act.fcaId ? `<span class="action-detail" style="color: var(--color-cyan); font-weight:500;"><i data-lucide="link" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Vinculado ao FCA #${act.fcaId.slice(-4)}</span>` : ''}
        </td>
        <td>
          ${whoContainer}
          <span class="action-detail"><strong>Área:</strong> ${escapeHtml(act.area || 'N/A')}</span>
          <span class="action-detail"><strong>Onde:</strong> ${escapeHtml(act.where)}</span>
        </td>
        <td>
          <div style="font-weight: 500;">${formattedDate}</div>
          <span style="font-size:11px; color:var(--text-muted)">Prazo final</span>
        </td>
        <td>
          <div style="max-height: 60px; overflow-y: auto; font-size: 13px;">${escapeHtml(act.how)}</div>
        </td>
        <td>
          ${costCellContent}
        </td>
        <td>
          <span class="badge ${badgeClass}">${act.status}</span>
          ${act.statusReason ? `<div style="font-size:11px;color:#ff5e84;margin-top:6px;max-width:140px;line-height:1.2;word-break:break-word;"><strong>Motivo:</strong> ${escapeHtml(act.statusReason)}</div>` : ''}
          <div style="margin-top: 6px;">${evidenceCell}</div>
        </td>
        <td>
          <div class="table-actions">
            <button onclick="editAction('${act.id}')" class="btn-icon edit" title="Editar">
              <i data-lucide="edit-3"></i>
            </button>
            <button onclick="deleteAction('${act.id}')" class="btn-icon delete" title="Excluir">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      `;
      
      actionsListBody.appendChild(tr);
    });
    
    lucide.createIcons();
  }

  // =========================================================================
  // ATUALIZAÇÃO E DESENHO DO DASHBOARD (ESTATÍSTICAS E GRÁFICOS)
  // =========================================================================
  function updateDashboard() {
    const total = actions.length;
    const completed = actions.filter(a => a.status === 'Concluído').length;
    const progress = actions.filter(a => a.status === 'Iniciado').length;
    const delayed = actions.filter(a => a.status === 'Atrasado').length;
    const pending = actions.filter(a => a.status === 'Não Iniciado').length;
    const cancelled = actions.filter(a => a.status === 'Cancelado').length;
    const stopped = actions.filter(a => a.status === 'Parado').length;

    // Atualiza os cartões de estatísticas
    statTotal.innerText = total;
    statProgress.innerText = progress;
    statCompleted.innerText = completed;
    statDelayed.innerText = delayed + stopped + pending + cancelled;

    statProgressPct.innerText = total > 0 ? `${Math.round((progress / total) * 100)}% do total` : '0% do total';
    statCompletedPct.innerText = total > 0 ? `${Math.round((completed / total) * 100)}% do total` : '0% do total';
    statDelayedPct.innerText = total > 0 ? `${Math.round(((delayed + stopped + pending + cancelled) / total) * 100)}% do total` : '0% do total';

    renderStatusChart(completed, progress, pending, delayed, cancelled, stopped);
    renderCostsChart();
    renderResponsibleChart();
    renderSectorsChart();
    renderProjectSummaryTable();
  }

  // Gráfico 1: Status das Ações (Doughnut)
  function renderStatusChart(completed, progress, pending, delayed, cancelled, stopped) {
    const ctx = document.getElementById('chart-status').getContext('2d');
    
    if (chartStatusInst) chartStatusInst.destroy();
    
    chartStatusInst = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Não Iniciado', 'Iniciado', 'Concluído', 'Atrasado', 'Cancelado', 'Parado'],
        datasets: [{
          data: [pending, progress, completed, delayed, cancelled, stopped],
          backgroundColor: [
            'rgba(255, 179, 0, 0.75)',
            'rgba(0, 198, 255, 0.75)',
            'rgba(0, 230, 118, 0.75)',
            'rgba(255, 23, 68, 0.75)',
            'rgba(156, 163, 175, 0.75)',
            'rgba(189, 0, 255, 0.75)'
          ],
          borderColor: [
            '#ffb300',
            '#00c6ff',
            '#00e676',
            '#ff1744',
            '#9ca3af',
            '#bd00ff'
          ],
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: getChartTextColor(), font: { family: 'Inter', size: 11 } }
          }
        },
        cutout: '65%'
      }
    });
  }

  // Gráfico 2: Custo das Ações por Setor / Onde (Barra Vertical)
  function renderCostsChart() {
    const ctx = document.getElementById('chart-costs').getContext('2d');
    
    if (chartCostsInst) chartCostsInst.destroy();

    const sectorCosts = {};
    actions.forEach(a => {
      const sector = a.where || 'Sem Setor';
      sectorCosts[sector] = (sectorCosts[sector] || 0) + (a.howMuch || 0);
    });

    const labels = Object.keys(sectorCosts);
    const data = Object.values(sectorCosts);

    chartCostsInst = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Investimento (R$)',
          data,
          backgroundColor: 'rgba(0, 242, 254, 0.4)',
          borderColor: '#00f2fe',
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { 
              color: getChartTextColor(),
              callback: function(value) {
                return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
              }
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: getChartTextColor() }
          }
        }
      }
    });
  }

  // Gráfico 3: Ações por Responsável / Quem (Barra Horizontal)
  function renderResponsibleChart() {
    const ctx = document.getElementById('chart-responsible').getContext('2d');
    
    if (chartResponsibleInst) chartResponsibleInst.destroy();

    const respCount = {};
    actions.forEach(a => {
      const resp = a.who || 'Sem Responsável';
      respCount[resp] = (respCount[resp] || 0) + 1;
    });

    const labels = Object.keys(respCount);
    const data = Object.values(respCount);

    chartResponsibleInst = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: 'rgba(189, 0, 255, 0.4)',
          borderColor: '#bd00ff',
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { 
              color: getChartTextColor(),
              stepSize: 1
            }
          },
          y: {
            grid: { display: false },
            ticks: { color: getChartTextColor() }
          }
        }
      }
    });
  }

  // Gráfico 4: Volume de Ações por Setor / Onde (Polar Area)
  function renderSectorsChart() {
    const ctx = document.getElementById('chart-sectors').getContext('2d');
    
    if (chartSectorsInst) chartSectorsInst.destroy();

    const sectorCount = {};
    actions.forEach(a => {
      const sector = a.where || 'Sem Setor';
      sectorCount[sector] = (sectorCount[sector] || 0) + 1;
    });

    const labels = Object.keys(sectorCount);
    const data = Object.values(sectorCount);

    chartSectorsInst = new Chart(ctx, {
      type: 'polarArea',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            'rgba(0, 242, 254, 0.3)',
            'rgba(189, 0, 255, 0.3)',
            'rgba(255, 0, 127, 0.3)',
            'rgba(0, 114, 255, 0.3)',
            'rgba(0, 230, 118, 0.3)'
          ],
          borderColor: [
            '#00f2fe',
            '#bd00ff',
            '#ff007f',
            '#0072ff',
            '#00e676'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: getChartTextColor(), font: { family: 'Inter', size: 11 } }
          }
        },
        scales: {
          r: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { display: false }
          }
        }
      }
    });
  }

  function renderProjectSummaryTable() {
    projectSummaryBody.innerHTML = '';
    
    // Agrupa dados por projeto
    const projectGroups = {};
    
    actions.forEach(act => {
      const projName = act.project ? act.project.trim() : 'Sem Projeto';
      if (!projectGroups[projName]) {
        projectGroups[projName] = {
          name: projName,
          actionsCount: 0,
          totalCost: 0,
          totalCashImpact: 0,
          hiringsCount: 0,
          hiringsCost: 0,
          reductionsCount: 0,
          reductionsCost: 0,
          migrationsCount: 0,
          migrationsCost: 0
        };
      }
      
      const group = projectGroups[projName];
      group.actionsCount++;
      group.totalCost += act.howMuch || 0;
      if (act.hasCashImpact === 'Sim') {
        group.totalCashImpact += act.cashImpactValue || 0;
      }
      
      if (act.peopleAction === 'Contratação') {
        group.hiringsCount++;
        group.hiringsCost += act.peopleCost || 0;
      } else if (act.peopleAction === 'Redução') {
        group.reductionsCount++;
        group.reductionsCost += act.peopleCost || 0;
      } else if (act.peopleAction === 'Migrar PJ') {
        group.migrationsCount++;
        group.migrationsCost += act.peopleCost || 0;
      }
    });
    
    const projectsArray = Object.values(projectGroups);
    
    if (projectsArray.length === 0) {
      projectSummaryBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 20px;">Nenhum projeto cadastrado.</td></tr>`;
      return;
    }
    
    // Ordena por nome do projeto
    projectsArray.sort((a, b) => a.name.localeCompare(b.name));
    
    projectsArray.forEach(proj => {
      const netPeopleCost = proj.hiringsCost + proj.migrationsCost - proj.reductionsCost;
      const formattedNet = netPeopleCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const netColor = netPeopleCost >= 0 ? 'var(--status-completed)' : 'var(--status-delayed)';
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(proj.name)}</td>
        <td><span class="badge badge-progress" style="background: rgba(0, 198, 255, 0.1); color: var(--color-cyan); border: 1px solid rgba(0, 198, 255, 0.2);">${proj.actionsCount}</span></td>
        <td style="font-weight: 500;">${(proj.totalCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
        <td style="font-weight: 500; color: var(--color-cyan);">${(proj.totalCashImpact).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
        <td>
          <span style="color: var(--status-completed); font-weight: 600;">${proj.hiringsCount}</span> 
          <span style="font-size:11px; color: var(--text-muted);">(${(proj.hiringsCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })})</span>
        </td>
        <td>
          <span style="color: var(--status-delayed); font-weight: 600;">${proj.reductionsCount}</span> 
          <span style="font-size:11px; color: var(--text-muted);">(${(proj.reductionsCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })})</span>
        </td>
        <td>
          <span style="color: #ff9800; font-weight: 600;">${proj.migrationsCount}</span> 
          <span style="font-size:11px; color: var(--text-muted);">(${(proj.migrationsCost).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })})</span>
        </td>
        <td style="font-weight: 700; color: ${netColor};">${formattedNet}</td>
      `;
      projectSummaryBody.appendChild(tr);
    });
  }

  // =========================================================================
  // UTILITÁRIOS (TOASTS E HIGIENIZAÇÃO HTML)
  // =========================================================================
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  const toastIcon = document.getElementById('toast-icon');
  let toastTimeout = null;

  function showToast(message, type = 'info') {
    if (toastTimeout) clearTimeout(toastTimeout);
    
    toastMsg.innerText = message;
    
    // Classes de tipos
    toast.className = 'toast active';
    if (type === 'error') {
      toast.classList.add('toast-error');
      toastIcon.setAttribute('data-lucide', 'alert-triangle');
    } else if (type === 'success') {
      toast.classList.add('toast-success');
      toastIcon.setAttribute('data-lucide', 'check-circle-2');
    } else if (type === 'warning') {
      toast.classList.add('toast-warning');
      toastIcon.setAttribute('data-lucide', 'alert-circle');
    } else {
      toastIcon.setAttribute('data-lucide', 'info');
    }
    
    lucide.createIcons();

    // Esconde depois de 4 segundos
    toastTimeout = setTimeout(() => {
      toast.classList.remove('active');
    }, 4000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =========================================================================
  // MÓDULO FCA - LÓGICA E EVENTOS [NEW]
  // =========================================================================
  
  // Renderização da Tabela de FCAs
  function renderFCAsTable() {
    const searchVal = fcaSearch.value.toLowerCase().trim();
    const filteredFcas = fcas.filter(fca => 
      fca.fact.toLowerCase().includes(searchVal) ||
      fca.cause.toLowerCase().includes(searchVal) ||
      fca.proposedAction.toLowerCase().includes(searchVal)
    );

    fcasListBody.innerHTML = '';

    if (filteredFcas.length === 0) {
      fcasEmptyState.style.display = 'block';
      return;
    }

    fcasEmptyState.style.display = 'none';

    filteredFcas.forEach(fca => {
      const tr = document.createElement('tr');
      
      // Procura a ação 5W2H vinculada
      const linkedAction = actions.find(a => a.fcaId === fca.id || a.id === fca.actionId);
      
      let statusCell = '';
      if (linkedAction) {
        let badgeClass = 'badge-pending';
        if (linkedAction.status === 'Iniciado') badgeClass = 'badge-progress';
        else if (linkedAction.status === 'Concluído') badgeClass = 'badge-completed';
        else if (linkedAction.status === 'Atrasado') badgeClass = 'badge-delayed';
        else if (linkedAction.status === 'Cancelado') badgeClass = 'badge-cancelled';
        else if (linkedAction.status === 'Parado') badgeClass = 'badge-stopped';

        statusCell = `
          <span class="badge ${badgeClass}">${linkedAction.status}</span>
          <span style="display:block;font-size:11px;color:var(--text-muted);margin-top:6px;font-weight:500;">
            <i data-lucide="arrow-right" style="width:10px;height:10px;display:inline-block;vertical-align:middle;margin-right:2px;"></i>
            Ação: ${escapeHtml(linkedAction.what.slice(0, 18))}...
          </span>
          <span style="display:block;font-size:11px;color:#d161ff;margin-top:4px;font-weight:500;">
            <i data-lucide="users" style="width:10px;height:10px;display:inline-block;vertical-align:middle;margin-right:2px;"></i>
            Líder(es): ${escapeHtml(linkedAction.who)}
          </span>
        `;
      } else {
        statusCell = `
          <button onclick="generate5wFromFca('${fca.id}')" class="btn btn-primary" style="padding: 6px 12px; font-size:12px; width: 100%; border:none; display:flex; align-items:center; justify-content:center; gap:4px;">
            <i data-lucide="plus" style="width:14px;height:14px;"></i> Criar Ação 5W
          </button>
        `;
      }

      tr.innerHTML = `
        <td>
          <span class="action-title" style="white-space: pre-wrap; display: block; max-height: 80px; overflow-y: auto;">${escapeHtml(fca.fact)}</span>
          <span class="action-detail">Fato/Problema ocorrido</span>
        </td>
        <td>
          <div style="font-size: 13px; line-height: 1.4; max-height: 80px; overflow-y: auto; white-space: pre-wrap;">${escapeHtml(fca.cause)}</div>
        </td>
        <td>
          <div style="font-size: 13px; line-height: 1.4; max-height: 80px; overflow-y: auto; white-space: pre-wrap;">${escapeHtml(fca.proposedAction)}</div>
        </td>
        <td>
          ${statusCell}
        </td>
        <td>
          <div class="table-actions">
            <button onclick="editFca('${fca.id}')" class="btn-icon edit" title="Editar">
              <i data-lucide="edit-3"></i>
            </button>
            <button onclick="deleteFca('${fca.id}')" class="btn-icon delete" title="Excluir">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      `;
      
      fcasListBody.appendChild(tr);
    });

    lucide.createIcons();
  }

  // Controle do modal de FCA
  btnNewFca.addEventListener('click', () => {
    openFcaModal();
  });

  btnFcaModalClose.addEventListener('click', closeFcaModal);
  btnFcaCancel.addEventListener('click', closeFcaModal);
  // O modal de FCA não fecha mais ao clicar fora

  function openFcaModal(fcaToEdit = null) {
    formFca.reset();
    
    if (fcaToEdit) {
      fcaModalTitle.innerText = "Editar Análise FCA";
      fcaIdField.value = fcaToEdit.id;
      fieldFcaFact.value = fcaToEdit.fact;
      fieldFcaCause.value = fcaToEdit.cause;
      fieldFcaAction.value = fcaToEdit.proposedAction;
    } else {
      fcaModalTitle.innerText = "Nova Análise FCA";
      fcaIdField.value = '';
    }
    
    modalFca.classList.add('active');
  }

  function closeFcaModal() {
    modalFca.classList.remove('active');
  }

  // Gravar/Atualizar FCA
  formFca.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = fcaIdField.value;
    const isEdit = id !== '';
    
    const fcaData = {
      id: isEdit ? id : String(Date.now()),
      fact: fieldFcaFact.value.trim(),
      cause: fieldFcaCause.value.trim(),
      proposedAction: fieldFcaAction.value.trim(),
      actionId: isEdit ? (fcas.find(f => f.id === id)?.actionId || '') : '',
      createdAt: isEdit ? (fcas.find(f => f.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    if (isEdit) {
      fcas = fcas.map(f => f.id === id ? fcaData : f);
      showToast("Análise FCA atualizada localmente!", "success");
    } else {
      fcas.unshift(fcaData);
      showToast("Novo FCA registrado localmente!", "success");
    }

    saveLocalFCAs();
    renderFCAsTable();
    closeFcaModal();

    if (dbConnected) {
      await syncWithDrive();
    }
  });

  // Editar FCA
  window.editFca = function(id) {
    const fca = fcas.find(f => f.id === id);
    if (fca) {
      openFcaModal(fca);
    }
  };

  // Excluir FCA
  window.deleteFca = async function(id) {
    if (confirm("Deseja realmente excluir esta análise FCA? Os vínculos com ações 5W2H serão removidos.")) {
      // Desvincula a ação correspondente
      actions = actions.map(act => act.fcaId === id ? { ...act, fcaId: '' } : act);
      saveLocalActions();
      renderActionsTable();

      fcas = fcas.filter(f => f.id !== id);
      saveLocalFCAs();
      renderFCAsTable();
      updateDashboard();
      showToast("Análise FCA excluída!", "info");

      if (dbConnected) {
        await syncWithDrive();
      }
    }
  };

  // Gerar ação 5W2H a partir de um FCA
  window.generate5wFromFca = function(fcaId) {
    const fca = fcas.find(f => f.id === fcaId);
    if (!fca) return;

    openModal(); // Abre modal 5W2H limpo
    
    modalTitle.innerText = "Nova Ação 5W2H (Gerada pelo FCA)";
    actionFcaIdField.value = fca.id;
    fcaLinkNotice.style.display = 'block';
    
    // Pré-preenche os campos baseados na análise do FCA
    fieldWhat.value = fca.proposedAction;
    fieldWhy.value = `Fato: ${fca.fact} | Causa raiz: ${fca.cause}`;
    fieldHow.value = `Conforme proposto no FCA: ${fca.proposedAction}`;
    
    // Alterna a aba para a aba dos planos de ação
    switchTab('actions-view');
  };

  // Ouvinte de busca na tabela de FCAs
  fcaSearch.addEventListener('input', renderFCAsTable);

  // =========================================================================
  // EXECUTA A INICIALIZAÇÃO
  // =========================================================================
  init();
});
