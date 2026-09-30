import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface PsyResult {
  id: string;
  nom: string;
  adresse: string;
  lat: number;
  lng: number;
  telephone?: string;
  type: string;
}

@Component({
  selector: 'app-trouver-medecin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trouver-medecin.component.html',
  styleUrl: './trouver-medecin.component.css'
})
export class TrouverMedecinComponent implements OnInit {

  results: PsyResult[] = [];
  selectedResult: PsyResult | null = null;
  searchLoading = false;
  locationLoading = false;
  locationError = '';
  locationSuccess = false;
  searchQuery = 'psychiatre';
  userLat: number | null = null;
  userLng: number | null = null;
  map: any = null;
  markers: any[] = [];
  userMarker: any = null;
  searchCity = 'Tunis';

  villes = [
    'Tunis', 'Sfax', 'Sousse', 'Monastir',
    'Bizerte', 'Nabeul', 'Kairouan', 'Gabès',
    'Ariana', 'Ben Arous', 'Manouba', 'Gafsa'
  ];

  categories = [
    { label: '🧠 Psychiatres',   query: 'psychiatre' },
    { label: '💬 Psychologues',  query: 'psychologue' },
    { label: '🏥 Cliniques psy', query: 'clinique psychiatrique' },
    { label: '🏨 Hôpitaux psy', query: 'hôpital psychiatrique' },
  ];

  cityCoords: any = {
    'Tunis':    { lat: 36.8190, lng: 10.1658, zoom: 12 },
    'Sfax':     { lat: 34.7406, lng: 10.7603, zoom: 12 },
    'Sousse':   { lat: 35.8245, lng: 10.6346, zoom: 12 },
    'Monastir': { lat: 35.7720, lng: 10.8216, zoom: 13 },
    'Bizerte':  { lat: 37.2744, lng: 9.8739,  zoom: 12 },
    'Nabeul':   { lat: 36.4561, lng: 10.7376, zoom: 12 },
    'Kairouan': { lat: 35.6781, lng: 10.0963, zoom: 12 },
    'Gabès':    { lat: 33.8814, lng: 10.0982, zoom: 12 },
    'Ariana':   { lat: 36.8625, lng: 10.1956, zoom: 13 },
    'Ben Arous':{ lat: 36.7533, lng: 10.2282, zoom: 12 },
    'Manouba':  { lat: 36.8090, lng: 10.0980, zoom: 12 },
    'Gafsa':    { lat: 34.4234, lng: 8.7842,  zoom: 12 },
  };

  fallbackData: { [key: string]: PsyResult[] } = {
    'Tunis': [
      { id: 't1', nom: 'Hôpital Razi - Service Psychiatrie',
        adresse: 'Route de la Manouba, La Manouba, Tunis',
        lat: 36.8120, lng: 10.0980, telephone: '71600700', type: 'hospital' },
      { id: 't2', nom: 'Hôpital Psychiatrique de Tunis',
        adresse: 'Rue Khereddine Pacha, Tunis',
        lat: 36.8380, lng: 10.1560, telephone: '71560244', type: 'hospital' },
      { id: 't3', nom: 'Clinique Les Jasmins - Psychiatrie',
        adresse: 'Avenue de la Liberté, Tunis',
        lat: 36.8200, lng: 10.1700, telephone: '71288000', type: 'clinic' },
    ],
    'Sfax': [
      { id: 's1', nom: 'Hôpital Psychiatrique de Sfax',
        adresse: 'Route de Tunis Km 0.5, Sfax',
        lat: 34.7478, lng: 10.7661, telephone: '74241233', type: 'hospital' },
      { id: 's2', nom: 'CHU Hédi Chaker - Service Psychiatrie',
        adresse: "Avenue de l'Ain, Sfax",
        lat: 34.7500, lng: 10.7580, telephone: '74243311', type: 'hospital' },
    ],
    'Sousse': [
      { id: 'so1', nom: 'CHU Farhat Hached - Psychiatrie',
        adresse: 'Avenue Ibn El Jazzar, Sousse',
        lat: 35.8288, lng: 10.6405, telephone: '73221411', type: 'hospital' },
      { id: 'so2', nom: 'Centre de Santé Mentale Sousse',
        adresse: 'Avenue Habib Bourguiba, Sousse',
        lat: 35.8260, lng: 10.6370, telephone: '73220000', type: 'clinic' },
    ],
    'Monastir': [
      { id: 'm1', nom: 'Hôpital Fattouma Bourguiba - Psychiatrie',
        adresse: 'Avenue Farhat Hached, Monastir',
        lat: 35.7720, lng: 10.8216, telephone: '73460144', type: 'hospital' },
    ],
    'Bizerte': [
      { id: 'b1', nom: 'Hôpital Psychiatrique de Bizerte',
        adresse: 'Avenue Habib Bourguiba, Bizerte',
        lat: 37.2744, lng: 9.8739, telephone: '72431000', type: 'hospital' },
    ],
    'Nabeul': [
      { id: 'n1', nom: 'Cabinet Psychiatrique Nabeul',
        adresse: 'Avenue Habib Bourguiba, Nabeul',
        lat: 36.4561, lng: 10.7376, telephone: '72285000', type: 'psychiatrist' },
    ],
    'Kairouan': [
      { id: 'k1', nom: 'Hôpital Ibn El Jazzar - Psychiatrie',
        adresse: 'Avenue de la République, Kairouan',
        lat: 35.6781, lng: 10.0963, telephone: '77221011', type: 'hospital' },
    ],
    'Gabès': [
      { id: 'g1', nom: 'Hôpital Régional de Gabès - Psychiatrie',
        adresse: 'Avenue Farhat Hached, Gabès',
        lat: 33.8814, lng: 10.0982, telephone: '75270555', type: 'hospital' },
    ],
    'Ariana': [
      { id: 'a1', nom: 'Centre de Santé Mentale Ariana',
        adresse: 'Avenue de la Banlieue Nord, Ariana',
        lat: 36.8625, lng: 10.1956, telephone: '71702000', type: 'clinic' },
    ],
    'Ben Arous': [
      { id: 'ba1', nom: 'Hôpital Ben Arous - Psychiatrie',
        adresse: 'Avenue de la République, Ben Arous',
        lat: 36.7533, lng: 10.2282, telephone: '71380000', type: 'hospital' },
    ],
    'Manouba': [
      { id: 'ma1', nom: 'Hôpital Razi Manouba - Psychiatrie',
        adresse: 'Route de la Manouba, Manouba',
        lat: 36.8090, lng: 10.0980, telephone: '71600700', type: 'hospital' },
    ],
    'Gafsa': [
      { id: 'ga1', nom: 'Hôpital Régional de Gafsa - Psychiatrie',
        adresse: 'Avenue Habib Bourguiba, Gafsa',
        lat: 34.4234, lng: 8.7842, telephone: '76224000', type: 'hospital' },
    ],
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.initMap();
      this.searchByCity();
    }, 400);
  }

  initMap(): void {
    if (typeof (window as any).L === 'undefined') return;
    const L = (window as any).L;
    this.map = L.map('map').setView([36.8190, 10.1658], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);
  }

  searchByCity(): void {
    this.searchLoading = true;
    this.results = [];
    this.selectedResult = null;
    this.clearMarkers();

    const city = this.searchCity || 'Tunis';
    const coords = this.cityCoords[city] || this.cityCoords['Tunis'];

    // Centrer la carte sur la ville
    if (this.map) {
      this.map.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 1.5 });
    }

    
    const radius = 30000;
    const overpassQuery = `
      [out:json][timeout:30];
      (
        node["healthcare"="psychiatrist"](around:${radius},${coords.lat},${coords.lng});
        node["healthcare"="psychologist"](around:${radius},${coords.lat},${coords.lng});
        node["healthcare"="mental_health"](around:${radius},${coords.lat},${coords.lng});
        node["amenity"="hospital"]["name"~"[Pp]sychiatr|[Pp]sycholog|[Rr]azi|[Mm]ental",i](around:${radius},${coords.lat},${coords.lng});
        node["amenity"="clinic"]["name"~"[Pp]sychiatr|[Pp]sycholog|[Mm]ental",i](around:${radius},${coords.lat},${coords.lng});
        node["name"~"[Pp]sychiatr|[Pp]sycholog|[Mm]ental|[Rr]azi",i](around:${radius},${coords.lat},${coords.lng});
        way["name"~"[Pp]sychiatr|[Pp]sycholog|[Mm]ental|[Rr]azi",i](around:${radius},${coords.lat},${coords.lng});
      );
      out center body;
    `;

    this.http.post<any>(
      'https://overpass-api.de/api/interpreter',
      overpassQuery,
      { responseType: 'json' as any }
    ).subscribe({
      next: (data: any) => {
        const elements = data.elements || [];
        const found = elements
          .filter((e: any) => (e.lat && e.lon) || (e.center?.lat && e.center?.lon))
          .map((e: any) => ({
            id: e.id?.toString(),
            nom: e.tags?.name || e.tags?.['name:fr'] ||
                 e.tags?.['name:ar'] || 'Cabinet Psychiatrique',
            adresse: this.buildAddress(e.tags, city),
            lat: e.lat || e.center?.lat,
            lng: e.lon || e.center?.lon,
            telephone: e.tags?.phone || e.tags?.['contact:phone'] || '',
            type: this.getType(e.tags)
          }));

        if (found.length > 0) {
          this.results = found;
          this.searchLoading = false;
          this.addMarkers();
        } else {
          this.useFallback(city, coords);
        }
      },
      error: () => this.useFallback(city, coords)
    });
  }

  useFallback(city: string, coords: any): void {
    this.results = this.fallbackData[city] || this.fallbackData['Tunis'];
    this.searchLoading = false;
    this.addMarkers();
    if (this.map) {
      this.map.flyTo([coords.lat, coords.lng], coords.zoom || 12, { duration: 1 });
    }
  }

  reloadData(): void {
    this.searchByCity();
  }

  buildAddress(tags: any, city: string): string {
    if (!tags) return city + ', Tunisie';
    const parts = [
      tags['addr:housenumber'],
      tags['addr:street'],
      tags['addr:city'] || tags['addr:town'] || city,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : city + ', Tunisie';
  }

  getType(tags: any): string {
    if (!tags) return 'medical';
    if (tags.healthcare === 'psychiatrist')  return 'psychiatrist';
    if (tags.healthcare === 'psychologist')  return 'psychologist';
    if (tags.amenity === 'hospital')         return 'hospital';
    if (tags.amenity === 'clinic')           return 'clinic';
    return 'medical';
  }

  addMarkers(): void {
    if (!this.map) return;
    const L = (window as any).L;
    this.clearMarkers();

    this.results.forEach((r, i) => {
      const icon = L.divIcon({
        className: '',
        html: `<div class="map-marker-psy">
                 <span class="marker-num">${i + 1}</span>
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });

      const marker = L.marker([r.lat, r.lng], { icon })
        .addTo(this.map)
        .bindPopup(`
          <div style="min-width:200px;font-family:Inter,sans-serif;padding:4px;">
            <div style="font-weight:800;color:#0f1c42;font-size:0.9rem;margin-bottom:4px;">
              🧠 ${r.nom}
            </div>
            <div style="font-size:0.75rem;color:#6b7280;margin-bottom:4px;">
              📍 ${r.adresse}
            </div>
            ${r.telephone ? `
            <div style="font-size:0.75rem;color:#059669;margin-bottom:4px;">
              📞 ${r.telephone}
            </div>` : ''}
            <div style="margin-top:8px;">
              <span style="background:#ede9fe;color:#7c3aed;padding:2px 8px;
                border-radius:10px;font-size:0.7rem;font-weight:700;">
                ${this.getTypeLabel(r.type)}
              </span>
            </div>
          </div>
        `);

      marker.on('click', () => this.selectResult(r));
      this.markers.push(marker);
    });

    if (this.markers.length > 0) {
      const group = (window as any).L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.3));
    }
  }

  clearMarkers(): void {
    this.markers.forEach(m => m.remove());
    this.markers = [];
  }

  selectResult(r: PsyResult): void {
    this.selectedResult = r;
    if (this.map) {
      this.map.flyTo([r.lat, r.lng], 15, { duration: 1 });
      const idx = this.results.findIndex(x => x.id === r.id);
      if (idx !== -1 && this.markers[idx]) {
        this.markers[idx].openPopup();
      }
    }
  }

  getMyLocation(): void {
    this.locationLoading = true;
    this.locationError = '';
    this.locationSuccess = false;

    if (!navigator.geolocation) {
      this.locationError = 'Géolocalisation non supportée';
      this.locationLoading = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLat = pos.coords.latitude;
        this.userLng = pos.coords.longitude;
        this.locationLoading = false;
        this.locationSuccess = true;

        if (this.map) {
          const L = (window as any).L;
          if (this.userMarker) this.userMarker.remove();

          const userIcon = L.divIcon({
            className: '',
            html: `<div class="map-marker-user">
                     <i class="bi bi-person-fill"></i>
                   </div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
          });

          this.userMarker = L.marker(
            [this.userLat!, this.userLng!],
            { icon: userIcon }
          ).addTo(this.map)
           .bindPopup('<b>📍 Votre position</b>')
           .openPopup();

          this.map.flyTo([this.userLat!, this.userLng!], 12);
        }

        this.findNearestCity();
      },
      () => {
        this.locationError = 'Impossible d\'obtenir votre position';
        this.locationLoading = false;
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  findNearestCity(): void {
    let nearestCity = 'Tunis';
    let minDist = Infinity;

    Object.entries(this.cityCoords).forEach(([city, coords]: any) => {
      const dist = this.calcDistance(
        this.userLat!, this.userLng!,
        coords.lat, coords.lng
      );
      if (dist < minDist) {
        minDist = dist;
        nearestCity = city;
      }
    });

    this.searchCity = nearestCity;
    this.searchByCity();
  }

  calcDistance(lat1: number, lng1: number,
               lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) ** 2 +
      Math.cos(lat1 * Math.PI/180) *
      Math.cos(lat2 * Math.PI/180) *
      Math.sin(dLng/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  getDistance(r: PsyResult): string {
    if (!this.userLat || !this.userLng) return '';
    const d = this.calcDistance(
      this.userLat, this.userLng, r.lat, r.lng
    );
    return d < 1 ? `${(d*1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
  }

  getTypeLabel(type: string): string {
    const map: any = {
      'hospital':     '🏥 Hôpital',
      'clinic':       '🏨 Clinique',
      'psychiatrist': '🧠 Psychiatre',
      'psychologist': '💬 Psychologue',
      'medical':      '⚕️ Médical'
    };
    return map[type] || '🧠 Psy';
  }
}