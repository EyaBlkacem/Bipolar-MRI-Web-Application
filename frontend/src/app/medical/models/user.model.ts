export interface User {
  username: string;
  role: 'secretaire' | 'medecin' | 'patient';
  nom: string;
  patientId?: string;
  medecinId?: string;
}