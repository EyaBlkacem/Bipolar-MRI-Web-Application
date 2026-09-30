import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FormService {

  private api = 'http://localhost:3000/api/assessments';

  constructor(private http: HttpClient) {}

  createForm(data: any) {
    const token = localStorage.getItem('token');

    return this.http.post(this.api, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
