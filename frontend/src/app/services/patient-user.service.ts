import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PatientUserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`, { headers: this.getHeaders() });
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateProfile(userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/me`, userData, { headers: this.getHeaders() });
  }

  getNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
  }

  getMoodHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mood-history`, { headers: this.getHeaders() });
  }

  getSleepHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sleep-history`, { headers: this.getHeaders() });
  }

  getEpisodes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/episodes`, { headers: this.getHeaders() });
  }

  getQuestionnaires(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/questionnaires`, { headers: this.getHeaders() });
  }

  getAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments`, { headers: this.getHeaders() });
  }

  submitQuestionnaire(questionnaireId: string, answers: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/questionnaires/${questionnaireId}/submit`, { answers }, { headers: this.getHeaders() });
  }
}
