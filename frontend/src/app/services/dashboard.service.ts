import { Injectable } from '@angular/core';

import {

  HttpClient,

  HttpHeaders

} from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({

  providedIn: 'root'

})

export class DashboardService {

  // ====================================
  // URLS
  // ====================================

  private dashboardUrl =

    'http://localhost:3000/api/dashboard';

  private notificationsUrl =

    'http://localhost:3000/api/notifications';

  // ====================================
  // CONSTRUCTOR
  // ====================================

  constructor(

    private http: HttpClient

  ) {}

  // ====================================
  // HEADERS
  // ====================================

  private getHeaders(): HttpHeaders {

    const token =

      localStorage.getItem('token');

    return new HttpHeaders({

      Authorization:
      `Bearer ${token}`,

      'Content-Type':
      'application/json'

    });

  }

  // ====================================
  // DASHBOARD HOME
  // ====================================

  getHome(): Observable<any> {

    return this.http.get<any>(

      `${this.dashboardUrl}/home`,

      {

        headers:
        this.getHeaders()

      }

    );

  }

  // ====================================
  // NOTIFICATIONS
  // ====================================

  getNotifications():
  Observable<any[]> {

    return this.http.get<any[]>(

      this.notificationsUrl,

      {

        headers:
        this.getHeaders()

      }

    );

  }

  // ====================================
  // MARK AS READ
  // ====================================

  markNotificationAsRead(
    id: string
  ): Observable<any> {

    return this.http.put(

      `${this.notificationsUrl}/${id}/read`,

      {},

      {

        headers:
        this.getHeaders()

      }

    );

  }

}