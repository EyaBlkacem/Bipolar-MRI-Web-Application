export interface Patient {
  id?: string;
  nom: string;
  prenom: string;
  cin: string;
  dateNaissance: Date | string;
  telephone: string;
  email?: string;
  adresse?: string;
  sexe: 'Homme' | 'Femme';
  actif?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}