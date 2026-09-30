import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiAssessmentService } from '../../../services/ai-assessment.service';

@Component({
  selector: 'app-ai-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assessment.component.html',
  styleUrls: ['./ai-assessment.component.css']
})
export class AiAssessmentComponent implements OnInit {

  loading = false;
  uploading = false;
  error = '';

  result: any = null;

  assessments: any[] = [];

  selectedFile: File | null = null;

  // ============================================
  // FORM
  // ============================================

  answers: any = {

    age: '18-25',

    gender: 'Female',

    diagnosis: 'Yes',

    moodEpisode: 'Always',

    energyLevel: 'Always',

    sleepChanges: 'Always',

    workSchoolImpact: 'Always',

    suicidalThoughts: 'Always',

    rapidSpeech: 'Always',

    socialWithdrawal: 'Always',

    concentration: 'Always',

    qualityLife: 'Very Bad',

    notes: ''
  };

  constructor(
    private aiService: AiAssessmentService
  ) {}

  // ============================================
  // INIT
  // ============================================

  ngOnInit(): void {

    this.loadMyAssessments();

  }

  // ============================================
  // USER
  // ============================================

  get currentUser(): any {

    try {

      return JSON.parse(
        localStorage.getItem('user') || '{}'
      );

    } catch {

      return {};

    }
  }

  get patientId(): string {

    const user = this.currentUser;

    return (
      user?.id ||
      user?._id ||
      localStorage.getItem('userId') ||
      ''
    );
  }

  // ============================================
  // LOAD
  // ============================================

  loadMyAssessments(): void {

    if (!this.patientId) return;

    this.aiService.getByPatient(this.patientId)
      .subscribe({

        next: (data: any[]) => {

          this.assessments = data || [];

        },

        error: (err: any) => {

          console.error(err);

        }

      });
  }

  // ============================================
  // SUBMIT
  // ============================================

  submitQuestionnaire(): void {

    this.loading = true;

    this.error = '';

    this.result = null;

    const user = this.currentUser;

    // ============================================
    // IMPORTANT SCORE MAP
    // ============================================

    const scoreMap: any = {

      'Never': 0,
      'Jamais': 0,

      'Sometimes': 5,
      'Parfois': 5,

      'Often': 8,

      'Always': 10,
      'Toujours': 10,

      'Yes': 10,
      'Oui': 10,

      'No': 0,
      'Non': 0,

      'Very Bad': 10,
      'Très mauvaise': 10,

      'Bad': 7,
      'Moyenne': 5,

      'Good': 2
    };

    // ============================================
    // CALCUL SCORE
    // ============================================

    let totalScore = 0;

    Object.keys(this.answers).forEach((key) => {

      const value = this.answers[key];

      if (scoreMap[value] !== undefined) {

        totalScore += scoreMap[value];

      }
    });

    // MAX 100
    if (totalScore > 100) {

      totalScore = 100;
    }

    // ============================================
    // RISK
    // ============================================

    let risk = 'Low';

    if (totalScore >= 70) {

      risk = 'High';

    } else if (totalScore >= 40) {

      risk = 'Medium';
    }

    // ============================================
    // PAYLOAD
    // ============================================

    const payload = {

      patientId: this.patientId,

      patientName:
        user?.fullname ||
        user?.nom ||
        user?.name ||
        'Patient',

      patientEmail: user?.email || '',

      answers: this.answers,

      score: totalScore,

      riskLevel: risk
    };

    console.log('PAYLOAD = ', payload);

    this.aiService.submitForm(payload)
      .subscribe({

        next: (res: any) => {

          this.result = {

            ...res.assessment,

            score: totalScore,

            riskLevel: risk
          };

          this.loading = false;

          this.loadMyAssessments();

        },

        error: (err: any) => {

          console.error(err);

          this.error =
            err?.error?.message ||
            'Erreur analyse IA';

          this.loading = false;

        }

      });
  }

  // ============================================
  // FILE
  // ============================================

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.selectedFile =
      input.files &&
      input.files.length > 0
        ? input.files[0]
        : null;
  }

  // ============================================
  // MRI
  // ============================================

  uploadMRI(assessment?: any): void {

    const target = assessment || this.result;

    if (!target?.id && !target?._id) {

      this.error = 'Assessment introuvable.';

      return;
    }

    if (!this.selectedFile) {

      this.error = 'Choisis une image IRM.';

      return;
    }

    this.uploading = true;

    this.error = '';

    const reader = new FileReader();

    reader.onload = () => {

      const payload = {

        fileName: this.selectedFile?.name,

        mimeType: this.selectedFile?.type,

        dataUrl: reader.result
      };

      this.aiService.uploadMRI(
        target.id || target._id,
        payload
      ).subscribe({

        next: (res: any) => {

          this.result = res.assessment;

          alert(
            'IRM uploadée avec succès et transmise au docteur.'
          );

          this.uploading = false;

          this.selectedFile = null;

          this.loadMyAssessments();

        },

        error: (err: any) => {

          console.error(err);

          this.error =
            err?.error?.message ||
            'Erreur upload IRM';

          this.uploading = false;

        }

      });
    };

    reader.onerror = () => {

      this.error =
        'Impossible de lire le fichier IRM.';

      this.uploading = false;

    };

    reader.readAsDataURL(this.selectedFile);
  }
}