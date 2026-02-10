/* ============================================
   UHAS-HPI Offline Status Handler
   Manages online/offline status UI
   ============================================ */

class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateStatusUI();
      console.log('📶 Back online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateStatusUI();
      console.log('📴 Gone offline');
    });
  }

  updateStatusUI() {
    const statusElements = document.querySelectorAll('[data-sync-status]');
    statusElements.forEach(el => {
      if (this.isOnline) {
        el.classList.remove('status-offline');
        el.classList.add('status-online');
        el.innerHTML = '<span class="status-dot"></span> Online';
      } else {
        el.classList.remove('status-online');
        el.classList.add('status-offline');
        el.innerHTML = '<span class="status-dot"></span> Offline';
      }
    });
  }
}

// Create global instance
const offlineManager = new OfflineManager();
