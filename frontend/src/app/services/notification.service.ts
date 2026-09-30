import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SocketService } from './socket.service';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'report' | 'message' | 'assessment' | 'consultation';
  read: boolean;
  createdAt: Date;
  relatedId?: string;
  relatedType?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api/notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private socket: SocketService
  ) {
    this.setupRealtimeListeners();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private setupRealtimeListeners(): void {
    // Listen for real-time notifications
    this.socket.listen('notification').subscribe((notification: Notification) => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
      this.updateUnreadCount();
    });

    // Listen for appointment notifications
    this.socket.listen('appointment-booked').subscribe((data: any) => {
      const notification: Notification = {
        title: 'Nouveau rendez-vous',
        message: `${data.patientName} a réservé un rendez-vous pour le ${data.date}`,
        type: 'appointment',
        userId: data.adminId,
        read: false,
        createdAt: new Date(),
        relatedId: data.appointmentId
      };
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
      this.updateUnreadCount();
    });

    // Listen for report notifications
    this.socket.listen('report-generated').subscribe((data: any) => {
      const notification: Notification = {
        title: 'Nouveau rapport',
        message: `Un rapport a été généré pour vous`,
        type: 'report',
        userId: data.patientId,
        read: false,
        createdAt: new Date(),
        relatedId: data.reportId
      };
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
      this.updateUnreadCount();
    });

    // Listen for assessment notifications
    this.socket.listen('assessment-completed').subscribe((data: any) => {
      const notification: Notification = {
        title: 'Évaluation complétée',
        message: `Votre évaluation IA a été complétée`,
        type: 'assessment',
        userId: data.patientId,
        read: false,
        createdAt: new Date(),
        relatedId: data.assessmentId
      };
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
      this.updateUnreadCount();
    });
  }

  loadNotifications(userId: string): Observable<Notification[]> {
    return new Observable(observer => {
      this.http.get<Notification[]>(`${this.apiUrl}/${userId}`, { headers: this.getHeaders() })
        .subscribe({
          next: (notifications) => {
            this.notificationsSubject.next(notifications);
            this.updateUnreadCount();
            observer.next(notifications);
            observer.complete();
          },
          error: (err) => observer.error(err)
        });
    });
  }

  addNotification(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification, { headers: this.getHeaders() });
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {}, { headers: this.getHeaders() });
  }

  markAllAsRead(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/read-all`, {}, { headers: this.getHeaders() });
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`, { headers: this.getHeaders() });
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  notifyAppointmentBooked(data: any): void {
    this.socket.emit('appointment-booked', data);
  }

  notifyReportGenerated(data: any): void {
    this.socket.emit('report-generated', data);
  }

  notifyAssessmentCompleted(data: any): void {
    this.socket.emit('assessment-completed', data);
  }
}
