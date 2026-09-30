import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private api = 'http://localhost:3000/api/bipolar/messages';

  constructor(private http: HttpClient, private socket: SocketService) {}

  joinRoom(userId: string) { this.socket.joinUser(userId); }

  getMessages(sender: string, receiver: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/${sender}/${receiver}`);
  }

  sendMessage(data: any): Observable<any> {
    return this.http.post(this.api, data);
  }

  emitRealtime(data: any): void { this.socket.sendMessage(data); }
  onMessage(): Observable<any> { return this.socket.onMessage(); }
  onOnlineUsers(): Observable<string[]> { return this.socket.onOnlineUsers(); }
}
