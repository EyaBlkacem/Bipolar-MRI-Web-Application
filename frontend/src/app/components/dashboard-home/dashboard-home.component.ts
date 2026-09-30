import {
  CommonModule,
  DatePipe,
  NgClass,
  isPlatformBrowser
} from '@angular/common';

import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';

import { DashboardService } from '../../services/dashboard.service';

import { io, Socket } from 'socket.io-client';

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    NgClass
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})

export class DashboardHomeComponent
implements OnInit, OnDestroy {

  // =========================================
  // SOCKET
  // =========================================

  private socket!: Socket;

  // =========================================
  // USER
  // =========================================

  currentUser: any = null;

  today = new Date();

  // =========================================
  // UI
  // =========================================

  loading = false;

  error = '';

  // =========================================
  // NOTIFICATIONS
  // =========================================

  notificationsCount = 0;

  notifications: any[] = [];

  showNotifications = false;

  notificationsLoaded = false;

  // =========================================
  // STATS
  // =========================================

  stats = {

    patients: 0,

    assessments: 0,

    reports: 0,

    appointments: 0,

    unreadMessages: 0

  };

  // =========================================
  // DATA
  // =========================================

  recentPatients: any[] = [];

  todayAppointments: any[] = [];

  appointmentsPerMonth: any[] = [];

  riskDistribution: any[] = [];

  // =========================================
  // CHARTS
  // =========================================

  private appointmentsChart: Chart | null = null;

  private riskChart: Chart | null = null;

  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(

    private dashboardService: DashboardService,

    @Inject(PLATFORM_ID)
    private platformId: object

  ) {}

  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {

    if (!this.isBrowser()) return;

    this.loadCurrentUser();

    this.loadDashboard();

    this.loadNotifications();

    this.initSocket();

  }

  // =========================================
  // DESTROY
  // =========================================

  ngOnDestroy(): void {

    if (this.appointmentsChart) {

      this.appointmentsChart.destroy();

    }

    if (this.riskChart) {

      this.riskChart.destroy();

    }

    if (this.socket) {

      this.socket.disconnect();

    }

  }

  // =========================================
  // CHECK BROWSER
  // =========================================

  private isBrowser(): boolean {

    return isPlatformBrowser(
      this.platformId
    );

  }

  // =========================================
  // LOAD USER
  // =========================================

  private loadCurrentUser(): void {

    const user =
    localStorage.getItem('user');

    if (user) {

      try {

        this.currentUser =
        JSON.parse(user);

      }

      catch {

        this.currentUser = null;

      }

    }

  }

  // =========================================
  // SOCKET
  // =========================================

  private initSocket(): void {

    this.socket =
    io('http://localhost:3000');

    const userId =

      this.currentUser?._id ||

      this.currentUser?.id ||

      this.currentUser?.userId;

    if (userId) {

      this.socket.emit(
        'register',
        userId
      );

    }

    // =====================================
    // REALTIME NOTIFICATION
    // =====================================

    this.socket.on(

      'newNotification',

      (data: any) => {

        console.log(
          'Realtime Notification:',
          data
        );

        const exists =
        this.notifications.some(

          n =>

            n._id &&

            data._id &&

            n._id === data._id

        );

        if (!exists) {

          this.notifications.unshift({

            _id:
            data._id,

            title:
            data.title ||

            this.getNotificationTitle(data),

            message:
            data.message ||

            data.text ||

            'New notification',

            type:
            data.type || 'general',

            isRead:
            data.isRead ?? false,

            createdAt:
            data.createdAt ||

            new Date()

          });

          this.notificationsCount =

          this.notifications.filter(

            n => !n.isRead

          ).length;

        }

        // refresh dashboard

        this.loadDashboard();

      }

    );

  }

  // =========================================
  // LOAD DASHBOARD
  // =========================================

  loadDashboard(): void {

    this.loading = true;

    this.error = '';

    this.dashboardService
    .getHome()

    .subscribe({

      next: (response: any) => {

        console.log(
          'Dashboard:',
          response
        );

        // ================================
        // STATS
        // ================================

        this.stats = {

          patients:
          response?.stats?.patients || 0,

          assessments:
          response?.stats?.assessments || 0,

          reports:
          response?.stats?.reports || 0,

          appointments:
          response?.stats?.appointments || 0,

          unreadMessages:
          response?.stats?.unreadMessages || 0

        };

        // ================================
        // TABLES
        // ================================

        this.recentPatients =

          response?.recentPatients || [];

        this.todayAppointments =

          response?.todayAppointments || [];

        // ================================
        // CHARTS
        // ================================

        this.appointmentsPerMonth =

          response?.charts?.appointmentsPerMonth || [];

        this.riskDistribution =

          response?.charts?.riskDistribution || [];

        this.loading = false;

        setTimeout(() => {

          this.createAppointmentsChart();

          this.createRiskChart();

        }, 200);

      },

      error: (err) => {

        console.error(err);

        this.error =
        'Impossible de charger le dashboard';

        this.loading = false;

      }

    });

  }

  // =========================================
  // LOAD NOTIFICATIONS
  // =========================================

  loadNotifications(): void {

    this.dashboardService
    .getNotifications()

    .subscribe({

      next: (data: any[]) => {

        this.notifications =
        data || [];

        this.notificationsCount =

        this.notifications.filter(

          n => !n.isRead

        ).length;

        this.notificationsLoaded = true;

      },

      error: (err) => {

        console.error(err);

        this.notificationsLoaded = true;

      }

    });

  }

  // =========================================
  // TOGGLE NOTIFICATIONS
  // =========================================

  toggleNotifications(): void {

    this.showNotifications =
    !this.showNotifications;

    if (this.showNotifications) {

      this.loadNotifications();

    }

  }

  // =========================================
  // MARK READ
  // =========================================

  markAsRead(notification: any): void {

    if (
      !notification?._id ||
      notification.isRead
    ) return;

    this.dashboardService

    .markNotificationAsRead(
      notification._id
    )

    .subscribe({

      next: () => {

        notification.isRead = true;

        this.notificationsCount =

        this.notifications.filter(

          n => !n.isRead

        ).length;

      },

      error: (err) => {

        console.error(err);

      }

    });

  }

  // =========================================
  // APPOINTMENTS CHART
  // =========================================

  createAppointmentsChart(): void {

    if (!this.isBrowser()) return;

    const canvas =

    document.getElementById(
      'appointmentsChart'
    ) as HTMLCanvasElement;

    if (!canvas) return;

    if (this.appointmentsChart) {

      this.appointmentsChart.destroy();

    }

    this.appointmentsChart =
    new Chart(canvas, {

      type: 'bar',

      data: {

        labels:

        this.appointmentsPerMonth.map(

          item => item.month

        ),

        datasets: [

          {

            label: 'Appointments',

            data:

            this.appointmentsPerMonth.map(

              item => item.total

            ),

            backgroundColor: '#3b82f6',

            borderRadius: 12

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false

      }

    });

  }

  // =========================================
  // RISK CHART
  // =========================================

  createRiskChart(): void {

    if (!this.isBrowser()) return;

    const canvas =

    document.getElementById(
      'riskChart'
    ) as HTMLCanvasElement;

    if (!canvas) return;

    if (this.riskChart) {

      this.riskChart.destroy();

    }

    this.riskChart =
    new Chart(canvas, {

      type: 'doughnut',

      data: {

        labels:

        this.riskDistribution.map(

          item => item.risk_level

        ),

        datasets: [

          {

            data:

            this.riskDistribution.map(

              item => item.total

            ),

            backgroundColor: [

              '#ef4444',

              '#facc15',

              '#22c55e'

            ]

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false

      }

    });

  }

  // =========================================
  // HELPERS
  // =========================================

  getNotificationTitle(notification: any): string {

    if (notification?.title)
      return notification.title;

    if (
      notification?.type === 'appointment'
    ) {

      return 'New Appointment';

    }

    if (
      notification?.type === 'message'
    ) {

      return 'New Message';

    }

    return 'Notification';

  }

  getUserName(): string {

    return (

      this.currentUser?.full_name ||

      this.currentUser?.name ||

      this.currentUser?.nom ||

      this.currentUser?.username ||

      'Admin'

    );

  }

  getUserRole(): string {

    return (
      this.currentUser?.role ||
      'admin'
    );

  }

  getUserInitial(): string {

    return this.getUserName()

    .charAt(0)

    .toUpperCase();

  }

  getPatientName(patient: any): string {

    return (

      patient?.full_name ||

      `${patient?.nom || ''} ${patient?.prenom || ''}`

      .trim() ||

      patient?.name ||

      'Patient'

    );

  }

  getAppointmentPatientName(
    appointment: any
  ): string {

    return (

      appointment?.full_name ||

      appointment?.patientName ||

      `${appointment?.patient?.nom || ''}

      ${appointment?.patient?.prenom || ''}`

      .trim() ||

      'Patient'

    );

  }

  getAppointmentDate(
    appointment: any
  ): any {

    return (

      appointment?.appointment_date ||

      appointment?.date ||

      null

    );

  }

  getAppointmentTime(
    appointment: any
  ): string {

    return (

      appointment?.appointment_time ||

      appointment?.heure ||

      ''

    );

  }

  getAppointmentStatus(
    appointment: any
  ): string {

    return (

      appointment?.status ||

      appointment?.statut ||

      'pending'

    );

  }

  formatTime(time: string): string {

    if (!time) return '';

    return String(time).slice(0, 5);

  }

  // =========================================
  // GETTERS
  // =========================================

  get totalPatients(): number {

    return this.stats.patients || 0;

  }

  get totalAssessments(): number {

    return this.stats.assessments || 0;

  }

  get totalReports(): number {

    return this.stats.reports || 0;

  }

  get totalAppointments(): number {

    return this.stats.appointments || 0;

  }

}