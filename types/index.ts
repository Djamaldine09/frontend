export type Role = 'ADMIN' | 'RESPONSABLE' | 'SURVEILLANT' | 'CORRECTEUR' | 'CANDIDAT';

export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  telephone?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  jwt?: string;
  user: User;
  message?: string;
}

export interface Candidat {
  _id: string;
  user: User | string;
  numeroMatricule?: string;
  dateNaissance: string;
  lieuNaissance: string;
  genre: 'M' | 'F';
  examen: string;
  serieFiliere: string;
  centreExamenSouhaite?: string;
  statutInscription: 'BROUILLON' | 'EN_ATTENTE_VALIDATION' | 'VALIDE' | 'REJETE';
  paiement: {
    statut: 'NON_PAYE' | 'EN_COURS' | 'PAYE' | 'ECHEC';
    referenceTransaction?: string;
    modePaiement?: 'MVOLA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY' | 'CARTE_BANCAIRE';
    datePaiement?: string;
    montant?: number;
  };
  piecesJustificatives: {
    photoIdentite?: string;
    acteNaissance?: string;
  };
  createdAt: string;
}

export interface Note {
  matiere: string;
  valeur: number;
  coefficient: number;
  correcteur: string;
}

export interface Resultat {
  _id: string;
  candidat: Candidat | string;
  examen: string;
  notes: Note[];
  moyenneGenerale: number;
  statutFinal: 'EN_ATTENTE' | 'ADMIS' | 'REFUSE' | 'REPECHAGE';
  createdAt: string;
}

export interface CentreExamen {
  _id: string;
  nom: string;
  code: string;
  ville: string;
  region: string;
  capaciteMaximale: number;
  examensAcceptes: string[];
  candidatsAffectes: string[];
  createdAt: string;
}
