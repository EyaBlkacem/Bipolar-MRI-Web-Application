import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  message = '';
  error = '';
  loading = false;
  isSignup = false;

  loginData  = { email: '', password: '' };
  signupData = { fullname: '', email: '', password: '' };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.loading = true;
    this.error = '';

    this.authService.login(this.loginData).subscribe({
      next: (user: any) => {
        if (!user) {
          this.error = 'Utilisateur non trouvé';
          this.loading = false;
          return;
        }

        localStorage.setItem('role', user.role);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'admin') {
          // Effacer currentUser si existant
          localStorage.removeItem('currentUser');
          this.router.navigate(['/admin-dashboard']);
        } else {
          // Patient (role='user') : créer currentUser compatible avec le système médical
          const currentUser = {
            role: 'patient',
            nom: user.fullname || user.email || 'Patient',
            patientId: user.id || user._id || ''
          };
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          this.router.navigate(['/medical/patient/rendezvous']);
        }

        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Identifiants incorrects';
        this.loading = false;
      }
    });
  }

  onSignup() {
    this.loading = true;
    this.error = '';

    this.authService.signup(this.signupData).subscribe({
      next: () => {
        this.isSignup = false;
        this.message = 'Compte créé avec succès';
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Erreur lors de la création du compte';
        this.loading = false;
      }
    });
  }
}
