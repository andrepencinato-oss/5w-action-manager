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

  fieldStatus.addEventListener('change', handleStatusChange);

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
  
  // Fecha ao clicar fora do modal
  modalAction.addEventListener('click', (e) => {
    if (e.target === modalAction) closeModal();
  });

  // Ouvintes para o modal de contingência
  btnContingencyClose.addEventListener('click', closeContingencyModal);
  btnContingencyOk.addEventListener('click', closeContingencyModal);
  modalContingency.addEventListener('click', (e) => {
    if (e.target === modalContingency) closeContingencyModal();
  });

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
      
      handleStatusChange();

      if (actionToEdit.fcaId) {
        fcaLinkNotice.style.display = 'block';
      }
    } else {
      modalTitle.innerText = "Nova Ação 5W2H";
      actionIdField.value = '';
      fieldStatus.value = 'Não Iniciado';
      fieldStatusReason.value = '';
      handleStatusChange();
      
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
    
    const actionData = {
      id: isEdit ? id : String(Date.now()),
      what: fieldWhat.value.trim(),
      why: fieldWhy.value.trim(),
      who: fieldWho.value.trim(),
      where: fieldWhere.value.trim(),
      area: fieldArea.value.trim(),
      when: fieldWhen.value,
      how: fieldHow.value.trim(),
      howMuch: parseFloat(fieldHowMuch.value) || 0,
      status: fieldStatus.value,
      evidence: fieldEvidence.value.trim(),
      fcaId: fcaId,
      statusReason: (fieldStatus.value === 'Cancelado' || fieldStatus.value === 'Parado') ? fieldStatusReason.value.trim() : '',
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
          <span class="cost-tag">${formattedCost}</span>
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
  modalFca.addEventListener('click', (e) => {
    if (e.target === modalFca) closeFcaModal();
  });

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
