import { Component, OnInit, OnDestroy, ViewChild,
         ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, Message } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface Contact {
  userId: string;
  nom: string;
  prenom: string;
  role: string;
  medecinId?: string;
  patientId?: string;
  online?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  contacts: Contact[] = [];
  selectedContact: Contact | null = null;
  messages: Message[] = [];
  newMessage = '';
  loading = false;
  currentUser: any;
  onlineUsers: string[] = [];

  constructor(
    private chatService: ChatService,
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

   
    this.chatService.connect(this.currentUser.id);

  
    this.chatService.messages$.subscribe(msgs => {
      if (this.selectedContact) {
        this.messages = msgs.filter(m =>
          (m.from === this.currentUser.id &&
           m.to === this.selectedContact!.userId) ||
          (m.from === this.selectedContact!.userId &&
           m.to === this.currentUser.id)
        );
      }
    });

   
    this.chatService.onlineUsers$.subscribe(users => {
      this.onlineUsers = users;
    });

   
    this.loadContacts();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }

  loadContacts(): void {
    this.http.get<any[]>('http://localhost:3000/api/auth/users').subscribe({
      next: (users) => {
        const currentId = this.currentUser.id;

        if (this.authService.isMedecin()) {
        
          this.contacts = users
            .filter(u => u.role === 'patient' && u.id !== currentId)
            .map(u => ({
              userId: u.id,
              nom: u.nom,
              prenom: u.prenom,
              role: u.role,
              patientId: u.patientId
            }));

        } else if (this.authService.isPatient()) {
          
          this.contacts = users
            .filter(u => u.role === 'medecin' && u.id !== currentId)
            .map(u => ({
              userId: u.id,
              nom: u.nom,
              prenom: u.prenom,
              role: u.role,
              medecinId: u.medecinId
            }));

        } else {
        
          this.contacts = users
            .filter(u => u.id !== currentId)
            .map(u => ({
              userId: u.id,
              nom: u.nom,
              prenom: u.prenom,
              role: u.role
            }));
        }
      }
    });
  }

  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    this.messages = [];
    this.loading = true;

    
    this.chatService.getConversation(
      this.currentUser.id,
      contact.userId
    ).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.loading = false;
        
        this.chatService.markAsRead(contact.userId, this.currentUser.id)
          .subscribe();
      },
      error: () => { this.loading = false; }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedContact) return;

    const msg = this.newMessage.trim();
    this.newMessage = '';

    this.chatService.sendMessage(
      this.selectedContact.userId,
      msg,
      this.currentUser.id,
      `${this.currentUser.prenom} ${this.currentUser.nom}`
    );

    
    this.messages = [...this.messages, {
      from: this.currentUser.id,
      to: this.selectedContact.userId,
      fromName: `${this.currentUser.prenom} ${this.currentUser.nom}`,
      message: msg,
      date: new Date()
    }];
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.includes(userId);
  }

  isMyMessage(msg: Message): boolean {
    return msg.from === this.currentUser.id;
  }

  getRoleLabel(role: string): string {
    const map: any = {
      'medecin': 'Psychiatre',
      'patient': 'Patient',
      'secretaire': 'Secrétaire'
    };
    return map[role] || role;
  }

  scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}