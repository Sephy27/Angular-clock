import {
  Component,
  computed,
  inject
} from '@angular/core';

import { AnalogClock } from './components/analog-clock/analog-clock';
import { CitySelector } from './components/city-selector/city-selector';
import { DigitalClock } from './components/digital-clock/digital-clock';
import { FullscreenButton } from './components/fullscreen-button/fullscreen-button';
import { ClockService } from './services/clock';

@Component({
  selector: 'app-root',
  imports: [
    DigitalClock,
    AnalogClock,
    CitySelector,
    FullscreenButton
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  clock = inject(ClockService);

  periodeJournee = computed(() => {
    const parties = new Intl.DateTimeFormat('fr-FR', {
      timeZone: this.clock.villeSelectionnee().fuseau,
      hour: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(this.clock.maintenant());

    const heure = Number(
      parties.find(partie => partie.type === 'hour')
        ?.value ?? 0
    );

    if (heure >= 6 && heure < 12) {
      return 'matin';
    }

    if (heure >= 12 && heure < 18) {
      return 'jour';
    }

    if (heure >= 18 && heure < 22) {
      return 'soir';
    }

    return 'nuit';
  });
}