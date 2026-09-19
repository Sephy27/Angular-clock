import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Lieu {
  ville: string;
  pays: string;
}

interface ReponseNominatim {
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    country?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private http = inject(HttpClient);

  async detecterLieu(): Promise<Lieu> {
    const position = await this.obtenirPosition();

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const cacheKey =
      `clock-location-${latitude.toFixed(2)}-${longitude.toFixed(2)}`;

    const cache = localStorage.getItem(cacheKey);

    if (cache) {
      return JSON.parse(cache) as Lieu;
    }

    const params = new HttpParams()
      .set('lat', latitude.toString())
      .set('lon', longitude.toString())
      .set('format', 'jsonv2')
      .set('addressdetails', '1')
      .set('accept-language', 'fr')
      .set('layer', 'address');

    const reponse = await firstValueFrom(
      this.http.get<ReponseNominatim>(
        'https://nominatim.openstreetmap.org/reverse',
        { params }
      )
    );

    const adresse = reponse.address;

    const lieu: Lieu = {
      ville:
        adresse.city ??
        adresse.town ??
        adresse.village ??
        adresse.municipality ??
        adresse.county ??
        'Lieu inconnu',

      pays: adresse.country ?? ''
    };

    localStorage.setItem(cacheKey, JSON.stringify(lieu));

    return lieu;
  }

  private obtenirPosition(): Promise<GeolocationPosition> {
    if (!navigator.geolocation) {
      return Promise.reject(
        new Error('La géolocalisation est indisponible.')
      );
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 300_000
        }
      );
    });
  }
}
