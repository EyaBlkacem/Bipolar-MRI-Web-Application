import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AiAssessmentService {
  private apiUrl = 'http://localhost:3000/api/ai';

  constructor(private http: HttpClient) {}

  submitForm(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/assessment-form`, payload);
  }

  uploadMRI(assessmentId: string, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/assessment-mri/${assessmentId}`, payload);
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assessments`);
  }

  getByPatient(patientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assessments/patient/${patientId}`);
  }

  generateReport(id: string, reportText?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/assessments/${id}/report`, { reportText });
  }
}
