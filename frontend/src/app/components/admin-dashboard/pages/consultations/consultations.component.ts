import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ConsultationDataService } from '../../../../services/consultation-data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consultations',
  standalone: true,
 imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './consultations.component.html',
  styleUrls: ['./consultations.component.css']
})
export class ConsultationsComponent implements OnInit {

  consultations: any[] = [];

  searchTerm = '';
  selectedType = '';
  selectedStatus = '';

  loading = false;

  constructor(
    private consultationService: ConsultationDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {

    this.loading = true;

    this.consultationService.getAll().subscribe({

      next: (data: any) => {

        console.log('CONSULTATIONS = ', data);

        this.consultations = Array.isArray(data)
          ? data
          : [];

        this.loading = false;
      },

      error: (err: any) => {

        console.error('CONSULTATIONS ERROR:', err);

        Swal.fire(
          'Erreur',
          'Impossible de charger les consultations',
          'error'
        );

        this.loading = false;
      }
    });
  }

  get totalConsultations(): number {

    return this.consultations.length;
  }

  get onlineConsultations(): number {

    return this.consultations.filter(c =>
      c.type === 'online' ||
      c.source === 'psychiatre'
    ).length;
  }

  get clinicConsultations(): number {

    return this.consultations.filter(c =>
      c.type === 'clinic' ||
      c.type === 'présentiel'
    ).length;
  }

  get activeConsultations(): number {

    return this.consultations.filter(c =>
      c.status === 'active' ||
      c.status === 'confirmé'
    ).length;
  }

  filteredConsultations(): any[] {

    return this.consultations.filter(c => {

      const fullname = (c.fullname || '').toLowerCase();

      const email = (c.email || '').toLowerCase();

      const type = (c.type || '').toLowerCase();

      const status = (c.status || '').toLowerCase();

      const search = this.searchTerm.toLowerCase();

      const matchSearch =
        fullname.includes(search) ||
        email.includes(search);

      const matchType =
        this.selectedType === '' ||
        type === this.selectedType.toLowerCase();

      const matchStatus =
        this.selectedStatus === '' ||
        status === this.selectedStatus.toLowerCase();

      return matchSearch &&
             matchType &&
             matchStatus;
    });
  }

  // ======================================
  // START VIDEO CONSULTATION
  // ======================================

  startConsultation(consultation: any): void {

    console.log('CONSULTATION DATA = ', consultation);

    // IMPORTANT :
    // utiliser TOUJOURS le MEME ID
    // pour admin ET patient

  const patientId =
  consultation.patient_id ||
  consultation.patientId ||
  consultation.patient?._id ||
  consultation.userId ||
  consultation.user?._id ||
  consultation._id ||
  consultation.id;

    if (!patientId) {

      console.error('PATIENT ID INTROUVABLE');

      Swal.fire(
        'Erreur',
        'ID patient introuvable',
        'error'
      );

      return;
    }

    // ROOM FIXE
    // PAS DE DATE
    // PAS RANDOM
    // SINON chaque user aura une room différente

   const roomId =
  consultation.roomId ||
  `consultation-${patientId}`;

    console.log('ROOM ID = ', roomId);

    this.router.navigate([
      '/consultation-video',
      roomId
    ]);
  }

  // ======================================
  // DELETE
  // ======================================

  deleteConsultation(id: string): void {

    Swal.fire({
      title: 'Supprimer cette consultation ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {

      if (result.isConfirmed) {

        this.loading = true;

        this.consultationService.delete(id).subscribe({

          next: () => {

            Swal.fire(
              'Succès',
              'Consultation supprimée',
              'success'
            );

            this.loadConsultations();
          },

          error: (err: any) => {

            console.error('DELETE ERROR:', err);

            Swal.fire(
              'Erreur',
              'Impossible de supprimer la consultation',
              'error'
            );

            this.loading = false;
          }
        });
      }
    });
  }

  refresh(): void {

    this.loadConsultations();
  }

}