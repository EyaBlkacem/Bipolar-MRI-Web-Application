import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../../services/theme.service';
import { PatientUserService } from '../../../services/patient-user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss']
})
export class PatientDashboardComponent implements OnInit {

  activeTab = signal<string>('dashboard');
  activeChatTab = signal<string>('chatbot');
  showNotifPanel = signal<boolean>(false);
  showProfileMenu = signal<boolean>(false);
  chatInput = signal<string>('');
  newMessage = '';
  loading = signal<boolean>(false);

  // Données du patient
  patient: any = {
    name: 'Chargement...',
    age: 0,
    id: '',
    avatar: '?',
    therapist: 'Dr. Mansouri',
    nextAppointment: '-',
    phase: 'Suivi',
    riskLevel: 'Modéré'
  };

  notifications: any[] = [];
  moodData: any[] = [];
  sleepData: any[] = [];
  episodes: any[] = [];
  questionnaires: any[] = [];
  appointments: any[] = [];
  chatMessages: any[] = [];
  tips: any[] = [
    { icon: '🌙', title: 'Hygiène du sommeil', text: 'Couchez-vous à heure fixe, évitez les écrans 1h avant le coucher.' },
    { icon: '🧘', title: 'Respiration 4-7-8', text: 'Inspirez 4s, retenez 7s, expirez 8s. Répétez 3 fois pour calmer l\'anxiété.' },
    { icon: '🚶', title: 'Marche quotidienne', text: '20 minutes de marche par jour améliorent significativement l\'humeur.' },
    { icon: '📓', title: 'Journal émotionnel', text: 'Notez 3 émotions ressenties aujourd\'hui et leur déclencheur.' }
  ];

  unreadCount = 0;

  // Questionnaire PHQ-9
  activeQuestionnaire: any = null;
  phq9Questions = [
    'Peu d\'intérêt ou de plaisir à faire les choses',
    'Se sentir triste, déprimé(e) ou sans espoir',
    'Difficultés à s\'endormir ou à dormir',
    'Se sentir fatigué(e) ou manquer d\'énergie',
    'Peu d\'appétit ou manger trop',
    'Se sentir nul(le) ou coupable',
    'Difficultés à se concentrer',
    'Bouger ou parler trop lentement / agitation',
    'Pensées suicidaires'
  ];
  phq9Answers: number[] = new Array(9).fill(-1);

  constructor(
    public theme: ThemeService,
    private patientUserService: PatientUserService
  ) {}

  ngOnInit() {
    this.theme.init();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);

    // Charger les données du patient
    this.patientUserService.getCurrentUser().subscribe({
      next: (user) => {
        this.patient = {
          name: user.name || user.fullname || 'Patient',
          age: user.age || 28,
          id: user.id || user._id,
          avatar: (user.name || user.fullname || 'P').charAt(0),
          therapist: user.therapist || 'Dr. Mansouri',
          nextAppointment: user.nextAppointment || '-',
          phase: user.phase || 'Suivi',
          riskLevel: user.riskLevel || 'Modéré'
        };
      },
      error: (err) => console.error('Erreur chargement utilisateur:', err)
    });

    // Charger les notifications
    this.patientUserService.getNotifications().subscribe({
      next: (notifs) => {
        this.notifications = notifs;
        this.unreadCount = notifs.filter(n => !n.read).length;
      },
      error: (err) => console.error('Erreur chargement notifications:', err)
    });

    // Charger l'historique d'humeur
    this.patientUserService.getMoodHistory().subscribe({
      next: (moods) => {
        this.moodData = moods && moods.length > 0 ? moods : this.getDefaultMoodData();
      },
      error: (err) => {
        console.error('Erreur chargement humeur:', err);
        this.moodData = this.getDefaultMoodData();
      }
    });

    // Charger l'historique de sommeil
    this.patientUserService.getSleepHistory().subscribe({
      next: (sleeps) => {
        this.sleepData = sleeps && sleeps.length > 0 ? sleeps : this.getDefaultSleepData();
      },
      error: (err) => {
        console.error('Erreur chargement sommeil:', err);
        this.sleepData = this.getDefaultSleepData();
      }
    });

    // Charger les épisodes
    this.patientUserService.getEpisodes().subscribe({
      next: (eps) => {
        this.episodes = eps || [];
      },
      error: (err) => console.error('Erreur chargement épisodes:', err)
    });

    // Charger les questionnaires
    this.patientUserService.getQuestionnaires().subscribe({
      next: (quests) => {
        this.questionnaires = quests || [];
      },
      error: (err) => console.error('Erreur chargement questionnaires:', err)
    });

    // Charger les rendez-vous
    this.patientUserService.getAppointments().subscribe({
      next: (appts) => {
        this.appointments = appts || [];
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement rendez-vous:', err);
        this.loading.set(false);
      }
    });
  }

  private getDefaultMoodData(): any[] {
    return [
      { day: 'Lun', score: 6, label: 'Lundi' },
      { day: 'Mar', score: 4, label: 'Mardi' },
      { day: 'Mer', score: 7, label: 'Mercredi' },
      { day: 'Jeu', score: 5, label: 'Jeudi' },
      { day: 'Ven', score: 3, label: 'Vendredi' },
      { day: 'Sam', score: 6, label: 'Samedi' },
      { day: 'Dim', score: 8, label: 'Dimanche' }
    ];
  }

  private getDefaultSleepData(): any[] {
    return [
      { day: 'Lun', hours: 6.5, quality: 'moyen' },
      { day: 'Mar', hours: 5.0, quality: 'mauvais' },
      { day: 'Mer', hours: 7.5, quality: 'bon' },
      { day: 'Jeu', hours: 6.0, quality: 'moyen' },
      { day: 'Ven', hours: 4.5, quality: 'mauvais' },
      { day: 'Sam', hours: 8.0, quality: 'bon' },
      { day: 'Dim', hours: 7.0, quality: 'bon' }
    ];
  }

  setTab(tab: string) {
    this.activeTab.set(tab);
  }

  toggleNotifPanel() {
    this.showNotifPanel.set(!this.showNotifPanel());
    if (this.showNotifPanel()) this.showProfileMenu.set(false);
  }

  toggleProfileMenu() {
    this.showProfileMenu.set(!this.showProfileMenu());
    if (this.showProfileMenu()) this.showNotifPanel.set(false);
  }

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
  }

  getMoodColor(score: number): string {
    if (score >= 7) return '#22c55e';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
  }

  getMoodHeight(score: number): string {
    return `${(score / 10) * 100}%`;
  }

  getSleepColor(quality: string): string {
    if (quality === 'bon') return '#6d4fc2';
    if (quality === 'moyen') return '#f59e0b';
    return '#ef4444';
  }

  getSleepHeight(hours: number): string {
    return `${(hours / 10) * 100}%`;
  }

  getEpisodeClass(type: string): string {
    if (type.includes('Dép')) return 'episode-dep';
    if (type.includes('Manie') || type.includes('Hypo')) return 'episode-man';
    return 'episode-mix';
  }

  getSeverityClass(sev: string): string {
    if (sev === 'Sévère') return 'sev-high';
    if (sev === 'Modéré') return 'sev-med';
    return 'sev-low';
  }

  openQuestionnaire(q: any) {
    if (q.status === 'En attente') {
      this.activeQuestionnaire = q;
      this.phq9Answers = new Array(9).fill(-1);
    }
  }

  setAnswer(idx: number, val: number) {
    this.phq9Answers[idx] = val;
  }

  submitQuestionnaire() {
    const total = this.phq9Answers.reduce((a, b) => a + (b >= 0 ? b : 0), 0);
    if (this.activeQuestionnaire) {
      this.patientUserService.submitQuestionnaire(this.activeQuestionnaire.id, this.phq9Answers).subscribe({
        next: () => {
          Swal.fire('Succès', 'Questionnaire soumis avec succès', 'success');
          this.activeQuestionnaire.status = 'Complété';
          this.activeQuestionnaire.score = total;
          this.activeQuestionnaire = null;
        },
        error: (err) => {
          console.error('Erreur:', err);
          Swal.fire('Erreur', 'Impossible de soumettre le questionnaire', 'error');
        }
      });
    }
  }

  sendChatMessage() {
    if (!this.newMessage.trim()) return;
    this.chatMessages.push({ sender: 'user', text: this.newMessage, time: new Date().toLocaleTimeString() });
    this.newMessage = '';
    setTimeout(() => {
      this.chatMessages.push({
        sender: 'bot',
        text: 'Je prends note de votre message. N\'hésitez pas à partager plus de détails sur ce que vous ressentez, ou à me poser des questions sur votre plan de soins.',
        time: new Date().toLocaleTimeString()
      });
    }, 800);
  }

  getAvgMood(): number {
    if (this.moodData.length === 0) return 0;
    const s = this.moodData.reduce((a, b) => a + (b.score || 0), 0);
    return Math.round(s / this.moodData.length * 10) / 10;
  }

  getAvgSleep(): number {
    if (this.sleepData.length === 0) return 0;
    const s = this.sleepData.reduce((a, b) => a + (b.hours || 0), 0);
    return Math.round(s / this.sleepData.length * 10) / 10;
  }
}
