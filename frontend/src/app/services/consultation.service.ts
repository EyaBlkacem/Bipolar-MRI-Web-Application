import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {

  private api =
    'http://localhost:3000/api/consultations';

  constructor(
    private http: HttpClient
  ) {}

  /* =========================
     GET PATIENTS
  ========================= */

  getPatients(): Observable<any[]> {

    return this.http.get<any[]>(

      `${this.api}/patients`

    );

  }

  /* =========================
     GET CONSULTATIONS
  ========================= */

  getConsultations(): Observable<any[]> {

    return this.http.get<any[]>(

      this.api

    );

  }

  /* =========================
     CREATE CONSULTATION
  ========================= */

  createConsultation(
    data: any
  ): Observable<any> {

    return this.http.post(

      `${this.api}/create`,

      data

    );

  }

  /* =========================
     GET CONSULTATION
     FOR PATIENT
  ========================= */

  getPatientConsultation(
    patientId: number
  ): Observable<any> {

    return this.http.get(

      `${this.api}/patient/${patientId}`

    );

  }

}
