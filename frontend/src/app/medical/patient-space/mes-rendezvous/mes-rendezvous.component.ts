import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-mes-rendezvous',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './mes-rendezvous.component.html',
  styleUrl: './mes-rendezvous.component.css'
})
export class MesRendezVousComponent implements OnInit, OnDestroy {
  appointments: any[] = [];
  doctors: any[] = [];
  loading = false;
  creating = false;
  showForm = false;
  user: any = null;
  private subscriptions = new Subscription();

  form: any = {
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    type: 'online',
    notes: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private socket: SocketService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const raw = localStorage.getItem('user');
    this.user = raw ? JSON.parse(raw) : null;
    const userId = this.user?.id || this.user?._id;
    if (userId) {
      this.socket.joinUser(userId);
      this.loadDoctors();
      this.loadAppointments();
      this.subscriptions.add(this.socket.onOnlineUsers().subscribe());
      this.subscriptions.add(this.socket.listen('appointment-updated').subscribe(() => this.loadAppointments()));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDoctors(): void {
    this.http.get<any[]>('http://localhost:3000/api/doctors/admins').subscribe({
      next: (res) => {
        this.doctors = res;
        if (!this.form.doctor_id && res.length) this.form.doctor_id = res[0].id || res[0]._id;
      },
      error: (err) => console.error(err)
    });
  }

  loadAppointments(): void {
    const userId = this.user?.id || this.user?._id;
    if (!userId) return;
    this.loading = true;
    this.http.get<any[]>(`http://localhost:3000/api/appointments/patient/${userId}`).subscribe({
      next: (res) => { this.appointments = res; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  createAppointment(): void {
    if (!this.form.appointment_date || !this.form.appointment_time) return;
    this.creating = true;
    const userId = this.user?.id || this.user?._id;
    const payload = {
      patient_id: userId,
      doctor_id: this.form.doctor_id || undefined,
      appointment_date: this.form.appointment_date,
      appointment_time: this.form.appointment_time,
      type: this.form.type,
      notes: this.form.notes,
      status: 'pending'
    };
    this.http.post('http://localhost:3000/api/appointments', payload).subscribe({
      next: () => {
        this.creating = false;
        this.showForm = false;
        this.form = { doctor_id: this.doctors[0]?.id || this.doctors[0]?._id || '', appointment_date: '', appointment_time: '', type: 'online', notes: '' };
        this.loadAppointments();
      },
      error: (err) => { console.error(err); this.creating = false; }
    });
  }

joinVideo(appt: any): void {

  console.log('APPOINTMENT = ', appt);

  // IMPORTANT
  // même room pour admin + patient

  const roomId =
    appt.roomId ||
    appt.consultationRoom ||
    appt.videoRoom ||
    `consultation-${appt._id}`;

  console.log('ROOM ID = ', roomId);

  this.router.navigate([
    '/consultation-video',
    roomId
  ]);
}

  cancelAppointment(appt: any): void {
    const appointmentId = appt.id || appt._id;
    this.http.put(`http://localhost:3000/api/appointments/${appointmentId}`, { status: 'cancelled' }).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => console.error(err)
    });
  }

  isFuture(date: string): boolean { return new Date(date) >= new Date(new Date().toDateString()); }
  canJoin(appt: any): boolean { return appt.type === 'online' && appt.status !== 'cancelled' && appt.status !== 'done'; }
  badgeClass(status: string): string { return `badge-${status || 'pending'}`; }
}
