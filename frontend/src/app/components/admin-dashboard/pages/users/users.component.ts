import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../../services/socket.service';
import { UserManagementService } from '../../../../services/user-management.service';
import Swal from 'sweetalert2';

interface PatientUser {
  id: string;
  _id?: string;
  fullname: string;
  email: string;
  phone: string | null;
  lastVisit: string | null;
  visits_count: number;
  created_at?: string;
  status?: string;
}

interface PatientForm {
  fullname: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {

  users: PatientUser[] = [];
  onlineUsers: string[] = [];
  search = '';
  loading = false;
  isBrowser = false;
  errorMessage = '';
  showFilters = false;
  private subscriptions = new Subscription();

  // MODALS
  showAddModal = false;
  showViewModal = false;
  showEditModal = false;
  selectedUser: PatientUser | null = null;

  // FORMS
  addForm: PatientForm = {
    fullname: '',
    email: '',
    phone: ''
  };

  editForm: PatientForm = {
    fullname: '',
    email: '',
    phone: ''
  };

  constructor(
    private userService: UserManagementService,
    private socketService: SocketService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.socketService.connect();
      this.loadUsers();
      this.subscriptions.add(
        this.socketService.onOnlineUsers().subscribe(ids => this.onlineUsers = ids || [])
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // LOAD USERS
  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Impossible de charger les utilisateurs', 'error');
        this.loading = false;
      }
    });
  }

  // FILTERED USERS
  get filteredPatients(): PatientUser[] {
    const term = this.search.trim().toLowerCase();

    if (!term) {
      return this.users;
    }

    return this.users.filter(user =>
      user.fullname.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.phone ? user.phone.toLowerCase().includes(term) : false)
    );
  }

  // FILTER BUTTON
  toggleFilter(): void {
    this.showFilters = !this.showFilters;
  }

  isOnline(user: PatientUser): boolean {
    const id = String(user.id || user._id || '');
    return this.onlineUsers.includes(id);
  }

  // SORT
  sortPatients(): void {
    this.users.sort((a, b) => a.fullname.localeCompare(b.fullname));
  }

  // ADD MODAL
  openAddModal(): void {
    this.errorMessage = '';
    this.addForm = {
      fullname: '',
      email: '',
      phone: ''
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  // ADD PATIENT
  addPatient(): void {
    this.errorMessage = '';

    if (!this.addForm.fullname || !this.addForm.email || !this.addForm.phone) {
      this.errorMessage = 'Veuillez compléter les informations du patient.';
      return;
    }

    this.loading = true;
    this.userService.create(this.addForm).subscribe({
      next: (response) => {
        console.log('PATIENT ADDED', response);
        Swal.fire('Succès', 'Patient ajouté avec succès', 'success');
        this.closeAddModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Erreur lors de la création du patient', 'error');
        this.loading = false;
      }
    });
  }

  // VIEW
  view(user: PatientUser): void {
    this.selectedUser = user;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedUser = null;
  }

  // EDIT
  openEditModal(user: PatientUser): void {
    this.selectedUser = user;
    this.editForm = {
      fullname: user.fullname,
      email: user.email,
      phone: user.phone || ''
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  // UPDATE
  updatePatient(): void {
    if (!this.selectedUser) {
      return;
    }

    this.loading = true;
    const userId = this.selectedUser.id || this.selectedUser._id;
    
    this.userService.update(userId!, {
      fullname: this.editForm.fullname,
      email: this.editForm.email,
      phone: this.editForm.phone
    }).subscribe({
      next: () => {
        Swal.fire('Succès', 'Patient mis à jour avec succès', 'success');
        this.closeEditModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Erreur lors de la mise à jour', 'error');
        this.loading = false;
      }
    });
  }

  // REPORT
  generateReport(user: PatientUser): void {
    const userId = user.id || user._id;
    this.loading = true;

    this.userService.generateReport(userId!).subscribe({
      next: (report) => {
        Swal.fire('Succès', `Rapport généré pour ${user.fullname}`, 'success');
        console.log('Report:', report);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Erreur', 'Impossible de générer le rapport', 'error');
        this.loading = false;
      }
    });
  }

  // CHAT
  openChat(user: PatientUser): void {
    Swal.fire('Info', `Ouverture de la consultation avec ${user.fullname}`, 'info');
  }

  // BLOCK
  block(id: string): void {
    Swal.fire({
      title: 'Bloquer ce patient ?',
      text: 'Le patient ne pourra plus accéder à son compte.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, bloquer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.userService.blockUser(id).subscribe({
          next: () => {
            Swal.fire('Succès', 'Patient bloqué', 'success');
            this.loadUsers();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Erreur', 'Impossible de bloquer le patient', 'error');
            this.loading = false;
          }
        });
      }
    });
  }

  // DELETE
  delete(id: string): void {
    Swal.fire({
      title: 'Supprimer ce patient ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true;
        this.userService.delete(id).subscribe({
          next: () => {
            Swal.fire('Succès', 'Patient supprimé', 'success');
            this.loadUsers();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Erreur', 'Impossible de supprimer le patient', 'error');
            this.loading = false;
          }
        });
      }
    });
  }
}
