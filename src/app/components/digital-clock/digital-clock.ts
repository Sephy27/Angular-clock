import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { ClockService } from '../../services/clock';
import { LocationService } from '../../services/location';

@Component({
  selector: 'app-digital-clock',
  imports: [],
  templateUrl: './digital-clock.html',
  styleUrl: './digital-clock.css'
})
export class DigitalClock {
  clock = inject(ClockService);
  locationService = inject(LocationService);

  format24h = signal(
    localStorage.getItem('clock-format') !== '12'
  );

  localisationEnCours = signal(false);
  positionDetectee = signal(false);
  erreurLocalisation = signal('');

  heureFormatee = computed(() => {
    const date = this.clock.maintenant();
    const fuseau = this.clock.villeSelectionnee().fuseau;

    const parties = new Intl.DateTimeFormat('fr-FR', {
      timeZone: fuseau,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: !this.format24h()
    }).formatToParts(date);

    const obtenirPartie = (type: string): string => {
      return (
        parties.find(partie => partie.type === type)?.value ?? ''
      );
    };

    return {
      heures: obtenirPartie('hour'),
      minutes: obtenirPartie('minute'),
      secondes: obtenirPartie('second'),
      periode: obtenirPartie('dayPeriod').toUpperCase()
    };
  });

  nomVille = computed(() => {
    const ville = this.clock.villeSelectionnee();

    return ville.pays
      ? `${ville.nom}, ${ville.pays}`
      : ville.nom;
  });

  dateFormatee = computed(() => {
    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: this.clock.villeSelectionnee().fuseau,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(this.clock.maintenant());
  });

  fuseauHoraire = computed(() => {
    return this.clock
      .villeSelectionnee()
      .fuseau
      .replace('/', ' / ')
      .replace(/_/g, ' ');
  });

  decalageUtc = computed(() => {
    const parties = new Intl.DateTimeFormat('fr-FR', {
      timeZone: this.clock.villeSelectionnee().fuseau,
      timeZoneName: 'shortOffset'
    }).formatToParts(this.clock.maintenant());

    return (
      parties.find(partie => partie.type === 'timeZoneName')
        ?.value ?? ''
    );
  });

  changerFormat(format24h: boolean): void {
    this.format24h.set(format24h);

    localStorage.setItem(
      'clock-format',
      format24h ? '24' : '12'
    );
  }

  async detecterVille(): Promise<void> {
    this.localisationEnCours.set(true);
    this.erreurLocalisation.set('');

    try {
      const lieu = await this.locationService.detecterLieu();

      this.clock.mettreAJourVilleLocale(
        lieu.ville,
        lieu.pays
      );

      this.clock.selectionnerVille('local');
      this.positionDetectee.set(true);
    } catch (erreur) {
      console.error(erreur);

      this.erreurLocalisation.set(
        'Localisation impossible. Vérifie l’autorisation du navigateur.'
      );
    } finally {
      this.localisationEnCours.set(false);
    }
  }
  jourRelatif = computed(() => {
    const date = this.clock.maintenant();

    const jourLocal = this.obtenirJourDansFuseau(
      date,
      this.clock.villeLocale().fuseau
    );

    const jourSelectionne = this.obtenirJourDansFuseau(
      date,
      this.clock.villeSelectionnee().fuseau
    );

    const difference =
      Math.round(
        (jourSelectionne - jourLocal) / 86_400_000
      );

    if (difference === -1) {
      return 'Hier';
    }

    if (difference === 1) {
      return 'Demain';
    }

    return "Aujourd’hui";
  });

  ecartHeureLocale = computed(() => {
    const date = this.clock.maintenant();

    const offsetLocal = this.obtenirOffset(
      date,
      this.clock.villeLocale().fuseau
    );

    const offsetSelectionne = this.obtenirOffset(
      date,
      this.clock.villeSelectionnee().fuseau
    );

    const difference = offsetSelectionne - offsetLocal;

    if (difference === 0) {
      return 'Heure locale';
    }

    const signe = difference > 0 ? '+' : '-';
    const valeurAbsolue = Math.abs(difference);
    const heures = Math.floor(valeurAbsolue / 60);
    const minutes = valeurAbsolue % 60;

    const parties = [
      heures > 0 ? `${heures} h` : '',
      minutes > 0 ? `${minutes} min` : ''
    ].filter(Boolean);

    return `${signe}${parties.join(' ')} par rapport à vous`;
  });
  private obtenirJourDansFuseau(
    date: Date,
    fuseau: string
  ): number {
    const parties = this.obtenirPartiesDate(date, fuseau);

    return Date.UTC(
      parties.annee,
      parties.mois - 1,
      parties.jour
    );
  }

  private obtenirOffset(
    date: Date,
    fuseau: string
  ): number {
    const parties = this.obtenirPartiesDate(date, fuseau);

    const dateCommeUtc = Date.UTC(
      parties.annee,
      parties.mois - 1,
      parties.jour,
      parties.heures,
      parties.minutes,
      parties.secondes
    );

    return Math.round(
      (dateCommeUtc - date.getTime()) / 60_000
    );
  }

  private obtenirPartiesDate(
    date: Date,
    fuseau: string
  ) {
    const parties = new Intl.DateTimeFormat('fr-FR', {
      timeZone: fuseau,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date);

    const obtenirNombre = (type: string): number => {
      return Number(
        parties.find(partie => partie.type === type)?.value ?? 0
      );
    };

    return {
      annee: obtenirNombre('year'),
      mois: obtenirNombre('month'),
      jour: obtenirNombre('day'),
      heures: obtenirNombre('hour'),
      minutes: obtenirNombre('minute'),
      secondes: obtenirNombre('second')
    };
  }
}