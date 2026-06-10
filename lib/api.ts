import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 secondes timeout
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
  lister: () => api.get<Examen[]>('/examens'),
  creer: (data: CreateExamenDTO) => api.post<Examen>('/examens/creer', data),
  modifier: (id: string, data: Partial<CreateExamenDTO>) => 
    api.put<Examen>(`/examens/${id}`, data),
  supprimer: (id: string) => api.delete<void>(`/examens/${id}`),
  getDetails: (id: string) => api.get<Examen>(`/examens/${id}`),
};

export interface Examen {
  _id: string;
  titre: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  nombreCandidats: number;
  nombreCentres: number;
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE';
  description?: string;
  lieu?: string;
  createdAt: string;
}

export interface CreateExamenDTO {
  titre: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  description?: string;
  lieu?: string;
}
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
  create: () => api.post('/inscription/create', {}),
};

export type AdminDashboard = {
  users: { total: number; byRole: Record<string, number> };
  candidats: { total: number; payes: number; byStatus: Record<string, number> };
  examens: { totalTypes: number; resultats: number; resultatsPublies: number };
  centres: { total: number; regions: number; capacity: number; occupied: number; occupancyRate: number };
  repartitionRegionale: Array<{
    region: string;
    centres: number;
    capacity: number;
  }>;
  security: { adminCount: number; jwtConfigured: boolean; corsOrigins: string[] };
};

export type AdminUser = {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'RESPONSABLE' | 'SURVEILLANT' | 'CORRECTEUR' | 'CANDIDAT';
  telephone?: string;
  createdAt: string;
  updatedAt?: string;
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
  dashboard: () => api.get<AdminDashboard>('/admin/dashboard', { 
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
    params: { _t: Date.now() }
  }),
  report: () => api.get<NationalReport>('/admin/reports/national', { 
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
    params: { _t: Date.now() }
  }),
  getUsers: () => api.get<AdminUser[]>('/admin/users', { 
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
    params: { _t: Date.now() }
  }),
  createUser: (data: Partial<AdminUser> & { motDePasse: string }) => 
    api.post<AdminUser>('/admin/users', data),
  updateUser: (id: string, data: Partial<AdminUser> & { motDePasse?: string }) => 
    api.put<AdminUser>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete<void>(`/admin/users/${id}`),
  getCentres: () => api.get<AdminCentre[]>('/admin/centres', { 
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
    params: { _t: Date.now() }
  }),
  resetCandidatStatus: () => api.post('/admin/candidats/reset-status'),
  validateCandidat: (candidatId: string, statut: 'VALIDE' | 'REJETE') => 
    api.put(`/admin/candidats/${candidatId}/validate`, { statut }),
  createCentre: (data: Partial<AdminCentre>) => api.post<AdminCentre>('/admin/centres', data),
  updateCentre: (id: string, data: Partial<AdminCentre>) => api.put<AdminCentre>(`/admin/centres/${id}`, data),
  deleteCentre: (id: string) => api.delete<void>(`/admin/centres/${id}`),
};


// À AJOUTER dans lib/api.ts - Endpoints manquants et complémentaire

// ============ PRÉSENCES ============
export const presenceAPI = {
  scan: (qrCode: string) => api.post('/presence/scan', { qrCode }),
  
  // Récupérer l'historique des présences
  getHistory: (examenId?: string, params?: any) =>
    api.get('/presence/history', { params: { examenId, ...params } }),
  
  // Exporter les présences en CSV
  export: (examenId: string) =>
    api.get(`/presence/export/${examenId}`, { responseType: 'blob' }),
};

// ============ PAIEMENTS - Endpoints réels manquants ============
export const paiementAPI = {
  // Initier un paiement (Endpoint manquant au backend!)
  // À ajouter au backend: POST /api/paiements/initier
  initiate: (data: {
    montant: number;
    modePaiement: 'MVOLA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY' | 'CARTE_BANCAIRE';
    numeroTelephone?: string;
    carteToken?: string;
  }) => {
    // NOTE: Cet endpoint n'existe pas dans le backend actuel
    // Vous devez le créer: POST /api/paiements/initier
    return api.post('/paiements/initier', data);
  },
  
  // Vérifier le statut d'un paiement
  checkStatus: (transactionId: string) =>
    api.get(`/paiements/${transactionId}/status`),
  
  // Webhook pour callback du provider (déjà implémenté)
  webhook: (data: any) => api.post('/paiements/webhook', data),
  
  // Historique des paiements d'un candidat (Endpoint manquant!)
  getHistory: () => api.get('/paiements/history'),
  
  // Relancer un paiement
  retry: (candidatId: string) => api.post(`/paiements/${candidatId}/retry`),
};

// ============ CONVOCATION ============
export const convocationAPI = {
  // Déjà partiellement couvert par candidatAPI.convocation()
  // Ajouter:
  
  // Télécharger la convocation en PDF
  download: () => api.get('/documents/convocation', { responseType: 'blob' }),
  
  // Générer un QR code
  generateQR: (candidatId: string) => api.get(`/convocation/${candidatId}/qr`),
  
  // Vérifier la validité d'une convocation au centre
  verify: (qrCode: string) => api.post('/convocation/verify', { qrCode }),
};

// ============ EXAMENS - Endpoints complémentaires ============
export const examensExtendedAPI = {
  // Créer un examen (existe)
  create: (data: any) => api.post('/examens/creer', data),
  
  // Obtenir les détails d'un examen
  getById: (id: string) => api.get(`/examens/${id}`),
  
  // Mettre à jour un examen
  update: (id: string, data: any) => api.put(`/examens/${id}`, data),
  
  // Supprimer un examen
  delete: (id: string) => api.delete(`/examens/${id}`),
  
  // Ajouter des épreuves à un examen
  addEpreuves: (examenId: string, epreuves: Array<any>) =>
    api.post(`/examens/${examenId}/epreuves`, { epreuves }),
  
  // Récupérer les épreuves d'un examen
  getEpreuves: (examenId: string) => api.get(`/examens/${examenId}/epreuves`),
  
  // Affecter des candidats à un examen
  affectCandidats: (examenId: string, candidatIds: string[]) =>
    api.post(`/examens/${examenId}/affecter`, { candidatIds }),
};

// ============ DOCUMENTS ============
export const documentsAPI_extended = {
  // Déjà partiellement implémenté
  
  // Télécharger une pièce justificative
  downloadJustificatif: (type: string) =>
    api.get(`/documents/justificatif/${type}`, { responseType: 'blob' }),
  
  // Vérifier le statut des pièces justificatives
  checkStatus: () => api.get('/documents/piecesJustificatives/status'),
  
  // Générer un relevé de notes
  generateReleve: () =>
    api.get('/documents/releve-notes', { responseType: 'blob' }),
  
  // Générer un bulletin de versement
  generateBulletin: () =>
    api.get('/documents/bulletin-versement', { responseType: 'blob' }),
};

// ============ RÉSULTATS - Opérations complémentaires ============
export const resultatsExtendedAPI = {
  // Saisir les notes (existe)
  saisirNotes: (candidatId: string, data: any) =>
    api.post(`/resultats/candidat/${candidatId}/notes`, data),
  
  // Récupérer les résultats d'un candidat
  getByCandidat: (candidatId: string) =>
    api.get(`/resultats/candidat/${candidatId}`),
  
  // Récupérer les résultats d'un examen
  getByExamen: (examenId: string) => api.get(`/resultats/examen/${examenId}`),
  
  // Publier les résultats
  publish: (examenId: string) => api.post(`/resultats/examen/${examenId}/publish`),
  
  // Récupérer les statistiques des résultats
  getStats: (examenId?: string) =>
    api.get('/resultats/stats', { params: { examenId } }),
  
  // Exporter les résultats en CSV
  export: (examenId: string) =>
    api.get(`/resultats/export/${examenId}`, { responseType: 'blob' }),
};

// ============ ADMIN - Dashboard amélioré ============
export const adminExtendedAPI = {
  // Déjà partiellement implémenté
  
  // Récupérer les utilisateurs avec filtres
  getUsersFiltered: (params: any) => api.get('/admin/users', { params }),
  
  // Récupérer les statistiques détaillées
  getDetailedStats: () => api.get('/admin/stats/detailed'),
  
  // Récupérer les rapports par région
  getReportByRegion: (region: string) => api.get(`/admin/reports/region/${region}`),
  
  // Exporter les rapports
  exportReport: (format: 'csv' | 'pdf' | 'excel') =>
    api.get(`/admin/reports/export?format=${format}`, { responseType: 'blob' }),
  
  // Récupérer les logs d'audit
  getAuditLogs: (params?: any) => api.get('/admin/audit', { params }),
  
  // Affecter les candidats aux centres
  affectCandidatsToCentres: (data: any) => api.post('/admin/affectation', data),
  
  // Récupérer les affectations
  getAffectations: (params?: any) => api.get('/admin/affectation', { params }),
};

// ============ SMS AUTHENTICATION ============
export const smsAuthAPI = {
  // Envoyer un code SMS
  sendCode: (email: string) => api.post('/auth/sms/send', { email }),
  
  // Vérifier le code SMS
  verifyCode: (email: string, code: string) =>
    api.post('/auth/sms/verify', { email, code }),
  
  // Réenvoyer le code
  resendCode: (email: string) => api.post('/auth/sms/resend', { email }),
};

// ============ AFFECTATIONS ============
export const affectationAPI = {
  // Affecter un candidat à un centre
  affectToCenter: (candidatId: string, centreId: string, salle: string, numeroPlace: string) =>
    api.post('/affectation', { candidatId, centreId, salle, numeroPlace }),
  
  // Récupérer l'affectation d'un candidat
  getByCandidat: (candidatId: string) => api.get(`/affectation/candidat/${candidatId}`),
  
  // Récupérer les affectations d'un centre
  getByCentre: (centreId: string) => api.get(`/affectation/centre/${centreId}`),
  
  // Récupérer les affectations d'un examen
  getByExamen: (examenId: string) => api.get(`/affectation/examen/${examenId}`),
  
  // Modifier une affectation
  update: (affectationId: string, data: any) =>
    api.put(`/affectation/${affectationId}`, data),
  
  // Annuler une affectation
  cancel: (affectationId: string) => api.delete(`/affectation/${affectationId}`),
};

// ============ NOTIFICATIONS ============
export const notificationAPI = {
  // Récupérer les notifications
  getAll: () => api.get('/notifications'),
  
  // Marquer une notification comme lue
  markAsRead: (notificationId: string) =>
    api.put(`/notifications/${notificationId}/read`),
  
  // Envoyer une notification à tous les candidats
  sendBroadcast: (message: string, type: string) =>
    api.post('/notifications/broadcast', { message, type }),

  
  // Enregistrer le token FCM de l'utilisateur (Push notifications)
  registerFcmToken: (token: string, platform: string = 'web') =>
    api.post('/notifications/fcm-token', { token, platform }),

  // Supprimer le token FCM
  removeFcmToken: (token: string) =>
    api.delete('/notifications/fcm-token', { data: { token } }),

  // Marquer toutes comme lues
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// ============ RÉSULTATS PUBLICS (sans auth) ============
export interface PublicResult {
  matricule: string;
  nomComplet: string;
  examen: string;
  centre?: string;
  region?: string;
  moyenne: number;
  mention?: string;
  statut: 'ADMIS' | 'REFUSE' | 'REPECHAGE' | 'EN_ATTENTE';
  datePublication?: string;
  notes?: { matiere: string; valeur: number; coefficient: number }[];
}

export const publicAPI = {
  // Recherche d'un résultat par matricule (endpoint public, pas de JWT)
  getResultByMatricule: (matricule: string) =>
    axios.get<PublicResult>(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/public/resultats/${encodeURIComponent(matricule)}`,
      { timeout: 10000 }
    ),
};

// ============ STATISTIQUES AVANCÉES ============
export const statisticsAPI = {
  // Statistiques globales
  global: () => api.get('/statistics/global'),
  
  // Statistiques par centre
  byCentre: (centreId?: string) =>
    api.get('/statistics/centre', { params: { centreId } }),
  
  // Statistiques par région
  byRegion: (region?: string) =>
    api.get('/statistics/region', { params: { region } }),
  
  // Statistiques des résultats
  results: (examenId?: string) =>
    api.get('/statistics/results', { params: { examenId } }),
  
  // Taux de présence
  attendanceRate: (examenId?: string) =>
    api.get('/statistics/attendance', { params: { examenId } }),
};

// NOTE IMPORTANTE: Plusieurs endpoints n'existent pas encore dans le backend!
// Endpoints à créer au backend:
// 1. POST /api/paiements/initier - Initier un paiement
// 2. GET /api/paiements/history - Historique des paiements
// 3. POST /api/paiements/:id/retry - Relancer un paiement
// 4. POST /api/examens/:id - Détails d'un examen
// 5. POST /api/examens/:id/epreuves - Gestion des épreuves
// 6. POST /api/convocation/verify - Vérifier une convocation
// 7. POST /api/auth/sms/send - SMS authentication
// 8. POST /api/affectation - Affectation candidat-centre
// Et d'autres...
