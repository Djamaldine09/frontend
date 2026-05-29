import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export function getDownloadErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'PDF indisponible.';
  }

  if (!error.response) {
    return 'PDF indisponible : backend non joignable.';
  }

  const message = error.response.data instanceof Blob
    ? undefined
    : (error.response.data as { message?: string } | undefined)?.message;

  if (error.response.status === 401) {
    return 'Session expirée : reconnectez-vous pour télécharger le PDF.';
  }
  if (error.response.status === 403) {
    return 'Téléchargement refusé : votre rôle ne permet pas cette action.';
  }
  if (error.response.status === 404) {
    return message || 'Convocation non disponible pour ce candidat.';
  }

  return message || `PDF indisponible : erreur ${error.response.status}.`;
}

// Auth
export const authAPI = {
  register: (data: { nom: string; prenom: string; email: string; motDePasse: string; role?: string; telephone?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; motDePasse: string }) =>
    api.post('/auth/login', data),
};

// Examens
export const examensAPI = {
  list: () => api.get('/examens'),
  creer: (data: { titre: string; date: string; type: string }) =>
    api.post('/examens/creer', data),
  planning: () => api.get('/examens/planning'),
};

// Resultats
export const resultatsAPI = {
  saisirNotes: (candidatId: string, data: { examen: string; notes: { matiere: string; valeur: number; coefficient: number }[] }) =>
    api.post(`/resultats/candidat/${candidatId}/notes`, data),
};

// Documents
export const documentsAPI = {
  telechargerReleve: () =>
    api.get('/documents/releve-notes', { responseType: 'blob' }),
  telechargerConvocation: () =>
    api.get('/documents/convocation', { responseType: 'blob' }),
};

// Candidat (current user)
export type CandidatMe = {
  _id: string;
  numeroMatricule?: string;
  user: { _id: string; nom: string; prenom: string; email: string };
  dateNaissance?: string;
  lieuNaissance?: string;
  genre?: 'M' | 'F';
  cin?: string;
  examen?: string;
  serieFiliere?: string;
  etablissementPrecedent?: string;
  mentionPrecedente?: string;
  adresse?: string;
  telephone?: string;
  emailParent?: string;
  statutInscription: 'BROUILLON' | 'EN_ATTENTE_VALIDATION' | 'VALIDE' | 'REJETE';
  paiement: {
    statut: 'NON_PAYE' | 'EN_COURS' | 'PAYE' | 'ECHEC';
    montant?: number;
    modePaiement?: string;
    datePaiement?: string;
  };
  piecesJustificatives: {
    photoIdentite?: { url: string; status: 'valide' | 'attente' | 'manquant'; uploadedAt?: string };
    acteNaissance?: { url: string; status: 'valide' | 'attente' | 'manquant'; uploadedAt?: string };
    diplomePrecedent?: { url: string; status: 'valide' | 'attente' | 'manquant'; uploadedAt?: string };
  };
  centreAffecte?: {
    nom: string;
    ville: string;
    region: string;
    adresse: string;
    salle: string;
    numeroPlace: string;
    coords?: { lat: number; lng: number };
  };
  createdAt: string;
};

export type Convocation = {
  qrPayload: string;
  candidatId: string;
  examenId: string;
  examenTitre: string;
  dateEpreuve: string;
  heureDebut: string;
  heureFin: string;
  centre: { nom: string; adresse: string; ville: string };
  salle: string;
  numeroPlace: string;
  matricule: string;
  prenom: string;
  nom: string;
  pdfUrl?: string;
};

export type EpreuvePlanning = {
  _id: string;
  matiere: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  duree: number;
  coefficient: number;
  type: 'EPREUVE' | 'REVISION';
};

export const candidatAPI = {
  me: () => api.get<CandidatMe>('/candidats/me'),
  update: (data: Partial<CandidatMe>) => api.put<CandidatMe>('/candidats/me', data),
  convocation: () => api.get<Convocation>('/candidats/me/convocation'),
  planning: () => api.get<EpreuvePlanning[]>('/candidats/me/planning'),
  uploadDocument: (type: 'photoIdentite' | 'acteNaissance' | 'diplomePrecedent', file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('type', type);
    return api.post('/candidats/me/documents', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export type AdminDashboard = {
  users: { total: number; byRole: Record<string, number> };
  candidats: { total: number; payes: number; byStatus: Record<string, number> };
  examens: { totalTypes: number; resultats: number; resultatsPublies: number };
  centres: { total: number; regions: number; capacity: number; occupied: number; occupancyRate: number };
  security: { adminCount: number; jwtConfigured: boolean; corsOrigins: string[] };
};

export type AdminUser = {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'RESPONSABLE' | 'SURVEILLANT' | 'CANDIDAT';
  telephone?: string;
  createdAt?: string;
};

export type AdminCentre = {
  _id: string;
  nom: string;
  code: string;
  ville: string;
  region: string;
  capaciteMaximale: number;
  examensAcceptes: string[];
  candidatsAffectes: string[];
};

export type NationalReport = {
  generatedAt: string;
  candidatsByRegion: Array<{ _id: string | null; count: number }>;
  centresByRegion: Array<{ _id: string | null; centres: number; capacity: number }>;
  resultatsByStatus: Array<{ _id: string | null; count: number }>;
};

export const adminAPI = {
  dashboard: () => api.get<AdminDashboard>('/admin/dashboard'),
  report: () => api.get<NationalReport>('/admin/reports/national'),
  users: (params?: { role?: string; q?: string }) => api.get<AdminUser[]>('/admin/users', { params }),
  createUser: (data: { nom: string; prenom: string; email: string; motDePasse: string; role: string; telephone?: string }) =>
    api.post<AdminUser>('/admin/users', data),
  updateUser: (id: string, data: Partial<AdminUser>) => api.put<AdminUser>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  centres: () => api.get<AdminCentre[]>('/admin/centres'),
  createCentre: (data: Omit<AdminCentre, '_id' | 'candidatsAffectes'>) => api.post<AdminCentre>('/admin/centres', data),
  updateCentre: (id: string, data: Partial<AdminCentre>) => api.put<AdminCentre>(`/admin/centres/${id}`, data),
  deleteCentre: (id: string) => api.delete(`/admin/centres/${id}`),
};
