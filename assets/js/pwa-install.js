/* ============================================
   UHAS-HPI PWA Install Handler
   iOS and Android app install prompts
   ============================================ */

class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.init();
  }

  init() {
    // Check if app is already installed
    if (globalThis.navigator.standalone === true) {
      this.isInstalled = true;
      return;
    }

    // Listen for beforeinstallprompt event (Android)
    globalThis.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showAndroidPrompt();
    });

    // Check for iOS
    if (this.isIOS()) {
      this.showIOSPrompt();
    }

    // Handle successful installation
    globalThis.addEventListener('appinstalled', () => {
      console.log('✅ App installed successfully');
      this.isInstalled = true;
      this.hidePrompt();
    });
  }

  /**
   * Check if device is iOS
   */
  isIOS() {
    return /iPad|iPhone|iPod/.test(globalThis.navigator.userAgent) && !globalThis.MSStream;
  }

  /**
   * Check if app is already in home screen (iOS/Android)
   */
  isAlreadyInstalled() {
    return (
      globalThis.navigator.standalone === true ||
      globalThis.matchMedia('(display-mode: standalone)').matches ||
      globalThis.matchMedia('(display-mode: fullscreen)').matches
    );
  }

  /**
   * Show Android install prompt
   */
  showAndroidPrompt() {
    if (this.isAlreadyInstalled()) return;

    const promptDiv = document.getElementById('appInstallPrompt');
    const installBtn = document.getElementById('installAppBtn');

    if (promptDiv && installBtn) {
      promptDiv.style.display = 'flex';
      installBtn.innerHTML = '📲 Install App';
      installBtn.onclick = () => this.installApp();
    }
  }

  /**
   * Show iOS install guide (custom modal)
   */
  showIOSPrompt() {
    if (this.isAlreadyInstalled()) return;

    const hasSeeniOSGuide = localStorage.getItem('ios-install-guide-shown');
    if (!hasSeeniOSGuide) {
      setTimeout(() => {
        const modal = document.getElementById('iosInstallModal');
        if (modal) {
          modal.style.display = 'block';
          const closeBtn = document.getElementById('closeIOSModalBtn');
          if (closeBtn) {
            closeBtn.onclick = () => {
              modal.style.display = 'none';
              localStorage.setItem('ios-install-guide-shown', 'true');
            };
          }
        }
      }, 2000);
    }
  }

  /**
   * Trigger Android app install
   */
  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted install prompt');
      } else {
        console.log('⚠️ User dismissed install prompt');
      }
      
      this.deferredPrompt = null;
      this.hidePrompt();
    }
  }

  /**
   * Hide install prompt
   */
  hidePrompt() {
    const promptDiv = document.getElementById('appInstallPrompt');
    if (promptDiv) {
      promptDiv.style.display = 'none';
    }
  }
}

// Initialize on load
window.addEventListener('load', () => {
  globalThis.pwaInstaller = new PWAInstaller();
});
