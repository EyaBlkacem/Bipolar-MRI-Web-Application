import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientService } from '../services/patient.service';
import { MedecinService } from '../services/medecin.service';
import { RendezVousService } from '../services/rendezvous.service';
import { AuthService } from '../services/auth.service';
import { RendezVous } from '../models/rendezvous.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  totalPatients  = 0;
  totalMedecins  = 0;
  totalRdv       = 0;
  rdvPlanifies   = 0;
  rdvConfirmes   = 0;
  rdvAnnules     = 0;
  rdvTermines    = 0;
  prochainRdv: RendezVous[] = [];
  loading = true;

  constructor(
    private patientService: PatientService,
    private medecinService: MedecinService,
    private rdvService: RendezVousService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.patientService.getAll().subscribe({
      next: (d) => this.totalPatients = d.length,
      error: (e) => console.error(e)
    });

    this.medecinService.getAll().subscribe({
      next: (d) => this.totalMedecins = d.length,
      error: (e) => console.error(e)
    });

    this.rdvService.getAll().subscribe({
      next: (data) => {
        this.totalRdv     = data.length;
        this.rdvPlanifies = data.filter(r => r.statut === 'planifié').length;
        this.rdvConfirmes = data.filter(r => r.statut === 'confirmé').length;
        this.rdvAnnules   = data.filter(r => r.statut === 'annulé').length;
        this.rdvTermines  = data.filter(r => r.statut === 'terminé').length;

        const today = new Date();
        today.setHours(0,0,0,0);
        this.prochainRdv = data
          .filter(r => new Date(r.date) >= today &&
            (r.statut === 'planifié' || r.statut === 'confirmé'))
          .slice(0, 5);

        this.loading = false;
      },
      error: (e) => { console.error(e); this.loading = false; }
    });
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  getPct(val: number): string {
    if (!this.totalRdv) return '0%';
    return (val / this.totalRdv * 100).toFixed(0) + '%';
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
}