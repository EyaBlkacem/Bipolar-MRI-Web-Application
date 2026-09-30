import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { RendezVousService } from '../../services/rendezvous.service';
import { AuthService } from '../../services/auth.service';
import { Patient } from '../../models/patient.model';
import { RendezVous } from '../../models/rendezvous.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.css'
})
export class PatientDetailComponent implements OnInit {

  patient: Patient | null = null;
  rendezvous: RendezVous[] = [];
  loading = false;

  constructor(
    private patientService: PatientService,
    private rdvService: RendezVousService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loading = true;

    this.patientService.getById(id).subscribe({
      next: (data) => { this.patient = data; this.loading = false; },
      error: (err)  => { console.error(err); this.loading = false; }
    });

    this.rdvService.getByPatient(id).subscribe({
      next: (data) => this.rendezvous = data,
      error: (err)  => console.error(err)
    });
  }

  getAge(): number {
    if (!this.patient?.dateNaissance) return 0;
    const diff = Date.now() - new Date(this.patient.dateNaissance).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  getStatutClass(statut: string): string {
    const map: any = {
      'planifié': 'badge-planifie',
      'confirmé': 'badge-confirme',
      'annulé':   'badge-annule',
      'terminé':  'badge-termine'
    };
    return map[statut] || '';
  }

  deletePatient(): void {
    Swal.fire({
      title: 'Supprimer ce patient ?',
      text: 'Tous ses rendez-vous seront également affectés !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.patientService.delete(this.patient!.id!).subscribe({
          next: () => {
            Swal.fire({
              toast: true, position: 'top-end',
              icon: 'success', title: 'Patient supprimé !',
              showConfirmButton: false, timer: 2500,
              timerProgressBar: true
            });
            this.router.navigate(['/medical/patients']);
          },
          error: (err) => console.error(err)
        });
      }
    });
  }

  deleteRdv(id: string): void {
    Swal.fire({
      title: 'Supprimer ce rendez-vous ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.rdvService.delete(id).subscribe({
          next: () => {
            Swal.fire({
              toast: true, position: 'top-end',
              icon: 'success', title: 'Rendez-vous supprimé !',
              showConfirmButton: false, timer: 2500,
              timerProgressBar: true
            });
            this.rendezvous = this.rendezvous.filter(r => r.id !== id);
          },
          error: (err) => console.error(err)
        });
      }
    });
  }
}