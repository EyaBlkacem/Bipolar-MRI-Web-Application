import { Routes } from '@angular/router';

// =====================================================
// PSYCHIATRE (admin/patient)
// =====================================================
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { LoginComponent as PsyLoginComponent } from './pages/login/login.component';
import { UsersComponent } from './components/admin-dashboard/pages/users/users.component';
import { FormsComponent } from './components/admin-dashboard/pages/forms/forms.component';
import { ReportsComponent } from './components/admin-dashboard/pages/reports/reports.component';
import { AppointmentsComponent } from './components/admin-dashboard/pages/appointments/appointments.component';
import { ResponsesComponent } from './components/admin-dashboard/pages/responses/responses.component';
import { ConsultationsComponent } from './components/admin-dashboard/pages/consultations/consultations.component';
import { FormComponent } from './components/user-dashboard/pages/form/form.component';

// =====================================================
// MEDICAL – commun
// =====================================================
import { LoginComponent as MedLoginComponent } from './medical/login/login.component';
import { RegisterComponent } from './medical/register/register.component';
import { DashboardComponent } from './medical/dashboard/dashboard.component';
import { ChatComponent } from './medical/chat/chat.component';
import { PatientListComponent } from './medical/patients/patient-list/patient-list.component';
import { PatientFormComponent } from './medical/patients/patient-form/patient-form.component';
import { PatientDetailComponent } from './medical/patients/patient-detail/patient-detail.component';
import { MedecinListComponent } from './medical/medecins/medecin-list/medecin-list.component';
import { MedecinFormComponent } from './medical/medecins/medecin-form/medecin-form.component';
import { MedecinDetailComponent } from './medical/medecins/medecin-detail/medecin-detail.component';
import { RendezVousListComponent } from './medical/rendezvous/rendezvous-list/rendezvous-list.component';
import { RendezVousFormComponent } from './medical/rendezvous/rendezvous-form/rendezvous-form.component';
import { authGuard } from './medical/guards/auth.guard';
import { roleGuard } from './medical/guards/role.guard';

// =====================================================
// MEDICAL – Espace Patient (nouveau)
// =====================================================
import { PatientLayoutComponent } from './medical/patient-layout/patient-layout.component';
import { MonProfilComponent } from './medical/patient-space/mon-profil/mon-profil.component';
import { MesRendezVousComponent } from './medical/patient-space/mes-rendezvous/mes-rendezvous.component';
import { TrouverMedecinComponent } from './medical/patient-space/trouver-medecin/trouver-medecin.component';
import { PatientDashboardComponent } from './medical/patient-space/patient-dashboard/patient-dashboard.component';
import { PatientMessagesComponent } from './medical/patient-space/messages/messages.component';
import { AiAssessmentComponent } from './medical/patient-space/ai-assessment/ai-assessment.component';

export const routes: Routes = [

  // Racine → login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // =====================================================
  // PSYCHIATRE – Login
  // =====================================================
  { path: 'login', component: PsyLoginComponent },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.component').then(m => m.SignupComponent)
  },

  // =====================================================
  // PSYCHIATRE – Admin Dashboard
  // =====================================================
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'dashboard-home', pathMatch: 'full' },
      { path: 'dashboard-home', component: DashboardHomeComponent },
      { path: 'patients',       component: UsersComponent },
      { path: 'assessments',    component: FormsComponent },
      { path: 'reports',        component: ReportsComponent },
      { path: 'appointments',   component: AppointmentsComponent },
      { path: 'messages',       component: ResponsesComponent },
      { path: 'consultations',  component: ConsultationsComponent }
    ]
  },

  // =====================================================
  // PSYCHIATRE – Formulaire rapide
  // =====================================================
  { path: 'user-form', component: AiAssessmentComponent },
  {
    path: 'consultation-video/:roomId',
    loadComponent: () =>
      import('./components/consultation-video/consultation-video.component')
        .then(m => m.ConsultationVideoComponent)
  },

  // =====================================================
  // MEDICAL – Login & Register
  // =====================================================
  { path: 'medical/login',    component: MedLoginComponent },
  { path: 'medical/register', component: RegisterComponent },

  // =====================================================
  // MEDICAL – Secrétaire / Médecin
  // =====================================================
  {
    path: 'medical/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire'] }
  },
  { path: 'medical/chat', component: ChatComponent, canActivate: [authGuard] },
  {
    path: 'medical/patients',
    component: PatientListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire', 'medecin'] }
  },
  {
    path: 'medical/patients/new',
    component: PatientFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire'] }
  },
  {
    path: 'medical/patients/edit/:id',
    component: PatientFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire'] }
  },
  {
    path: 'medical/patients/:id',
    component: PatientDetailComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire', 'medecin'] }
  },
  {
    path: 'medical/medecins',
    component: MedecinListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire'] }
  },
  {
    path: 'medical/medecins/new',
    component: MedecinFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire'] }
  },
  {
    path: 'medical/medecins/edit/:id',
    component: MedecinFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire'] }
  },
  {
    path: 'medical/medecins/:id',
    component: MedecinDetailComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire', 'medecin'] }
  },
  {
    path: 'medical/rendezvous',
    component: RendezVousListComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire', 'medecin'] }
  },
  {
    path: 'medical/rendezvous/new',
    component: RendezVousFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire', 'medecin', 'patient'] }
  },
  {
    path: 'medical/rendezvous/edit/:id',
    component: RendezVousFormComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['secretaire', 'medecin', 'patient'] }
  },

  // =====================================================
  // MEDICAL – Espace Patient (avec navbar via PatientLayout)
  // =====================================================
  {
    path: 'medical/patient',
    component: PatientLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['patient'] },
    children: [
      { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    component: PatientDashboardComponent },
      { path: 'profil',       component: MonProfilComponent },
      { path: 'rendezvous',   component: MesRendezVousComponent },
      { path: 'messages',     component: PatientMessagesComponent },
      { path: 'ai-assessment', component: AiAssessmentComponent },
      { path: 'trouver-medecin', component: TrouverMedecinComponent }
    ]
  },

  // =====================================================
  // WILDCARD — DOIT ÊTRE EN DERNIER
  // =====================================================
  { path: '**', redirectTo: 'login' }
];
