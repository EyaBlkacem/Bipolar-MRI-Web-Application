import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-patient-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class PatientMessagesComponent implements OnInit {
  user: any = null;
  doctors: any[] = [];
  selectedDoctor: any = null;
  messages: any[] = [];
  newMessage = '';
  onlineUsers: string[] = [];

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const raw = localStorage.getItem('user');
    this.user = raw ? JSON.parse(raw) : null;
    const userId = this.user?.id || this.user?._id;
    if (!userId) return;
    this.messageService.joinRoom(userId);
    this.loadDoctors();
    this.messageService.onMessage().subscribe((data: any) => {
      if (!this.selectedDoctor) return;
      const userId = this.user?.id || this.user?._id;
      const sameConversation =
        (String(data.sender_id) === String(this.selectedDoctor.id || this.selectedDoctor._id) && String(data.receiver_id) === String(userId)) ||
        (String(data.sender_id) === String(userId) && String(data.receiver_id) === String(this.selectedDoctor.id || this.selectedDoctor._id));
      if (sameConversation && !this.messages.some(m => m.id && m.id === data.id)) this.messages.push(data);
    });
    this.messageService.onOnlineUsers().subscribe(ids => this.onlineUsers = ids || []);
  }

  loadDoctors(): void {
    this.http.get<any[]>('http://localhost:3000/api/doctors/admins').subscribe({
      next: (res) => {
        this.doctors = res;
        if (res.length) this.selectDoctor(res[0]);
      },
      error: (err) => console.error(err)
    });
  }

  selectDoctor(doctor: any): void {
    this.selectedDoctor = doctor;
    const userId = this.user?.id || this.user?._id;
    const doctorId = doctor?.id || doctor?._id;
    this.messageService.getMessages(userId, doctorId).subscribe({
      next: (res) => this.messages = res,
      error: (err) => console.error(err)
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedDoctor) return;
    const senderId = this.user?.id || this.user?._id;
    const receiverId = this.selectedDoctor?.id || this.selectedDoctor?._id;
    const data = {
      sender_id: senderId,
      receiver_id: receiverId,
      fromName: this.user.fullname,
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

  isOnline(id: string): boolean { return this.onlineUsers.includes(String(id)); }
}
