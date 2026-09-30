import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username = '';
  password = '';
  errorMessage = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.loginFromApi(this.username, this.password).subscribe({
      next: (user) => {
        this.authService.saveUser(user);

        switch(user.role) {
          case 'secretaire': this.router.navigate(['/medical/dashboard']); break;
          case 'medecin':    this.router.navigate(['/medical/rendezvous']); break;
          case 'patient':    this.router.navigate(['/medical/patient/dashboard']); break;
          default:           this.router.navigate(['/medical/login']); break;
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Identifiants incorrects';
        this.loading = false;
      }
    });
  }
}
