import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { ConsultationService }
from '../../services/consultation.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent
implements OnInit {

  consultation: any = null;

  user: any = null;

  constructor(
    private consultationService: ConsultationService,
    private router: Router
  ) {}

  ngOnInit(): void {

    if (typeof window !== 'undefined') {

      const userData =
        localStorage.getItem('user');

      if (userData) {

        this.user = JSON.parse(userData);

        this.loadConsultation();

      }

    }

  }

  loadConsultation(): void {

    this.consultationService
      .getPatientConsultation(this.user.id)
      .subscribe({

        next: (res: any) => {

          this.consultation = res;

          console.log(
            'Consultation loaded:',
            res
          );

        },

        error: (err: any) => {

          console.error(
            'Error loading consultation:',
            err
          );

        }

      });

  }

  joinConsultation(): void {

    if (
      !this.consultation ||
      !this.consultation.roomId
    ) {
      return;
    }

    this.router.navigate([
      '/consultation-video',
      this.consultation.roomId
    ]);

  }

}
