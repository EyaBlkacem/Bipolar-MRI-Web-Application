export interface RendezVous {
  id?: string;
  patient: any;
  medecin: any;
  date: Date | string;
  heure: string;
  motif: string;
  statut?: 'planifié' | 'confirmé' | 'annulé' | 'terminé';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}