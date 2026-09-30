import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface PatientData {
  _id?: string;
  id?: string;
  nom: string;
  prenom: string;
  cin?: string;
  dateNaissance?: Date;
  telephone?: string;
  email?: string;
  adresse?: string;
  sexe?: string;
  actif?: boolean;
  iaModels?: {
    bipolareModel?: { score: number; risk: string; lastEvaluation: Date };
    moodModel?: { score: number; trend: string; lastUpdate: Date };
    behaviourModel?: { score: number; status: string; lastUpdate: Date };
  };
  appointments?: number;
  lastVisit?: Date;
  assessments?: number;
  risksIdentified?: string[];
  status?: 'active' | 'inactive' | 'high-risk' | 'stable';
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = 'http://localhost:3000/api/patients';
  private patientsSubject = new BehaviorSubject<PatientData[]>([]);
  public patients$ = this.patientsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<PatientData[]> {
    return this.http.get<PatientData[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getById(id: string): Observable<PatientData> {
    return this.http.get<PatientData>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  create(patient: PatientData): Observable<PatientData> {
    return this.http.post<PatientData>(this.apiUrl, patient, { headers: this.getHeaders() });
  }

  update(id: string, patient: PatientData): Observable<PatientData> {
    return this.http.put<PatientData>(`${this.apiUrl}/${id}`, patient, { headers: this.getHeaders() });
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Get patients with IA model evaluation data
  getWithIAModels(): Observable<PatientData[]> {
    return this.http.get<PatientData[]>(`${this.apiUrl}/with-ia-models`, { headers: this.getHeaders() });
  }

  // Get high-risk patients
  getHighRiskPatients(): Observable<PatientData[]> {
    return this.http.get<PatientData[]>(`${this.apiUrl}/high-risk`, { headers: this.getHeaders() });
  }

  // Search patients
  search(query: string): Observable<PatientData[]> {
    return this.http.get<PatientData[]>(`${this.apiUrl}/search?q=${query}`, { headers: this.getHeaders() });
  }

  // Get patient statistics
  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`, { headers: this.getHeaders() });
  }

  loadPatients(): void {
    this.getAll().subscribe({
      next: (patients) => this.patientsSubject.next(patients),
      error: (err) => console.error('Error loading patients:', err)
    });
  }

  getPatients(): PatientData[] {
    return this.patientsSubject.value;
  }
}
