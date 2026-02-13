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
      JSON.parse(draft);
      // We'll populate fields as we render them, or pre-fill answers
      // For simplicity in wizard, we might just rely on DOM elements retaining state if we hid them, 
      // but since we re-render, we need to store them. 
      // Actually, simplest is to keep a hidden form with ALL inputs, and the wizard just shows/hides them?
      // No, let's render one by one/
    } catch (e) { console.error('Error parsing draft', e); }
  }

  q.sections.forEach(section => {
    section.questions.forEach(question => {
      if (question.type === 'scale' && question.items && question.items.length > 1) {
        // Split each scale item into its own wizard step for one-at-a-time flow
        question.items.forEach((item, idx) => {
          wizardState.questions.push({
            id: item.id,
            label: item.text,
            type: 'scale-single',
            required: question.required,
            scale: question.scale,
            parentId: question.id,
            parentItems: question.items,
            itemIndex: idx,
            sectionTitle: section.title,
            sectionDesc: section.description
          });
        });
      } else {
        wizardState.questions.push({
          ...question,
          sectionTitle: section.title,
          sectionDesc: section.description
        });
      }
    });
  });

  // Setup container
  let html = `
    <form id="${q.id}Form" novalidate class="wizard-form">
      <div id="wizardHeader" class="wizard-header mb-3">
        <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted" id="wizardProgress">Question 1 of ${wizardState.questions.length}</small>
            <div class="progress" style="width: 50%; height: 6px;">
                <div id="wizardProgressBar" class="progress-bar bg-success" role="progressbar" style="width: 0%"></div>
            </div>
        </div>
        <h5 class="mt-2" id="wizardSectionTitle"></h5>
      </div>

      <div id="wizardStepContainer">
        <!-- Question injected here -->
      </div>

      <div class="wizard-footer d-flex gap-2 justify-content-between">
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
  const sectionTitle = qItem.sectionTitle || '';
  const sectionDesc = qItem.sectionDesc || '';
  document.getElementById('wizardSectionTitle').innerHTML = sectionTitle + 
    (sectionDesc ? `<small style="display:block;font-weight:400;font-size:0.8rem;color:var(--text-muted);margin-top:4px;">${sectionDesc}</small>` : '');
  document.getElementById('wizardProgress').textContent = `Question ${wizardState.currentIndex + 1} of ${wizardState.questions.length}`;
  const pct = ((wizardState.currentIndex + 1) / wizardState.questions.length) * 100;
  document.getElementById('wizardProgressBar').style.width = `${pct}%`;

  // Render Question
  let qHtml = renderQuestion(qItem, currentTab + 'Form'); // Reuse existing render

  // Wrap in a fade-in div
  container.innerHTML = `<div class="wizard-step fade-in-up">${qHtml}</div>`;

  // In wizard mode, force the question-group visible.
  // The wizard handles show/hide via shouldHideQuestion() at navigation level,
  // but renderQuestion() adds style="display:none;" for showIf questions.
  const questionGroup = container.querySelector('.question-group');
  if (questionGroup) {
    questionGroup.style.display = '';
    questionGroup.removeAttribute('data-show-if-field');
    questionGroup.removeAttribute('data-show-if-value');
  }

  // Restore answer if exists in state or draft
  restoreWizardAnswer(qItem.id);

  // Attach auto-advance listeners for radios (not for scales - they have multiple items)
  if (qItem.type === 'radio' || qItem.type === 'select' || qItem.type === 'scale-single') {
    const inputs = container.querySelectorAll('input[type="radio"]');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        console.log('🔘 Radio changed:', input.value);
        // Don't auto-advance if "Other" is selected — let user type first
        if (input.value.toLowerCase().includes('other')) {
          console.log('⏸️ "Other" selected, waiting for user input');
          return;
        }
        setTimeout(() => {
          console.log('⏰ Triggering wizardNext from radio change');
          wizardNext();
        }, 400);
      });
    });
  } else if (qItem.type === 'scale') {
    // For scale: auto-advance only when ALL items answered
    const inputs = container.querySelectorAll('input[type="radio"]');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        // Clear highlight on answered item
        const itemEl = input.closest('.likert-item');
        if (itemEl) itemEl.style.outline = 'none';

        const totalItems = qItem.items.length;
        const answeredItems = container.querySelectorAll('input[type="radio"]:checked').length;
        if (answeredItems >= totalItems) {
          setTimeout(() => wizardNext(), 400);
        }
      });
    });
  }

  updateWizardControls();
}

function updateWizardControls() {
  const isFirst = wizardState.currentIndex === 0;
  const isReview = wizardState.currentIndex >= wizardState.questions.length;

  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnSubmit = document.getElementById('btnSubmit');

  if (btnPrev) btnPrev.style.visibility = isFirst ? 'hidden' : 'visible';

  if (isReview) {
    if (btnNext) btnNext.style.display = 'none';
    if (btnSubmit) btnSubmit.style.display = 'flex';
    if (btnPrev) btnPrev.onclick = () => wizardPrev(); // Ensure it goes back
  } else {
    if (btnNext) btnNext.style.display = 'flex';
    if (btnSubmit) btnSubmit.style.display = 'none';
  }
}

function shouldHideQuestion(q) {
  if (!q.showIf) return false;

  const depValue = wizardState.answers[q.showIf.field];
  const expectedValue = q.showIf.value;

  // Handle array of accepted values (e.g. showIf: { field: 'x', value: ['a','b'] })
  if (Array.isArray(expectedValue)) {
    return !expectedValue.includes(depValue);
  }

  return depValue !== expectedValue;
}

function wizardNext() {
  console.log('➡️ wizardNext called');
  if (!validateCurrentStep()) {
    console.warn('❌ User validation failed');
    return;
  }
  saveCurrentStepAnswer();
  console.log('💾 Step saved. Current State:', wizardState.answers);

  let nextIndex = wizardState.currentIndex + 1;

  // Skip hidden questions
  while (nextIndex < wizardState.questions.length) {
    if (!shouldHideQuestion(wizardState.questions[nextIndex])) {
      break;
    }
    console.log(`⏩ Skipping hidden question: ${wizardState.questions[nextIndex].id}`);
    nextIndex++;
  }

  if (nextIndex < wizardState.questions.length) {
    wizardState.currentIndex = nextIndex;
    renderWizardStep();
  } else {
    // End of form -> Show Review Screen
    renderWizardReview();
  }
}

function wizardPrev() {
  saveCurrentStepAnswer(); // Optional: save before moving back

  // If we are in review mode (index = length), go back to last visible question
  if (wizardState.currentIndex >= wizardState.questions.length) {
    let prevIndex = wizardState.questions.length - 1;
    while (prevIndex >= 0) {
      if (!shouldHideQuestion(wizardState.questions[prevIndex])) break;
      prevIndex--;
    }
    wizardState.currentIndex = prevIndex;
    renderWizardStep();
    return;
  }

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

function jumpToQuestion(index) {
  wizardState.currentIndex = index;
  renderWizardStep();
}

function renderWizardReview() {
  // Set index to length to indicate review mode
  wizardState.currentIndex = wizardState.questions.length;

  const container = document.getElementById('wizardStepContainer');
  document.getElementById('wizardSectionTitle').textContent = 'Review Answers';
  document.getElementById('wizardProgress').textContent = 'Review';
  document.getElementById('wizardProgressBar').style.width = '100%';

  let html = `
        <div class="wizard-step fade-in-up">
            <h5 class="mb-3">Please review your answers before submitting.</h5>
            <div class="list-group list-group-flush border rounded mb-3">
    `;

  wizardState.questions.forEach((q, index) => {
    if (shouldHideQuestion(q)) return; // Skip hidden

    const answer = wizardState.answers[q.id];
    let displayAnswer = '<span class="text-muted fst-italic">Not answered</span>';
    let isMissing = false;

    if (answer) {
      if (q.type === 'scale' && typeof answer === 'object' && !Array.isArray(answer)) {
        // Scale: show each item's answer
        const scaleLabels = { '1': 'SD', '2': 'D', '3': 'N', '4': 'A', '5': 'SA' };
        const parts = q.items.map(item => {
          const v = answer[item.id];
          return v ? `<span style="display:inline-block;background:var(--primary-light);padding:2px 6px;border-radius:4px;margin:1px;font-size:0.8rem;">${item.id.toUpperCase()}: ${scaleLabels[v] || v}</span>` : `<span style="color:var(--danger);font-size:0.8rem;">${item.id.toUpperCase()}: ?</span>`;
        });
        displayAnswer = parts.join(' ');
      } else if (q.type === 'scale-single') {
        const scaleLabelsReview = { '1': 'Strongly Disagree', '2': 'Disagree', '3': 'Neutral', '4': 'Agree', '5': 'Strongly Agree' };
        displayAnswer = `<span style="display:inline-flex;align-items:center;gap:6px;"><strong>${answer}</strong> — ${scaleLabelsReview[answer] || answer}</span>`;
      } else if (Array.isArray(answer)) {
        displayAnswer = answer.join(', ');
      } else {
        displayAnswer = answer;
      }
    } else if (q.required) {
      displayAnswer = '<span class="text-danger fw-bold"><i class="bi bi-exclamation-circle"></i> Required</span>';
      isMissing = true;
    }

    const qLabel = q.type === 'scale' ? (q.sectionTitle || 'Rating Scale') : q.label;

    html += `
            <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" 
                 onclick="jumpToQuestion(${index})" style="cursor: pointer;">
                <div style="flex: 1;">
                    <small class="text-muted d-block">${qLabel}</small>
                    <div class="fw-medium">${displayAnswer}</div>
                </div>
                <div class="text-primary ms-2"><i class="bi bi-pencil-square"></i></div>
            </div>
        `;
  });

  html += `</div>
        <div class="alert alert-info">
            <i class="bi bi-info-circle"></i> Tap any question to edit your answer.
        </div>
    </div>`;

  container.innerHTML = html;
  updateWizardControls();
}

function validateCurrentStep() {
  const container = document.getElementById('wizardStepContainer');
  const qItem = wizardState.questions[wizardState.currentIndex];

  if (qItem.required) {
    let hasValue = false;

    if (qItem.type === 'scale') {
      // Scale: ALL items must be answered
      const totalItems = qItem.items.length;
      const answeredItems = container.querySelectorAll('input[type="radio"]:checked').length;
      hasValue = answeredItems >= totalItems;

      if (!hasValue) {
        // Highlight unanswered items
        qItem.items.forEach(item => {
          const checked = container.querySelector(`input[name="${item.id}"]:checked`);
          const itemEl = container.querySelector(`input[name="${item.id}"]`)?.closest('.likert-item');
          if (itemEl) {
            itemEl.style.outline = checked ? 'none' : '2px solid var(--danger)';
            itemEl.style.borderRadius = 'var(--radius-md)';
          }
        });
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 500);
        return false;
      }
    } else if (qItem.type === 'checkbox') {
      hasValue = container.querySelectorAll('input:checked').length > 0;
    } else if (qItem.type === 'radio' || qItem.type === 'select' || qItem.type === 'scale-single') {
      hasValue = container.querySelectorAll('input:checked').length > 0;
    } else {
      const val = container.querySelector('input')?.value;
      hasValue = val && val.trim() !== '';
    }

    if (!hasValue) {
      container.classList.add('shake');
      setTimeout(() => container.classList.remove('shake'), 500);
      return false;
    }
  }
  return true;
}

function saveCurrentStepAnswer() {
  const container = document.getElementById('wizardStepContainer');
  // Guard against out-of-bounds index (e.g. on Review step)
  if (!wizardState.questions || !wizardState.questions[wizardState.currentIndex]) {
    return;
  }
  const qItem = wizardState.questions[wizardState.currentIndex];

  // Extract value
  let val = null;
  if (qItem.type === 'scale') {
    // Scale questions have multiple items, each with their own radio group
    const scaleAnswers = {};
    let hasAny = false;
    qItem.items.forEach(item => {
      const checked = container.querySelector(`input[name="${item.id}"]:checked`);
      if (checked) {
        scaleAnswers[item.id] = checked.value;
        hasAny = true;
      }
    });
    if (hasAny) val = scaleAnswers;
  } else if (qItem.type === 'checkbox') {
    const checked = Array.from(container.querySelectorAll('input:checked')).map(cb => cb.value);

    // Handle "Other" text for checkboxes
    const otherInput = container.querySelector(`input[name="${qItem.id}_other"]`);
    if (otherInput && otherInput.value.trim()) {
      const otherIndex = checked.findIndex(v => v.toLowerCase().includes('other'));
      if (otherIndex !== -1) {
        checked[otherIndex] = `Other: ${otherInput.value.trim()}`;
      }
    }

    if (checked.length > 0) val = checked;
  } else if (qItem.type === 'radio' || qItem.type === 'select' || qItem.type === 'scale-single') {
    const checked = container.querySelector('input:checked');
    if (checked) {
      val = checked.value;

      // Handle "Other" text
      if (val.toLowerCase().includes('other')) {
        const otherInput = container.querySelector(`input[name="${qItem.id}_other"]`);
        if (otherInput && otherInput.value.trim()) {
          val = `Other: ${otherInput.value.trim()}`;
        }
      }
    }
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
  const qItem = wizardState.questions[wizardState.currentIndex];

  // Scale questions: val is an object { itemId: value, ... }
  if (qItem && qItem.type === 'scale' && typeof val === 'object' && !Array.isArray(val)) {
    Object.entries(val).forEach(([itemId, itemVal]) => {
      const radio = container.querySelector(`input[name="${itemId}"][value="${itemVal}"]`);
      if (radio) radio.checked = true;
    });
    return;
  }

  if (Array.isArray(val)) { // Checkbox
    val.forEach(v => {
      let valueToCheck = v;
      let otherText = '';

      if (v.startsWith('Other: ')) {
        valueToCheck = 'Other';
        otherText = v.substring(7);

        const otherOpt = Array.from(container.querySelectorAll('input[type="checkbox"]'))
          .find(i => i.value.toLowerCase().includes('other'));
        if (otherOpt) valueToCheck = otherOpt.value;

        const otherInput = container.querySelector(`input[name="${qId}_other"]`);
        if (otherInput) {
          otherInput.value = otherText;
          otherInput.style.display = 'block';
        }
      }

      const el = container.querySelector(`input[value="${valueToCheck}"]`);
      if (el) el.checked = true;
    });
  } else {
    let valueToCheck = val;
    let otherText = '';

    if (typeof val === 'string' && val.startsWith('Other: ')) {
      otherText = val.substring(7);
      const otherOpt = Array.from(container.querySelectorAll('input[type="radio"]'))
        .find(i => i.value.toLowerCase().includes('other'));
      if (otherOpt) valueToCheck = otherOpt.value;

      const otherInput = container.querySelector(`input[name="${qId}_other"]`);
      if (otherInput) {
        otherInput.value = otherText;
        otherInput.style.display = 'block';
      }
    }

    const radio = container.querySelector(`input[value="${valueToCheck}"]`);
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
    case 'scale-single':
      html += renderScaleSingleQuestion(q, formId);
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
  // Check if "Other" is in options
  const hasOther = q.options.some(opt => opt.toLowerCase().includes('other'));
  const skipAutoOther = q.skipAutoOther || false;
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

function renderScaleSingleQuestion(q, formId) {
  const required = q.required ? 'required' : '';

  const scaleLabels = {
    1: 'Strongly Disagree',
    2: 'Disagree',
    3: 'Neutral',
    4: 'Agree',
    5: 'Strongly Agree'
  };

  // Show progress within the scale group (e.g. "3 of 10")
  const progressText = q.parentItems ? `<span class="text-muted" style="font-size:0.8rem;">(${q.itemIndex + 1} of ${q.parentItems.length})</span>` : '';

  let html = `
    <label class="form-label ${q.required ? 'required' : ''}">${q.label} ${progressText}</label>
    <div class="tap-options">
  `;

  q.scale.forEach(val => {
    html += `
      <label class="tap-option" for="${formId}_${q.id}_${val}">
        <input type="radio" name="${q.id}" value="${val}"
               id="${formId}_${q.id}_${val}" ${required}>
        <span class="tap-btn">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:var(--bg-alt);font-weight:700;font-size:1.1rem;flex-shrink:0;">${val}</span>
          <span class="tap-label">${scaleLabels[val]}</span>
        </span>
      </label>
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

  // COLLECT & VALIDATE (WIZARD MODE)

  // 1. Ensure current step is saved
  saveCurrentStepAnswer();

  // 2. Validate all questions against wizardState
  for (let i = 0; i < wizardState.questions.length; i++) {
    const q = wizardState.questions[i];
    if (shouldHideQuestion(q)) continue; // Skip hidden logic

    const val = wizardState.answers[q.id];
    let isMissing = !val || (Array.isArray(val) && val.length === 0);

    // Scale questions: check all items are answered
    if (q.type === 'scale' && val && typeof val === 'object' && !Array.isArray(val)) {
      isMissing = q.items.some(item => !val[item.id]);
    }

    if (q.required && isMissing) {
      const qLabel = q.type === 'scale' ? (q.sectionTitle || 'Rating Scale') : q.label;
      console.warn(`Validation failed at question ${i}: ${qLabel}`);
      jumpToQuestion(i); // Auto-jump to missing question

      // Small delay to allow render, then shake/alert
      setTimeout(() => {
        const container = document.getElementById('wizardStepContainer');
        if (container) {
          container.classList.add('shake');
          setTimeout(() => container.classList.remove('shake'), 500);
        }
        alert(`⚠️ Please answer: ${qLabel}`);
      }, 100);
      return;
    }
  }

  // 3. Extract special fields for DB
  const surveyData = {};

  // Flatten scale question answers (objects) into individual keys
  for (const [key, val] of Object.entries(wizardState.answers)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      // Scale question: spread individual item answers
      Object.entries(val).forEach(([itemId, itemVal]) => {
        surveyData[itemId] = itemVal;
      });
      // Also keep group reference
      surveyData[key] = val;
    } else {
      surveyData[key] = val;
    }
  }

  // Study Site is just another field now, but we need it for the record header
  // It should be in surveyData['studySite'] if the question ID is 'studySite'
  let studySite = surveyData['studySite'] || 'UNKNOWN';

  // If studySite is "Other" or "Other: ...", resolve the actual value
  if (studySite === 'Other' && surveyData['studySiteOther']) {
    studySite = surveyData['studySiteOther'];
  } else if (studySite.startsWith('Other: ')) {
    studySite = studySite.substring(7);
  }

  if (!studySite || studySite === 'UNKNOWN') {
    // Just in case studySite logic is unique or missed
    // Use the first question as fallback if IT is studySite
    // But validation above should catch it.
  }

  // Explicitly ensure studySite is there
  surveyData.studySite = studySite;

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
      data: surveyData
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
    alert('✅ JSON export complete');
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

async function viewResponse(id) {
  try {
    if (!db.db) await db.init();
    const numId = typeof id === 'string' ? Number.parseInt(id, 10) : id;
    const survey = await db.get('surveys', numId);
    if (!survey) { alert('Record not found'); return; }
    alert(JSON.stringify(survey, null, 2));
  } catch (error) {
    console.error('View failed:', error);
    alert('❌ Could not load record');
  }
}

function _buildFileName(survey) {
  const pid = survey.participantId || survey.id;
  const site = (survey.studySite || 'unknown').replaceAll(/[^a-zA-Z0-9-]/g, '_');
  const date = new Date(survey.createdAt).toISOString().split('T')[0];
  return `${pid}_${site}_${date}.json`;
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
  if (!modal || !text) return;

  const statusContent = customStatusHtml || 'Data saved locally.';

  text.innerHTML = `
    <strong>Participant ID:</strong> ${participantId}<br>
    <strong>Site:</strong> ${studySite}<br><br>
    ${statusContent}
  `;

  modal.style.display = 'block';
}

function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
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


