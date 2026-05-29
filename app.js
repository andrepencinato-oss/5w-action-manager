/**
 * 5W2H Action Monitor - Controlador Principal da Aplicação
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // ESTADO DA APLICAÇÃO
  // =========================================================================
  let actions = [];
  let fcas = [];
  let headcount = [];
  let selectedEmployeeIds = [];
  let currentEmployeeCTags = [];
  let currentEmployeeHTags = [];
  let currentEmployeeATags = [];
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
  const btnClearActionSearch = document.getElementById('btn-clear-action-search');
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
  const hasCashImpactGroup = document.getElementById('has-cash-impact-group');
  const cashImpactValueGroup = document.getElementById('cash-impact-value-group');
  const fieldCashImpactValue = document.getElementById('field-cash-impact-value');
  
  // Elementos do Projeto e Movimentação de Pessoas
  const fieldProject = document.getElementById('field-project');
  const projectCustomGroup = document.getElementById('project-custom-group');
  const fieldProjectCustom = document.getElementById('field-project-custom');
  const fieldAreaGroup = document.getElementById('field-area-group');
  const fieldHowMuchGroup = document.getElementById('field-how-much-group');
  const peopleActionContainer = document.getElementById('people-action-container');
  const collaboratorsListReadOnly = document.getElementById('collaborators-list-read-only');
  const actionPeopleListField = document.getElementById('action-people-list-field');
  const projectSummaryBody = document.getElementById('project-summary-body');

  // Elementos do Quadro de Pessoas e Team Builder [NEW]
  const peopleListBody = document.getElementById('people-list-body');
  const peopleEmptyState = document.getElementById('people-empty-state');
  const peopleSearch = document.getElementById('people-search');
  const btnClearPeopleSearch = document.getElementById('btn-clear-people-search');
  const filterPeopleStatus = document.getElementById('filter-people-status');
  const btnImportPeopleXlsx = document.getElementById('btn-import-people-xlsx');
  const peopleXlsxFilePicker = document.getElementById('people-xlsx-file-picker');
  const btnNewEmployee = document.getElementById('btn-new-employee');
  
  const modalEmployee = document.getElementById('modal-employee');
  const formEmployee = document.getElementById('form-employee');
  const employeeModalTitle = document.getElementById('employee-modal-title');
  const btnEmployeeModalClose = document.getElementById('btn-employee-modal-close');
  const btnEmployeeCancel = document.getElementById('btn-employee-cancel');
  
  const employeeIdField = document.getElementById('employee-id-field');
  const fieldEmployeeCadastro = document.getElementById('field-employee-cadastro');
  const fieldEmployeeName = document.getElementById('field-employee-name');
  const fieldEmployeeAdmission = document.getElementById('field-employee-admission');
  const fieldEmployeeStatus = document.getElementById('field-employee-status');
  const fieldEmployeeRole = document.getElementById('field-employee-role');
  const fieldEmployeeArea = document.getElementById('field-employee-area');
  const fieldEmployeeSalary = document.getElementById('field-employee-salary');
  const fieldEmployeeCost = document.getElementById('field-employee-cost');
  const fieldEmployeeC = document.getElementById('field-employee-c');
  const fieldEmployeeH = document.getElementById('field-employee-h');
  const fieldEmployeeA = document.getElementById('field-employee-a');
  
  // Seletores do editor de tags do colaborador
  const cTagsVisualContainer = document.getElementById('c-tags-visual-container');
  const hTagsVisualContainer = document.getElementById('h-tags-visual-container');
  const aTagsVisualContainer = document.getElementById('a-tags-visual-container');
  const cTagNewInput = document.getElementById('c-tag-new-input');
  const hTagNewInput = document.getElementById('h-tag-new-input');
  const aTagNewInput = document.getElementById('a-tag-new-input');
  const btnAddCTag = document.getElementById('btn-add-c-tag');
  const btnAddHTag = document.getElementById('btn-add-h-tag');
  const btnAddATag = document.getElementById('btn-add-a-tag');
  const cTagSuggestions = document.getElementById('c-tag-suggestions');
  const hTagSuggestions = document.getElementById('h-tag-suggestions');
  const aTagSuggestions = document.getElementById('a-tag-suggestions');
  
  const peopleStatTotal = document.getElementById('people-stat-total');
  const peopleStatActive = document.getElementById('people-stat-active');
  const peopleStatSalary = document.getElementById('people-stat-salary');
  const peopleStatCost = document.getElementById('people-stat-cost');
  
  const checkAllPeople = document.getElementById('check-all-people');
  const draftTeamCount = document.getElementById('draft-team-count');
  const teamBuilderEmpty = document.getElementById('team-builder-empty');
  const teamBuilderContent = document.getElementById('team-builder-content');
  const draftTeamMembers = document.getElementById('draft-team-members');
  const consolidatedC = document.getElementById('consolidated-c');
  const consolidatedH = document.getElementById('consolidated-h');
  const consolidatedA = document.getElementById('consolidated-a');
  const draftTeamCost = document.getElementById('draft-team-cost');

  // Sub-Ações / Desdobramentos
  const btnAddSubAction = document.getElementById('btn-add-sub-action');
  const subActionsModalList = document.getElementById('sub-actions-modal-list');

  // Resumo Executivo [NEW]
  const modalSummary = document.getElementById('modal-summary');
  const btnSummaryModalClose = document.getElementById('btn-summary-modal-close');
  const btnSummaryClose = document.getElementById('btn-summary-close');
  const btnSummaryDownload = document.getElementById('btn-summary-download');
  const btnCopySummary = document.getElementById('btn-copy-summary');

  // Chave pública/usuário para testar integração com Gemini (substitua pela sua)
  const GEMINI_API_KEY = "AIzaSyAEYg-MhJcd2U7G7jbg5zm93cDj5U0URbI"; // fornecida pelo usuário

  // Detalhes extras de transição PJ e custo de demissão [NEW]
  const pjDetailsContainer = document.getElementById('pj-details-container');
  const pjCurrentSalary = document.getElementById('pj-current-salary');
  const pjCurrentCost = document.getElementById('pj-current-cost');
  const fieldPjProposedCost = document.getElementById('field-pj-proposed-cost');
  const pjCostDifference = document.getElementById('pj-cost-difference');

  const reductionDetailsContainer = document.getElementById('reduction-details-container');
  const fieldDismissalCost = document.getElementById('field-dismissal-cost');
  const reductionMonthlySavings = document.getElementById('reduction-monthly-savings');
  const btnGeneratePivotAction = document.getElementById('btn-generate-pivot-action');

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

    // Inicializa arrays como vazios por padrão
    actions = [];
    fcas = [];
    headcount = [];

    // Limpa dados de mock antigos do localStorage para iniciar limpo
    const rawActions = localStorage.getItem('5w2h_actions');
    if (rawActions && (rawActions.includes('act-1') || rawActions.includes('act-2') || rawActions.includes('act-3'))) {
      localStorage.removeItem('5w2h_actions');
    }
    const rawHeadcount = localStorage.getItem('5w2h_headcount');
    if (rawHeadcount && (rawHeadcount.includes('hc-1') || rawHeadcount.includes('hc-2') || rawHeadcount.includes('hc-3'))) {
      localStorage.removeItem('5w2h_headcount');
    }
    
    // 3. Registra os ícones do Lucide
    lucide.createIcons();
    initTagEditorListeners();
    initTransitionListeners();
    initSubActionsListeners();

    // 4. Desenha UI Inicial (Vazia por padrão)
    renderActionsTable();
    renderFCAsTable();
    renderHeadcountTable();
    updateHeadcountStats();
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
  const MOCK_ACTIONS = [];

  function loadLocalActions() {
    const raw = localStorage.getItem('5w2h_actions');
    if (raw) {
      try {
        actions = JSON.parse(raw);
        if (actions.length === 0) {
          actions = [...MOCK_ACTIONS];
          saveLocalActions();
        }
      } catch (e) {
        console.error("Erro ao carregar ações do localStorage:", e);
        actions = [...MOCK_ACTIONS];
      }
    } else {
      actions = [...MOCK_ACTIONS];
      saveLocalActions();
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
      await GoogleDriveDB.saveHeadcount(headcount);
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
    
    // Zera os dados na tela ao desconectar, para que venha vazio
    actions = [];
    fcas = [];
    headcount = [];
    
    renderActionsTable();
    renderFCAsTable();
    renderHeadcountTable();
    updateDashboard();
    updateHeadcountStats();
    
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

      // Sincroniza Headcount
      const cloudHeadcount = await GoogleDriveDB.loadHeadcount();
      if (cloudHeadcount.length === 0 && headcount.length > 0) {
        // Se a nuvem estiver vazia, o local será sincronizado na primeira gravação
      } else {
        headcount = cloudHeadcount;
        saveLocalHeadcount();
      }

      dbConnected = true;
      updateConnectionStatus(true, 'connected');
      
      renderActionsTable();
      renderFCAsTable();
      renderHeadcountTable();
      updateHeadcountStats();
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
      
      // Oculta campos de impacto no caixa no formulário
      hasCashImpactGroup.style.display = 'none';
      fieldHasCashImpact.removeAttribute('required');
      fieldHasCashImpact.value = 'Não';
      
      cashImpactValueGroup.style.display = 'none';
      fieldCashImpactValue.removeAttribute('required');
      fieldCashImpactValue.value = '';
      
      // Exibe container de Pessoas
      peopleActionContainer.style.display = 'block';
    } else {
      // Exibe Area e Custo naturais
      fieldAreaGroup.style.display = 'block';
      fieldArea.setAttribute('required', 'required');
      
      fieldHowMuchGroup.style.display = 'block';
      
      // Exibe campos de impacto no caixa
      hasCashImpactGroup.style.display = 'block';
      fieldHasCashImpact.setAttribute('required', 'required');
      
      // Controla a exibição condicional do valor de impacto
      handleCashImpactChange();
      
      // Oculta container de Pessoas
      peopleActionContainer.style.display = 'none';
    }
  }

  function renderCollaboratorsReadOnly(collabList) {
    collaboratorsListReadOnly.innerHTML = '';
    if (!collabList || collabList.length === 0) {
      collaboratorsListReadOnly.innerHTML = `<span style="font-size: 13px; color: var(--text-muted); font-style: italic;">Nenhum colaborador movimentado.</span>`;
      return;
    }
    
    collabList.forEach(c => {
      const item = document.createElement('div');
      item.className = 'collab-read-only-item';
      
      const formattedCost = (c.cost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
      let badgeStyle = '';
      if (c.action === 'Contratação') badgeStyle = 'background: var(--status-completed-bg); color: var(--status-completed);';
      else if (c.action === 'Redução') badgeStyle = 'background: var(--status-delayed-bg); color: var(--status-delayed);';
      else if (c.action === 'Migrar PJ') badgeStyle = 'background: rgba(255, 152, 0, 0.15); color: #ff9800;';
      else if (c.action === 'Enquadramento') badgeStyle = 'background: rgba(0, 242, 254, 0.15); color: var(--color-cyan);';
      else badgeStyle = 'background: rgba(189, 0, 255, 0.15); color: #bd00ff;';
      
      item.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-weight: 600; color: var(--text-main);">${escapeHtml(capitalizeText(c.name))}</span>
          <span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(capitalizeText(c.role))} | ${escapeHtml(c.area)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge" style="${badgeStyle}">${escapeHtml(c.action)}</span>
          <span style="font-weight: 600; color: var(--text-main); font-size: 12px;">${formattedCost}</span>
        </div>
      `;
      collaboratorsListReadOnly.appendChild(item);
    });
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
      ["ID", "What (O que)", "Why (Por que)", "Where (Onde)", "Area (Área)", "When (Quando)", "Who (Quem)", "How (Como)", "How Much (Quanto)", "Status", "StatusReason (Motivo)", "Evidence (Evidência)", "FcaId", "HasCashImpact (Impacto no Caixa?)", "CashImpactValue (Valor do Impacto)", "Project (Projeto)", "PeopleAction (Contratação/Redução/Migrar PJ)", "PeopleName (Nome Colaborador)", "PeopleCost (Custo Movimentação)", "PeopleRole (Cargo)", "PeopleList (Lista Colaboradores JSON)"]
    ];
    const actionsSample = [
      ["1001", "Exemplo de Ação 5W2H", "Exemplo de Justificativa", "Setor de Operações", "Operações", "2026-12-31", "André, Carlos", "Exemplo de Como Fazer", 3500.00, "Não Iniciado", "", "", "", "Sim", 5000.00, "Pessoas", "Contratação", "Mariana Santos", 3500.00, "Analista Financeiro", '[{"action":"Contratação","name":"Mariana Santos","role":"Analista Financeiro","area":"Operações","cost":3500}]']
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
              peoplerole: headers.findIndex(h => h.includes("peoplerole") || h.includes("cargo")),
              peoplelist: headers.findIndex(h => h.includes("peoplelist") || h.includes("lista colaboradores") || h.includes("lista de colaboradores"))
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
              const peopleListVal = colMap.peoplelist !== -1 && row[colMap.peoplelist] ? String(row[colMap.peoplelist]).trim() : '';
              
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
                peopleList: peopleListVal,
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
    
    // Limpa a lista de colaboradores e containers de detalhes extras
    actionPeopleListField.value = '';
    collaboratorsListReadOnly.innerHTML = '';
    pjDetailsContainer.style.display = 'none';
    pjCurrentCost.removeAttribute('data-value');
    fieldPjProposedCost.value = '';
    pjCostDifference.innerText = 'R$ 0,00';
    pjCostDifference.style.color = 'var(--text-muted)';
    reductionDetailsContainer.style.display = 'none';
    fieldDismissalCost.value = '';
    reductionMonthlySavings.innerText = 'R$ 0,00';
    subActionsModalList.innerHTML = '';
    
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
      
      // Carrega os colaboradores do peopleList
      let collabList = [];
      if (actionToEdit.peopleList) {
        try {
          collabList = JSON.parse(actionToEdit.peopleList);
          actionPeopleListField.value = actionToEdit.peopleList;
        } catch (e) {
          console.error("Erro parsing peopleList in openModal:", e);
        }
      }
      
      renderCollaboratorsReadOnly(collabList);
      
      const firstCollab = collabList[0];
      if (firstCollab && actionToEdit.project === 'Pessoas') {
        if (firstCollab.action === 'Migrar PJ') {
          pjDetailsContainer.style.display = 'block';
          
          const emp = headcount.find(e => e.cadastro === firstCollab.cadastro || e.name === firstCollab.name);
          const currentSal = emp ? emp.salary : (firstCollab.salary || 0);
          const currentCst = emp ? emp.cost : (firstCollab.currentCost || firstCollab.cost || 0);
          
          pjCurrentSalary.innerText = currentSal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          pjCurrentCost.innerText = currentCst.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          pjCurrentCost.setAttribute('data-value', currentCst);
          
          fieldPjProposedCost.value = firstCollab.cost || '';
          updatePjDifferenceCalculations(currentCst, firstCollab.cost || 0);
        } else if (firstCollab.action === 'Redução') {
          reductionDetailsContainer.style.display = 'block';
          
          const emp = headcount.find(e => e.cadastro === firstCollab.cadastro || e.name === firstCollab.name);
          const currentCst = emp ? emp.cost : (firstCollab.cost || 0);
          reductionMonthlySavings.innerText = currentCst.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          
          fieldDismissalCost.value = actionToEdit.howMuch || '';
        }
      }
      
      handleStatusChange();
      handleCashImpactChange();
      handleProjectChange();

      if (actionToEdit.fcaId) {
        fcaLinkNotice.style.display = 'block';
      }

      // Carrega as sub-ações
      let subActionsList = [];
      if (actionToEdit.subActionsList) {
        try {
          subActionsList = JSON.parse(actionToEdit.subActionsList);
        } catch (e) {
          console.error("Erro parsing subActionsList in openModal:", e);
        }
      }
      subActionsList.forEach(sub => renderSubActionFormItem(sub));
    } else {
      modalTitle.innerText = "Nova Ação 5W2H";
      actionIdField.value = '';
      fieldStatus.value = 'Não Iniciado';
      fieldStatusReason.value = '';
      
      // Impacto no Caixa
      fieldHasCashImpact.value = 'Não';
      fieldCashImpactValue.value = '';
      
      // Projeto e Movimentação de Pessoas - Padroniza para "Sem Projeto" por padrão
      fieldProject.value = 'Sem Projeto';
      fieldProjectCustom.value = '';
      
      renderCollaboratorsReadOnly([]);
      
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

    // Coleta as informações de colaboradores
    let collaborators = [];
    if (actionPeopleListField.value) {
      try {
        collaborators = JSON.parse(actionPeopleListField.value);
      } catch (e) {
        console.error("Erro parsing peopleList in submit:", e);
      }
    }
    let totalPeopleCost = 0;
    let names = [];
    let roles = [];
    let areas = [];
    let actionsTypes = new Set();
    
    collaborators.forEach(c => {
      totalPeopleCost += (c.cost || 0);
      if (c.name) names.push(c.name);
      if (c.role) roles.push(c.role);
      if (c.area) areas.push(c.area);
      if (c.action) actionsTypes.add(c.action);
    });

    if (isPessoasProj && collaborators.length === 0) {
      showToast("Por favor, adicione pelo menos um colaborador para o projeto Pessoas.", "error");
      return;
    }

    // Validação de inputs de detalhes extras do projeto Pessoas
    if (isPessoasProj && collaborators.length === 1) {
      const firstCollab = collaborators[0];
      if (firstCollab.action === 'Migrar PJ') {
        const proposedVal = parseFloat(fieldPjProposedCost.value);
        if (isNaN(proposedVal) || proposedVal < 0) {
          showToast("Por favor, insira o Custo Proposto (PJ) válido.", "error");
          return;
        }
      } else if (firstCollab.action === 'Redução') {
        const dismissalVal = parseFloat(fieldDismissalCost.value);
        if (isNaN(dismissalVal) || dismissalVal < 0) {
          showToast("Por favor, insira o Custo de Demissão Calculada válido.", "error");
          return;
        }
      }
    }

    let finalPeopleAction = 'Não';
    if (isPessoasProj && collaborators.length > 0) {
      if (actionsTypes.size === 1) {
        finalPeopleAction = Array.from(actionsTypes)[0];
      } else {
        finalPeopleAction = 'Vários';
      }
    }

    let finalHowMuch = totalPeopleCost;
    let finalHasCashImpact = fieldHasCashImpact.value;
    let finalCashImpactVal = fieldHasCashImpact.value === 'Sim' ? (parseFloat(fieldCashImpactValue.value) || 0) : 0;

    if (isPessoasProj && collaborators.length === 1) {
      const firstCollab = collaborators[0];
      if (firstCollab.action === 'Migrar PJ') {
        const proposedVal = parseFloat(fieldPjProposedCost.value) || 0;
        const currentCst = parseFloat(pjCurrentCost.getAttribute('data-value')) || firstCollab.currentCost || firstCollab.cost || 0;
        
        finalHowMuch = proposedVal;
        finalHasCashImpact = 'Sim';
        finalCashImpactVal = currentCst - proposedVal; // Economia = positivo, Aumento = negativo
      } else if (firstCollab.action === 'Redução') {
        const dismissalVal = parseFloat(fieldDismissalCost.value) || 0;
        
        finalHowMuch = dismissalVal;
        finalHasCashImpact = 'Sim';
        finalCashImpactVal = -dismissalVal; // Saída de caixa = impacto negativo
      }
    }

    // Coleta as sub-ações
    const subActionCards = document.querySelectorAll('.sub-action-item-card');
    const subActions = [];
    let isSubActionsValid = true;
    
    subActionCards.forEach(card => {
      const what = card.querySelector('.sub-what').value.trim();
      const who = card.querySelector('.sub-who').value.trim();
      const status = card.querySelector('.sub-status').value;
      const startDate = card.querySelector('.sub-start-date').value;
      const endDate = card.querySelector('.sub-end-date').value;
      const cashImpact = card.querySelector('.sub-cash-impact').value;
      const cashValueRaw = card.querySelector('.sub-cash-value').value;
      const cashValue = cashImpact === 'Sim' ? (parseFloat(cashValueRaw) || 0) : 0;
      
      if (!what || !who || !startDate || !endDate) {
        isSubActionsValid = false;
      }
      
      subActions.push({
        what,
        who,
        status,
        startDate,
        endDate,
        cashImpact,
        cashValue
      });
    });
    
    if (!isSubActionsValid) {
      showToast("Por favor, preencha todos os campos obrigatórios das sub-ações.", "error");
      return;
    }

    const actionData = {
      id: isEdit ? id : String(Date.now()),
      what: fieldWhat.value.trim(),
      why: fieldWhy.value.trim(),
      who: fieldWho.value.trim(),
      where: fieldWhere.value.trim(),
      area: isPessoasProj ? [...new Set(areas)].join(', ') : fieldArea.value.trim(),
      when: fieldWhen.value,
      how: fieldHow.value.trim(),
      howMuch: isPessoasProj ? finalHowMuch : (parseFloat(fieldHowMuch.value) || 0),
      status: fieldStatus.value,
      evidence: fieldEvidence.value.trim(),
      fcaId: fcaId,
      statusReason: (fieldStatus.value === 'Cancelado' || fieldStatus.value === 'Parado') ? fieldStatusReason.value.trim() : '',
      hasCashImpact: finalHasCashImpact,
      cashImpactValue: finalCashImpactVal,
      project: finalProject,
      peopleAction: finalPeopleAction,
      peopleName: isPessoasProj ? names.join(', ') : '',
      peopleRole: isPessoasProj ? roles.join(', ') : '',
      peopleCost: isPessoasProj ? totalPeopleCost : 0,
      peopleList: isPessoasProj ? JSON.stringify(collaborators) : '',
      subActionsList: subActions.length > 0 ? JSON.stringify(subActions) : '',
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
    
    // Sincroniza o headcount de acordo com a movimentação realizada caso esteja "Concluído"
    syncPessoasActionToHeadcount(actionData);

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
  actionSearch.addEventListener('input', () => {
    if (actionSearch.value.trim().length > 0) {
      btnClearActionSearch.style.display = 'flex';
    } else {
      btnClearActionSearch.style.display = 'none';
    }
    renderActionsTable();
  });
  if (btnClearActionSearch) {
    btnClearActionSearch.addEventListener('click', () => {
      actionSearch.value = '';
      btnClearActionSearch.style.display = 'none';
      renderActionsTable();
    });
  }
  filterStatus.addEventListener('change', renderActionsTable);

  function getFilteredActions() {
    const searchVal = stripAccents(actionSearch.value.toLowerCase().trim());
    const statusVal = filterStatus.value;

    return actions.filter(act => {
      const matchesSearch = 
        stripAccents(act.what.toLowerCase()).includes(searchVal) ||
        stripAccents(act.who.toLowerCase()).includes(searchVal) ||
        stripAccents(act.where.toLowerCase()).includes(searchVal) ||
        stripAccents(act.why.toLowerCase()).includes(searchVal) ||
        stripAccents(act.how.toLowerCase()).includes(searchVal) ||
        (act.project && stripAccents(act.project.toLowerCase()).includes(searchVal)) ||
        (act.area && stripAccents(act.area.toLowerCase()).includes(searchVal)) ||
        (act.peopleName && stripAccents(act.peopleName.toLowerCase()).includes(searchVal));

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
      
      let collabs = [];
      if (act.peopleList) {
        try {
          collabs = JSON.parse(act.peopleList);
        } catch (e) {
          console.error("Erro parsing peopleList in renderActionsTable:", e);
        }
      }
      
      if (!Array.isArray(collabs) || collabs.length === 0) {
        if (act.peopleAction && act.peopleAction !== 'Não') {
          collabs = [{
            action: act.peopleAction,
            name: act.peopleName,
            role: act.peopleRole,
            area: act.area,
            cost: act.peopleCost
          }];
        }
      }
      
      if (collabs && collabs.length > 0) {
        costCellContent += `<div style="margin-top: 8px; border-top: 1px solid var(--border-normal); padding-top: 6px; display: flex; flex-direction: column; gap: 6px;">`;
        collabs.forEach(c => {
          const formattedPeopleCost = (c.cost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
          let iconName = 'users';
          let colorStyle = 'var(--color-cyan)';
          if (c.action === 'Contratação') {
            iconName = 'user-plus';
            colorStyle = 'var(--status-completed)';
          } else if (c.action === 'Redução') {
            iconName = 'user-minus';
            colorStyle = 'var(--status-delayed)';
          } else if (c.action === 'Migrar PJ') {
            iconName = 'user-check';
            colorStyle = '#ff9800';
          }
          
          costCellContent += `
            <div style="font-size: 11px; line-height: 1.2; display: flex; flex-direction: column; gap: 1px;">
              <span style="color: ${colorStyle}; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                <i data-lucide="${iconName}" style="width: 12px; height: 12px; flex-shrink: 0;"></i>
                <span onclick="window.filterActionsByEmployee('${escapeHtml(c.name.replace(/'/g, "\\'"))}')" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 130px; cursor: pointer; text-decoration: underline;" title="Filtrar por esta pessoa">${escapeHtml(capitalizeText(c.name))}</span>
              </span>
              <span style="font-size: 10px; color: var(--text-muted); padding-left: 16px;">
                ${escapeHtml(capitalizeText(c.role))} (${escapeHtml(c.action)})
              </span>
              <span style="font-size: 10px; color: var(--text-muted); font-weight: 500; padding-left: 16px;">
                Custo: ${formattedPeopleCost}
              </span>
            </div>
          `;
        });
        costCellContent += `</div>`;
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
          ${(() => {
            let subCollabs = [];
            if (act.subActionsList) {
              try {
                subCollabs = JSON.parse(act.subActionsList);
              } catch (e) {
                console.error("Erro parsing subActionsList in render:", e);
              }
            }

            if (subCollabs.length === 0) return '';
            
            const completedCount = subCollabs.filter(s => s.status === 'Concluído').length;
            
            let totalSubCashImpact = 0;
            subCollabs.forEach(s => {
              if (s.cashImpact === 'Sim') {
                totalSubCashImpact += (s.cashValue || 0);
              }
            });
            
            const formattedSubCash = totalSubCashImpact !== 0 
              ? ` | Caixa: ${totalSubCashImpact.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}` 
              : '';
              
            let subActionsHtml = `
              <div style="margin-top: 8px;">
                <button onclick="window.toggleSubActionsCollapse('${act.id}', event)" class="sub-actions-toggle-btn">
                  <i data-lucide="git-branch" style="width:11px; height:11px;"></i> Sub-Ações (${completedCount}/${subCollabs.length} Concluídas${formattedSubCash})
                </button>
                <div id="sub-actions-collapse-${act.id}" class="sub-actions-collapse-container" style="display:none; margin-top:8px; border-left: 2px solid var(--color-cyan); padding-left: 8px; margin-left: 6px;">
            `;
            
            subCollabs.forEach(sub => {
              let subStatusClass = 'badge-pending';
              if (sub.status === 'Iniciado') subStatusClass = 'badge-progress';
              else if (sub.status === 'Concluído') subStatusClass = 'badge-completed';
              else if (sub.status === 'Atrasado') subStatusClass = 'badge-delayed';
              else if (sub.status === 'Cancelado') subStatusClass = 'badge-cancelled';
              else if (sub.status === 'Parado') subStatusClass = 'badge-stopped';
              
              const formattedStart = sub.startDate ? sub.startDate.split('-').reverse().join('/') : '';
              const formattedEnd = sub.endDate ? sub.endDate.split('-').reverse().join('/') : '';
              const dateRange = formattedStart && formattedEnd ? `${formattedStart} a ${formattedEnd}` : (formattedEnd ? `Prazo: ${formattedEnd}` : '');
              
              const formattedSubImpact = sub.cashImpact === 'Sim' && sub.cashValue 
                ? ` | Caixa: ${(parseFloat(sub.cashValue) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}` 
                : '';
                
              subActionsHtml += `
                <div style="font-size: 11px; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    <span style="font-weight: 500; color: var(--text-main);">${escapeHtml(sub.what)}</span>
                    <span class="badge ${subStatusClass}" style="font-size: 9px; padding: 1px 4px; border: none;">${sub.status}</span>
                  </div>
                  <div style="color: var(--text-muted); font-size: 10px; margin-top: 2px; display: flex; justify-content: space-between;">
                    <span>Resp: <strong>${escapeHtml(sub.who)}</strong>${formattedSubImpact}</span>
                    <span>${dateRange}</span>
                  </div>
                </div>
              `;
            });
            
            subActionsHtml += `
                </div>
              </div>
            `;
            return subActionsHtml;
          })()}
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
            <button onclick="window.showExecutiveSummary('${act.id}')" class="btn-icon summary" title="Resumo Executivo" style="color: var(--color-cyan);">
              <i data-lucide="file-text"></i>
            </button>
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
  function downloadExecutiveSummaryPdf() {
    const actionId = modalSummary.dataset.currentActionId;
    const act = actions.find(item => item.id === actionId);
    if (!act) {
      showToast('Nenhuma ação válida disponível para gerar o PDF.', 'error');
      return;
    }

    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      showToast('Biblioteca jsPDF não está carregada.', 'error');
      return;
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const lines = buildExecutiveSummaryText(act).split('\n');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    const wrappedLines = doc.splitTextToSize(lines, maxLineWidth);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Resumo Executivo - Ação ${act.id}`, margin, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(wrappedLines, margin, 30);
    doc.save(`ResumoExecutivo_${act.id}.pdf`);
  }

  function copyExecutiveSummaryMarkdown() {
    const actionId = modalSummary.dataset.currentActionId;
    const act = actions.find(item => item.id === actionId);
    if (!act) {
      showToast('Nenhuma ação válida disponível para copiar.', 'error');
      return;
    }

    // Se houver um resumo gerado pela IA disponível, copie-o primeiro
    if (window.currentGeneratedSummaryText) {
      navigator.clipboard.writeText(window.currentGeneratedSummaryText).then(() => {
        showToast('Resumo executivo (gerado por IA) copiado para a área de transferência.', 'success');
      }).catch(() => {
        showToast('Não foi possível copiar o resumo gerado. Tente novamente.', 'error');
      });
      return;
    }

    const markdownText = buildExecutiveSummaryMarkdown(act);
    navigator.clipboard.writeText(markdownText).then(() => {
      showToast('Resumo executivo copiado para a área de transferência.', 'success');
    }).catch(() => {
      showToast('Não foi possível copiar o resumo. Tente novamente.', 'error');
    });
  }

  /**
   * Função para gerar o Resumo Executivo Profissional utilizando a API Gemini
   * @param {Object} acaoData
   */
  async function gerarResumoExecutivoProfissional(acaoData) {
    const summaryCard = document.getElementById('summary-content-card');
    if (!summaryCard) return;

    // Estado de carregamento elegante
    summaryCard.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px; color: var(--color-cyan);">
          <div class="spinner" style="border: 3px solid rgba(0,242,254,0.1); border-top: 3px solid var(--color-cyan); border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite;"></div>
          <span>Inteligência Artificial construindo relatório executivo de alto nível...</span>
      </div>
      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `;

    // Mapeamento dinâmico de sub-ações
    let subActionsText = "Nenhuma sub-ação detalhada cadastrada.";
    if (acaoData.subActionsList) {
      try {
        const subActions = JSON.parse(acaoData.subActionsList);
        if (Array.isArray(subActions) && subActions.length > 0) {
          subActionsText = subActions.map((sub, i) => {
            const costInfo = sub.cashImpact === 'Sim' ? ` | Impacto no Caixa: R$ ${sub.cashValue || '0'}` : '';
            return `- Sub-Ação ${i + 1}: ${sub.what || 'Sem descrição'} (Responsável: ${sub.who || 'N/A'} | Prazo: ${sub.endDate || 'N/A'} | Status: ${sub.status || 'Não Iniciado'}${costInfo})`;
          }).join('\n');
        }
      } catch (e) {
        console.error("Erro ao processar a lista de sub-ações para o prompt:", e);
      }
    }

    const prompt = `
    Você é um especialista em Gestão de Projetos (PMO) e Diretor Executivo (C-Level).
    Analise os dados brutos da seguinte ação 5W2H e crie um "Status Report Executivo" profissional no formato de Project Charter/PMO.
    
    Regra Crítica: Você DEVE retornar a resposta estruturada seguindo EXATAMENTE o template em Markdown abaixo (com as mesmas seções, marcadores e tabela). Substitua os colchetes com os dados analisados e expandidos profissionalmente:

    ## [${acaoData.project || 'Sem Projeto'} - ID: ${acaoData.id || 'N/A'}] Status Report Executivo
    ---
    ### 📋 Escopo & Alinhamento Estratégico
    - **O Que (What)**: [Descrição direta da ação expandida profissionalmente, baseada em: ${acaoData.what || 'Não informado'}]
    - **Justificativa (Why)**: [Motivo comercial/operacional de alto nível, baseado em: ${acaoData.why || 'Não informado'}]
    - **Área Impactada (Where)**: [Departamento / Setor / Local, baseado em: ${acaoData.where || 'Não informado'} (Área: ${acaoData.area || 'Não informada'})]

    ### 👥 Matriz de Responsabilidade & Cronograma
    - **Responsáveis (Who)**: [Nomes dos envolvidos, baseados em: ${acaoData.who || 'Não informado'}]
    - **Prazo Final (When)**: [Data formatada no padrão brasileiro DD/MM/AAAA, baseada em: ${acaoData.when || 'Não informado'}]
    - **Status Atual**: [Status destacado com indicador de status, baseado em: ${acaoData.status || 'Não iniciado'}]

    ### 💰 Viabilidade Financeira & Recursos (KPIs)
    | Indicador Financeiro | Detalhe / Valor |
    | :--- | :--- |
    | **Orçamento Requerido (How Much)** | R$ ${acaoData.howMuch || '0'} |
    | **Impacto Direto no Caixa** | [Indique se sim ou não, baseado em: ${acaoData.hasCashImpact || 'Não'}. Se sim, mencione o valor de R$ ${acaoData.cashImpactValue || '0'}] |
    | **Transição de Pessoas (Headcount)** | [Indique se sim ou não, e o tipo de movimentação se houver, baseando-se no projeto de Pessoas: ${acaoData.project === 'Pessoas' ? 'Sim' : 'Não'}] |

    - **Plano de Execução (How)**: [Como será feito, baseado na descrição principal: "${acaoData.how || 'Não informado'}". Analise a lista de sub-ações abaixo e estruture-as de forma refinada como um checklist ou cronograma real de entregas das sub-ações, indicando os prazos e responsáveis, e destacando visualmente quais subtarefas já foram iniciadas, concluídas ou estão pendentes:
    ${subActionsText}]
    ---

    Instruções adicionais:
    1. Articule as informações nos colchetes como textos corporativos de alto nível (PMO/Project Charter), sem inventar dados e mantendo os originais intactos.
    2. Responda APENAS o Markdown final estruturado seguindo o modelo acima. Não adicione textos adicionais antes ou depois do relatório.
    `;

    try {
      // Chamada direta para o endpoint oficial do Gemini 2.5 Flash (Plano Gratuito)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) throw new Error('Falha na comunicação com a API do Gemini');

      const data = await response.json();
      const textoGerado = data.candidates[0].content.parts[0].text;

      // Renderiza o Markdown retornado formatado na tela
      summaryCard.innerHTML = `<div style="white-space: pre-wrap; text-align: left;">${textoGerado}</div>`;

      // Armazena para uso posterior (download / copiar)
      window.currentGeneratedSummaryText = textoGerado;

    } catch (error) {
      console.error('Erro ao construir resumo:', error);
      const fallbackHtml = buildExecutiveSummaryHtml(acaoData);
      summaryCard.innerHTML = `
        <div style="color: var(--status-delayed); margin-bottom: 16px; font-size: 13px; font-weight: 500;">
          ⚠️ Ocorreu um erro ao gerar o resumo com Inteligência Artificial (verifique a chave de API ou conexão). Exibindo dados locais abaixo:
        </div>
        ${fallbackHtml}
      `;
    }
  }

  function buildExecutiveSummaryText(act) {
    const lines = [
      `Resumo Executivo - Ação ${act.id}`,
      '',
      `O que: ${act.what || 'N/A'}`,
      `Por que: ${act.why || 'N/A'}`,
      `Onde: ${act.where || 'N/A'}`,
      `Quando: ${formatDateString(act.when)}`,
      `Quem: ${act.who || 'N/A'}`,
      `Como: ${act.how || 'N/A'}`,
      `Quanto: ${formatCurrency(act.howMuch)}`,
      `Status: ${act.status || 'N/A'}`,
      act.statusReason ? `Motivo: ${act.statusReason}` : '',
      `Impacto no Caixa: ${act.hasCashImpact === 'Sim' ? 'Sim' : 'Não'}`,
      act.hasCashImpact === 'Sim' ? `Valor do Impacto: ${formatCurrency(act.cashImpactValue)}` : '',
      act.peopleAction ? `Movimentação de Pessoas: ${act.peopleAction}` : '',
      act.peopleName ? `Nome do Colaborador: ${act.peopleName}` : '',
      act.peopleRole ? `Cargo: ${act.peopleRole}` : '',
      act.peopleCost ? `Custo Movimentação: ${formatCurrency(act.peopleCost)}` : '',
      act.evidence ? `Evidência: ${act.evidence}` : ''
    ];

    const peopleList = formatPeopleList(act.peopleList);
    if (peopleList) {
      lines.push('', 'Lista de Pessoas:', peopleList);
    }

    return lines.filter(Boolean).join('\n');
  }

  function buildExecutiveSummaryMarkdown(act) {
    const lines = [
      `# Resumo Executivo - Ação ${act.id}`,
      '',
      `**O que:** ${act.what || 'N/A'}`,
      `**Por que:** ${act.why || 'N/A'}`,
      `**Onde:** ${act.where || 'N/A'}`,
      `**Quando:** ${formatDateString(act.when)}`,
      `**Quem:** ${act.who || 'N/A'}`,
      `**Como:** ${act.how || 'N/A'}`,
      `**Quanto:** ${formatCurrency(act.howMuch)}`,
      `**Status:** ${act.status || 'N/A'}`,
      act.statusReason ? `**Motivo:** ${act.statusReason}` : '',
      `**Impacto no Caixa:** ${act.hasCashImpact === 'Sim' ? 'Sim' : 'Não'}`,
      act.hasCashImpact === 'Sim' ? `**Valor do Impacto:** ${formatCurrency(act.cashImpactValue)}` : '',
      act.peopleAction ? `**Movimentação de Pessoas:** ${act.peopleAction}` : '',
      act.peopleName ? `**Nome do Colaborador:** ${act.peopleName}` : '',
      act.peopleRole ? `**Cargo:** ${act.peopleRole}` : '',
      act.peopleCost ? `**Custo Movimentação:** ${formatCurrency(act.peopleCost)}` : '',
      act.evidence ? `**Evidência:** ${act.evidence}` : ''
    ];

    const peopleList = formatPeopleList(act.peopleList);
    if (peopleList) {
      lines.push('', '**Lista de Pessoas:**', peopleList);
    }

    return lines.filter(Boolean).join('\n');
  }

  function formatPeopleList(peopleList) {
    if (!peopleList) return '';
    try {
      const list = JSON.parse(peopleList);
      if (Array.isArray(list) && list.length > 0) {
        return list.map(person => {
          const name = person.name || person.Nome || '';
          const role = person.role || person.Cargo || '';
          const area = person.area || person.Area || '';
          return `- ${name}${role ? ` | ${role}` : ''}${area ? ` | ${area}` : ''}`;
        }).join('\n');
      }
    } catch (error) {
      return peopleList;
    }
    return '';
  }

  function formatCurrency(value) {
    if (value === undefined || value === null || value === '') return 'N/A';
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return 'N/A';
    return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  }

  function formatDateString(dateValue) {
    if (!dateValue) return 'N/A';
    const dateParts = String(dateValue).split('-');
    return dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : String(dateValue);
  }

  function showExecutiveSummary(actId) {
    const act = actions.find(item => item.id === actId);
    if (!act) {
      showToast('Ação não encontrada para gerar o resumo executivo.', 'error');
      return;
    }

    modalSummary.dataset.currentActionId = act.id;
    modalSummary.classList.add('active');

    // Aciona a geração do Resumo Executivo com Gemini (que cuidará de colocar o loader e fazer o fallback em caso de erro)
    gerarResumoExecutivoProfissional(act);
  }

  window.showExecutiveSummary = showExecutiveSummary;

  function buildExecutiveSummaryHtml(act) {
    const formattedCost = formatCurrency(act.howMuch);
    const formattedImpactValue = formatCurrency(act.cashImpactValue);
    const evidenceLink = act.evidence ? `<div style="margin-top: 10px;"><strong>Evidência:</strong> <a href="${escapeHtml(act.evidence)}" target="_blank" rel="noreferrer">${escapeHtml(act.evidence)}</a></div>` : '';
    const statusReason = act.statusReason ? `<div style="margin-top: 10px;"><strong>Motivo:</strong> ${escapeHtml(act.statusReason)}</div>` : '';
    const peopleSection = act.peopleAction ? `<div style="margin-top: 10px;"><strong>Movimentação de Pessoas:</strong> ${escapeHtml(act.peopleAction)}<br>${act.peopleName ? `<strong>Nome:</strong> ${escapeHtml(act.peopleName)}<br>` : ''}${act.peopleRole ? `<strong>Cargo:</strong> ${escapeHtml(act.peopleRole)}<br>` : ''}${act.peopleCost ? `<strong>Custo:</strong> ${escapeHtml(formatCurrency(act.peopleCost))}` : ''}</div>` : '';
    const peopleList = formatPeopleList(act.peopleList);
    const peopleListHtml = peopleList ? `<div style="margin-top: 10px; white-space: pre-wrap;"><strong>Lista de Pessoas:</strong><br>${escapeHtml(peopleList).replace(/\n/g, '<br>')}</div>` : '';

    return `
      <div style="display: grid; gap: 12px;">
        <div><strong>O que:</strong> ${escapeHtml(act.what)}</div>
        <div><strong>Por que:</strong> ${escapeHtml(act.why)}</div>
        <div><strong>Onde:</strong> ${escapeHtml(act.where)}</div>
        <div><strong>Quando:</strong> ${escapeHtml(formatDateString(act.when))}</div>
        <div><strong>Quem:</strong> ${escapeHtml(act.who)}</div>
        <div><strong>Como:</strong> ${escapeHtml(act.how)}</div>
        <div><strong>Quanto:</strong> ${escapeHtml(formattedCost)}</div>
        <div><strong>Status:</strong> ${escapeHtml(act.status)}</div>
        ${statusReason}
        <div style="margin-top: 10px;"><strong>Impacto no Caixa:</strong> ${escapeHtml(act.hasCashImpact === 'Sim' ? `Sim (${formattedImpactValue})` : 'Não')}</div>
        ${peopleSection}
        ${peopleListHtml}
        ${evidenceLink}
      </div>
    `;
  }

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
      
      let collabs = [];
      if (act.peopleList) {
        try {
          collabs = JSON.parse(act.peopleList);
        } catch (e) {
          console.error("Erro parsing peopleList in renderProjectSummaryTable:", e);
        }
      }
      
      if (!Array.isArray(collabs) || collabs.length === 0) {
        if (act.peopleAction && act.peopleAction !== 'Não') {
          collabs = [{
            action: act.peopleAction,
            cost: act.peopleCost || 0
          }];
        }
      }
      
      collabs.forEach(c => {
        if (c.action === 'Contratação') {
          group.hiringsCount++;
          group.hiringsCost += c.cost || 0;
        } else if (c.action === 'Redução') {
          group.reductionsCount++;
          group.reductionsCost += c.cost || 0;
        } else if (c.action === 'Migrar PJ') {
          group.migrationsCount++;
          group.migrationsCost += c.cost || 0;
        }
      });
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

  function capitalizeText(str) {
    if (!str) return '';
    const prepositions = ['de', 'do', 'da', 'dos', 'das', 'e', 'para', 'com', 'o', 'a'];
    const acronyms = ['PJ', 'CLT', 'CRM', '3D', 'WMS', 'DRE', 'RH', 'CSAT', 'NPS', 'IT', 'TI', 'SLA', 'FCA', '5W2H', '5W', 'JR', 'PL', 'SR'];
    
    return str
      .trim()
      .split(/\s+/)
      .map((word, index) => {
        if (!word) return '';
        const wordUpper = word.toUpperCase();
        if (acronyms.includes(wordUpper)) {
          return wordUpper;
        }
        const wordLower = word.toLowerCase();
        if (prepositions.includes(wordLower) && index > 0) {
          return wordLower;
        }
        return wordLower.charAt(0).toUpperCase() + wordLower.slice(1);
      })
      .join(' ');
  }

  function stripAccents(str) {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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
  // MÓDULO QUADRO DE PESSOAS - LÓGICA E EVENTOS [NEW]
  // =========================================================================

  // Dados Mockados dos 22 Colaboradores do print
  const MOCK_HEADCOUNT = [];

  // Carrega do localStorage
  function loadLocalHeadcount() {
    const raw = localStorage.getItem('5w2h_headcount');
    if (raw) {
      try {
        headcount = JSON.parse(raw);
        if (headcount.length === 0) {
          headcount = [...MOCK_HEADCOUNT];
          saveLocalHeadcount();
        }
      } catch (e) {
        console.error("Erro ao carregar headcount do localStorage:", e);
        headcount = [...MOCK_HEADCOUNT];
      }
    } else {
      headcount = [...MOCK_HEADCOUNT];
      saveLocalHeadcount();
    }
  }

  // Grava localmente
  function saveLocalHeadcount() {
    localStorage.setItem('5w2h_headcount', JSON.stringify(headcount));
  }

  // Tenta enviar para a nuvem
  async function syncHeadcountWithDrive() {
    if (!dbConnected) return;
    try {
      await GoogleDriveDB.saveHeadcount(headcount);
      showToast("Quadro de Pessoas sincronizado com o Drive!", "success");
    } catch (err) {
      console.error("Erro ao sincronizar headcount com Drive:", err);
      showToast("Falha na sincronização do Headcount. Dados locais mantidos.", "error");
    }
  }

  // Sanitização de entradas do Headcount
  function sanitizeEmployeeData(val, type) {
    if (val === undefined || val === null) {
      if (type === 'number') return 0;
      return '';
    }
    
    let str = String(val).trim();
    
    if (type === 'number') {
      // Limpa caracteres especiais de dinheiro
      str = str.replace(/[R\$\s\.]/gi, '');
      str = str.replace(',', '.');
      const num = parseFloat(str);
      return isNaN(num) ? 0 : num;
    }
    
    if (type === 'date') {
      // DD/MM/AAAA -> AAAA-MM-DD
      const brDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = str.match(brDateRegex);
      if (match) {
        return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
      }
      
      if (!isNaN(str) && Number(str) > 30000) {
        // Conversão data numérica Excel
        const dateObj = new Date((Number(str) - 25569) * 86400 * 1000);
        return dateObj.toISOString().slice(0, 10);
      }
      
      return str;
    }
    
    return str;
  }

  // Renderiza a Tabela de Colaboradores
  function renderHeadcountTable() {
    const searchVal = stripAccents(peopleSearch.value.toLowerCase().trim());
    const statusVal = filterPeopleStatus.value;

    const filtered = headcount.filter(emp => {
      const matchesSearch = 
        stripAccents(emp.name.toLowerCase()).includes(searchVal) ||
        stripAccents(emp.cadastro.toLowerCase()).includes(searchVal) ||
        stripAccents(emp.role.toLowerCase()).includes(searchVal) ||
        stripAccents(emp.area.toLowerCase()).includes(searchVal) ||
        (emp.conhecimentos && stripAccents(emp.conhecimentos.toLowerCase()).includes(searchVal)) ||
        (emp.habilidades && stripAccents(emp.habilidades.toLowerCase()).includes(searchVal)) ||
        (emp.atitudes && stripAccents(emp.atitudes.toLowerCase()).includes(searchVal));

      const matchesStatus = (statusVal === 'all') || (emp.status === statusVal);

      return matchesSearch && matchesStatus;
    });

    peopleListBody.innerHTML = '';

    if (filtered.length === 0) {
      peopleEmptyState.style.display = 'block';
      return;
    }

    peopleEmptyState.style.display = 'none';

    filtered.forEach(emp => {
      const tr = document.createElement('tr');
      if (emp.status === 'Inativo') {
        tr.style.opacity = '0.6';
      }

      const formattedSalary = (emp.salary || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const formattedCost = (emp.cost || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      // Renderiza Tags CHA
      let chaHtml = '<div style="display: flex; flex-direction: column; gap: 8px;">';
      
      if (emp.conhecimentos) {
        const cTags = emp.conhecimentos.split(',').map(t => t.trim()).filter(t => t);
        if (cTags.length > 0) {
          chaHtml += `<div><div style="font-size:9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; font-weight:600;">Conhecimentos</div><div style="display: flex; flex-wrap: wrap; gap: 3px;">${cTags.map(t => `<span class="cha-pill c">${escapeHtml(t)}</span>`).join('')}</div></div>`;
        }
      }
      if (emp.habilidades) {
        const hTags = emp.habilidades.split(',').map(t => t.trim()).filter(t => t);
        if (hTags.length > 0) {
          chaHtml += `<div><div style="font-size:9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; font-weight:600;">Habilidades</div><div style="display: flex; flex-wrap: wrap; gap: 3px;">${hTags.map(t => `<span class="cha-pill h">${escapeHtml(t)}</span>`).join('')}</div></div>`;
        }
      }
      if (emp.atitudes) {
        const aTags = emp.atitudes.split(',').map(t => t.trim()).filter(t => t);
        if (aTags.length > 0) {
          chaHtml += `<div><div style="font-size:9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; font-weight:600;">Atitudes</div><div style="display: flex; flex-wrap: wrap; gap: 3px;">${aTags.map(t => `<span class="cha-pill a">${escapeHtml(t)}</span>`).join('')}</div></div>`;
        }
      }
      chaHtml += '</div>';

      const isChecked = selectedEmployeeIds.includes(emp.id) ? 'checked' : '';
      const statusClass = emp.status === 'Ativo' ? 'badge-completed' : 'badge-cancelled';

      tr.innerHTML = `
        <td style="text-align: center; vertical-align: middle;">
          <input type="checkbox" class="people-checkbox" data-id="${emp.id}" ${isChecked} style="cursor: pointer; width: 16px; height: 16px;">
        </td>
        <td style="vertical-align: middle;">
          <div onclick="window.filterActionsByEmployee('${escapeHtml(emp.name.replace(/'/g, "\\'"))}')" style="font-weight: 600; color: var(--color-cyan); font-size:14px; cursor: pointer; text-decoration: underline;" title="Ver ações desta pessoa">${escapeHtml(capitalizeText(emp.name))}</div>
          <div style="display:flex; gap: 8px; align-items:center; margin-top:4px;">
            <span style="font-size: 11px; color: var(--text-muted);">Cadastro: ${escapeHtml(emp.cadastro)}</span>
            <span class="badge ${statusClass}" style="font-size:10px; padding: 2px 6px;">${emp.status}</span>
          </div>
        </td>
        <td style="vertical-align: middle;">
          <div style="font-weight: 500;">${escapeHtml(capitalizeText(emp.role))}</div>
          <span style="font-size:11px; color: var(--text-muted);">${escapeHtml(emp.area)}</span>
        </td>
        <td style="vertical-align: middle;">
          ${chaHtml || '<span style="font-size:11px; color:var(--text-muted); font-style:italic;">Sem CHA cadastrado</span>'}
        </td>
        <td style="vertical-align: middle;">
          <div class="cost-tag">${formattedSalary}</div>
          <span style="font-size:11px; color: var(--color-cyan); font-weight:500;">Custo: ${formattedCost}</span>
        </td>
        <td style="vertical-align: middle; text-align: right;">
          <div style="display: flex; align-items: center; gap: 10px; justify-content: flex-end; white-space: nowrap;">
            <!-- Secondary links -->
            <div style="display: flex; gap: 8px; align-items: center;">
              ${emp.status === 'Ativo' ? `
                <a href="#" onclick="event.preventDefault(); triggerSingleEmployeeAction('${emp.id}', 'Migrar PJ');" style="color: #ff9800; font-size: 11px; text-decoration: none; font-weight: 600; cursor: pointer;" title="Transformar em PJ">Virar PJ</a>
                <a href="#" onclick="event.preventDefault(); triggerSingleEmployeeAction('${emp.id}', 'Redução');" style="color: var(--status-delayed); font-size: 11px; text-decoration: none; font-weight: 600; cursor: pointer;" title="Demitir colaborador">Demitir</a>
              ` : `
                <a href="#" onclick="event.preventDefault(); triggerSingleEmployeeAction('${emp.id}', 'Contratação');" style="color: var(--status-completed); font-size: 11px; text-decoration: none; font-weight: 600; cursor: pointer;" title="Recontratar colaborador">Contratar</a>
              `}
            </div>
            
            <!-- Primary action button -->
            <button onclick="triggerSingleEmployeeAction('${emp.id}', 'Enquadramento')" class="btn" style="padding: 4px 10px; font-size:11px; height:26px; min-height:26px; background: rgba(0, 242, 254, 0.1); color: var(--color-cyan); border: 1px solid rgba(0, 242, 254, 0.3); border-radius: var(--radius-sm); font-weight: 600; cursor: pointer;" title="Ajuste de Cargo/Salário">Enquadrar</button>
            
            <!-- Admin actions -->
            <div style="display: flex; gap: 2px; align-items: center; border-left: 1px solid var(--border-normal); padding-left: 6px; margin-left: 2px;">
              <button onclick="editEmployee('${emp.id}')" class="btn-icon edit" style="width:24px; height:24px; display: inline-flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: var(--text-muted);" title="Editar Cadastro">
                <i data-lucide="edit-3" style="width:12px; height:12px;"></i>
              </button>
              <button onclick="deleteEmployee('${emp.id}')" class="btn-icon delete" style="width:24px; height:24px; display: inline-flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: var(--status-delayed);" title="Excluir Colaborador">
                <i data-lucide="trash-2" style="width:12px; height:12px;"></i>
              </button>
            </div>
          </div>
        </td>
      `;

      peopleListBody.appendChild(tr);
    });

    // Registra eventos nos checkboxes das linhas
    peopleListBody.querySelectorAll('.people-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = cb.getAttribute('data-id');
        if (cb.checked) {
          if (!selectedEmployeeIds.includes(id)) {
            selectedEmployeeIds.push(id);
          }
        } else {
          selectedEmployeeIds = selectedEmployeeIds.filter(x => x !== id);
        }
        updateTeamBuilderPanel();
      });
    });

    lucide.createIcons();
  }

  // Atualiza os Painéis de Estatísticas do Headcount
  function updateHeadcountStats() {
    const total = headcount.length;
    const activeList = headcount.filter(e => e.status === 'Ativo');
    const activeCount = activeList.length;
    
    const salarySum = activeList.reduce((sum, e) => sum + (e.salary || 0), 0);
    const costSum = activeList.reduce((sum, e) => sum + (e.cost || 0), 0);

    peopleStatTotal.innerText = total;
    peopleStatActive.innerText = `${activeCount} ativos`;
    peopleStatSalary.innerText = salarySum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    peopleStatCost.innerText = costSum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Atualiza o painel lateral do Team Builder
  function updateTeamBuilderPanel() {
    const count = selectedEmployeeIds.length;
    draftTeamCount.innerText = `${count} selecionado${count !== 1 ? 's' : ''}`;

    if (count === 0) {
      teamBuilderEmpty.style.display = 'flex';
      teamBuilderContent.style.display = 'none';
      checkAllPeople.checked = false;
      return;
    }

    teamBuilderEmpty.style.display = 'none';
    teamBuilderContent.style.display = 'flex';

    // Renders integrantes
    draftTeamMembers.innerHTML = '';
    const selectedEmployees = headcount.filter(e => selectedEmployeeIds.includes(e.id));
    
    selectedEmployees.forEach(emp => {
      const pill = document.createElement('div');
      pill.className = 'team-member-pill';
      pill.style.cursor = 'pointer';
      pill.innerHTML = `
        <span style="font-weight: 600;" title="Filtrar e editar CHA de ${escapeHtml(capitalizeText(emp.name))}">${escapeHtml(capitalizeText(emp.name.split(' ')[0]))}</span>
        <span class="remove-member" data-id="${emp.id}">&times;</span>
      `;
      pill.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-member')) return;
        openEmployeeModal(emp);
      });
      pill.querySelector('.remove-member').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedEmployeeIds = selectedEmployeeIds.filter(x => x !== emp.id);
        const cb = peopleListBody.querySelector(`.people-checkbox[data-id="${emp.id}"]`);
        if (cb) cb.checked = false;
        updateTeamBuilderPanel();
      });
      draftTeamMembers.appendChild(pill);
    });

    // Consolida CHA
    const cSet = new Set();
    const hSet = new Set();
    const aSet = new Set();

    selectedEmployees.forEach(emp => {
      if (emp.conhecimentos) emp.conhecimentos.split(',').forEach(t => { if (t.trim()) cSet.add(t.trim().toUpperCase()); });
      if (emp.habilidades) emp.habilidades.split(',').forEach(t => { if (t.trim()) hSet.add(t.trim().toUpperCase()); });
      if (emp.atitudes) emp.atitudes.split(',').forEach(t => { if (t.trim()) aSet.add(t.trim().toUpperCase()); });
    });

    consolidatedC.innerHTML = Array.from(cSet).map(t => escapeHtml(capitalizeText(t))).join(', ') || '<span style="color:var(--text-muted); font-style:italic;">Nenhum</span>';
    consolidatedH.innerHTML = Array.from(hSet).map(t => escapeHtml(capitalizeText(t))).join(', ') || '<span style="color:var(--text-muted); font-style:italic;">Nenhum</span>';
    consolidatedA.innerHTML = Array.from(aSet).map(t => escapeHtml(capitalizeText(t))).join(', ') || '<span style="color:var(--text-muted); font-style:italic;">Nenhum</span>';

    // Custo Total
    const costSum = selectedEmployees.reduce((sum, e) => sum + (e.cost || 0), 0);
    draftTeamCost.innerText = costSum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Ouvinte checkAll na tabela de colaboradores
  checkAllPeople.addEventListener('change', () => {
    const isChecked = checkAllPeople.checked;
    selectedEmployeeIds = [];
    
    peopleListBody.querySelectorAll('.people-checkbox').forEach(cb => {
      cb.checked = isChecked;
      if (isChecked) {
        selectedEmployeeIds.push(cb.getAttribute('data-id'));
      }
    });

    updateTeamBuilderPanel();
  });

  // Eventos de Filtro e Busca de Pessoas
  peopleSearch.addEventListener('input', () => {
    if (peopleSearch.value.trim().length > 0) {
      btnClearPeopleSearch.style.display = 'flex';
    } else {
      btnClearPeopleSearch.style.display = 'none';
    }
    renderHeadcountTable();
  });
  if (btnClearPeopleSearch) {
    btnClearPeopleSearch.addEventListener('click', () => {
      peopleSearch.value = '';
      btnClearPeopleSearch.style.display = 'none';
      renderHeadcountTable();
    });
  }
  filterPeopleStatus.addEventListener('change', renderHeadcountTable);

  // MÓDULO CRUD DE COLABORADOR MANUAL
  btnNewEmployee.addEventListener('click', () => {
    openEmployeeModal();
  });

  btnEmployeeModalClose.addEventListener('click', closeEmployeeModal);
  btnEmployeeCancel.addEventListener('click', closeEmployeeModal);

  // Fechar Modal Resumo Executivo [NEW]
  if (btnSummaryModalClose) {
    btnSummaryModalClose.addEventListener('click', () => {
      modalSummary.classList.remove('active');
    });
  }
  if (btnSummaryClose) {
    btnSummaryClose.addEventListener('click', () => {
      modalSummary.classList.remove('active');
    });
  }
  if (btnSummaryDownload) {
    btnSummaryDownload.addEventListener('click', downloadExecutiveSummaryPdf);
  }
  if (btnCopySummary) {
    btnCopySummary.addEventListener('click', copyExecutiveSummaryMarkdown);
  }

  function openEmployeeModal(empToEdit = null) {
    formEmployee.reset();
    
    // Reseta inputs temporários de tags
    cTagNewInput.value = '';
    hTagNewInput.value = '';
    aTagNewInput.value = '';
    
    if (empToEdit) {
      employeeModalTitle.innerText = "Editar Colaborador";
      employeeIdField.value = empToEdit.id;
      fieldEmployeeCadastro.value = empToEdit.cadastro;
      fieldEmployeeName.value = empToEdit.name;
      fieldEmployeeAdmission.value = empToEdit.admission;
      fieldEmployeeStatus.value = empToEdit.status;
      fieldEmployeeRole.value = empToEdit.role;
      fieldEmployeeArea.value = empToEdit.area;
      fieldEmployeeSalary.value = empToEdit.salary !== undefined ? empToEdit.salary : '';
      fieldEmployeeCost.value = empToEdit.cost !== undefined ? empToEdit.cost : '';
      
      fieldEmployeeC.value = empToEdit.conhecimentos || '';
      fieldEmployeeH.value = empToEdit.habilidades || '';
      fieldEmployeeA.value = empToEdit.atitudes || '';
      
      currentEmployeeCTags = empToEdit.conhecimentos ? empToEdit.conhecimentos.split(',').map(t => t.trim()).filter(t => t) : [];
      currentEmployeeHTags = empToEdit.habilidades ? empToEdit.habilidades.split(',').map(t => t.trim()).filter(t => t) : [];
      currentEmployeeATags = empToEdit.atitudes ? empToEdit.atitudes.split(',').map(t => t.trim()).filter(t => t) : [];
    } else {
      employeeModalTitle.innerText = "Novo Colaborador";
      employeeIdField.value = '';
      fieldEmployeeStatus.value = 'Ativo';
      fieldEmployeeAdmission.value = new Date().toISOString().slice(0, 10);
      fieldEmployeeC.value = '';
      fieldEmployeeH.value = '';
      fieldEmployeeA.value = '';
      
      currentEmployeeCTags = [];
      currentEmployeeHTags = [];
      currentEmployeeATags = [];
    }
    
    renderVisualTags('c');
    renderVisualTags('h');
    renderVisualTags('a');
    
    modalEmployee.classList.add('active');
  }

  function closeEmployeeModal() {
    modalEmployee.classList.remove('active');
  }

  // LÓGICA DO EDITOR VISUAL DE TAGS (CHA)
  function getSuggestions(type) {
    const allTags = new Set();
    headcount.forEach(emp => {
      let fieldVal = '';
      if (type === 'c') fieldVal = emp.conhecimentos;
      else if (type === 'h') fieldVal = emp.habilidades;
      else if (type === 'a') fieldVal = emp.atitudes;

      if (fieldVal) {
        fieldVal.split(',').forEach(tag => {
          const trimmed = tag.trim();
          if (trimmed) allTags.add(trimmed.toUpperCase());
        });
      }
    });
    return Array.from(allTags);
  }

  function renderVisualTags(type) {
    let container, hiddenInput, activeList, suggestionContainer, cssClass;
    if (type === 'c') {
      container = cTagsVisualContainer;
      hiddenInput = fieldEmployeeC;
      activeList = currentEmployeeCTags;
      suggestionContainer = cTagSuggestions;
      cssClass = 'c';
    } else if (type === 'h') {
      container = hTagsVisualContainer;
      hiddenInput = fieldEmployeeH;
      activeList = currentEmployeeHTags;
      suggestionContainer = hTagSuggestions;
      cssClass = 'h';
    } else {
      container = aTagsVisualContainer;
      hiddenInput = fieldEmployeeA;
      activeList = currentEmployeeATags;
      suggestionContainer = aTagSuggestions;
      cssClass = 'a';
    }

    // Renderiza pills ativas
    container.innerHTML = '';
    if (activeList.length === 0) {
      container.innerHTML = `<span style="font-size: 11px; color: var(--text-muted); font-style: italic;">Nenhuma tag adicionada. Digite abaixo ou selecione uma sugestão.</span>`;
    } else {
      activeList.forEach((tag, index) => {
        const tagPill = document.createElement('div');
        tagPill.className = `tag-editor-pill ${cssClass}`;
        tagPill.innerHTML = `
          <span>${escapeHtml(capitalizeText(tag))}</span>
          <span class="remove-tag-btn" onclick="window.removeEmployeeTag('${type}', ${index})">&times;</span>
        `;
        container.appendChild(tagPill);
      });
    }

    // Sincroniza com o input hidden
    hiddenInput.value = activeList.join(', ');

    // Renderiza sugestões de tags do banco existente
    suggestionContainer.innerHTML = '';
    const allSuggestions = getSuggestions(type);
    const unusedSuggestions = allSuggestions.filter(s => !activeList.map(t => t.toUpperCase()).includes(s));

    if (unusedSuggestions.length > 0) {
      const label = document.createElement('div');
      label.className = 'suggestion-label';
      label.innerText = 'Tags sugeridas (clique para adicionar):';
      suggestionContainer.appendChild(label);

      unusedSuggestions.slice(0, 15).forEach(s => {
        const suggPill = document.createElement('span');
        suggPill.className = 'tag-suggestion-pill';
        suggPill.innerText = capitalizeText(s);
        suggPill.addEventListener('click', () => {
          addEmployeeTag(type, s);
        });
        suggestionContainer.appendChild(suggPill);
      });
    }
  }

  function addEmployeeTag(type, value) {
    if (!value) return;
    const cleanValue = value.trim();
    if (!cleanValue) return;

    let activeList;
    if (type === 'c') activeList = currentEmployeeCTags;
    else if (type === 'h') activeList = currentEmployeeHTags;
    else activeList = currentEmployeeATags;

    const upperList = activeList.map(t => t.toUpperCase());
    if (!upperList.includes(cleanValue.toUpperCase())) {
      activeList.push(cleanValue);
      renderVisualTags(type);
    }
  }

  window.removeEmployeeTag = function(type, index) {
    let activeList;
    if (type === 'c') activeList = currentEmployeeCTags;
    else if (type === 'h') activeList = currentEmployeeHTags;
    else activeList = currentEmployeeATags;

    activeList.splice(index, 1);
    renderVisualTags(type);
  };

  function initTagEditorListeners() {
    // Conhecimentos
    btnAddCTag.addEventListener('click', () => {
      addEmployeeTag('c', cTagNewInput.value);
      cTagNewInput.value = '';
    });
    cTagNewInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addEmployeeTag('c', cTagNewInput.value);
        cTagNewInput.value = '';
      }
    });

    // Habilidades
    btnAddHTag.addEventListener('click', () => {
      addEmployeeTag('h', hTagNewInput.value);
      hTagNewInput.value = '';
    });
    hTagNewInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addEmployeeTag('h', hTagNewInput.value);
        hTagNewInput.value = '';
      }
    });

    // Atitudes
    btnAddATag.addEventListener('click', () => {
      addEmployeeTag('a', aTagNewInput.value);
      aTagNewInput.value = '';
    });
    aTagNewInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addEmployeeTag('a', aTagNewInput.value);
        aTagNewInput.value = '';
      }
    });
  }

  formEmployee.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = employeeIdField.value;
    const isEdit = id !== '';

    // Sanitiza e formata os dados de salário e custo
    const salary = sanitizeEmployeeData(fieldEmployeeSalary.value, 'number');
    const cost = sanitizeEmployeeData(fieldEmployeeCost.value, 'number');

    const empData = {
      id: isEdit ? id : 'hc-' + crypto.randomUUID(),
      cadastro: fieldEmployeeCadastro.value.trim(),
      name: fieldEmployeeName.value.trim().toUpperCase(),
      admission: fieldEmployeeAdmission.value,
      status: fieldEmployeeStatus.value,
      role: fieldEmployeeRole.value.trim().toUpperCase(),
      area: fieldEmployeeArea.value.trim(),
      salary: salary,
      cost: cost,
      conhecimentos: fieldEmployeeC.value.trim(),
      habilidades: fieldEmployeeH.value.trim(),
      atitudes: fieldEmployeeA.value.trim(),
      updatedAt: new Date().toISOString()
    };

    if (isEdit) {
      headcount = headcount.map(emp => emp.id === id ? empData : emp);
      showToast("Cadastro atualizado com sucesso!", "success");
    } else {
      headcount.push(empData);
      showToast("Novo colaborador registrado com sucesso!", "success");
    }

    saveLocalHeadcount();
    renderHeadcountTable();
    updateHeadcountStats();
    updateTeamBuilderPanel();
    closeEmployeeModal();

    if (dbConnected) {
      await syncHeadcountWithDrive();
    }
  });

  window.editEmployee = function(id) {
    const emp = headcount.find(e => e.id === id);
    if (emp) {
      openEmployeeModal(emp);
    }
  };

  window.deleteEmployee = async function(id) {
    if (confirm("Tem certeza que deseja remover este colaborador do cadastro?")) {
      headcount = headcount.filter(e => e.id !== id);
      selectedEmployeeIds = selectedEmployeeIds.filter(x => x !== id);
      
      saveLocalHeadcount();
      renderHeadcountTable();
      updateHeadcountStats();
      updateTeamBuilderPanel();
      showToast("Colaborador removido!", "info");

      if (dbConnected) {
        await syncHeadcountWithDrive();
      }
    }
  };

  // Importação da Planilha de Quadro Pessoas Excel
  btnImportPeopleXlsx.addEventListener('click', () => {
    peopleXlsxFilePicker.click();
  });

  peopleXlsxFilePicker.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importPeopleExcelFile(file);
    peopleXlsxFilePicker.value = '';
  });

  async function importPeopleExcelFile(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Pega a primeira aba
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (rows.length <= 1) {
          showToast("A planilha importada está vazia ou sem cabeçalhos.", "error");
          return;
        }

        const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
        
        // Mapeia colunas
        const colMap = {
          cadastro: headers.findIndex(h => h.includes("cadastro") || h.includes("cod") || h.includes("chapa")),
          name: headers.findIndex(h => h.includes("relação") || h.includes("quadro") || h.includes("nome") || h.includes("colaborador") || h.includes("name")),
          role: headers.findIndex(h => h.includes("cargo") || h.includes("role") || h.includes("função")),
          area: headers.findIndex(h => h.includes("área") || h.includes("area") || h.includes("setor") || h.includes("departamento")),
          salary: headers.findIndex(h => h.includes("salário") || h.includes("salario") || h.includes("salary")),
          cost: headers.findIndex(h => h.includes("custo") || h.includes("cost") || h.includes("total")),
          admission: headers.findIndex(h => h.includes("admissão") || h.includes("admissao") || h.includes("data") || h.includes("admission")),
          status: headers.indexOf("status"),
          conhecimentos: headers.findIndex(h => h.includes("conhecimento") || h.includes("cha") || h.includes("c")),
          habilidades: headers.findIndex(h => h.includes("habilidade") || h.includes("h")),
          atitudes: headers.findIndex(h => h.includes("atitude") || h.includes("a"))
        };

        if (colMap.name === -1) {
          showToast("Não foi possível localizar a coluna com o Nome do Colaborador (ex: Relação de Quadro Mensal).", "error");
          return;
        }

        let importedCount = 0;
        const nowStr = new Date().toISOString();

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const rawName = row[colMap.name];
          if (!rawName) continue;

          const name = String(rawName).trim().toUpperCase();
          const cadastro = colMap.cadastro !== -1 && row[colMap.cadastro] ? String(row[colMap.cadastro]).trim() : String(Date.now() + i);
          const role = colMap.role !== -1 && row[colMap.role] ? String(row[colMap.role]).trim().toUpperCase() : 'NÃO DEFINIDO';
          const area = colMap.area !== -1 && row[colMap.area] ? String(row[colMap.area]).trim() : 'Sem Setor';
          
          const rawSalary = colMap.salary !== -1 ? row[colMap.salary] : 0;
          const rawCost = colMap.cost !== -1 ? row[colMap.cost] : 0;
          const salary = sanitizeEmployeeData(rawSalary, 'number');
          const cost = sanitizeEmployeeData(rawCost, 'number');
          
          const rawAdmission = colMap.admission !== -1 ? row[colMap.admission] : nowStr.slice(0,10);
          const admission = sanitizeEmployeeData(rawAdmission, 'date') || nowStr.slice(0, 10);
          
          const status = colMap.status !== -1 && row[colMap.status] ? String(row[colMap.status]).trim() : 'Ativo';
          
          const conhecimentos = colMap.conhecimentos !== -1 && row[colMap.conhecimentos] ? String(row[colMap.conhecimentos]).trim() : '';
          const habilidades = colMap.habilidades !== -1 && row[colMap.habilidades] ? String(row[colMap.habilidades]).trim() : '';
          const atitudes = colMap.atitudes !== -1 && row[colMap.atitudes] ? String(row[colMap.atitudes]).trim() : '';

          const empData = {
            id: 'hc-' + crypto.randomUUID(),
            cadastro,
            name,
            admission,
            status,
            role,
            area,
            salary,
            cost,
            conhecimentos,
            habilidades,
            atitudes,
            updatedAt: nowStr
          };

          // Verifica duplicidade baseada em Nome ou Cadastro
          const existingIndex = headcount.findIndex(e => e.cadastro === cadastro || e.name === name);
          if (existingIndex !== -1) {
            // Preserva ID e apenas atualiza
            empData.id = headcount[existingIndex].id;
            headcount[existingIndex] = empData;
          } else {
            headcount.push(empData);
          }
          importedCount++;
        }

        saveLocalHeadcount();
        renderHeadcountTable();
        updateHeadcountStats();
        updateTeamBuilderPanel();
        
        if (dbConnected) {
          await syncHeadcountWithDrive();
        }

        showToast(`Importação Concluída! ${importedCount} colaboradores importados/atualizados.`, "success");
      } catch (err) {
        console.error(err);
        showToast(`Erro ao importar funcionários: ${err.message}`, "error");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // FILTRAR AÇÕES POR NOME DE COLABORADOR
  window.filterActionsByEmployee = function(name) {
    if (!name) return;
    actionSearch.value = name.trim();
    if (btnClearActionSearch) btnClearActionSearch.style.display = 'flex';
    renderActionsTable();
    switchTab('actions-view');
    showToast(`Filtrado por: ${capitalizeText(name)}`, "info");
  };

  // AUTOMATED 5W2H ACTIONS GENERATORS FROM HEADCOUNT TAB
  window.triggerSingleEmployeeAction = function(id, actionType) {
    const emp = headcount.find(e => e.id === id);
    if (!emp) return;
    
    const collaborator = {
      action: actionType, // 'Contratação', 'Redução', 'Migrar PJ', 'Enquadramento'
      name: emp.name,
      role: emp.role,
      area: emp.area,
      cost: emp.cost,
      cadastro: emp.cadastro,
      salary: emp.salary,
      currentCost: emp.cost
    };
    
    openModal(); // Abre modal limpo
    
    modalTitle.innerText = `Nova Ação 5W2H - Movimentação (${actionType})`;
    fieldProject.value = 'Pessoas';
    handleProjectChange();
    
    actionPeopleListField.value = JSON.stringify([collaborator]);
    renderCollaboratorsReadOnly([collaborator]);
    
    // Inicializa containers específicos de transição PJ e Demissão
    if (actionType === 'Migrar PJ') {
      pjDetailsContainer.style.display = 'block';
      pjCurrentSalary.innerText = emp.salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      pjCurrentCost.innerText = emp.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      pjCurrentCost.setAttribute('data-value', emp.cost);
      fieldPjProposedCost.value = '';
      pjCostDifference.innerText = 'R$ 0,00';
      pjCostDifference.style.color = 'var(--text-muted)';
    } else if (actionType === 'Redução') {
      reductionDetailsContainer.style.display = 'block';
      reductionMonthlySavings.innerText = emp.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      fieldDismissalCost.value = '';
    }
    
    let whatVal = '';
    let whyVal = '';
    let howVal = '';
    let whoVal = '';
    
    if (actionType === 'Redução') {
      whatVal = `Desligamento do colaborador ${emp.name} (${emp.role} - ${emp.area}).`;
      whyVal = `Readequação de quadro de funcionários para otimização de custos e eficiência operacional do setor.`;
      whoVal = `RH, Diretor da Área`;
      howVal = `Realizar reunião de feedback demissional, processar trâmites legais da rescisão CLT, efetuar pagamento das verbas rescisórias e exame médico.`;
    } else if (actionType === 'Migrar PJ') {
      whatVal = `Migração do regime de contratação do colaborador ${emp.name} (${emp.role} - ${emp.area}) de CLT para PJ.`;
      whyVal = `Otimização de custos trabalhistas de folha de pagamento e alinhamento a modelo flexível de contratação.`;
      whoVal = `RH, Financeiro, ${emp.name}`;
      howVal = `Definir novos termos de remuneração PJ, orientar o colaborador na abertura/regularização de CNPJ e emissão de notas, assinar termo de rescisão CLT e novo contrato PJ.`;
    } else if (actionType === 'Enquadramento') {
      whatVal = `Enquadramento salarial e de cargo do colaborador ${emp.name} (${emp.role} - ${emp.area}).`;
      whyVal = `Promoção meritocrática ou equiparação salarial do colaborador às novas responsabilidades do cargo.`;
      whoVal = `RH, Gestor da Área`;
      howVal = `Aprovar reajuste junto à diretoria, atualizar registro na carteira de trabalho (CTPS) digital e ajustar a remuneração no sistema de folha de pagamento.`;
    } else if (actionType === 'Contratação') {
      whatVal = `Contratação de colaborador para reposição / expansão da posição de ${emp.role} na área de ${emp.area}.`;
      whyVal = `Atendimento à demanda de trabalho no setor e suporte ao crescimento das metas operacionais da área.`;
      whoVal = `RH, Líder da Área`;
      howVal = `Divulgação da vaga, triagem de currículos, entrevistas com candidatos, proposta formal de contratação e onboarding do novo funcionário.`;
    }
    
    fieldWhat.value = whatVal;
    fieldWhy.value = whyVal;
    fieldWho.value = whoVal;
    fieldWhere.value = emp.area;
    fieldArea.value = emp.area;
    fieldHow.value = howVal;
    
    if (actionType === 'Migrar PJ' || actionType === 'Redução') {
      fieldHowMuch.value = '';
    } else {
      fieldHowMuch.value = emp.cost;
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fieldWhen.value = tomorrow.toISOString().slice(0, 10);
    
    switchTab('actions-view');
    showToast("Ação de movimentação pré-preenchida! Clique em Salvar.", "success");
  };

  // Gerar ação 5W de Pivot com o time selecionado
  btnGeneratePivotAction.addEventListener('click', triggerPivotTeamAction);

  function triggerPivotTeamAction() {
    if (selectedEmployeeIds.length === 0) {
      showToast("Selecione pelo menos um colaborador para o time.", "error");
      return;
    }
    
    const selectedEmployees = headcount.filter(e => selectedEmployeeIds.includes(e.id));
    const collaborators = selectedEmployees.map(e => ({
      action: 'Alocação Pivot',
      name: e.name,
      role: e.role,
      area: e.area,
      cost: e.cost,
      cadastro: e.cadastro
    }));
    
    const totalCost = selectedEmployees.reduce((sum, e) => sum + e.cost, 0);
    const names = selectedEmployees.map(e => e.name).join(', ');
    
    // Consolida CHA tags
    let knowledgeSet = new Set();
    let skillsSet = new Set();
    selectedEmployees.forEach(e => {
      if (e.conhecimentos) e.conhecimentos.split(',').forEach(t => { if (t.trim()) knowledgeSet.add(t.trim()); });
      if (e.habilidades) e.habilidades.split(',').forEach(t => { if (t.trim()) skillsSet.add(t.trim()); });
    });
    
    const consolidatedKnowledge = Array.from(knowledgeSet).join(', ');
    const consolidatedSkills = Array.from(skillsSet).join(', ');

    openModal(); // Abre modal limpo
    
    modalTitle.innerText = "Nova Ação 5W2H - Pivot de Time";
    fieldProject.value = 'Pessoas';
    handleProjectChange();
    
    actionPeopleListField.value = JSON.stringify(collaborators);
    renderCollaboratorsReadOnly(collaborators);
    
    fieldWhat.value = `Montagem e alocação de time multidisciplinar focado no pivot estratégico empresarial.`;
    fieldWhy.value = `Execução e validação de novo direcionamento de negócio utilizando competências chave em conhecimentos (${consolidatedKnowledge}) e habilidades (${consolidatedSkills}) do time alocado.`;
    fieldWho.value = names;
    fieldWhere.value = 'Operações / Nova Frente de Negócio';
    fieldArea.value = 'Foco em Pivot';
    fieldHow.value = `Realizar o alinhamento da nova estratégia com a equipe, definir metas individuais, iniciar rituais ágeis de acompanhamento diário (daily) e sprints de validação de mercado.`;
    fieldHowMuch.value = totalCost;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    fieldWhen.value = tomorrow.toISOString().slice(0, 10);
    
    switchTab('actions-view');
    showToast("Formulário de Ação preenchido! Clique em Salvar para registrar.", "success");
  }

  // Sincroniza o status do colaborador no headcount com base na conclusão do 5W2H
  function syncPessoasActionToHeadcount(actionData) {
    if (actionData.project !== 'Pessoas' || actionData.status !== 'Concluído') return;
    
    let collabs = [];
    if (actionData.peopleList) {
      try {
        collabs = JSON.parse(actionData.peopleList);
      } catch (e) {
        console.error("Erro parsing peopleList in syncPessoasActionToHeadcount:", e);
        return;
      }
    }
    
    if (collabs.length === 0) return;
    
    let headcountChanged = false;
    const nowStr = new Date().toISOString();
    
    collabs.forEach(c => {
      // Procura funcionário por Cadastro ou por Nome aproximado
      let emp = headcount.find(e => e.cadastro === c.cadastro || e.name.toLowerCase().trim() === c.name.toLowerCase().trim());
      
      if (c.action === 'Redução') {
        if (emp) {
          emp.status = 'Inativo';
          emp.updatedAt = nowStr;
          headcountChanged = true;
          console.log(`Colaborador ${emp.name} desativado via ação de Redução.`);
        }
      } else if (c.action === 'Contratação') {
        if (emp) {
          emp.status = 'Ativo';
          emp.role = c.role;
          emp.area = c.area;
          emp.cost = c.cost;
          emp.salary = emp.salary || (c.cost * 0.5);
          emp.updatedAt = nowStr;
          headcountChanged = true;
          console.log(`Colaborador existente ${emp.name} reativado via contratação.`);
        } else {
          // Cria novo
          const newEmp = {
            id: 'hc-' + crypto.randomUUID(),
            cadastro: c.cadastro || String(Date.now() % 10000),
            name: c.name.toUpperCase(),
            admission: new Date().toISOString().slice(0, 10),
            role: c.role.toUpperCase(),
            area: c.area,
            salary: c.cost * 0.45, // estimativa baseada no print (remuneração CLT padrão)
            cost: c.cost,
            status: 'Ativo',
            conhecimentos: '',
            habilidades: '',
            atitudes: '',
            updatedAt: nowStr
          };
          headcount.push(newEmp);
          headcountChanged = true;
          console.log(`Novo colaborador ${newEmp.name} cadastrado via contratação.`);
        }
      } else if (c.action === 'Migrar PJ') {
        if (emp) {
          emp.status = 'Ativo';
          emp.role = c.role;
          emp.area = c.area;
          emp.cost = c.cost;
          emp.salary = 0; // Contrato PJ não possui salário base CLT
          emp.updatedAt = nowStr;
          headcountChanged = true;
          console.log(`Colaborador ${emp.name} atualizado regime para PJ.`);
        }
      } else if (c.action === 'Enquadramento') {
        if (emp) {
          emp.status = 'Ativo';
          emp.role = c.role;
          emp.area = c.area;
          emp.cost = c.cost;
          emp.salary = c.cost * 0.45; // atualiza proporção CLT
          emp.updatedAt = nowStr;
          headcountChanged = true;
          console.log(`Colaborador ${emp.name} atualizado por Enquadramento.`);
        }
      } else if (c.action === 'Alocação Pivot') {
        if (emp) {
          emp.status = 'Ativo';
          emp.updatedAt = nowStr;
          headcountChanged = true;
        }
      }
    });
    
    if (headcountChanged) {
      saveLocalHeadcount();
      renderHeadcountTable();
      updateHeadcountStats();
      syncHeadcountWithDrive();
    }
  }

  function updatePjDifferenceCalculations(currentCst, proposedVal) {
    const diff = currentCst - proposedVal;
    const absDiff = Math.abs(diff);
    const formattedDiff = absDiff.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    if (diff > 0) {
      pjCostDifference.innerText = `Economia de ${formattedDiff}/mês`;
      pjCostDifference.style.color = 'var(--status-completed)';
    } else if (diff < 0) {
      pjCostDifference.innerText = `Aumento de ${formattedDiff}/mês`;
      pjCostDifference.style.color = '#ff9800';
    } else {
      pjCostDifference.innerText = 'Sem alteração de custo';
      pjCostDifference.style.color = 'var(--text-muted)';
    }
  }

  function initTransitionListeners() {
    fieldPjProposedCost.addEventListener('input', () => {
      const proposedVal = parseFloat(fieldPjProposedCost.value) || 0;
      
      const currentCst = parseFloat(pjCurrentCost.getAttribute('data-value')) || 0;
      if (actionPeopleListField.value) {
        try {
          const collabs = JSON.parse(actionPeopleListField.value);
          if (collabs.length === 1) {
            if (collabs[0].currentCost === undefined) {
              collabs[0].currentCost = currentCst;
            }
            // Updates collaborator cost in JSON
            collabs[0].cost = proposedVal;
            actionPeopleListField.value = JSON.stringify(collabs);
          }
        } catch (e) {
          console.error(e);
        }
      }
      
      updatePjDifferenceCalculations(currentCst, proposedVal);
      
      // Update Quanto Custa (howMuch) field in action form
      fieldHowMuch.value = proposedVal > 0 ? proposedVal : '';
    });

    fieldDismissalCost.addEventListener('input', () => {
      const dismissalCost = parseFloat(fieldDismissalCost.value) || 0;
      fieldHowMuch.value = dismissalCost > 0 ? dismissalCost : '';
    });
  }

  let subActionCounter = 0;

  function updateSubActionsNumbering() {
    const cards = subActionsModalList.querySelectorAll('.sub-action-item-card');
    cards.forEach((card, i) => {
      const titleSpan = card.querySelector('.sub-action-title');
      if (titleSpan) {
        titleSpan.textContent = `Sub-Ação ${i + 1}`;
      }
    });
  }

  function renderSubActionFormItem(sub = null) {
    const index = subActionCounter++;
    
    const card = document.createElement('div');
    card.className = 'sub-action-item-card';
    card.setAttribute('data-index', index);
    
    const whatVal = sub ? sub.what : '';
    const whoVal = sub ? sub.who : (fieldWho ? fieldWho.value : '');
    const statusVal = sub ? sub.status : 'Não Iniciado';
    const startDateVal = sub ? sub.startDate : '';
    const endDateVal = sub ? sub.endDate : '';
    const cashImpactVal = sub ? sub.cashImpact : 'Não';
    const cashValueVal = sub ? sub.cashValue : '';
    
    const cashDisplay = cashImpactVal === 'Sim' ? 'block' : 'none';
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span class="sub-action-title" style="font-size: 11px; font-weight: 600; color: var(--color-cyan); text-transform: uppercase; letter-spacing: 0.5px;">Sub-Ação</span>
        <button type="button" class="btn-icon delete btn-remove-sub-action" style="background: none; border: none; cursor: pointer; color: var(--status-delayed); display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px;" title="Remover Sub-Ação">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
      </div>
      <div class="form-grid" style="gap: 8px;">
        <div class="form-group form-grid-full">
          <label style="font-size: 10px; margin-bottom: 2px; color: var(--text-muted);">O que será feito? (What)</label>
          <input type="text" class="input-control sub-what" placeholder="Descrição da sub-ação" value="${escapeHtml(whatVal)}" required style="font-size: 12px; height: 32px; min-height: 32px;">
        </div>
        <div class="form-group">
          <label style="font-size: 10px; margin-bottom: 2px; color: var(--text-muted);">Quem (Who)</label>
          <input type="text" class="input-control sub-who" placeholder="Responsável" value="${escapeHtml(whoVal)}" required style="font-size: 12px; height: 32px; min-height: 32px;">
        </div>
        <div class="form-group">
          <label style="font-size: 10px; margin-bottom: 2px; color: var(--text-muted);">Status</label>
          <select class="input-control sub-status" style="font-size: 12px; height: 32px; min-height: 32px;">
            <option value="Não Iniciado" ${statusVal === 'Não Iniciado' ? 'selected' : ''}>Não Iniciado</option>
            <option value="Iniciado" ${statusVal === 'Iniciado' ? 'selected' : ''}>Iniciado</option>
            <option value="Concluído" ${statusVal === 'Concluído' ? 'selected' : ''}>Concluído</option>
            <option value="Atrasado" ${statusVal === 'Atrasado' ? 'selected' : ''}>Atrasado</option>
            <option value="Cancelado" ${statusVal === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
            <option value="Parado" ${statusVal === 'Parado' ? 'selected' : ''}>Parado</option>
          </select>
        </div>
        <div class="form-group">
          <label style="font-size: 10px; margin-bottom: 2px; color: var(--text-muted);">Data Início</label>
          <input type="date" class="input-control sub-start-date" value="${startDateVal}" required style="font-size: 12px; height: 32px; min-height: 32px;">
        </div>
        <div class="form-group">
          <label style="font-size: 10px; margin-bottom: 2px; color: var(--text-muted);">Prazo / Fim (When)</label>
          <input type="date" class="input-control sub-end-date" value="${endDateVal}" required style="font-size: 12px; height: 32px; min-height: 32px;">
        </div>
        <div class="form-group">
          <label style="font-size: 10px; margin-bottom: 2px; color: var(--text-muted);">Impacto no Caixa?</label>
          <select class="input-control sub-cash-impact" style="font-size: 12px; height: 32px; min-height: 32px;">
            <option value="Não" ${cashImpactVal === 'Não' ? 'selected' : ''}>Não</option>
            <option value="Sim" ${cashImpactVal === 'Sim' ? 'selected' : ''}>Sim</option>
          </select>
        </div>
        <div class="form-group sub-cash-value-group" style="display: ${cashDisplay};">
          <label style="font-size: 10px; margin-bottom: 2px; color: var(--text-muted);">Valor do Impacto</label>
          <input type="number" class="input-control sub-cash-value" placeholder="R$ (ex: -1500 ou 500)" value="${cashValueVal}" style="font-size: 12px; height: 32px; min-height: 32px;">
        </div>
      </div>
    `;
    
    // Wire delete button
    card.querySelector('.btn-remove-sub-action').addEventListener('click', () => {
      card.remove();
      updateSubActionsNumbering();
    });
    
    // Wire toggle cash value input display
    const cashImpactSelect = card.querySelector('.sub-cash-impact');
    const cashValueGroup = card.querySelector('.sub-cash-value-group');
    const cashValueInput = card.querySelector('.sub-cash-value');
    
    cashImpactSelect.addEventListener('change', () => {
      if (cashImpactSelect.value === 'Sim') {
        cashValueGroup.style.display = 'block';
        cashValueInput.setAttribute('required', 'required');
      } else {
        cashValueGroup.style.display = 'none';
        cashValueInput.removeAttribute('required');
        cashValueInput.value = '';
      }
    });
    
    subActionsModalList.appendChild(card);
    updateSubActionsNumbering();
    lucide.createIcons();
  }

  function initSubActionsListeners() {
    btnAddSubAction.addEventListener('click', () => {
      renderSubActionFormItem();
    });
  }

  window.toggleSubActionsCollapse = function(actId, event) {
    if (event) event.stopPropagation();
    const container = document.getElementById(`sub-actions-collapse-${actId}`);
    if (container) {
      const isCollapsed = container.style.display === 'none';
      container.style.display = isCollapsed ? 'block' : 'none';
      
      const btn = event.currentTarget;
      if (isCollapsed) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  };

  // =========================================================================
  // EXECUTA A INICIALIZAÇÃO
  // =========================================================================
  init();
});
