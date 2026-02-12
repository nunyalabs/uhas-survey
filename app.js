/* ============================================
   UHAS-HPI Survey App
   Uses unified scripts: db.js, participant.js, sync.js
   ============================================ */

console.log('🔷 app.js: Script loading started');
console.log('🔍 Checking dependencies at load time:');
console.log('  - globalThis.db:', globalThis.db);
console.log('  - globalThis.participantManager:', globalThis.participantManager);
console.log('  - globalThis.Dashboard:', globalThis.Dashboard);
console.log('  - globalThis.CONFIG:', globalThis.CONFIG);

// ===== STATE =====
let currentTab = 'dashboard';
let currentView = 'list'; // 'list' or 'group'
let selectedGroup = null;

// Wizard State
let wizardState = {
  questions: [],
  currentIndex: 0,
  answers: {}
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check dependencies
    if (!globalThis.db) {
      throw new Error('Database module not loaded');
    }
    if (!globalThis.participantManager) {
      throw new Error('Participant module not loaded');
    }
    if (!globalThis.Dashboard) {
      throw new Error('Dashboard module not loaded');
    }
    if (!globalThis.QUESTIONNAIRES) {
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

    // Setup scroll-to-top button
    setupScrollToTop();

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
  // No tab buttons needed - dashboard is the default view
}

function attachTabListeners() {
  document.querySelectorAll('.tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active state
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Switch tab
      currentTab = tab.dataset.tab;
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
  document.getElementById('bottomBar').style.display = 'flex';
}

// ===== QUESTIONNAIRE RENDERING (WIZARD FLOW) =====
function renderQuestionnaire(q) {
  // 1. Flatten questions with section info
  wizardState.questions = [];
  wizardState.currentIndex = 0;
  wizardState.answers = {}; // Reset answers

  // Load draft if exists
  const draft = localStorage.getItem(`survey_draft_${q.id}`);
  if (draft) {
    try {
      const parsed = JSON.parse(draft);
      // We'll populate fields as we render them, or pre-fill answers
      // For simplicity in wizard, we might just rely on DOM elements retaining state if we hid them, 
      // but since we re-render, we need to store them. 
      // Actually, simplest is to keep a hidden form with ALL inputs, and the wizard just shows/hides them?
      // No, let's render one by one/
    } catch (e) { console.error('Error parsing draft', e); }
  }

  q.sections.forEach(section => {
    section.questions.forEach(question => {
      wizardState.questions.push({
        ...question,
        sectionTitle: section.title,
        sectionDesc: section.description
      });
    });
  });

  // Setup container
  let html = `
    <form id="${q.id}Form" novalidate class="wizard-form" style="height: 100%; display: flex; flex-direction: column;">
      <div id="wizardHeader" class="wizard-header mb-3">
        <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted" id="wizardProgress">Question 1 of ${wizardState.questions.length}</small>
            <div class="progress" style="width: 50%; height: 6px;">
                <div id="wizardProgressBar" class="progress-bar bg-success" role="progressbar" style="width: 0%"></div>
            </div>
        </div>
        <h5 class="mt-2" id="wizardSectionTitle"></h5>
      </div>

      <div id="wizardStepContainer" class="flex-grow-1 d-flex flex-column justify-content-center">
        <!-- Question injected here -->
      </div>

      <div class="wizard-footer mt-auto pt-3 d-flex gap-2 justify-content-between">
        <button type="button" class="btn btn-outline-secondary" id="btnPrev" onclick="wizardPrev()">
          <i class="bi bi-arrow-left"></i> Previous
        </button>
        <button type="button" class="btn btn-primary" id="btnNext" onclick="wizardNext()">
          Next <i class="bi bi-arrow-right"></i>
        </button>
        <button type="button" class="btn btn-success" id="btnSubmit" onclick="submitCurrentForm()" style="display: none;">
          <i class="bi bi-check-lg"></i> Save & Finish
        </button>
      </div>
    </form>
  `;

  // Defer initial render to after HTML injection
  setTimeout(() => renderWizardStep(), 0);

  return html;
}

function renderWizardStep() {
  const container = document.getElementById('wizardStepContainer');
  if (!container) return;

  // Find next visible question (handling showIf)
  // We don't skip here, we assume currentIndex is valid or we moved to it. 
  // Should we check validity of current index?

  const qItem = wizardState.questions[wizardState.currentIndex];
  if (!qItem) {
    // End of wizard?
    return;
  }

  // Check showIf logic. If hidden, auto-move.
  // NOTE: This recursive check needs to handle direction. 
  // For now, let's render, then check visibility. If hidden, trigger Next immediately?
  // Better: loop until we find a visible one.

  // We'll trust the navigation logic to settle on a visible index.
  // But for initial render, we might be on a hidden one.
  if (shouldHideQuestion(qItem)) {
    // Auto move next without animation
    wizardState.currentIndex++;
    if (wizardState.currentIndex >= wizardState.questions.length) {
      // Reached end? Show submit?
      updateWizardControls();
      return;
    }
    renderWizardStep();
    return;
  }

  // Update Header
  document.getElementById('wizardSectionTitle').textContent = qItem.sectionTitle || '';
  document.getElementById('wizardProgress').textContent = `Question ${wizardState.currentIndex + 1} of ${wizardState.questions.length}`;
  const pct = ((wizardState.currentIndex + 1) / wizardState.questions.length) * 100;
  document.getElementById('wizardProgressBar').style.width = `${pct}%`;

  // Render Question
  let qHtml = renderQuestion(qItem, currentTab + 'Form'); // Reuse existing render

  // Wrap in a fade-in div
  container.innerHTML = `<div class="wizard-step fade-in-up">${qHtml}</div>`;

  // Restore answer if exists in state or draft
  restoreWizardAnswer(qItem.id);

  // Attach auto-advance listeners for radios
  if (qItem.type === 'radio' || qItem.type === 'scale' || qItem.type === 'select') {
    const inputs = container.querySelectorAll('input[type="radio"], input[type="radio"]'); // Selects are rendered as radios in this app helper
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        // Delay slightly for visual feedback
        setTimeout(() => wizardNext(), 400);
      });
    });
  }

  updateWizardControls();
}

function updateWizardControls() {
  const isFirst = wizardState.currentIndex === 0;
  const isLast = wizardState.currentIndex === wizardState.questions.length - 1; // Or check if remaining are all hidden

  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnSubmit = document.getElementById('btnSubmit');

  if (btnPrev) btnPrev.style.visibility = isFirst ? 'hidden' : 'visible';

  // Check if we are at the "effective" end (next questions are hidden)
  // For simplicity, just check last index.

  if (isLast) {
    if (btnNext) btnNext.style.display = 'none';
    if (btnSubmit) btnSubmit.style.display = 'flex';
  } else {
    if (btnNext) btnNext.style.display = 'flex';
    if (btnSubmit) btnSubmit.style.display = 'none';
  }
}

function shouldHideQuestion(q) {
  if (!q.showIf) return false;

  // Check dependency value
  // We need to look up the answer in wizardState.answers or the DOM if it's still there (it's not).
  // So we MUST store answers in wizardState.answers on change.

  const depValue = wizardState.answers[q.showIf.field];
  return depValue !== q.showIf.value;
}

function wizardNext() {
  if (!validateCurrentStep()) return;
  saveCurrentStepAnswer();

  let nextIndex = wizardState.currentIndex + 1;

  // Skip hidden questions
  while (nextIndex < wizardState.questions.length) {
    if (!shouldHideQuestion(wizardState.questions[nextIndex])) {
      break;
    }
    nextIndex++;
  }

  if (nextIndex < wizardState.questions.length) {
    wizardState.currentIndex = nextIndex;
    renderWizardStep();
  } else {
    // End of form
    updateWizardControls();
    // Maybe render a "Review" or "Finished" step?
    // For now, just ensure Submit button is visible
    wizardState.currentIndex = wizardState.questions.length - 1; // Stay on last
    updateWizardControls();
  }
}

function wizardPrev() {
  saveCurrentStepAnswer(); // Optional: save before moving back

  let prevIndex = wizardState.currentIndex - 1;

  // Skip hidden questions backwards
  while (prevIndex >= 0) {
    if (!shouldHideQuestion(wizardState.questions[prevIndex])) {
      break;
    }
    prevIndex--;
  }

  if (prevIndex >= 0) {
    wizardState.currentIndex = prevIndex;
    renderWizardStep();
  }
}

function validateCurrentStep() {
  // Check required
  const container = document.getElementById('wizardStepContainer');
  const qItem = wizardState.questions[wizardState.currentIndex];

  if (qItem.required) {
    // Check if answered
    const input = container.querySelector('input:checked, input[type="text"], input[type="date"], select');
    // Note: this is a rough check. 

    let hasValue = false;
    if (qItem.type === 'checkbox') {
      hasValue = container.querySelectorAll('input:checked').length > 0;
    } else if (qItem.type === 'radio' || qItem.type === 'scale' || qItem.type === 'select') { // Select rendered as radios
      hasValue = container.querySelectorAll('input:checked').length > 0;
    } else {
      const val = container.querySelector('input')?.value;
      hasValue = val && val.trim() !== '';
    }

    if (!hasValue) {
      // alert('Please answer this question.'); 
      // Better: shake animation or inline error
      container.classList.add('shake');
      setTimeout(() => container.classList.remove('shake'), 500);
      return false;
    }
  }
  return true;
}

function saveCurrentStepAnswer() {
  const container = document.getElementById('wizardStepContainer');
  const qItem = wizardState.questions[wizardState.currentIndex];

  // Extract value
  let val = null;
  if (qItem.type === 'checkbox') {
    const checked = Array.from(container.querySelectorAll('input:checked')).map(cb => cb.value);
    if (checked.length > 0) val = checked;
  } else if (qItem.type === 'radio' || qItem.type === 'scale' || qItem.type === 'select') {
    const checked = container.querySelector('input:checked');
    if (checked) val = checked.value;
  } else {
    const input = container.querySelector('input');
    if (input) val = input.value;
  }

  if (val !== null) {
    wizardState.answers[qItem.id] = val;
  }
}

function restoreWizardAnswer(qId) {
  const val = wizardState.answers[qId];
  if (!val) return;

  const container = document.getElementById('wizardStepContainer');
  const qItem = wizardState.questions.find(q => q.id === qId);

  if (Array.isArray(val)) { // Checkbox
    val.forEach(v => {
      const el = container.querySelector(`input[value="${v}"]`);
      if (el) el.checked = true;
    });
  } else {
    const radio = container.querySelector(`input[value="${val}"]`);
    if (radio) {
      radio.checked = true;
    } else {
      const text = container.querySelector(`input[name="${qId}"]`);
      if (text) text.value = val;
    }
  }
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
    let onchangeAttr = '';

    if (isOther && !skipAutoOther) {
      onchangeAttr = `onchange="toggleOtherInput(this, '${formId}_${q.id}_other', true)"`;
    } else if (hasOther && !skipAutoOther) {
      onchangeAttr = `onchange="toggleOtherInput(this, '${formId}_${q.id}_other', false)"`;
    }

    html += `
      <label class="tap-option" for="${formId}_${q.id}_${i}">
        <input type="radio" name="${q.id}" value="${opt}" 
               id="${formId}_${q.id}_${i}" ${required}
               ${onchangeAttr}>
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
    let onchangeAttr = '';
    if (isOther) {
      onchangeAttr = `onchange="toggleOtherInput(this, '${formId}_${q.id}_other', true)"`;
    } else if (hasOther) {
      onchangeAttr = `onchange="toggleOtherInput(this, '${formId}_${q.id}_other', false)"`;
    }

    html += `
      <label class="tap-option" for="${formId}_${q.id}_${i}">
        <input type="radio" name="${q.id}" value="${opt}" 
               id="${formId}_${q.id}_${i}" ${required}
               ${onchangeAttr}>
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
          <button class="btn btn-sm btn-outline" onclick='viewResponse(${JSON.stringify(resp).replaceAll(/'/, "&apos;")})'>
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

function getStudySiteValue() {
  const studySiteEl = document.getElementById(`${currentTab}_studySite`);
  let studySite = studySiteEl?.value;

  if (!studySite) {
    const checkedConfig = document.querySelector(`input[name="studySite"]:checked`);
    if (checkedConfig) {
      studySite = checkedConfig.value;
    }
  }

  return studySite;
}

function validateAndResolveStudySite(studySite) {
  const studySiteOtherEl = document.getElementById(`${currentTab}_studySiteOther`);

  if (studySite === 'Other') {
    const otherValue = studySiteOtherEl?.value?.trim();
    if (!otherValue) {
      if (studySiteOtherEl) {
        studySiteOtherEl.style.display = 'block';
        studySiteOtherEl.focus();
      }
      alert('Please specify the study site');
      return null;
    }
    return otherValue;
  }

  if (!studySite) {
    const firstOption = document.querySelector(`input[name="studySite"]`);
    if (firstOption) {
      firstOption.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    alert('Please select a Study Site');
    return null;
  }

  return studySite;
}

function collectFormData(form) {
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
  return data;
}

async function submitCurrentForm() {
  const questionnaire = QUESTIONNAIRES[currentTab];
  if (!questionnaire || questionnaire.isDataView) return;

  const form = document.getElementById(`${currentTab}Form`);
  if (!form) return;

  // Get and validate study site
  let studySite = getStudySiteValue();
  studySite = validateAndResolveStudySite(studySite);
  if (!studySite) return;

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

  // Collect form data explicitly from WIZARD STATE
  // Since inputs are removed from DOM, we rely on wizardState.answers
  // We also need to do a final save of the current step
  saveCurrentStepAnswer();

  const data = { ...wizardState.answers };

  // Explicitly ensure studySite is there
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

    // Clear draft and reset state
    localStorage.removeItem(`survey_draft_${currentTab}`);
    wizardState.answers = {};
    wizardState.currentIndex = 0;

    // Show success modal with initial status
    const statusText = `
        <span id="syncStatus">⏳ Saving locally...</span><br>
        <span id="downloadStatus">⏳ Preparing download...</span>
    `;
    showSuccessModal(participantId, studySite.toUpperCase(), record, statusText);

    // Reset wizard
    renderCurrentTab();

    // Auto-sync to Firebase
    if (window.syncService && navigator.onLine) {
      document.getElementById('syncStatus').innerHTML = '🔄 Syncing to cloud...';

      syncService.syncSurvey(record).then(() => {
        console.log('✅ Auto-synced');
        const el = document.getElementById('syncStatus');
        if (el) el.innerHTML = '✅ Data sync successful';
      }).catch(err => {
        console.warn('Sync failed:', err);
        const el = document.getElementById('syncStatus');
        if (el) el.innerHTML = '⚠️ Sync failed (saved locally)';
      });
    } else {
      const el = document.getElementById('syncStatus');
      if (el) el.innerHTML = '📂 Saved locally (Offline)';
    }

    // AUTO DOWNLOAD JSON
    setTimeout(async () => {
      try {
        const fileName = _buildFileName(record);
        const jsonStr = JSON.stringify(record, null, 2);
        await DataExchange._downloadFile(jsonStr, fileName, 'application/json');

        const el = document.getElementById('downloadStatus');
        if (el) el.innerHTML = `✅ File downloaded: ${fileName}`;
      } catch (e) {
        console.error('Auto-download failed', e);
        const el = document.getElementById('downloadStatus');
        if (el) el.innerHTML = '⚠️ Auto-download failed';
      }
    }, 1000);

  } catch (error) {
    console.error('❌ Submit failed:', error);
    alert(`❌ Failed to save response: ${error.message}`);
  }
}

// ===== SCROLL TO TOP =====
function setupScrollToTop() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });
}

// ===== EXPORT =====
async function exportData() {
  try {
    // Default to JSON export
    await DataExchange.exportJSON();
    alert('✅ JSON export complete\n\n📱 Next: Send this file to the researchers via WhatsApp');
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

  await renderCurrentTab();
}

function openQuestionnaire(questionnaireId) {
  currentTab = questionnaireId;
  currentView = 'list';
  selectedGroup = null;

  renderCurrentTab();
}

async function viewParticipantGroup(type) {
  currentView = 'group';
  selectedGroup = type;
  const container = document.getElementById('surveyContent');
  container.innerHTML = await Dashboard.renderGroupDetail(type);
}

function viewResponse(id) {
  // Share the record as JSON file directly
  shareOneRecord(id);
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

// ===== SHARE & EXPORT =====
function _buildFileName(survey) {
  const pid = survey.participantId || survey.id;
  const site = (survey.studySite || 'unknown').replaceAll(/[^a-zA-Z0-9-]/g, '_');
  const date = new Date(survey.createdAt).toISOString().split('T')[0];
  return `${pid}_${site}_${date}.json`;
}

async function shareOneRecord(id) {
  try {
    if (!db.db) await db.init();
    const numId = typeof id === 'string' ? Number.parseInt(id, 10) : id;
    const survey = await db.get('surveys', numId);
    if (!survey) { alert('Record not found'); return; }

    const jsonStr = JSON.stringify(survey, null, 2);
    const fileName = _buildFileName(survey);
    // Use text/plain for Android compatibility as many apps filter out application/json
    const blob = new Blob([jsonStr], { type: 'text/plain' });
    const file = new File([blob], fileName, { type: 'text/plain' });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: fileName, files: [file] });
    } else {
      DataExchange._downloadFile(jsonStr, fileName, 'application/json');
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error);
      alert('❌ Share failed: ' + error.message);
    }
  }
}

async function shareAllRecords() {
  try {
    if (!db.db) await db.init();
    const surveys = await db.getAll('surveys');
    if (surveys.length === 0) { alert('No records to share'); return; }

    const files = surveys.map(s => {
      const jsonStr = JSON.stringify(s, null, 2);
      // Use text/plain for Android compatibility
      const blob = new Blob([jsonStr], { type: 'text/plain' });
      return new File([blob], _buildFileName(s), { type: 'text/plain' });
    });

    if (navigator.canShare?.({ files })) {
      await navigator.share({ title: 'UHAS Survey Records', files });
    } else {
      // Fallback: download each file
      surveys.forEach(s => {
        const jsonStr = JSON.stringify(s, null, 2);
        DataExchange._downloadFile(jsonStr, _buildFileName(s), 'application/json');
      });
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error);
      alert('❌ Share failed: ' + error.message);
    }
  }
}

async function exportAllRecords() {
  try {
    if (!db.db) await db.init();
    const surveys = await db.getAll('surveys');
    if (surveys.length === 0) { alert('No records to export'); return; }

    surveys.forEach(s => {
      const jsonStr = JSON.stringify(s, null, 2);
      DataExchange._downloadFile(jsonStr, _buildFileName(s), 'application/json');
    });

    alert(`✅ Exported ${surveys.length} record(s)`);
  } catch (error) {
    console.error('Export failed:', error);
    alert('❌ Export failed: ' + error.message);
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

function _toggleChildInputRequired(child, shouldShow, el) {
  if (shouldShow) {
    const label = el.querySelector('label');
    if (label?.classList.contains('required')) {
      child.setAttribute('required', 'true');
    }
  } else {
    child.removeAttribute('required');
  }
}

function _handleConditionalFieldChange(el, fieldName, expectedValue) {
  return function () {
    let currentValue;
    if (this.type === 'select-one') {
      currentValue = this.value;
    } else {
      currentValue = this.checked ? this.value : null;
    }

    if (this.type === 'radio') {
      const checked = document.querySelector(`[name="${fieldName}"]:checked`);
      currentValue = checked ? checked.value : null;
    }

    const shouldShow = (currentValue === expectedValue);
    el.style.display = shouldShow ? 'block' : 'none';

    const childInputs = el.querySelectorAll('input, select, textarea');
    childInputs.forEach(child => {
      _toggleChildInputRequired(child, shouldShow, el);
    });
  };
}

function attachConditionalLogic() {
  document.querySelectorAll('[data-show-if-field]').forEach(el => {
    const fieldName = el.dataset.showIfField;
    const expectedValue = el.dataset.showIfValue;

    const inputs = document.querySelectorAll(`[name="${fieldName}"]`);
    inputs.forEach(input => {
      input.addEventListener('change', _handleConditionalFieldChange(el, fieldName, expectedValue));
    });
  });
}

// ===== SUCCESS MODAL =====
function showSuccessModal(participantId, studySite, record, customStatusHtml) {
  const modal = document.getElementById('successModal');
  const text = document.getElementById('successModalText');
  const shareBtn = document.getElementById('successShareBtn');

  if (!modal || !text || !shareBtn) return;

  const statusContent = customStatusHtml || 'Data saved locally.';

  text.innerHTML = `
    <strong>Participant ID:</strong> ${participantId}<br>
    <strong>Site:</strong> ${studySite}<br><br>
    ${statusContent}
  `;

  // Attach share handler
  // Use record.id if it's an object, otherwise treat as ID
  const id = (typeof record === 'object' && record !== null) ? record.id : record;

  shareBtn.onclick = async () => {
    // Attempt share
    await shareOneRecord(id);
    closeSuccessModal();
  };

  modal.style.display = 'block';
}

function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== SAVE & SHARE =====
async function submitAndShareCurrentForm() {
  const questionnaire = QUESTIONNAIRES[currentTab];
  if (!questionnaire || questionnaire.isDataView) return;

  const form = document.getElementById(`${currentTab}Form`);
  if (!form) return;

  let studySite = getStudySiteValue();
  studySite = validateAndResolveStudySite(studySite);
  if (!studySite) return;

  const invalidFields = form.querySelectorAll(':invalid');
  if (invalidFields.length > 0) {
    invalidFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    invalidFields[0].focus();
    alert('Please fill in all required fields');
    return;
  }

  const data = collectFormData(form);
  data.studySite = studySite;

  const typeMap = {
    patients: 'patient',
    clinicians: 'clinician',
    herbalists: 'herbalist',
    caregivers: 'caregiver',
    policymakers: 'policymaker',
    researchers: 'researcher'
  };

  const participantType = typeMap[currentTab] || 'researcher';
  const participantId = participantManager.generateId(participantType);

  const record = {
    type: currentTab,
    participantId,
    studySite,
    data,
    createdAt: new Date().toISOString(),
    synced: false
  };

  try {
    const jsonStr = JSON.stringify(record, null, 2);
    const fileName = _buildFileName(record);
    const blob = new Blob([jsonStr], { type: 'text/plain' });
    const file = new File([blob], fileName, { type: 'text/plain' });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: fileName, files: [file] });
    } else {
      DataExchange._downloadFile(jsonStr, fileName, 'application/json');
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error);
      alert('❌ Share failed: ' + error.message);
    }
  }

  try {
    if (!db.db) await db.init();
    const savedRecord = await db.add('surveys', record);
    console.log('✅ Survey saved to local storage (IndexedDB):', savedRecord);

    localStorage.removeItem(`survey_draft_${currentTab}`);
    form.reset();

    showSuccessModal(participantId, studySite.toUpperCase(), savedRecord);

    // Auto-sync to Firebase
    if (window.syncService && navigator.onLine) {
      syncService.syncSurvey(savedRecord).then(() => {
        // alert('✅ Data synced to cloud!'); // Optional: separate alert or just toast
        console.log('✅ Auto-synced to cloud');
      }).catch(err => console.warn('Sync failed:', err));
    }

  } catch (error) {
    console.error('❌ Save to DB failed:', error);
    alert(`❌ Data sharing initiated, but LOCAL SAVE FAILED: ${error.message}. Please take a screenshot of the filled form.`);
  }
}

async function syncAllToCloud() {
  if (!window.syncService) {
    alert('Sync service not loaded');
    return;
  }

  if (!navigator.onLine) {
    alert('⚠️ You are offline. Connect to the internet to sync.');
    return;
  }

  const btn = document.querySelector('button[onclick="syncAllToCloud()"]');
  const originalText = btn ? btn.innerHTML : '';
  if (btn) btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Syncing...';

  try {
    const result = await syncService.syncAll();
    console.log('Sync result:', result);

    if (result.totalSynced > 0) {
      alert(`✅ Successfully synced ${result.totalSynced} items to the cloud!`);
    } else if (result.totalFailed > 0) {
      alert(`⚠️ Sync completed with errors. Failed: ${result.totalFailed}. Check console for details.`);
    } else {
      alert('All data is already up to date.');
    }

    // Refresh table if on data view
    if (typeof loadDataTable === 'function') {
      loadDataTable();
    }
  } catch (error) {
    console.error('Sync error:', error);
    alert('❌ Sync failed: ' + error.message);
  } finally {
    if (btn) btn.innerHTML = originalText;
  }
}

globalThis.submitAndShareCurrentForm = submitAndShareCurrentForm;
