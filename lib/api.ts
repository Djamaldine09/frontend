import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
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
};
