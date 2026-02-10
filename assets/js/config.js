/* ============================================
   UHAS-HPI Unified Configuration
   Offline-first with IndexedDB storage
   ============================================ */

const CONFIG = {
  // App Info
  app: {
    name: 'UHAS-HPI Hypertension Study',
    shortName: 'UHAS-HPI',
    version: '2.0.0',
    description: 'Offline-first Hypertension Research Platform'
  },

  // IndexedDB Configuration
  db: {
    name: 'uhas-hpi-db',
    version: 2,
    stores: {
      participants: 'participants',
      surveys: 'surveys',
      toolkit: 'toolkit',
      exports: 'exports'
    }
  },

  // Participant ID Prefixes (matching Toolkit A system)
  participantPrefixes: {
    patient: 'PAT',
    clinician: 'CLN',
    herbalist: 'HRB',
    caregiver: 'CG',
    policymaker: 'POL',
    researcher: 'RES'
  },

  // Participant groups for dashboard
  participantGroups: [
    { type: 'patient', label: 'Patients', icon: 'bi-person-heart', color: '#e74c3c' },
    { type: 'clinician', label: 'Clinicians', icon: 'bi-capsule', color: '#3498db' },
    { type: 'herbalist', label: 'Herbalists', icon: 'bi-leaf', color: '#27ae60' },
    { type: 'caregiver', label: 'Caregivers', icon: 'bi-hand-thumbs-up', color: '#f39c12' },
    { type: 'policymaker', label: 'Policymakers', icon: 'bi-briefcase', color: '#9b59b6' },
    { type: 'researcher', label: 'Researchers', icon: 'bi-flask', color: '#1abc9c' }
  ]
};

// Make available globally
window.CONFIG = CONFIG;
