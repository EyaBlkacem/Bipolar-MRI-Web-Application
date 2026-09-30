import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../../../services/appointment.service';
import { SocketService } from '../../../../services/socket.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit, OnDestroy {

  appointments: any[] = [];
  showForm = false;
  loading = false;
  private subscriptions = new Subscription();

  current: any = {
    patient_id: '',
    appointment_date: '',
    appointment_time: '',
    status: 'pending',
    notes: ''
  };

  constructor(
    private appointmentService: AppointmentService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.loadAppointments();
    this.socketService.connect();
    this.subscriptions.add(
      this.socketService.listen('appointment-updated').subscribe(() => this.loadAppointments())
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getAll().subscribe({
      next: (data) => {
        this.appointments = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rendez-vous:', err);
        this.loading = false;
        Swal.fire('Erreur', 'Impossible de charger les rendez-vous', 'error');
      }
    });
  }

  newAppointment() {
    this.showForm = true;
    this.current = {
      patient_id: '',
      appointment_date: '',
      appointment_time: '',
      status: 'pending',
      notes: ''
    };
  }

  save() {
    if (!this.current.patient_id || !this.current.appointment_date || !this.current.appointment_time) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    this.loading = true;
    this.appointmentService.create(this.current).subscribe({
      next: () => {
        Swal.fire('Succès', 'Rendez-vous créé avec succès', 'success');
        this.showForm = false;
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        Swal.fire('Erreur', 'Impossible de créer le rendez-vous', 'error');
        this.loading = false;
      }
    });
  }

  close() {
    this.showForm = false;
  }

  confirm(appointment: any) {
    this.updateAppointmentStatus(appointment._id || appointment.id, 'confirmed');
  }

  complete(appointment: any) {
    this.updateAppointmentStatus(appointment._id || appointment.id, 'done');
  }

  cancelAppt(appointment: any) {
    this.updateAppointmentStatus(appointment._id || appointment.id, 'cancelled');
  }

  private updateAppointmentStatus(id: string, status: string): void {
    this.loading = true;
    this.appointmentService.updateStatus(id, status).subscribe({
      next: () => {
        Swal.fire('Succès', `Rendez-vous ${status}`, 'success');
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
        Swal.fire('Erreur', 'Impossible de mettre à jour le rendez-vous', 'error');
        this.loading = false;
      }
    });
  }

  deleteAppointment(id: string): void {
    Swal.fire({
      title: 'Supprimer ce rendez-vous ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.appointmentService.delete(id).subscribe({
          next: () => {
            Swal.fire('Succès', 'Rendez-vous supprimé', 'success');
            this.loadAppointments();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression:', err);
            Swal.fire('Erreur', 'Impossible de supprimer le rendez-vous', 'error');
            this.loading = false;
          }
        });
      }
    });
  }

  get pendingCount(): number {
    return this.appointments.filter(a => a.status === 'pending').length;
  }

  get todayCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments.filter(a => {
      const apptDate = new Date(a.appointment_date).toISOString().split('T')[0];
      return apptDate === today;
    }).length;
  }

  get confirmedCount(): number {
    return this.appointments.filter(a => a.status === 'confirmed').length;
  }

  get completedCount(): number {
    return this.appointments.filter(a => a.status === 'done').length;
  }
}
