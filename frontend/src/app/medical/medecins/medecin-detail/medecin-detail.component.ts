import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MedecinService } from '../../services/medecin.service';
import { RendezVousService } from '../../services/rendezvous.service';
import { AuthService } from '../../services/auth.service';
import { Medecin } from '../../models/medecin.model';
import { RendezVous } from '../../models/rendezvous.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medecin-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './medecin-detail.component.html',
  styleUrl: './medecin-detail.component.css'
})
export class MedecinDetailComponent implements OnInit {

  medecin: Medecin | null = null;
  rendezvous: RendezVous[] = [];
  loading = false;

  rdvPlanifies = 0;
  rdvConfirmes = 0;
  rdvTermines  = 0;

  constructor(
    private medecinService: MedecinService,
    private rdvService: RendezVousService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loading = true;

    this.medecinService.getById(id).subscribe({
      next: (data) => { this.medecin = data; this.loading = false; },
      error: (err)  => { console.error(err); this.loading = false; }
    });

    this.rdvService.getAll({ medecinId: id }).subscribe({
      next: (data) => {
        this.rendezvous   = data;
        this.rdvPlanifies = data.filter(r => r.statut === 'planifié').length;
        this.rdvConfirmes = data.filter(r => r.statut === 'confirmé').length;
        this.rdvTermines  = data.filter(r => r.statut === 'terminé').length;
      },
      error: (err) => console.error(err)
    });
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

  deleteMedecin(): void {
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
        this.medecinService.delete(this.medecin!.id!).subscribe({
          next: () => {
            Swal.fire({
              toast: true, position: 'top-end',
              icon: 'success', title: 'Psychiatre supprimé !',
              showConfirmButton: false, timer: 2500,
              timerProgressBar: true
            });
            this.router.navigate(['/medical/medecins']);
          },
          error: (err) => console.error(err)
        });
      }
    });
  }
}