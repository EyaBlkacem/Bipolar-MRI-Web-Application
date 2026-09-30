import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MedecinService } from '../../services/medecin.service';
import { AuthService } from '../../services/auth.service';
import { Medecin } from '../../models/medecin.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medecin-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './medecin-list.component.html',
  styleUrl: './medecin-list.component.css'
})
export class MedecinListComponent implements OnInit {

  medecins: Medecin[] = [];
  loading = false;

  constructor(
    private medecinService: MedecinService,
    public authService: AuthService
  ) {}

  ngOnInit(): void { this.loadMedecins(); }

  loadMedecins(): void {
  this.loading = true;
  
  this.medecinService.getAll().subscribe({
    next: (data) => { this.medecins = data; this.loading = false; },
    error: (err)  => { console.error(err); this.loading = false; }
  });
}
  deleteMedecin(id: string): void {
    Swal.fire({
      title: 'Supprimer ce psychiatre ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.medecinService.delete(id).subscribe({
          next: () => {
            Swal.fire({
              toast: true, position: 'top-end',
              icon: 'success', title: 'Psychiatre supprimé !',
              showConfirmButton: false, timer: 2500,
              timerProgressBar: true
            });
            this.loadMedecins();
          },
          error: (err) => console.error(err)
        });
      }
    });
  }
}