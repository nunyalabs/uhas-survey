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
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      return;
    }

    // Listen for beforeinstallprompt event (Android)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showAndroidPrompt();
    });

    // Check for iOS
    if (this.isIOS()) {
      this.showIOSPrompt();
    }

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ App installed successfully');
      this.isInstalled = true;
      this.hidePrompt();
    });
  }

  /**
   * Check if device is iOS
   */
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  /**
   * Check if app is already in home screen (iOS/Android)
   */
  isAlreadyInstalled() {
    return (
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches
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
   * Show iOS install guide
   */
  showIOSPrompt() {
    if (this.isAlreadyInstalled()) return;

    // Show one-time guide for iOS
    const hasSeeniOSGuide = localStorage.getItem('ios-install-guide-shown');
    if (!hasSeeniOSGuide) {
      setTimeout(() => {
        alert(
          '📱 Add to Home Screen\n\n' +
          'To use this app offline:\n\n' +
          '1. Tap the Share button (box with arrow)\n' +
          '2. Scroll and tap "Add to Home Screen"\n' +
          '3. Tap "Add" to confirm\n\n' +
          'The app will then work offline!'
        );
        localStorage.setItem('ios-install-guide-shown', 'true');
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
  new PWAInstaller();
});
