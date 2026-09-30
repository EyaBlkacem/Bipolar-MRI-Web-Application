import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-consultation-video',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultation-video.component.html',
  styleUrls: ['./consultation-video.component.css']
})
export class ConsultationVideoComponent implements OnInit, OnDestroy {

  @ViewChild('localVideo')
  localVideo!: ElementRef<HTMLVideoElement>;

  @ViewChild('remoteVideo')
  remoteVideo!: ElementRef<HTMLVideoElement>;

  roomId = '';

  participants = 1;

  localStream!: MediaStream;

  remoteReady = false;

  error = '';

  micEnabled = true;
  camEnabled = true;

  // IMPORTANT
  role = 'user';

  // IMPORTANT
  offerCreated = false;

  // IMPORTANT
  peerConnection!: RTCPeerConnection;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService
  ) {}

  async ngOnInit(): Promise<void> {

    // ROOM
    this.roomId =
      this.route.snapshot.paramMap.get('roomId') || '';

    if (!this.roomId || this.roomId.includes('undefined')) {

      this.error = 'Room invalide';

      return;
    }

    // USER
    const user =
      JSON.parse(localStorage.getItem('user') || '{}');

    this.role = user?.role || 'user';

    try {

      // CAMERA + MICRO
      this.localStream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

      this.localVideo.nativeElement.srcObject =
        this.localStream;

      // PEER CONNECTION
      this.peerConnection =
        new RTCPeerConnection({
          iceServers: [
            {
              urls: 'stun:stun.l.google.com:19302'
            }
          ]
        });

      // ADD TRACKS
      this.localStream.getTracks().forEach(track => {

        this.peerConnection.addTrack(
          track,
          this.localStream
        );
      });

      // REMOTE VIDEO
      this.peerConnection.ontrack = (event) => {

        console.log('REMOTE STREAM RECEIVED');

        this.remoteReady = true;

        this.remoteVideo.nativeElement.srcObject =
          event.streams[0];
      };

      // ICE CANDIDATE
      this.peerConnection.onicecandidate = (event) => {

        if (event.candidate) {

          this.socketService.sendIceCandidate({
            roomId: this.roomId,
            candidate: event.candidate
          });
        }
      };

      // JOIN ROOM
      this.socketService.joinVideoRoom(
        this.roomId,
        user?._id || user?.id,
        this.role
      );

      // =====================================
      // VIDEO USERS
      // =====================================

      this.socketService.onVideoUsers()
      .subscribe(async (users: any) => {

        console.log('VIDEO USERS:', users);

        // backend peut envoyer array ou object

        if (Array.isArray(users)) {

          this.participants = users.length;

        } else if (users?.count) {

          this.participants = users.count;

        } else if (users?.users) {

          this.participants = users.users.length;

        } else {

          this.participants = 1;
        }

        console.log('PARTICIPANTS =', this.participants);

        // ADMIN crée OFFER

        if (
          this.participants >= 2 &&
          this.role === 'admin' &&
          !this.offerCreated
        ) {

          this.offerCreated = true;

          try {

            console.log('ADMIN CREATING OFFER');

            const offer =
              await this.peerConnection.createOffer();

            await this.peerConnection.setLocalDescription(
              offer
            );

            this.socketService.sendOffer({
              roomId: this.roomId,
              offer
            });

          } catch (err) {

            console.error(err);
          }
        }
      });

      // =====================================
      // OFFER
      // =====================================

      this.socketService.onOffer()
      .subscribe(async (data: any) => {

        console.log('OFFER RECEIVED');

        // admin ignore offer
        if (this.role === 'admin') return;

        try {

          await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );

          const answer =
            await this.peerConnection.createAnswer();

          await this.peerConnection.setLocalDescription(
            answer
          );

          this.socketService.sendAnswer({
            roomId: this.roomId,
            answer
          });

        } catch (err) {

          console.error(err);
        }
      });

      // =====================================
      // ANSWER
      // =====================================

      this.socketService.onAnswer()
      .subscribe(async (data: any) => {

        console.log('ANSWER RECEIVED');

        // user ignore answer
        if (this.role !== 'admin') return;

        try {

          await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );

        } catch (err) {

          console.error(err);
        }
      });

      // =====================================
      // ICE
      // =====================================

      this.socketService.onIceCandidate()
      .subscribe(async (data: any) => {

        try {

          if (data?.candidate) {

            await this.peerConnection.addIceCandidate(
              new RTCIceCandidate(data.candidate)
            );
          }

        } catch (err) {

          console.error(err);
        }
      });

    } catch (err: any) {

      console.error(err);

      this.error =
        'Impossible d’accéder caméra/micro';
    }
  }

  // =====================================
  // MICRO
  // =====================================

  toggleMicro(): void {

    this.micEnabled = !this.micEnabled;

    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = this.micEnabled;
    });
  }

  // =====================================
  // CAMERA
  // =====================================

  toggleCamera(): void {

    this.camEnabled = !this.camEnabled;

    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = this.camEnabled;
    });
  }

  // =====================================
  // LEAVE
  // =====================================

  leaveCall(): void {

    this.socketService.leaveVideoRoom(this.roomId);

    this.peerConnection?.close();

    if (this.localStream) {

      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
    }

    this.router.navigate([
      '/admin-dashboard/consultations'
    ]);
  }

  // =====================================
  // DESTROY
  // =====================================

  ngOnDestroy(): void {

    this.peerConnection?.close();

    if (this.localStream) {

      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  }
}