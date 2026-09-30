import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  loginFromApi(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

  saveUser(user: any): void {
    const normalized = { ...user };

    if (user.medecinId && typeof user.medecinId === 'object') {
      normalized.medecinId = user.medecinId._id || user.medecinId.id;
      normalized.medecinInfo = user.medecinId;
    }

    if (user.patientId && typeof user.patientId === 'object') {
      normalized.patientId = user.patientId._id || user.patientId.id;
      normalized.patientInfo = user.patientId;
    }

    localStorage.setItem('currentUser', JSON.stringify(normalized));
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    // Also clear bipolar auth keys in case of bridged login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('fullname');
  }

  getCurrentUser(): any {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
  }

  getMedecinId(): string {
    const user = this.getCurrentUser();
    if (!user?.medecinId) return '';
    return typeof user.medecinId === 'object'
      ? user.medecinId._id || user.medecinId.id || ''
      : String(user.medecinId);
  }

  getPatientId(): string {
    const user = this.getCurrentUser();
    if (!user?.patientId) return '';
    return typeof user.patientId === 'object'
      ? user.patientId._id || user.patientId.id || ''
      : String(user.patientId);
  }

  isLoggedIn(): boolean    { return !!this.getCurrentUser(); }
  isSecretaire(): boolean  { return this.getCurrentUser()?.role === 'secretaire'; }
  isMedecin(): boolean     { return this.getCurrentUser()?.role === 'medecin'; }
  isPatient(): boolean     { return this.getCurrentUser()?.role === 'patient'; }
  getRole(): string        { return this.getCurrentUser()?.role || ''; }
}
