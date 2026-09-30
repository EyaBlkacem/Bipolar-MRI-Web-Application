import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  get currentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  getRoleBadge(): string {
    switch(this.authService.getRole()) {
      case 'medecin':    return 'Psychiatre';
      case 'secretaire': return 'Secrétaire';
      case 'patient':    return 'Patient';
      default:           return '';
    }
  }

  getRoleClass(): string {
    switch(this.authService.getRole()) {
      case 'medecin':    return 'role-medecin';
      case 'secretaire': return 'role-secretaire';
      case 'patient':    return 'role-patient';
      default:           return '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}