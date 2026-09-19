import {
  computed,
  DestroyRef,
  Injectable,
  inject,
  signal
} from '@angular/core';

import { Ville } from '../models/villes';

@Injectable({
  providedIn: 'root'
})
export class ClockService {
  maintenant = signal(new Date());

  villeLocale = signal<Ville>({
    id: 'local',
    nom: 'Ma position',
    pays: '',
    fuseau: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  private villesFixes: Ville[] = [
    {
      id: 'londres',
      nom: 'Londres',
      pays: 'Royaume-Uni',
      fuseau: 'Europe/London'
    },
    {
      id: 'new-york',
      nom: 'New York',
      pays: 'États-Unis',
      fuseau: 'America/New_York'
    },
    {
      id: 'tokyo',
      nom: 'Tokyo',
      pays: 'Japon',
      fuseau: 'Asia/Tokyo'
    },
    {
      id: 'dubai',
      nom: 'Dubaï',
      pays: 'Émirats arabes unis',
      fuseau: 'Asia/Dubai'
    },
    {
      id: 'sydney',
      nom: 'Sydney',
      pays: 'Australie',
      fuseau: 'Australia/Sydney'
    }
  ];

  villes = computed(() => [
    this.villeLocale(),
    ...this.villesFixes
  ]);

  villeSelectionneeId = signal(
    localStorage.getItem('clock-city') ?? 'local'
  );

  villeSelectionnee = computed(() => {
    return (
      this.villes().find(
        ville => ville.id === this.villeSelectionneeId()
      ) ?? this.villeLocale()
    );
  });

  private destroyRef = inject(DestroyRef);

  constructor() {
    const timer = setInterval(() => {
      this.maintenant.set(new Date());
    }, 1000);

    this.destroyRef.onDestroy(() => {
      clearInterval(timer);
    });
  }

  selectionnerVille(id: string): void {
    const villeExiste = this.villes().some(
      ville => ville.id === id
    );

    if (!villeExiste) {
      return;
    }

    this.villeSelectionneeId.set(id);
    localStorage.setItem('clock-city', id);
  }

  mettreAJourVilleLocale(nom: string, pays: string): void {
    this.villeLocale.update(ville => ({
      ...ville,
      nom,
      pays
    }));
  }
}