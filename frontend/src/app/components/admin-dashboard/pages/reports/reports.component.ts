import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../services/report.service';
import { PatientUserService } from '../../../../services/patient-user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {

  reports: any[] = [];
  forms: any[] = [];

  showForm = false;
  selectedForm: any = null;
  loading = false;

  currentReport: any = {
    form_id: null,
    diagnosis: '',
    recommendations: '',
    risk: 'medium'
  };

  constructor(
    private reportService: ReportService,
    private patientUserService: PatientUserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.loadForms();
    this.loadReports();
  }

  // Charger les formulaires (assessments)
  loadForms() {
    if (!this.isBrowser()) return;

    this.loading = true;
    this.patientUserService.getQuestionnaires().subscribe({
      next: (data: any) => {
        console.log('FORMS:', data);
        this.forms = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('ERROR FORMS:', err);
        Swal.fire('Erreur', 'Impossible de charger les formulaires', 'error');
        this.loading = false;
      }
    });
  }

  // Charger les rapports
  loadReports() {
    if (!this.isBrowser()) return;

    this.loading = true;
    this.reportService.getAll().subscribe({
      next: (data: any) => {
        console.log('REPORTS:', data);
        this.reports = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('ERROR REPORTS:', err);
        Swal.fire('Erreur', 'Impossible de charger les rapports', 'error');
        this.loading = false;
      }
    });
  }

  newReport(form?: any) {
    console.log("NEW REPORT CLICKED");
    this.showForm = true;

    this.currentReport = {
      form_id: form?.id || form?._id || null,
      diagnosis: '',
      recommendations: '',
      risk: 'medium'
    };
  }

  saveReport() {
    if (!this.currentReport.form_id) {
      Swal.fire('Erreur', 'Veuillez sélectionner un formulaire patient d\'abord', 'warning');
      return;
    }

    if (!this.currentReport.diagnosis || !this.currentReport.recommendations) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    this.loading = true;

    this.reportService.create(this.currentReport).subscribe({
      next: () => {
        Swal.fire('Succès', 'Rapport créé avec succès', 'success');
        this.showForm = false;
        this.loadReports();
      },
      error: (err) => {
        console.error('Erreur:', err);
        Swal.fire('Erreur', 'Impossible de créer le rapport', 'error');
        this.loading = false;
      }
    });
  }

  cancel() {
    this.showForm = false;
  }

  delete(id: string) {
    Swal.fire({
      title: 'Supprimer ce rapport ?',
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
        this.reportService.delete(id).subscribe({
          next: () => {
            Swal.fire('Succès', 'Rapport supprimé', 'success');
            this.loadReports();
          },
          error: (err) => {
            console.error('Erreur:', err);
            Swal.fire('Erreur', 'Impossible de supprimer le rapport', 'error');
            this.loading = false;
          }
        });
      }
    });
  }

  edit(report: any) {
    this.showForm = true;

    this.selectedForm = {
      id: report.form_id,
      fullname: report.fullname
    };

    this.currentReport = {
      form_id: report.form_id,
      diagnosis: report.diagnosis,
      recommendations: report.recommendations,
      risk: report.risk || 'medium',
      id: report.id
    };
  }

  get totalReports(): number {
    return this.reports.length;
  }

  get highRisk(): number {
    return this.reports.filter(r => r.risk === 'high').length;
  }

  get mediumRisk(): number {
    return this.reports.filter(r => r.risk === 'medium').length;
  }

  get lowRisk(): number {
    return this.reports.filter(r => r.risk === 'low').length;
  }
}
