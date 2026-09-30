import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface Message {
  from: string;
  to: string;
  fromName: string;
  message: string;
  date?: Date;
  createdAt?: Date;
  lu?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {

  private socket!: Socket;
  private apiUrl = 'http://localhost:3000/api';
  private serverUrl = 'http://localhost:3000';

  messages$ = new BehaviorSubject<Message[]>([]);
  onlineUsers$ = new BehaviorSubject<string[]>([]);
  unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  // Connecter au socket
  connect(userId: string): void {
    this.socket = io(this.serverUrl);

    this.socket.on('connect', () => {
      console.log('🔌 Socket connecté');
      this.socket.emit('register', userId);
    });

    this.socket.on('receiveMessage', (msg: Message) => {
      const current = this.messages$.value;
      this.messages$.next([...current, msg]);
      this.unreadCount$.next(this.unreadCount$.value + 1);
    });

    this.socket.on('onlineUsers', (users: string[]) => {
      this.onlineUsers$.next(users);
    });
  }

  
  disconnect(): void {
    if (this.socket) this.socket.disconnect();
  }

  sendMessage(to: string, message: string, from: string, fromName: string): void {
    this.socket.emit('sendMessage', { to, message, from, fromName });

  
    const current = this.messages$.value;
    this.messages$.next([...current, {
      from, to, fromName, message, date: new Date()
    }]);
  }

 
  getConversation(userId1: string, userId2: string): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.apiUrl}/messages/${userId1}/${userId2}`
    );
  }

 
  getUnreadCount(userId: string): void {
    this.http.get<{count: number}>(
      `${this.apiUrl}/messages/unread/${userId}`
    ).subscribe(data => this.unreadCount$.next(data.count));
  }


  markAsRead(from: string, to: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/messages/read/${from}/${to}`, {}
    );
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers$.value.includes(userId);
  }
}