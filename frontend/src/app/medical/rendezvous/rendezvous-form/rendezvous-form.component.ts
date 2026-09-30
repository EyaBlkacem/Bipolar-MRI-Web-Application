import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RendezVousService } from '../../services/rendezvous.service';
import { PatientService } from '../../services/patient.service';
import { MedecinService } from '../../services/medecin.service';
import { AuthService } from '../../services/auth.service';
import { RendezVous } from '../../models/rendezvous.model';
import { Patient } from '../../models/patient.model';
import { Medecin } from '../../models/medecin.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rendezvous-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rendezvous-form.component.html',
  styleUrl: './rendezvous-form.component.css'
})
export class RendezVousFormComponent implements OnInit {

  isEditMode   = false;
  rdvId        = '';
  loading      = false;
  errorMessage = '';

  patients: Patient[] = [];
  medecins: Medecin[] = [];

  heures = [
    '08:00','08:30','09:00','09:30','10:00','10:30',
    '11:00','11:30','12:00','14:00','14:30','15:00',
    '15:30','16:00','16:30','17:00','17:30'
  ];

  motifs = [
    'Première consultation',
    'Suivi thérapeutique',
    'Anxiété et troubles anxieux',
    'Dépression',
    'Troubles bipolaires',
    'Schizophrénie',
    'Troubles obsessionnels compulsifs',
    'Troubles du sommeil',
    'Addictologie',
    'Troubles de la personnalité',
    'Stress post-traumatique',
    'Autre'
  ];

  rdv: RendezVous = {
    patient: '', medecin: '',
    date: '', heure: '',
    motif: '', statut: 'planifié', notes: ''
  };

  constructor(
    private rdvService: RendezVousService,
    private patientService: PatientService,
    private medecinService: MedecinService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load medecins
    this.medecinService.getMedecinsEnregistres().subscribe({
      next: (data) => this.medecins = data,
      error: () => this.medecinService.getAll().subscribe({
        next: (data) => this.medecins = data,
        error: (err) => console.error(err)
      })
    });

    // Load patients if not a patient
    if (!this.authService.isPatient()) {
      this.patientService.getAll().subscribe({
        next: (data) => this.patients = data,
        error: (err) => console.error(err)
      });
    }

    // Pre-fill patient if logged in as patient
    if (this.authService.isPatient()) {
      const patientId = this.authService.getPatientId();
      if (patientId) {
        this.rdv.patient = patientId;
      }
    }

    // Pre-fill from query params
    const medecinId = this.route.snapshot.queryParams['medecinId'];
    if (medecinId) this.rdv.medecin = medecinId;

    const patientId = this.route.snapshot.queryParams['patientId'];
    if (patientId) this.rdv.patient = patientId;

    // Edit mode
    this.rdvId = this.route.snapshot.params['id'];
    if (this.rdvId) {
      this.isEditMode = true;
      this.rdvService.getById(this.rdvId).subscribe({
        next: (data) => {
          this.rdv = {
            ...data,
            patient: data.patient?.id || data.patient,
            medecin: data.medecin?.id || data.medecin,
            date: new Date(data.date).toISOString().split('T')[0]
          };
        },
        error: (err) => console.error(err)
      });
    }
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0];
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    // If patient and patientId not set, try to resolve
    if (this.authService.isPatient() && !this.rdv.patient) {
      const patientId = this.authService.getPatientId();
      if (patientId) {
        this.rdv.patient = patientId;
        this.submitRdv();
      } else {
        this.errorMessage = 'Votre profil patient n\'est pas lié. Contactez le secrétariat.';
        this.loading = false;
      }
    } else {
      this.submitRdv();
    }
  }

  submitRdv(): void {
    const action = this.isEditMode
      ? this.rdvService.update(this.rdvId, this.rdv)
      : this.rdvService.create(this.rdv);

    action.subscribe({
      next: () => {
        Swal.fire({
          toast: true, position: 'top-end',
          icon: 'success',
          title: this.isEditMode ? 'RDV modifié !' : 'RDV créé avec succès !',
          showConfirmButton: false,
          timer: 2500, timerProgressBar: true
        });
        if (this.authService.isPatient()) {
          this.router.navigate(['/medical/patient/rendezvous']);
        } else {
          this.router.navigate(['/medical/rendezvous']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Une erreur est survenue';
        this.loading = false;
      }
    });
  }
}
