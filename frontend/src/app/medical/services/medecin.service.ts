import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medecin } from '../models/medecin.model';

@Injectable({ providedIn: 'root' })
export class MedecinService {

  private apiUrl     = 'http://localhost:3000/api/medecins';
  private authApiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  // Tous les médecins (pour secrétaire)
  getAll(): Observable<Medecin[]> {
    return this.http.get<Medecin[]>(this.apiUrl);
  }

  getMedecinsEnregistres(): Observable<Medecin[]> {
  return new Observable(observer => {
    this.http.get<any[]>('http://localhost:3000/api/auth/users').subscribe({
      next: (users) => {
        const medecinUsers = users.filter(u =>
          u.role === 'medecin' && u.medecinId
        );

        const medecinIds = medecinUsers.map(u =>
          typeof u.medecinId === 'object'
            ? u.medecinId._id || u.medecinId.id
            : u.medecinId
        ).filter(Boolean);

        if (medecinIds.length === 0) {
          observer.next([]);
          observer.complete();
          return;
        }

        this.http.get<Medecin[]>(this.apiUrl).subscribe({
          next: (medecins) => {
            const filtered = medecins.filter(m =>
              medecinIds.includes(m.id)
            );
            // Ajouter le nom d'affichage depuis le compte user
            const enriched = filtered.map(m => {
              const userAccount = medecinUsers.find(u => {
                const uid = typeof u.medecinId === 'object'
                  ? u.medecinId._id || u.medecinId.id
                  : u.medecinId;
                return uid === m.id;
              });
              return {
                ...m,
                displayNom: userAccount?.nom || m.nom,
                displayPrenom: userAccount?.prenom || m.prenom
              };
            });
            observer.next(enriched as Medecin[]);
            observer.complete();
          },
          error: (err) => observer.error(err)
        });
      },
      error: (err) => observer.error(err)
    });
  });
}

  getById(id: string): Observable<Medecin> {
    return this.http.get<Medecin>(`${this.apiUrl}/${id}`);
  }

  create(medecin: Medecin): Observable<Medecin> {
    return this.http.post<Medecin>(this.apiUrl, medecin);
  }

  update(id: string, medecin: Medecin): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, medecin);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}