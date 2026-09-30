
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  users: any[] = [];
  adminName: string = 'Admin';
  adminRole: string = '';
  adminAvatar: string = '';
  
  notifications: Notification[] = [];
  unreadNotifications: number = 0;
  showNotifications: boolean = false;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    public auth: AuthService,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
    private socket: SocketService
  ) {}

  ngOnInit() {
    this.initializeAdmin();
    this.loadNotifications();
    this.setupRealtimeUpdates();
    this.loadUsers();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initializeAdmin(): void {
    const currentUser = this.auth.getUser();
    if (currentUser) {
      this.adminName = currentUser.nom || currentUser.prenom || 'Admin';
      if (currentUser.prenom) {
        this.adminName = `${currentUser.prenom} ${currentUser.nom || ''}`.trim();
      }
      this.adminRole = currentUser.role || 'Administrateur';
      this.adminAvatar = currentUser.avatar || '';
      
      // Connect socket with admin ID
      this.socket.connect(currentUser._id || currentUser.id);
    }
  }

  private loadNotifications(): void {
    const user = this.auth.getUser();
    if (user) {
      const sub = this.notificationService.loadNotifications(user._id || user.id).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.updateUnreadCount();
        },
        error: (err) => console.error('Error loading notifications:', err)
      });
      this.subscriptions.add(sub);
    }
  }

  private setupRealtimeUpdates(): void {
    const notifSub = this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.updateUnreadCount();
    });
    this.subscriptions.add(notifSub);

    const unreadSub = this.notificationService.unreadCount$.subscribe(count => {
      this.unreadNotifications = count;
    });
    this.subscriptions.add(unreadSub);
  }

  private updateUnreadCount(): void {
    this.unreadNotifications = this.notifications.filter(n => !n.read).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markNotificationAsRead(notificationId: string | undefined): void {
    if (!notificationId) return;
    
    const sub = this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.read = true;
          this.updateUnreadCount();
        }
      }
    });
    this.subscriptions.add(sub);
  }

  markAllAsRead(): void {
    const user = this.auth.getUser();
    if (!user) return;
    
    const sub = this.notificationService.markAllAsRead(user._id || user.id).subscribe({
      next: () => {
        this.notifications.forEach(n => n.read = true);
        this.updateUnreadCount();
      }
    });
    this.subscriptions.add(sub);
  }

  deleteNotification(notificationId: string | undefined): void {
    if (!notificationId) return;
    
    const sub = this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateUnreadCount();
      }
    });
    this.subscriptions.add(sub);
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'appointment': 'fa-solid fa-calendar-check',
      'report': 'fa-solid fa-file-pdf',
      'message': 'fa-solid fa-envelope',
      'assessment': 'fa-solid fa-brain',
      'consultation': 'fa-solid fa-video'
    };
    return icons[type] || 'fa-solid fa-bell';
  }

  getUser() {
    return this.auth.getUser();
  }

  loadUsers() {
    const sub = this.userService.getUsers().subscribe(data => {
      this.users = data;
    });
    this.subscriptions.add(sub);
  }

  delete(id: number) {
    if (confirm('Delete this user ?')) {
      const sub = this.userService.deleteUser(id).subscribe(() => {
        this.loadUsers(); // refresh
      });
      this.subscriptions.add(sub);
    }
  }

  logout() {
    this.auth.logout();
    this.socket.disconnect();
    this.router.navigate(['/login']);
  }

  get visitedPatients() {
    return this.users.filter(u => u.lastVisit).length;
  }

  get noVisitPatients() {
    return this.users.filter(u => !u.lastVisit).length;
  }
}
