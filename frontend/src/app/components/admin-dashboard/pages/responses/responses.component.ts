import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MessageService } from '../../../../services/message.service';

@Component({
  selector: 'app-responses',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.css']
})
export class ResponsesComponent implements OnInit {
  users: any[] = [];
  messages: any[] = [];
  selectedUser: any = null;
  newMessage = '';
  searchTerm = '';
  currentUserId = '';
  currentUserName = 'Docteur';
  onlineUsers: string[] = [];
  isBrowser = false;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!this.isBrowser) return;

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      this.currentUserId = parsedUser.id || parsedUser._id;
      this.currentUserName = parsedUser.fullname || 'Docteur';
    }

    this.messageService.joinRoom(this.currentUserId);
    this.loadUsers();

    this.messageService.onMessage().subscribe((data: any) => {
      if (!this.selectedUser) return;
      const sameConversation =
        (String(data.sender_id) === String(this.selectedUser.id) && String(data.receiver_id) === String(this.currentUserId)) ||
        (String(data.sender_id) === String(this.currentUserId) && String(data.receiver_id) === String(this.selectedUser.id));
      if (sameConversation && !this.messages.some(m => m.id && m.id === data.id)) this.messages.push(data);
    });

    this.messageService.onOnlineUsers().subscribe((ids: string[]) => this.onlineUsers = ids || []);
  }

  loadUsers(): void {
    this.http.get<any[]>('http://localhost:3000/api/users/chat-users').subscribe({
      next: (res) => this.users = res,
      error: (err) => console.error(err)
    });
  }

  get filteredUsers(): any[] {
    const s = this.searchTerm.toLowerCase().trim();
    if (!s) return this.users;
    return this.users.filter(u => (u.fullname || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s));
  }

  isOnline(user: any): boolean { return this.onlineUsers.includes(String(user.id)); }

  selectUser(user: any): void {
    this.selectedUser = user;
    this.loadMessages();
  }

  loadMessages(): void {
    if (!this.selectedUser || !this.currentUserId) return;
    this.messageService.getMessages(this.currentUserId, this.selectedUser.id).subscribe({
      next: (res) => this.messages = res,
      error: (err) => console.error(err)
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedUser) return;
    const data = {
      sender_id: this.currentUserId,
      receiver_id: this.selectedUser.id,
      fromName: this.currentUserName,
      message: this.newMessage.trim()
    };

    this.messageService.sendMessage(data).subscribe({
      next: (res: any) => {
        this.messages.push(res.message || { ...data, created_at: new Date() });
        this.newMessage = '';
      },
      error: (err) => console.error(err)
    });
  }
}
