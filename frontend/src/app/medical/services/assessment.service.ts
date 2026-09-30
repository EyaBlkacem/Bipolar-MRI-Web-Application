import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Assessment {
  id?: string;
  patientId: string;
  date?: Date;
  humeur: number;
  heureSommeil: number;
  qualiteSommeil: 'mauvaise' | 'moyenne' | 'bonne' | 'excellente';
  energie: number;
  anxiete: number;
  irritabilite: number;
  penseesRapides: boolean;
  medicamentsPris: boolean;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  create(data: Assessment): Observable<Assessment> {
    return this.http.post<Assessment>(`${this.apiUrl}/assessments`, data);
  }

  getByPatient(patientId: string): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.apiUrl}/assessments/patient/${patientId}`);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/assessments/${id}`);
  }
}
