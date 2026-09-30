import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PatientSidebarComponent } from '../patient-space/patient-sidebar/patient-sidebar.component';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [RouterOutlet, PatientSidebarComponent],
  template: `
    <div class="patient-layout">
      <app-patient-sidebar></app-patient-sidebar>
      <main class="patient-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .patient-layout {
      display: flex;
      min-height: 100vh;
      background: #f0f4ff;
    }
    .patient-main {
      flex: 1;
      min-height: 100vh;
      padding: 28px 32px;
      overflow-y: auto;
      background: #f0f4ff;
    }
    @media (max-width: 768px) {
      .patient-main { padding: 16px; }
    }
  `]
})
export class PatientLayoutComponent {}
