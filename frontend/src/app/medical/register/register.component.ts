import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  loading = false;
  errorMessage = '';
  showPassword = false;

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

  form = {
    nom: '',
    prenom: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    telephone: '',
    email: '',
    adresse: '',
    sexe: 'Homme',
    dateNaissance: '',
    specialite: 'Psychiatrie générale'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.form.nom || !this.form.prenom ||
        !this.form.username || !this.form.password || !this.form.role) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.form.password.length < 4) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 4 caractères';
      return;
    }

    if (this.form.role === 'patient' && !this.form.telephone) {
      this.errorMessage = 'Le téléphone est obligatoire pour un patient';
      return;
    }

    this.loading = true;
    this.authService.register(this.form).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Compte créé !',
          text: 'Votre compte a été créé avec succès.',
          confirmButtonColor: '#1a2a5e',
          confirmButtonText: 'Se connecter'
        }).then(() => this.router.navigate(['/login']));
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription';
        this.loading = false;
      }
    });
  }
}