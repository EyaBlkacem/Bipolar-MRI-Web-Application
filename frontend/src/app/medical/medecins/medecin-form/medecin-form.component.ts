import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MedecinService } from '../../services/medecin.service';
import { Medecin } from '../../models/medecin.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medecin-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './medecin-form.component.html',
  styleUrl: './medecin-form.component.css'
})
export class MedecinFormComponent implements OnInit {

  isEditMode   = false;
  medecinId    = '';
  loading      = false;
  errorMessage = '';

  // Spécialités psychiatriques uniquement
  specialites = [
    'Psychiatrie générale',
    'Psychiatrie de l\'enfant et de l\'adolescent',
    'Psychiatrie légale',
    'Psychogériatrie',
    'Addictologie',
    'Neuropsychiatrie',
    'Psychothérapie comportementale',
    'Psychiatrie de liaison'
  ];

  medecin: Medecin = {
    nom: '', prenom: '', specialite: '',
    telephone: '', email: '', adresse: ''
  };

  constructor(
    private medecinService: MedecinService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.medecinId = this.route.snapshot.params['id'];
    if (this.medecinId) {
      this.isEditMode = true;
      this.medecinService.getById(this.medecinId).subscribe({
        next: (data) => this.medecin = data,
        error: (err)  => console.error(err)
      });
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    const action = this.isEditMode
      ? this.medecinService.update(this.medecinId, this.medecin)
      : this.medecinService.create(this.medecin);

    action.subscribe({
      next: () => {
        Swal.fire({
          toast: true, position: 'top-end',
          icon: 'success',
          title: this.isEditMode ? 'Psychiatre modifié !' : 'Psychiatre créé !',
          showConfirmButton: false,
          timer: 2500, timerProgressBar: true
        });
        this.router.navigate(['/medical/medecins']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Une erreur est survenue';
        this.loading = false;
      }
    });
  }
}