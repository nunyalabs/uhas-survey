/* ============================================
   UHAS-HPI Survey App
   Uses unified scripts: db.js, participant.js, sync.js
   ============================================ */

console.log('🔷 app.js: Script loading started');
console.log('🔍 Checking dependencies at load time:');
console.log('  - window.db:', window.db);
console.log('  - window.participantManager:', window.participantManager);
console.log('  - window.Dashboard:', window.Dashboard);
console.log('  - window.CONFIG:', window.CONFIG);

// ===== STATE =====
let currentTab = 'dashboard';
let currentView = 'list'; // 'list' or 'group'
let selectedGroup = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check dependencies
    if (!window.db) {
      throw new Error('Database module not loaded');
    }
    if (!window.participantManager) {
      throw new Error('Participant module not loaded');
    }
    if (!window.Dashboard) {
      throw new Error('Dashboard module not loaded');
    }
    if (!window.QUESTIONNAIRES) {
      throw new Error('Questions not loaded');
    }

    console.log('📦 Loading dependencies...');

    // Initialize unified database
    await db.init();
    console.log('✅ Database initialized');

    // Render UI
    renderTabs();
    await renderCurrentTab();
    attachTabListeners();

    // Set current date on date inputs
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
      if (!input.value) input.value = today;
    });

    // Setup import button
    setupImportButton();

    console.log('✅ Survey app ready');
  } catch (error) {
    console.error('❌ Failed to initialize:', error);

    // Show user-friendly error
    const content = document.getElementById('surveyContent');
    if (content) {
      content.innerHTML = `
        <div class="card" style="border-left: 4px solid #dc3545;">
          <h5 style="color: #dc3545;">⚠️ Failed to Load</h5>
          <p><strong>Error:</strong> ${error.message}</p>
          <p>Please refresh the page. If the problem persists, check your browser console.</p>
          <button class="btn btn-primary" onclick="location.reload()">
            <i class="bi bi-arrow-clockwise"></i> Refresh Page
          </button>
        </div>
      `;
    }
  }
});

// ===== TAB RENDERING =====
function renderTabs() {
  const container = document.getElementById('surveyTabs');
  container.innerHTML = '';

  // Add Dashboard tab only - all forms accessible via cards
  const dashboardTab = document.createElement('button');
  dashboardTab.className = 'tab active';
  dashboardTab.setAttribute('data-tab', 'dashboard');
  dashboardTab.innerHTML = `<i class="bi bi-speedometer2"></i> <span>Dashboard</span>`;
  container.appendChild(dashboardTab);
}

function attachTabListeners() {
  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active state
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Switch tab
      currentTab = tab.getAttribute('data-tab');
      currentView = 'list';
      selectedGroup = null;
      renderCurrentTab();
    });
  });
}

async function renderCurrentTab() {
  const container = document.getElementById('surveyContent');
  updateBottomBar();

  if (currentTab === 'dashboard') {
    container.innerHTML = await Dashboard.render();
  } else {
    const questionnaire = QUESTIONNAIRES[currentTab];

    if (!questionnaire) {
      container.innerHTML = '<div class="card"><p>Questionnaire not found.</p></div>';
      return;
    }

    container.innerHTML = renderQuestionnaire(questionnaire);
    attachConditionalLogic();
  }
}

function updateBottomBar() {
  const isDashboard = currentTab === 'dashboard';
  
  document.getElementById('clearBtn').style.display = isDashboard ? 'none' : 'block';
  document.getElementById('importBtn').style.display = isDashboard ? 'none' : 'block';
  document.getElementById('saveBtn').style.display = isDashboard ? 'none' : 'block';
  document.getElementById('backBtn').style.display = isDashboard ? 'none' : 'block';
  document.getElementById('exportBtn').style.display = isDashboard ? 'block' : 'block';
}

// ===== QUESTIONNAIRE RENDERING =====
function renderQuestionnaire(q) {
  let html = `
    <form id="${q.id}Form" novalidate>
      <div class="section-header d-flex justify-content-between align-items-start">
        <div>
            <h5><i class="bi ${q.icon}"></i> ${q.title}</h5>
            <small>Participant ID auto-generated on submit</small>
        </div>
        <div class="d-flex gap-1">
             <!-- Export button moved to Data tab and Footer -->
        </div>
      </div>
  `;

  q.sections.forEach(section => {
    if (section.title) {
      html += `
        <div class="section-header mt-2">
          <h6>${section.title}</h6>
          ${section.description ? `<small>${section.description}</small>` : ''}
        </div>
      `;
    }

    section.questions.forEach(question => {
      html += renderQuestion(question, q.id);
    });
  });

  html += `</form>`;
  return html;
}

function renderQuestion(q, formId) {
  const showIfAttr = q.showIf ?
    `data-show-if-field="${q.showIf.field}" data-show-if-value="${q.showIf.value}" style="display:none;"` : '';

  let html = `<div class="question-group" ${showIfAttr}>`;

  switch (q.type) {
    case 'scale':
      html += renderScaleQuestion(q, formId);
      break;
    case 'checkbox':
      html += renderCheckboxQuestion(q, formId);
      break;
    case 'radio':
      html += renderRadioQuestion(q, formId);
      break;
    case 'select':
      html += renderSelectQuestion(q, formId);
      break;
    default:
      html += renderTextQuestion(q, formId);
  }

  html += `</div>`;
  return html;
}

function renderTextQuestion(q, formId) {
  const inputType = q.type === 'date' ? 'date' : 'text';
  const maxlength = q.maxlength ? `maxlength="${q.maxlength}"` : '';
  const required = q.required ? 'required' : '';

  return `
    <label class="form-label ${q.required ? 'required' : ''}">${q.label}</label>
    <input type="${inputType}" class="form-control" name="${q.id}" 
           id="${formId}_${q.id}" ${required} ${maxlength}>
  `;
}

function renderSelectQuestion(q, formId) {
  // Check if "Other" is in options AND there's no dedicated showIf field for it
  const hasOther = q.options.some(opt => opt.toLowerCase().includes('other'));
  const skipAutoOther = q.skipAutoOther || q.id === 'studySite';
  const required = q.required ? 'required' : '';

  let html = `
    <label class="form-label ${q.required ? 'required' : ''}">${q.label}</label>
    <div class="tap-options">
  `;

  q.options.forEach((opt, i) => {
    const isOther = opt.toLowerCase().includes('other');
    html += `
      <label class="tap-option" for="${formId}_${q.id}_${i}">
        <input type="radio" name="${q.id}" value="${opt}" 
               id="${formId}_${q.id}_${i}" ${required}
               ${isOther && !skipAutoOther ? `onchange="toggleOtherInput(this, '${formId}_${q.id}_other', true)"` :
        (hasOther && !skipAutoOther ? `onchange="toggleOtherInput(this, '${formId}_${q.id}_other', false)"` : '')}>
        <span class="tap-btn">
          <i class="bi bi-circle tap-icon-unchecked"></i>
          <i class="bi bi-check-circle-fill tap-icon-checked"></i>
          <span class="tap-label">${opt}</span>
        </span>
      </label>
    `;
  });

  html += `</div>`;

  if (hasOther && !skipAutoOther) {
    html += `<input type="text" class="form-control mt-1" name="${q.id}_other" 
             id="${formId}_${q.id}_other" placeholder="Please specify..." style="display: none;">`;
  }

  return html;
}

function renderRadioQuestion(q, formId) {
  const hasOther = q.options.some(opt => opt.toLowerCase().includes('other'));
  const required = q.required ? 'required' : '';

  let html = `
    <label class="form-label ${q.required ? 'required' : ''}">${q.label}</label>
    <div class="tap-options">
  `;

  q.options.forEach((opt, i) => {
    const isOther = opt.toLowerCase().includes('other');
    html += `
      <label class="tap-option" for="${formId}_${q.id}_${i}">
        <input type="radio" name="${q.id}" value="${opt}" 
               id="${formId}_${q.id}_${i}" ${required}
               ${isOther ? `onchange="toggleOtherInput(this, '${formId}_${q.id}_other', true)"` :
        (hasOther ? `onchange="toggleOtherInput(this, '${formId}_${q.id}_other', false)"` : '')}>
        <span class="tap-btn">
          <i class="bi bi-circle tap-icon-unchecked"></i>
          <i class="bi bi-check-circle-fill tap-icon-checked"></i>
          <span class="tap-label">${opt}</span>
        </span>
      </label>
    `;
  });

  html += `</div>`;

  if (hasOther) {
    html += `<input type="text" class="form-control mt-1" name="${q.id}_other" 
             id="${formId}_${q.id}_other" placeholder="Please specify..." style="display: none;">`;
  }

  return html;
}

function renderCheckboxQuestion(q, formId) {
  const hasOther = q.options.some(opt => opt.toLowerCase().includes('other'));

  let html = `
    <label class="form-label">${q.label}</label>
    <p class="tap-hint">Tap all that apply</p>
    <div class="tap-options tap-options-multi">
  `;

  q.options.forEach((opt, i) => {
    const isOther = opt.toLowerCase().includes('other');
    html += `
      <label class="tap-option tap-option-multi" for="${formId}_${q.id}_${i}">
        <input type="checkbox" name="${q.id}[]" value="${opt}" 
               id="${formId}_${q.id}_${i}"
               ${isOther ? `onchange="toggleOtherInput(this, '${formId}_${q.id}_other', this.checked)"` : ''}>
        <span class="tap-btn">
          <i class="bi bi-square tap-icon-unchecked"></i>
          <i class="bi bi-check-square-fill tap-icon-checked"></i>
          <span class="tap-label">${opt}</span>
        </span>
      </label>
    `;
  });

  html += `</div>`;

  if (hasOther) {
    html += `<input type="text" class="form-control mt-1" name="${q.id}_other" 
             id="${formId}_${q.id}_other" placeholder="Please specify..." style="display: none;">`;
  }

  return html;
}

function renderScaleQuestion(q, formId) {
  const required = q.required ? 'required' : '';

  // Scale labels for accessibility
  const scaleLabels = {
    1: 'Strongly Disagree',
    2: 'Disagree',
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree'
  };

  let html = `
    <div class="likert-container">
      <div class="likert-legend">
        <span class="likert-legend-item"><strong>1</strong> = Strongly Disagree</span>
        <span class="likert-legend-item"><strong>5</strong> = Strongly Agree</span>
      </div>
  `;

  q.items.forEach(item => {
    html += `
      <div class="likert-item">
        <p class="likert-statement">${item.text}</p>
        <div class="likert-options">
    `;
    q.scale.forEach(val => {
      html += `
          <label class="likert-option" for="${formId}_${item.id}_${val}">
            <input type="radio" name="${item.id}" value="${val}" 
                   id="${formId}_${item.id}_${val}" ${required}>
            <span class="likert-btn">
              <span class="likert-number">${val}</span>
              <span class="likert-label">${scaleLabels[val]}</span>
            </span>
          </label>
      `;
    });
    html += `
        </div>
      </div>
    `;
  });

  html += `</div>`;
  return html;
}

// ===== DATA VIEW =====
function renderDataView() {
  return `
    <div class="section-header">
      <h5><i class="bi bi-database"></i> Collected Survey Data</h5>
      <small>All submitted responses stored locally</small>
    </div>

    <div class="card">
      <div class="card-header">
        <div>
          <span>Responses: <strong id="responseCount">0</strong></span>
          <span class="text-muted"> | </span>
          <span>Unsynced: <strong id="unsyncedCount">0</strong></span>
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-primary" onclick="syncAllToCloud()">
            <i class="bi bi-cloud-upload"></i> Sync
          </button>
          <button class="btn btn-sm btn-outline" onclick="exportData()">
            <i class="bi bi-download"></i> Export
          </button>
        </div>
      </div>
      
      <div style="overflow-x: auto;">
        <table class="table data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Participant</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="dataTableBody">
            <tr><td colspan="5" class="text-center text-muted">Loading...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadDataTable() {
  try {
    // Ensure database is initialized
    if (!db.db) {
      console.log('⚠️ Database not initialized, initializing now...');
      try {
        await db.init();
        console.log('✅ Database initialized successfully');
      } catch (initError) {
        console.error('❌ Database initialization failed:', initError);
        const tbody = document.getElementById('dataTableBody');
        if (tbody) {
          tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load database. Please refresh the page.</td></tr>';
        }
        return;
      }
    }

    const responses = await db.getAll('surveys');
    console.log('📊 Loaded surveys from local device:', responses.length, 'record(s)');

    const tbody = document.getElementById('dataTableBody');
    const countEl = document.getElementById('responseCount');
    const unsyncedEl = document.getElementById('unsyncedCount');

    if (countEl) countEl.textContent = responses.length;
    if (unsyncedEl) unsyncedEl.textContent = responses.filter(r => !r.synced).length;

    if (!tbody) return;

    if (responses.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No surveys saved yet. Submit a survey to see data here.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    responses.reverse().forEach(resp => {
      const tr = document.createElement('tr');
      const syncBadge = resp.synced
        ? '<span class="badge badge-success"><i class="bi bi-cloud-check"></i> Synced</span>'
        : '<span class="badge badge-warning"><i class="bi bi-cloud-slash"></i> Local</span>';

      tr.innerHTML = `
        <td>${resp.id}</td>
        <td><span class="badge badge-primary">${resp.type}</span></td>
        <td>${resp.participantId}</td>
        <td>${syncBadge}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick='viewResponse(${JSON.stringify(resp).replace(/'/g, "&apos;")})'>
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteResponse(${resp.id})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Failed to load data:', error);
    const tbody = document.getElementById('dataTableBody');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading data: ${error.message}</td></tr>`;
    }
  }
}

// ===== FORM ACTIONS =====
function clearCurrentForm() {
  if (currentTab === 'dashboard') {
    alert('⚠️ Select a questionnaire to clear form');
    return;
  }
  
  const form = document.getElementById(`${currentTab}Form`);
  if (form && confirm('Clear all entries in this form?')) {
    form.reset();
    document.querySelectorAll('[data-show-if-field]').forEach(el => el.style.display = 'none');
  }
}

function saveProgress() {
  const form = document.getElementById(`${currentTab}Form`);
  if (!form) return;

  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  });

  // Include study site (use form-prefixed ID)
  const studySiteEl = document.getElementById(`${currentTab}_studySite`);
  let studySiteValue = studySiteEl?.value || '';

  // If "Other" is selected, use the specified value
  if (studySiteValue === 'Other') {
    const otherSiteEl = document.getElementById(`${currentTab}_studySiteOther`);
    if (otherSiteEl?.value?.trim()) {
      studySiteValue = otherSiteEl.value.trim();
    }
  }
  data.studySite = studySiteValue;

  // Save to localStorage as backup
  localStorage.setItem(`survey_draft_${currentTab}`, JSON.stringify(data));
  alert('✅ Progress saved locally');
}

async function submitCurrentForm() {
  const questionnaire = QUESTIONNAIRES[currentTab];
  if (!questionnaire || questionnaire.isDataView) return;

  const form = document.getElementById(`${currentTab}Form`);
  if (!form) return;

  // Check study site selection
  // Try getting by ID first (for select/text inputs)
  const studySiteEl = document.getElementById(`${currentTab}_studySite`);
  let studySite = studySiteEl?.value;

  // If not found by ID (e.g. it's a radio group from renderSelectQuestion), try querySelector
  if (!studySite) {
    const checkedConfig = document.querySelector(`input[name="studySite"]:checked`);
    if (checkedConfig) {
      studySite = checkedConfig.value;
    }
  }

  const studySiteOtherEl = document.getElementById(`${currentTab}_studySiteOther`);

  // If "Other" is selected, check if the other field is filled
  if (studySite === 'Other') {
    const otherValue = studySiteOtherEl?.value?.trim();
    if (!otherValue) {
      if (studySiteOtherEl) {
        studySiteOtherEl.style.display = 'block';
        studySiteOtherEl.focus();
      }
      alert('Please specify the study site');
      return;
    }
    // Use the custom site name
    studySite = otherValue;
  } else if (!studySite) {
    // If we can't focus a specific input, scroll to the top
    const firstOption = document.querySelector(`input[name="studySite"]`);
    if (firstOption) {
      firstOption.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    alert('Please select a Study Site');
    return;
  }

  // Validate required fields
  const invalidFields = form.querySelectorAll(':invalid');
  if (invalidFields.length > 0) {
    invalidFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    invalidFields[0].focus();
    alert('Please fill in all required fields');
    return;
  }

  // Ensure database is initialized
  if (!db.db) {
    console.log('⚠️ Database not initialized, initializing now...');
    try {
      await db.init();
      console.log('✅ Database initialized');
    } catch (initError) {
      console.error('❌ Database initialization failed:', initError);
      alert('❌ Failed to initialize database. Please refresh the page.');
      return;
    }
  }

  // Collect form data
  const formData = new FormData(form);
  const data = {};
  formData.forEach((value, key) => {
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  });

  // Add study site to data (use the resolved value)
  data.studySite = studySite;

  // Map survey type to participant type
  const typeMap = {
    patients: 'patient',
    clinicians: 'clinician',
    herbalists: 'herbalist',
    caregivers: 'caregiver',
    policymakers: 'policymaker',
    researchers: 'researcher'
  };

  try {
    console.log('💾 Saving survey data...');

    // Generate participant ID using unified system
    const participantType = typeMap[currentTab] || 'researcher';
    const participantId = participantManager.generateId(participantType);
    console.log(`📝 Generated ID: ${participantId}`);

    // Save to unified database (IndexedDB)
    const record = await db.add('surveys', {
      type: currentTab,
      participantId: participantId,
      studySite: studySite,
      data: data
    });

    console.log('✅ Survey saved to local storage (IndexedDB):', record);

    // Clear draft
    localStorage.removeItem(`survey_draft_${currentTab}`);

    // Show success message with WhatsApp reminder
    alert(`✅ Saved successfully!\n\nParticipant ID: ${participantId}\nStudy Site: ${studySite.toUpperCase()}\n\nData saved locally on your device.\n\n📱 Remember: Export your responses as JSON/CSV and send directly via WhatsApp to share with researchers.`);
    form.reset();
  } catch (error) {
    console.error('❌ Submit failed:', error);
    alert(`❌ Failed to save response: ${error.message}\n\nPlease try again or contact support if the problem persists.`);
  }
}

// ===== IMPORT/EXPORT =====
function setupImportButton() {
  const importBtn = document.getElementById('importBtn');
  const fileInput = document.getElementById('importFileInput');

  if (importBtn && fileInput) {
    importBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        let count = 0;
        if (file.name.endsWith('.json')) {
          count = await DataExchange.importJSON(file);
        } else if (file.name.endsWith('.csv')) {
          count = await DataExchange.importCSV(file);
        } else {
          alert('❌ Unsupported file format. Use JSON or CSV.');
          return;
        }

        alert(`✅ Successfully imported ${count} records`);
        fileInput.value = '';
        // Refresh dashboard if visible
        if (currentTab === 'dashboard') {
          renderCurrentTab();
        }
      } catch (error) {
        console.error('❌ Import failed:', error);
        alert(`❌ Import failed: ${error.message}`);
        fileInput.value = '';
      }
    });
  }
}

async function exportData() {
  try {
    const format = prompt('Export format? Enter "json" or "csv":', 'json').toLowerCase();

    if (format === 'json') {
      await DataExchange.exportJSON();
      alert('✅ JSON export complete\n\n📱 Next: Send this file to the researchers via WhatsApp');
    } else if (format === 'csv') {
      await DataExchange.exportCSV();
      alert('✅ CSV export complete\n\n📱 Next: Send this file to the researchers via WhatsApp');
    } else {
      alert('❌ Invalid format. Use "json" or "csv".');
    }
  } catch (error) {
    console.error('❌ Export failed:', error);
    alert(`❌ Export failed: ${error.message}`);
  }
}

// ===== DASHBOARD NAVIGATION =====
async function showDashboard() {
  currentTab = 'dashboard';
  currentView = 'list';
  selectedGroup = null;
  
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="dashboard"]').classList.add('active');
  
  await renderCurrentTab();
}

function openQuestionnaire(questionnaireId) {
  currentTab = questionnaireId;
  currentView = 'list';
  selectedGroup = null;
  
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="dashboard"]').classList.add('active');
  
  renderCurrentTab();
}

async function viewParticipantGroup(type) {
  currentView = 'group';
  selectedGroup = type;
  const container = document.getElementById('surveyContent');
  container.innerHTML = await Dashboard.renderGroupDetail(type);
}

function viewResponse(id) {
  if (typeof id === 'object') {
    // Old format - backward compatibility
    const formatted = JSON.stringify(id.data, null, 2);
    alert(`Response Details:\n\nID: ${id.participantId}\nType: ${id.type}\n\nData:\n${formatted}`);
  } else {
    // New string ID format - convert to number if needed
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    db.get('surveys', numId).then(resp => {
      if (resp) {
        const formatted = JSON.stringify(resp.data, null, 2);
        alert(`Response Details:\n\nID: ${resp.participantId}\nType: ${resp.type}\n\nDate: ${new Date(resp.createdAt).toLocaleString()}\n\nData:\n${formatted}`);
      } else {
        alert('❌ Response not found');
      }
    }).catch(err => {
      console.error('Failed to retrieve response:', err);
      alert('❌ Failed to retrieve response');
    });
  }
}

async function deleteResponse(id) {
  if (!confirm('Delete this response? This cannot be undone.')) return;

  try {
    await db.delete('surveys', id);
    loadDataTable();
  } catch (error) {
    console.error('Delete failed:', error);
    alert('❌ Failed to delete');
  }
}

// ===== UTILITIES =====
function toggleOtherInput(el, otherId, show) {
  const otherInput = document.getElementById(otherId);
  if (!otherInput) return;

  if (el.type === 'select-one') {
    show = el.value.toLowerCase().includes('other');
  }

  otherInput.style.display = show ? 'block' : 'none';
  if (!show) otherInput.value = '';
}

function attachConditionalLogic() {
  document.querySelectorAll('[data-show-if-field]').forEach(el => {
    const fieldName = el.getAttribute('data-show-if-field');
    const expectedValue = el.getAttribute('data-show-if-value');

    const inputs = document.querySelectorAll(`[name="${fieldName}"]`);
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        let currentValue = input.type === 'select-one' ? input.value :
          (input.checked ? input.value : null);

        if (input.type === 'radio') {
          const checked = document.querySelector(`[name="${fieldName}"]:checked`);
          currentValue = checked ? checked.value : null;
        }

        const shouldShow = (currentValue === expectedValue);
        el.style.display = shouldShow ? 'block' : 'none';

        // Toggle required attribute for inputs inside the conditional field
        const childInputs = el.querySelectorAll('input, select, textarea');
        childInputs.forEach(child => {
          if (shouldShow) {
            // Restore required if it was originally required
            // We assume if it has the 'required' class or attribute it should be required
            // For simplicity, we can check if the label has 'required' class
            const label = el.querySelector('label');
            if (label && label.classList.contains('required')) {
              child.setAttribute('required', 'true');
            }
          } else {
            child.removeAttribute('required');
          }
        });
      });
    });
  });
}
