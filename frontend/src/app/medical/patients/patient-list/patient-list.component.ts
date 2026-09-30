import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { RendezVousService } from '../../services/rendezvous.service';
import { AuthService } from '../../services/auth.service';
import { Patient } from '../../models/patient.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css'
})
export class PatientListComponent implements OnInit {

  patients: Patient[] = [];
  search: string = '';
  loading = false;

  constructor(
    private patientService: PatientService,
    private rdvService: RendezVousService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  getMedecinId(): string {
    const user = this.authService.getCurrentUser();
    if (!user?.medecinId) return '';
    return typeof user.medecinId === 'object'
      ? (user.medecinId as any)?._id || (user.medecinId as any)?.id || ''
      : user.medecinId;
  }

  loadPatients(): void {
    this.loading = true;

    if (this.authService.isMedecin()) {
      const medecinId = this.getMedecinId();

      if (!medecinId) {
        this.patients = [];
        this.loading = false;
        return;
      }

      this.rdvService.getAll({ medecinId }).subscribe({
        next: (rdvs) => {
          const patientIds = [...new Set(
            rdvs.map((r: any) =>
              r.patient?.id || r.patient?._id || r.patient
            ).filter(Boolean)
          )];

          if (patientIds.length === 0) {
            this.patients = [];
            this.loading = false;
            return;
          }

          this.patientService.getAll().subscribe({
            next: (allPatients) => {
              this.patients = allPatients.filter(p =>
                patientIds.includes(p.id)
              );
              this.loading = false;
            },
            error: (err) => { console.error(err); this.loading = false; }
          });
        },
        error: (err) => { console.error(err); this.loading = false; }
      });

    } else {
      this.patientService.getAll(this.search).subscribe({
        next: (data) => { this.patients = data; this.loading = false; },
        error: (err)  => { console.error(err); this.loading = false; }
      });
    }
  }

  onSearch(): void {
    this.loadPatients();
  }

  deletePatient(id: string): void {
    Swal.fire({
      title: 'Supprimer ce patient ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.patientService.delete(id).subscribe({
          next: () => {
            Swal.fire({
              toast: true, position: 'top-end',
              icon: 'success', title: 'Patient supprimé !',
              showConfirmButton: false, timer: 2500,
              timerProgressBar: true
            });
            this.loadPatients();
          },
          error: (err) => console.error(err)
        });
      }
    });
  }
}