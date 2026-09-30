import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';
import { MedecinService } from '../../services/medecin.service';
import { RendezVousService } from '../../services/rendezvous.service';
import { Patient } from '../../models/patient.model';
import { Medecin } from '../../models/medecin.model';
import { RendezVous } from '../../models/rendezvous.model';

@Component({
  selector: 'app-mon-profil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mon-profil.component.html',
  styleUrl: './mon-profil.component.css'
})
export class MonProfilComponent implements OnInit {

  patient: Patient | null = null;
  medecins: Medecin[] = [];
  prochainRdv: RendezVous | null = null;
  totalRdv     = 0;
  rdvConfirmes = 0;
  rdvTermines  = 0;
  loading      = true;
  userName     = '';

  constructor(
    public authService: AuthService,
    private patientService: PatientService,
    private medecinService: MedecinService,
    private rdvService: RendezVousService
  ) {}

 ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  this.userName = user?.nom || user?.prenom || 'Patient';

  // Charger médecins enregistrés
  this.medecinService.getMedecinsEnregistres().subscribe({
    next: (data) => this.medecins = data,
    error: ()    => this.medecinService.getAll().subscribe({
      next: (data) => this.medecins = data
    })
  });

  // Récupérer patientId normalisé
  const patientId = this.authService.getPatientId();

  if (patientId) {
    this.patientService.getById(patientId).subscribe({
      next: (data) => { this.patient = data; this.loading = false; },
      error: ()    => { this.loading = false; }
    });

    this.rdvService.getByPatient(patientId).subscribe({
      next: (data) => {
        this.totalRdv     = data.length;
        this.rdvConfirmes = data.filter(r => r.statut === 'confirmé').length;
        this.rdvTermines  = data.filter(r => r.statut === 'terminé').length;

        const today = new Date();
        today.setHours(0,0,0,0);
        const futurs = data
          .filter(r => new Date(r.date) >= today &&
            (r.statut === 'planifié' || r.statut === 'confirmé'))
          .sort((a,b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        this.prochainRdv = futurs[0] || null;
      },
      error: (err) => console.error(err)
    });
  } else {
    this.loading = false;
  }
}

     

  getAge(): number {
    if (!this.patient?.dateNaissance) return 0;
    const diff = Date.now() - new Date(this.patient.dateNaissance).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
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