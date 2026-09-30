import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RendezVous } from '../models/rendezvous.model';

@Injectable({ providedIn: 'root' })
export class RendezVousService {

  private apiUrl = 'http://localhost:3000/api/rendezvous';

  constructor(private http: HttpClient) {}

  getAll(filters?: any): Observable<RendezVous[]> {
    let params = '';
    if (filters) {
      const query = Object.entries(filters)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      if (query) params = `?${query}`;
    }
    return this.http.get<RendezVous[]>(`${this.apiUrl}${params}`);
  }

  getById(id: string): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${this.apiUrl}/${id}`);
  }

  getByPatient(patientId: string): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  create(rdv: RendezVous): Observable<RendezVous> {
    return this.http.post<RendezVous>(this.apiUrl, rdv);
  }

  update(id: string, rdv: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, rdv);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}