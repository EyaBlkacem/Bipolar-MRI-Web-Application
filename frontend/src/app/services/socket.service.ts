import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;
  private readonly url = 'http://localhost:3000';

  connect(userId?: string): void {
    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 500
      });
    }

    if (userId) {
      const id = String(userId);
      this.socket.emit('register', id);
      this.socket.emit('joinRoom', id);
      this.socket.emit('joinChat', id);
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  joinUser(userId: string): void {
    this.connect(userId);
  }

joinVideoRoom(roomId: string, userId?: string, role?: string): void {

  this.connect();

  console.log('JOIN VIDEO ROOM:', roomId);

  this.socket?.emit('join-video-room', {
    roomId: roomId,
    userId: userId || 'anonymous',
    role: role || 'user'
  });
}
  leaveVideoRoom(roomId: string, userId?: string): void {
    this.socket?.emit('leave-video-room', { roomId, userId });
  }

  joinRoom(roomId: string): void {
    this.connect(roomId);
  }

  sendMessage(data: any): void {
    this.connect();
    this.socket?.emit('send-message', data);
    this.socket?.emit('sendMessage', data);
  }

  sendOffer(data: any): void {
    this.connect();
    this.socket?.emit('webrtc-offer', data);
  }

  sendAnswer(data: any): void {
    this.connect();
    this.socket?.emit('webrtc-answer', data);
  }

  sendIceCandidate(data: any): void {
    this.connect();
    this.socket?.emit('webrtc-ice-candidate', data);
  }

  onVideoUsers(): Observable<any> { return this.listen('video-users'); }
  onUserJoined(): Observable<any> { return this.listen('user-joined'); }
  onUserLeft(): Observable<any> { return this.listen('user-left'); }
  onOffer(): Observable<any> { return this.listen('webrtc-offer'); }
  onAnswer(): Observable<any> { return this.listen('webrtc-answer'); }
  onIceCandidate(): Observable<any> { return this.listen('webrtc-ice-candidate'); }
  onMessage(): Observable<any> { return this.listen('receive-message'); }
  onOnlineUsers(): Observable<string[]> { return this.listen('online-users'); }

  // Generic emit and listen methods
  emit(event: string, data: any): void {
    this.connect();
    this.socket?.emit(event, data);
  }

  listen<T = any>(event: string): Observable<T> {
    this.connect();
    return new Observable<T>(observer => {
      const handler = (data: T) => observer.next(data);
      this.socket?.on(event, handler);
      return () => { this.socket?.off(event, handler); };
    });
  }

  getSocket(): Socket | undefined {
    return this.socket;
  }
}
