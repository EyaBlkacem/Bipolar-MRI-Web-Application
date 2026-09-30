import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  formData = {
    fullname: '',
    email: '',
    password: ''
  };

  message = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

 onSignup() {
  this.authService.signup(this.formData).subscribe({
    next: () => {
      this.router.navigate(['/login']); // 👈 LOGIN
    },
    error: (err) => {
      this.error = err.error?.message;
    }
  });
}
}
