/* ============================================
   UHAS-HPI Dashboard Module
   Display participant groups and stats
   ============================================ */

console.log('🔷 dashboard.js: Script loading started');

class Dashboard {
  static async render() {
    try {
      if (!db.db) {
        await db.init();
      }

      const surveys = await db.getAll('surveys');

      let html = `
        <div class="dashboard-container">
          <div class="section-header">
            <h5>Questionnaires</h5>
            <small>Select a group to fill out a questionnaire</small>
          </div>

          <!-- Participant Group Cards -->
          <div class="dashboard-groups">
            <h6 style="margin: var(--space-md) 0 var(--space-sm) 0;">Participant Questionnaires</h6>
      `;

      for (const group of CONFIG.participantGroups) {
        const questionnaireId = this._getQuestionnaireId(group.type);
        html += `
          <div class="participant-card" onclick="openQuestionnaire('${questionnaireId}')" style="border-left: 4px solid ${group.color}; cursor: pointer;">
            <div class="participant-card-header">
              <i class="bi ${group.icon}" style="color: ${group.color}; font-size: 1.5rem;"></i>
              <div>
                <div class="participant-card-title">${group.label}</div>
                <div class="participant-card-count">Tap to fill form</div>
              </div>
            </div>
            <div class="participant-card-arrow">
              <i class="bi bi-chevron-right"></i>
            </div>
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;

      return html;
    } catch (error) {
      console.error('❌ Dashboard render failed:', error);
      return `<div class="card"><p>❌ Failed to load dashboard</p></div>`;
    }
  }

  /**
   * Map participant type to questionnaire ID
   */
  static _getQuestionnaireId(type) {
    const typeMap = {
      'patient': 'patients',
      'clinician': 'clinicians',
      'herbalist': 'herbalists',
      'caregiver': 'caregivers',
      'policymaker': 'policymakers',
      'researcher': 'researchers'
    };
    return typeMap[type] || type;
  }

  /**
   * Calculate dashboard statistics
   */
  static _calculateStats(surveys) {
    const stats = {
      byType: {},
      sites: new Set(),
      uniqueParticipants: new Set()
    };

    surveys.forEach(survey => {
      // Count by type
      stats.byType[survey.type] = (stats.byType[survey.type] || 0) + 1;

      // Unique sites
      if (survey.studySite) {
        stats.sites.add(survey.studySite);
      }

      // Unique participants
      if (survey.participantId) {
        stats.uniqueParticipants.add(survey.participantId);
      }
    });

    return {
      byType: stats.byType,
      sites: stats.sites.size,
      uniqueParticipants: stats.uniqueParticipants.size
    };
  }

  /**
   * Render participant group detail view
   */
  static async renderGroupDetail(type) {
    try {
      if (!db.db) {
        await db.init();
      }

      const surveys = await db.getByIndex('surveys', 'type', type);
      const group = CONFIG.participantGroups.find(g => g.type === type);

      let html = `
        <div>
          <div class="section-header d-flex align-items-center gap-2" style="margin-bottom: var(--space-md);">
            <button class="btn btn-sm btn-outline" onclick="showDashboard()">
              <i class="bi bi-arrow-left"></i> Back
            </button>
            <div>
              <h5><i class="bi ${group.icon}" style="color: ${group.color};"></i> ${group.label}</h5>
              <small>${surveys.length} response${surveys.length === 1 ? '' : 's'}</small>
            </div>
          </div>

          <div class="responses-list">
      `;

      if (surveys.length === 0) {
        html += '<p style="text-align: center; padding: var(--space-md);">No responses for this group</p>';
      } else {
        surveys.forEach(survey => {
          const date = new Date(survey.createdAt).toLocaleDateString();
          html += `
            <div class="response-item" onclick="viewResponse('${survey.id}')">
              <div>
                <div style="font-weight: 500;">${survey.participantId}</div>
                <div style="font-size: 0.875rem; color: var(--color-text-muted);">${survey.studySite} • ${date}</div>
              </div>
              <i class="bi bi-chevron-right"></i>
            </div>
          `;
        });
      }

      html += `
          </div>
        </div>
      `;

      return html;
    } catch (error) {
      console.error('❌ Group detail render failed:', error);
      return `<div class="card"><p>❌ Failed to load group details</p></div>`;
    }
  }
}

// Make available globally
globalThis.Dashboard = Dashboard;

console.log('✅ dashboard.js: globalThis.Dashboard assigned', globalThis.Dashboard);
