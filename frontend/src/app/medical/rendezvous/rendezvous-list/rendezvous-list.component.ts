import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RendezVousService } from '../../services/rendezvous.service';
import { AuthService } from '../../services/auth.service';
import { RendezVous } from '../../models/rendezvous.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rendezvous-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './rendezvous-list.component.html',
  styleUrl: './rendezvous-list.component.css'
})
export class RendezVousListComponent implements OnInit {

  rendezvous: RendezVous[] = [];
  loading = false;
  filters = { dateDebut: '', dateFin: '', statut: '' };

  constructor(
    private rdvService: RendezVousService,
    public authService: AuthService
  ) {}

  ngOnInit(): void { this.loadRdv(); }

  getMedecinId(): string {
    const user = this.authService.getCurrentUser();
    if (!user?.medecinId) return '';
    return typeof user.medecinId === 'object'
      ? (user.medecinId as any)?._id || (user.medecinId as any)?.id || ''
      : user.medecinId;
  }

  loadRdv(): void {
    this.loading = true;

    if (this.authService.isMedecin()) {
      const medecinId = this.getMedecinId();

      if (!medecinId) {
        this.rendezvous = [];
        this.loading = false;
        return;
      }

      const filters = { ...this.filters, medecinId };

      this.rdvService.getAll(filters).subscribe({
        next: (data) => { this.rendezvous = data; this.loading = false; },
        error: (err)  => { console.error(err); this.loading = false; }
      });

    } else {
      this.rdvService.getAll(this.filters).subscribe({
        next: (data) => { this.rendezvous = data; this.loading = false; },
        error: (err)  => { console.error(err); this.loading = false; }
      });
    }
  }

  resetFilters(): void {
    this.filters = { dateDebut: '', dateFin: '', statut: '' };
    this.loadRdv();
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

  changerStatut(rdv: RendezVous, statut: string): void {
    this.rdvService.update(rdv.id!, { statut }).subscribe({
      next: () => {
        Swal.fire({
          toast: true, position: 'top-end',
          icon: 'success',
          title: `RDV marqué "${statut}" !`,
          showConfirmButton: false,
          timer: 2000, timerProgressBar: true
        });
        this.loadRdv();
      },
      error: (err) => console.error(err)
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
              icon: 'success', title: 'RDV supprimé !',
              showConfirmButton: false, timer: 2000,
              timerProgressBar: true
            });
            this.loadRdv();
          },
          error: (err) => console.error(err)
        });
      }
    });
  }
}