import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Install {
  deferredPrompt: any = null;
  canInstall = signal(false);

  constructor() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.canInstall.set(true);
    });
  }

  showInstallPrompt() {
    if (!this.deferredPrompt) {
      return;
    }

    this.deferredPrompt.prompt();

    this.deferredPrompt.userChoice.then((choiceResult:any) => {
      if (choiceResult.outcome === 'accepted') {
        this.deferredPrompt = null;
        this.canInstall.set(false)
          ;
      }
    });
  }
}