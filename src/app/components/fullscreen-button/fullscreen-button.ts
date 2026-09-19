import {
  Component,
  HostListener,
  signal
} from '@angular/core';

@Component({
  selector: 'app-fullscreen-button',
  imports: [],
  templateUrl: './fullscreen-button.html',
  styleUrl: './fullscreen-button.css'
})
export class FullscreenButton {
  pleinEcran = signal(
    Boolean(document.fullscreenElement)
  );

  disponible = document.fullscreenEnabled;

  async basculerPleinEcran(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen({
          navigationUI: 'hide'
        });
      }
    } catch (erreur) {
      console.error(
        'Impossible de modifier le plein écran :',
        erreur
      );
    }
  }

  @HostListener('document:fullscreenchange')
  mettreAJourEtat(): void {
    this.pleinEcran.set(
      Boolean(document.fullscreenElement)
    );
  }
}
