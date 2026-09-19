import { Component, computed, inject } from '@angular/core';
import { ClockService } from '../../services/clock';

@Component({
  selector: 'app-analog-clock',
  imports: [],
  templateUrl: './analog-clock.html',
  styleUrl: './analog-clock.css'
})
export class AnalogClock {
  clock = inject(ClockService);

  nombres = Array.from({ length: 12 }, (_, index) => ({
    valeur: index + 1,
    angle: (index + 1) * 30
  }));

  heureDuFuseau = computed(() => {
    const parties = new Intl.DateTimeFormat('fr-FR', {
      timeZone: this.clock.villeSelectionnee().fuseau,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(this.clock.maintenant());

    const obtenirNombre = (type: string): number => {
      const valeur =
        parties.find(partie => partie.type === type)?.value;

      return Number(valeur ?? 0);
    };

    return {
      heures: obtenirNombre('hour'),
      minutes: obtenirNombre('minute'),
      secondes: obtenirNombre('second')
    };
  });

  angleHeures = computed(() => {
    const heure = this.heureDuFuseau();

    return (
      (heure.heures % 12) * 30 +
      heure.minutes * 0.5 +
      heure.secondes / 120
    );
  });

  angleMinutes = computed(() => {
    const heure = this.heureDuFuseau();

    return (
      heure.minutes * 6 +
      heure.secondes * 0.1
    );
  });

  angleSecondes = computed(() => {
    return this.heureDuFuseau().secondes * 6;
  });
}
