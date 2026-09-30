export interface Medecin {
  id?: string;
  nom: string;
  prenom: string;
  specialite: string;
  telephone: string;
  email?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  actif?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}