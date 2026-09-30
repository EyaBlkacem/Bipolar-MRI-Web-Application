import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.css'
})
export class PatientFormComponent implements OnInit {

  isEditMode = false;
  patientId  = '';
  loading    = false;
  errorMessage = '';

  patient: Patient = {
    nom: '', prenom: '', cin: '',
    dateNaissance: '', telephone: '',
    email: '', adresse: '', sexe: 'Homme'
  };

  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params['id'];
    if (this.patientId) {
      this.isEditMode = true;
      this.patientService.getById(this.patientId).subscribe({
        next: (data) => {
          this.patient = data;
          if (data.dateNaissance) {
            this.patient.dateNaissance = new Date(data.dateNaissance)
              .toISOString().split('T')[0];
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    const action = this.isEditMode
      ? this.patientService.update(this.patientId, this.patient)
      : this.patientService.create(this.patient);

    action.subscribe({
      next: () => {
        Swal.fire({
          toast: true, position: 'top-end',
          icon: 'success',
          title: this.isEditMode ? 'Patient modifié !' : 'Patient créé !',
          showConfirmButton: false,
          timer: 2500, timerProgressBar: true
        });
        this.router.navigate(['/medical/patients']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Une erreur est survenue';
        this.loading = false;
      }
    });
  }
}