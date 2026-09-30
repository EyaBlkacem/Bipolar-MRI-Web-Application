import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AssessmentService, Assessment } from '../../services/assessment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('moodCanvas') moodCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sleepCanvas') sleepCanvas!: ElementRef<HTMLCanvasElement>;

  patientId = '';
  assessments: Assessment[] = [];
  loading = true;
  showForm = false;
  submitting = false;
  successMsg = '';
  todayStr = '';

  // Formulaire bipolaire
  form: Omit<Assessment, 'id' | 'date' | 'patientId'> = {
    humeur: 5,
    heureSommeil: 7,
    qualiteSommeil: 'bonne',
    energie: 5,
    anxiete: 3,
    irritabilite: 3,
    penseesRapides: false,
    medicamentsPris: true,
    notes: ''
  };

  // Notifications & conseils
  notifications: { type: string; icon: string; message: string }[] = [];

  constructor(
    private assessmentService: AssessmentService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.todayStr = this.formatDate(new Date());
    this.patientId = this.authService.getPatientId();
    if (this.patientId) {
      this.loadAssessments();
    } else {
      this.loading = false;
      this.notifications.push({
        type: 'warning',
        icon: '⚠️',
        message: 'Votre compte n\'est pas encore lié à un dossier patient. Contactez votre secrétariat.'
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.assessments.length > 0) {
      this.drawCharts();
    }
  }

  loadAssessments(): void {
    this.loading = true;
    this.assessmentService.getByPatient(this.patientId).subscribe({
      next: (data) => {
        this.assessments = data.sort((a, b) =>
          new Date(a.date!).getTime() - new Date(b.date!).getTime()
        );
        this.loading = false;
        this.generateNotifications();
        setTimeout(() => this.drawCharts(), 100);
      },
      error: (e) => { console.error(e); this.loading = false; }
    });
  }

  generateNotifications(): void {
    this.notifications = [];
    if (this.assessments.length === 0) {
      this.notifications.push({
        type: 'info',
        icon: '📋',
        message: 'Remplissez votre premier formulaire d\'évaluation pour commencer le suivi de votre humeur.'
      });
      return;
    }

    const last = this.assessments[this.assessments.length - 1];

    if (last.humeur <= 3) {
      this.notifications.push({
        type: 'danger',
        icon: '🔴',
        message: 'Votre humeur est basse aujourd\'hui. N\'hésitez pas à contacter votre psychiatre.'
      });
    } else if (last.humeur >= 9) {
      this.notifications.push({
        type: 'warning',
        icon: '🟡',
        message: 'Humeur très élevée détectée — signes possibles de phase maniaque. Consultez votre médecin.'
      });
    } else {
      this.notifications.push({
        type: 'success',
        icon: '🟢',
        message: 'Votre humeur est stable. Continuez à suivre votre traitement.'
      });
    }

    if (last.heureSommeil < 6) {
      this.notifications.push({
        type: 'warning',
        icon: '😴',
        message: `Vous avez dormi seulement ${last.heureSommeil}h. Un manque de sommeil peut aggraver les symptômes bipolaires.`
      });
    } else if (last.heureSommeil > 10) {
      this.notifications.push({
        type: 'info',
        icon: '💤',
        message: `Vous avez dormi ${last.heureSommeil}h. Un excès de sommeil peut indiquer une phase dépressive.`
      });
    }

    if (!last.medicamentsPris) {
      this.notifications.push({
        type: 'danger',
        icon: '💊',
        message: 'Rappel : vous n\'avez pas pris vos médicaments lors de votre dernière évaluation.'
      });
    }

    if (last.anxiete >= 7) {
      this.notifications.push({
        type: 'warning',
        icon: '🌬️',
        message: 'Niveau d\'anxiété élevé. Essayez des exercices de respiration ou de pleine conscience.'
      });
    }

    if (last.penseesRapides) {
      this.notifications.push({
        type: 'warning',
        icon: '⚡',
        message: 'Pensées rapides signalées. Prenez note de vos activités et évitez les stimulants.'
      });
    }

    // Conseil hebdomadaire
    const conseils = [
      '💡 Conseil : Maintenez un rythme de sommeil régulier — c\'est essentiel dans la gestion du trouble bipolaire.',
      '💡 Conseil : L\'exercice physique modéré peut aider à stabiliser l\'humeur.',
      '💡 Conseil : Évitez l\'alcool et les drogues qui peuvent déclencher des épisodes.',
      '💡 Conseil : Tenez un journal de votre humeur pour mieux identifier vos déclencheurs.'
    ];
    this.notifications.push({
      type: 'tip',
      icon: '💡',
      message: conseils[new Date().getDay() % conseils.length]
    });
  }

  submitAssessment(): void {
    if (!this.patientId) return;
    this.submitting = true;
    const data: Assessment = { ...this.form, patientId: this.patientId };
    this.assessmentService.create(data).subscribe({
      next: () => {
        this.submitting = false;
        this.showForm = false;
        this.successMsg = 'Évaluation enregistrée avec succès !';
        this.resetForm();
        this.loadAssessments();
        setTimeout(() => this.successMsg = '', 4000);
      },
      error: (e) => { console.error(e); this.submitting = false; }
    });
  }

  resetForm(): void {
    this.form = {
      humeur: 5,
      heureSommeil: 7,
      qualiteSommeil: 'bonne',
      energie: 5,
      anxiete: 3,
      irritabilite: 3,
      penseesRapides: false,
      medicamentsPris: true,
      notes: ''
    };
  }

  deleteAssessment(id: string | undefined): void {
    if (!id) return;
    if (!confirm('Supprimer cette évaluation ?')) return;
    this.assessmentService.delete(id).subscribe({
      next: () => this.loadAssessments(),
      error: (e) => console.error(e)
    });
  }

  // --- Stats calculées ---
  get dernierAssessment(): Assessment | null {
    return this.assessments.length ? this.assessments[this.assessments.length - 1] : null;
  }

  get moyenneHumeur(): string {
    if (!this.assessments.length) return '—';
    const avg = this.assessments.reduce((s, a) => s + a.humeur, 0) / this.assessments.length;
    return avg.toFixed(1);
  }

  get moyenneSommeil(): string {
    if (!this.assessments.length) return '—';
    const avg = this.assessments.reduce((s, a) => s + a.heureSommeil, 0) / this.assessments.length;
    return avg.toFixed(1) + 'h';
  }

  get tauxMedoc(): string {
    if (!this.assessments.length) return '—';
    const pct = this.assessments.filter(a => a.medicamentsPris).length / this.assessments.length * 100;
    return pct.toFixed(0) + '%';
  }

  getHumeurLabel(v: number): string {
    if (v <= 2) return 'Très bas';
    if (v <= 4) return 'Bas';
    if (v <= 6) return 'Modéré';
    if (v <= 8) return 'Bon';
    return 'Très élevé';
  }

  getHumeurColor(v: number): string {
    if (v <= 3) return '#ef4444';
    if (v <= 5) return '#f97316';
    if (v <= 7) return '#eab308';
    return '#22c55e';
  }

  getQualiteLabel(q: string): string {
    const map: any = { mauvaise: '😴 Mauvaise', moyenne: '😐 Moyenne', bonne: '😊 Bonne', excellente: '😁 Excellente' };
    return map[q] || q;
  }

  getNotifClass(type: string): string {
    const map: any = {
      danger: 'notif-danger',
      warning: 'notif-warning',
      success: 'notif-success',
      info: 'notif-info',
      tip: 'notif-tip'
    };
    return map[type] || 'notif-info';
  }

  // --- Canvas Charts (vanilla canvas, no lib needed) ---
  drawCharts(): void {
    this.drawMoodChart();
    this.drawSleepChart();
  }

  drawMoodChart(): void {
    const canvas = this.moodCanvas?.nativeElement;
    if (!canvas || this.assessments.length < 1) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;
    const pad = { top: 20, right: 20, bottom: 40, left: 40 };
    const data = this.assessments.slice(-14);

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i += 2) {
      const y = pad.top + (h - pad.top - pad.bottom) * (1 - i / 10);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(i), pad.left - 5, y + 4);
    }

    if (data.length < 2) {
      // Single point
      const xPos = (w - pad.left - pad.right) / 2 + pad.left;
      const yPos = pad.top + (h - pad.top - pad.bottom) * (1 - data[0].humeur / 10);
      ctx.beginPath();
      ctx.arc(xPos, yPos, 5, 0, Math.PI * 2);
      ctx.fillStyle = this.getHumeurColor(data[0].humeur);
      ctx.fill();
      return;
    }

    const xStep = (w - pad.left - pad.right) / (data.length - 1);
    const points = data.map((a, i) => ({
      x: pad.left + i * xStep,
      y: pad.top + (h - pad.top - pad.bottom) * (1 - a.humeur / 10),
      val: a.humeur,
      date: new Date(a.date!)
    }));

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    grad.addColorStop(0, 'rgba(99,102,241,0.3)');
    grad.addColorStop(1, 'rgba(99,102,241,0)');
    ctx.beginPath();
    ctx.moveTo(points[0].x, h - pad.bottom);
    ctx.lineTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Points
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = this.getHumeurColor(p.val);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    const step = Math.ceil(points.length / 6);
    points.forEach((p, i) => {
      if (i % step === 0 || i === points.length - 1) {
        const d = p.date;
        ctx.fillText(`${d.getDate()}/${d.getMonth()+1}`, p.x, h - pad.bottom + 15);
      }
    });
  }

  drawSleepChart(): void {
    const canvas = this.sleepCanvas?.nativeElement;
    if (!canvas || this.assessments.length < 1) return;
    const ctx = canvas.getContext('2d')!;
    const w = canvas.width;
    const h = canvas.height;
    const pad = { top: 20, right: 20, bottom: 40, left: 40 };
    const data = this.assessments.slice(-14);

    ctx.clearRect(0, 0, w, h);

    // Grid & Y labels
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    [0, 4, 8, 12].forEach(v => {
      const y = pad.top + (h - pad.top - pad.bottom) * (1 - v / 12);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(v + 'h', pad.left - 5, y + 4);
    });

    // Zone idéale (7-9h)
    const yIdealBot = pad.top + (h - pad.top - pad.bottom) * (1 - 7 / 12);
    const yIdealTop = pad.top + (h - pad.top - pad.bottom) * (1 - 9 / 12);
    ctx.fillStyle = 'rgba(34,197,94,0.1)';
    ctx.fillRect(pad.left, yIdealTop, w - pad.left - pad.right, yIdealBot - yIdealTop);

    const barW = Math.max(8, (w - pad.left - pad.right) / data.length - 4);
    const xStep = (w - pad.left - pad.right) / data.length;

    data.forEach((a, i) => {
      const barH = (h - pad.top - pad.bottom) * (a.heureSommeil / 12);
      const x = pad.left + i * xStep + (xStep - barW) / 2;
      const y = h - pad.bottom - barH;

      let color = '#6366f1';
      if (a.heureSommeil < 6) color = '#ef4444';
      else if (a.heureSommeil > 10) color = '#f97316';
      else if (a.heureSommeil >= 7 && a.heureSommeil <= 9) color = '#22c55e';

      const gradBar = ctx.createLinearGradient(0, y, 0, h - pad.bottom);
      gradBar.addColorStop(0, color);
      gradBar.addColorStop(1, color + '88');
      ctx.fillStyle = gradBar;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 3);
      ctx.fill();
    });

    // X labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    const step = Math.ceil(data.length / 6);
    data.forEach((a, i) => {
      if (i % step === 0 || i === data.length - 1) {
        const d = new Date(a.date!);
        const x = pad.left + i * xStep + xStep / 2;
        ctx.fillText(`${d.getDate()}/${d.getMonth()+1}`, x, h - pad.bottom + 15);
      }
    });
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  formatDate(d: any): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  range(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }
}
