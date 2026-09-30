# Complete Code Implementation - Remaining Components

## 1. ADMIN ASSESSMENTS PAGE (Dynamic with Report Generation)

### assessments.component.ts
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiAssessmentService } from '../../../../services/ai-assessment.service';
import { ReportService } from '../../../../services/report.service';
import { PatientService } from '../../../../services/patient.service';
import { SocketService } from '../../../../services/socket.service';
import { NotificationService } from '../../../../services/notification.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

interface Assessment {
  _id?: string;
  id?: string;
  patientId: string;
  patientName?: string;
  type: string;
  date: Date;
  score: number;
  status: 'pending' | 'completed' | 'reviewed';
  notes?: string;
  results?: any;
}

@Component({
  selector: 'app-assessments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.css']
})
export class AssessmentsComponent implements OnInit, OnDestroy {
  assessments: Assessment[] = [];
  filteredAssessments: Assessment[] = [];
  selectedPatientId = '';
  searchTerm = '';
  loading = false;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private assessmentService: AiAssessmentService,
    private reportService: ReportService,
    private patientService: PatientService,
    private socket: SocketService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAssessments();
    this.setupRealtimeUpdates();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadAssessments(): void {
    this.loading = true;
    const sub = this.assessmentService.getAll().subscribe({
      next: (data) => {
        this.assessments = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Impossible de charger les évaluations', 'error');
        this.loading = false;
      }
    });
    this.subscriptions.add(sub);
  }

  private setupRealtimeUpdates(): void {
    const sub = this.socket.listen('assessment-completed').subscribe(() => {
      this.loadAssessments();
    });
    this.subscriptions.add(sub);
  }

  applyFilters(): void {
    this.filteredAssessments = this.assessments.filter(a => {
      const matchSearch = !this.searchTerm || 
        (a.patientName || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchPatient = !this.selectedPatientId || a.patientId === this.selectedPatientId;
      return matchSearch && matchPatient;
    });
  }

  generateReport(assessment: Assessment): void {
    if (!assessment._id || !assessment.patientId) return;
    
    Swal.fire({
      title: 'Générer un rapport?',
      text: 'Un rapport sera créé et envoyé au patient',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Générer'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const reportData = {
          assessmentId: assessment._id,
          patientId: assessment.patientId,
          type: assessment.type,
          results: assessment.results,
          score: assessment.score
        };
        
        const sub = this.reportService.generateReport(reportData).subscribe({
          next: (report) => {
            Swal.fire('Succès', 'Rapport généré', 'success');
            
            // Send notification to patient via Socket
            this.notificationService.notifyReportGenerated({
              patientId: assessment.patientId,
              reportId: report._id || report.id,
              assessmentType: assessment.type
            });
            
            this.loadAssessments();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Erreur', 'Impossible de générer le rapport', 'error');
            this.loading = false;
          }
        });
        this.subscriptions.add(sub);
      }
    });
  }

  viewResults(assessment: Assessment): void {
    Swal.fire({
      title: 'Résultats de l\'évaluation',
      html: `<pre style="text-align: left;">${JSON.stringify(assessment.results, null, 2)}</pre>`,
      icon: 'info'
    });
  }

  get completedCount(): number {
    return this.assessments.filter(a => a.status === 'completed').length;
  }

  get pendingCount(): number {
    return this.assessments.filter(a => a.status === 'pending').length;
  }
}
```

### assessments.component.html
```html
<div class="assessments-page">
  
  <!-- HEADER -->
  <div class="page-header">
    <h1>Évaluations IA</h1>
    <p>Gestion des évaluations et rapports</p>
  </div>

  <!-- STATS -->
  <div class="stats-grid">
    <div class="stat-card">
      <h3>{{ assessments.length }}</h3>
      <p>Total Évaluations</p>
    </div>
    <div class="stat-card">
      <h3>{{ completedCount }}</h3>
      <p>Complétées</p>
    </div>
    <div class="stat-card">
      <h3>{{ pendingCount }}</h3>
      <p>En Attente</p>
    </div>
  </div>

  <!-- FILTERS -->
  <div class="filter-section">
    <input type="text" 
           [(ngModel)]="searchTerm" 
           (ngModelChange)="applyFilters()"
           placeholder="Rechercher un patient...">
  </div>

  <!-- LOADING -->
  <div *ngIf="loading" class="loading-state">
    Chargement...
  </div>

  <!-- TABLE -->
  <div *ngIf="!loading" class="assessments-table">
    <div class="table-header">
      <span>Patient</span>
      <span>Type</span>
      <span>Date</span>
      <span>Score</span>
      <span>Statut</span>
      <span>Actions</span>
    </div>

    <div *ngFor="let assessment of filteredAssessments" class="table-row">
      <span>{{ assessment.patientName }}</span>
      <span>{{ assessment.type }}</span>
      <span>{{ assessment.date | date: 'short' }}</span>
      <span>{{ assessment.score }}%</span>
      <span class="badge" [ngClass]="assessment.status">{{ assessment.status }}</span>
      <div class="actions">
        <button (click)="viewResults(assessment)" class="btn-small">Voir</button>
        <button (click)="generateReport(assessment)" class="btn-small" [disabled]="assessment.status === 'reviewed'">Rapport</button>
      </div>
    </div>
  </div>

</div>
```

---

## 2. ADMIN MESSAGES - WITH ONLINE/OFFLINE STATUS

### message-panel.component.ts (Enhancement)
```typescript
// Add to existing message service integration
private setupUserStatusTracking(): void {
  const sub = this.socket.onOnlineUsers().subscribe((onlineUsers: string[]) => {
    this.onlineUsers = onlineUsers;
    this.updateUserStatuses();
  });
  this.subscriptions.add(sub);
}

private updateUserStatuses(): void {
  this.users.forEach(user => {
    user.isOnline = this.onlineUsers.includes(user._id || user.id);
  });
}

getUserStatusBadge(user: any): string {
  return user.isOnline ? 'online' : 'offline';
}

getUserStatusLabel(user: any): string {
  return user.isOnline ? 'En ligne' : 'Hors ligne';
}
```

---

## 3. USER DASHBOARD (Patient Side)

### patient-dashboard.component.ts
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { AiAssessmentService } from '../../services/ai-assessment.service';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

interface Dashboard {
  upcomingAppointments: number;
  recentAssessments: number;
  notifications: number;
  lastAppointment?: Date;
  nextAppointment?: Date;
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  
  patientName = '';
  upcomingAppointments: any[] = [];
  recentAssessments: any[] = [];
  notifications: number = 0;
  loading = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private auth: AuthService,
    private appointmentService: AppointmentService,
    private assessmentService: AiAssessmentService,
    private notificationService: NotificationService,
    private socket: SocketService
  ) {}

  ngOnInit(): void {
    this.initializeDashboard();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeDashboard(): void {
    const user = this.auth.getUser();
    if (user) {
      this.patientName = `${user.prenom} ${user.nom}`.trim();
      this.socket.connect(user._id || user.id);
    }
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    // Load appointments
    const apptSub = this.appointmentService.getAll().subscribe(appointments => {
      const today = new Date();
      this.upcomingAppointments = appointments
        .filter(a => new Date(a.date || a.appointment_date) >= today)
        .sort((a, b) => new Date(a.date || a.appointment_date).getTime() - new Date(b.date || b.appointment_date).getTime())
        .slice(0, 5);
      this.checkLoadingComplete();
    });
    this.subscriptions.add(apptSub);

    // Load assessments
    const assessSub = this.assessmentService.getAll().subscribe(assessments => {
      this.recentAssessments = assessments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      this.checkLoadingComplete();
    });
    this.subscriptions.add(assessSub);

    // Load notifications
    const user = this.auth.getUser();
    if (user) {
      const notifSub = this.notificationService.loadNotifications(user._id || user.id).subscribe(notifs => {
        this.notifications = notifs.filter(n => !n.read).length;
        this.checkLoadingComplete();
      });
      this.subscriptions.add(notifSub);
    }
  }

  private checkLoadingComplete(): void {
    if (this.upcomingAppointments.length > 0 && this.recentAssessments.length >= 0 && this.notifications >= 0) {
      this.loading = false;
    }
  }
}
```

---

## 4. USER MY APPOINTMENTS (Patient Side)

### mes-rendezvous.component.ts
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

interface Appointment {
  _id?: string;
  id?: string;
  patientId?: string;
  date: Date;
  heure: string;
  medecin?: { nom: string; prenom: string; specialite: string };
  motif: string;
  statut: 'pending' | 'confirmed' | 'done' | 'cancelled';
  notes?: string;
}

@Component({
  selector: 'app-mes-rendezvous',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-rendezvous.component.html',
  styleUrls: ['./mes-rendezvous.component.css']
})
export class MesRendezvousComponent implements OnInit, OnDestroy {
  
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  filterType = 'upcoming'; // upcoming, past, all
  loading = false;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private appointmentService: AppointmentService,
    private auth: AuthService,
    private socket: SocketService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.setupRealtimeUpdates();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadAppointments(): void {
    this.loading = true;
    const sub = this.appointmentService.getAll().subscribe({
      next: (data) => {
        this.appointments = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Impossible de charger vos rendez-vous', 'error');
        this.loading = false;
      }
    });
    this.subscriptions.add(sub);
  }

  private setupRealtimeUpdates(): void {
    const sub = this.socket.listen('appointment-status-changed').subscribe(() => {
      this.loadAppointments();
    });
    this.subscriptions.add(sub);
  }

  applyFilters(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.filteredAppointments = this.appointments.filter(a => {
      const apptDate = new Date(a.date);
      apptDate.setHours(0, 0, 0, 0);

      switch (this.filterType) {
        case 'upcoming':
          return apptDate >= today && a.statut !== 'cancelled';
        case 'past':
          return apptDate < today || a.statut === 'done';
        default:
          return true;
      }
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  cancelAppointment(appointmentId: string | undefined): void {
    if (!appointmentId) return;
    
    Swal.fire({
      title: 'Annuler ce rendez-vous?',
      text: 'Vous pouvez le replanifier plus tard',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        const sub = this.appointmentService.updateStatus(appointmentId, 'cancelled').subscribe({
          next: () => {
            Swal.fire('Succès', 'Rendez-vous annulé', 'success');
            this.loadAppointments();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Erreur', 'Impossible d\'annuler le rendez-vous', 'error');
            this.loading = false;
          }
        });
        this.subscriptions.add(sub);
      }
    });
  }

  get upcomingCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.appointments.filter(a => 
      new Date(a.date) >= today && a.statut !== 'cancelled'
    ).length;
  }

  get pastCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.appointments.filter(a =>
      new Date(a.date) < today || a.statut === 'done'
    ).length;
  }
}
```

---

## 5. USER AI ASSESSMENTS - WITH REAL-TIME NOTIFICATIONS

### ai-assessment-patient.component.ts
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiAssessmentService } from '../../services/ai-assessment.service';
import { ReportService } from '../../services/report.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

interface Assessment {
  _id?: string;
  id?: string;
  patientId: string;
  type: string;
  date: Date;
  score: number;
  status: 'pending' | 'completed' | 'reported';
  results?: any;
}

@Component({
  selector: 'app-ai-assessment-patient',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-assessment-patient.component.html',
  styleUrls: ['./ai-assessment-patient.component.css']
})
export class AiAssessmentPatientComponent implements OnInit, OnDestroy {
  
  assessments: Assessment[] = [];
  reports: any[] = [];
  loading = false;
  hasNewReport = false;
  newReportNotifications: Notification[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private assessmentService: AiAssessmentService,
    private reportService: ReportService,
    private notificationService: NotificationService,
    private socket: SocketService
  ) {}

  ngOnInit(): void {
    this.loadAssessments();
    this.setupRealtimeNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadAssessments(): void {
    this.loading = true;
    const sub = this.assessmentService.getAll().subscribe({
      next: (data) => {
        this.assessments = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
    this.subscriptions.add(sub);
  }

  private setupRealtimeNotifications(): void {
    const sub = this.notificationService.notifications$.subscribe(notifications => {
      this.newReportNotifications = notifications.filter(n => n.type === 'report');
      this.hasNewReport = this.newReportNotifications.some(n => !n.read);
    });
    this.subscriptions.add(sub);
  }

  viewReport(assessmentId: string): void {
    const sub = this.reportService.getById(assessmentId).subscribe(report => {
      // Display report in modal or new page
      console.log('Report:', report);
    });
    this.subscriptions.add(sub);
  }

  downloadReport(assessmentId: string): void {
    // Implement download functionality
  }
}
```

---

## BACKEND ENDPOINTS TO CREATE

Ensure your backend has these endpoints:

```javascript
// PATIENTS ENDPOINTS
GET    /api/patients/with-ia-models
GET    /api/patients/high-risk
GET    /api/patients/statistics

// ASSESSMENTS ENDPOINTS
GET    /api/assessments/patient/:patientId
POST   /api/assessments/:id/generate-report
GET    /api/assessments/:id/report

// NOTIFICATIONS ENDPOINTS
GET    /api/notifications/:userId
POST   /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/:userId/read-all
DELETE /api/notifications/:id
```

---

## SOCKET.IO EVENTS TO HANDLE

**Backend should emit:**
- `appointment-status-changed` - Appointment status updated
- `assessment-completed` - Assessment finished
- `report-generated` - Report created for patient
- `consultation-updated` - Consultation info changed
- `patient-updated` - Patient info changed
- `user-online` / `user-offline` - User status changed

**Frontend should listen:**
```typescript
this.socket.listen('event-name').subscribe(data => {
  // Handle event
});
```

---

## CSS GUIDELINES

All components should follow:
- Responsive grid layouts (auto-fill, minmax)
- Gradient backgrounds for stats
- Smooth transitions on hover
- Loading spinners
- Empty states
- Error messages with Swal

---

## TESTING CHECKLIST

- [ ] Admin sees real-time appointment notifications
- [ ] Patient search works in appointments
- [ ] Date filtering in appointments works
- [ ] Patient cards show IA model scores
- [ ] Reports sent to patients appear in their notifications
- [ ] Messages show online/offline status
- [ ] Patient dashboard loads dynamic data
- [ ] Appointments update when doctor confirms
- [ ] Assessments appear in real-time
- [ ] All forms validate before submission
