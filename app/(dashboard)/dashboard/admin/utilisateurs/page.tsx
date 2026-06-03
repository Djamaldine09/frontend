'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Plus, Edit2, Trash2, Shield, Loader } from 'lucide-react';

interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'ADMIN' | 'RESPONSABLE' | 'SURVEILLANT' | 'CANDIDAT';
  telephone?: string;
  createdAt?: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'badge-red',
  RESPONSABLE: 'badge-blue',
  SURVEILLANT: 'badge-yellow',
  CANDIDAT: 'badge-green',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  RESPONSABLE: 'Responsable',
  SURVEILLANT: 'Surveillant',
  CANDIDAT: 'Candidat',
};

export default function UtilisateursAdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    role: 'SURVEILLANT',
    telephone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // DÉCLARER fetchUsers AVANT de l'utiliser
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/users');
      
      let usersData = [];
      if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else if (response.data && typeof response.data === 'object') {
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          usersData = possibleArrays[0];
        } else {
          usersData = [];
        }
      } else {
        usersData = [];
      }
      
      setUsers(usersData);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des utilisateurs';
      setError(message);
      toast.error(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // MAINTENANT on peut l'utiliser dans useEffect
  useEffect(() => {
    fetchUsers();
  }, []);

  // Vérifier permission
  if (user?.role !== 'ADMIN') {
    return (
      <div className="card" style={{ padding: 28, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div className="tile tile-sm" style={{ background: 'var(--tile-rose)', flexShrink: 0 }}>
          <Shield size={17} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
            Accès administrateur requis
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
            Seuls les administrateurs peuvent accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.email || (!editing && !form.motDePasse)) {
      toast.error('Les champs requis doivent être complétés');
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        const response = await api.put(`/admin/users/${editing}`, form);
        setUsers(users.map(u => u._id === editing ? response.data : u));
        toast.success('Utilisateur modifié');
      } else {
        const response = await api.post('/admin/users', form);
        setUsers([response.data, ...users]);
        toast.success('Utilisateur créé');
      }
      setForm({ nom: '', prenom: '', email: '', motDePasse: '', role: 'SURVEILLANT', telephone: '' });
      setShowForm(false);
      setEditing(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      toast.success('Utilisateur supprimé');
    } catch (err: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (u: User) => {
    setForm({ 
      nom: u.nom, 
      prenom: u.prenom, 
      email: u.email, 
      motDePasse: '', 
      role: u.role, 
      telephone: u.telephone || '' 
    });
    setEditing(u._id);
    setShowForm(true);
  };

  const filtered = users.filter(u => {
    const matchSearch = `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>
            Gestion des utilisateurs
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            {users.length} utilisateurs dans la base de données
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) setEditing(null);
            setForm({ nom: '', prenom: '', email: '', motDePasse: '', role: 'SURVEILLANT', telephone: '' });
          }}
        >
          {showForm ? '✕ Annuler' : <><Plus size={16} /> Créer un utilisateur</>}
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(88,166,255,0.3)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 18, color: 'var(--text-primary)' }}>
            {editing ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
          </h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <div>
                <label>Nom *</label>
                <input
                  className="input-field"
                  placeholder="Rakoto"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Prénom *</label>
                <input
                  className="input-field"
                  placeholder="Jean"
                  value={form.prenom}
                  onChange={e => setForm({ ...form, prenom: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Email *</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="jean@example.mg"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Téléphone</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+261 34 XX XXX XX"
                  value={form.telephone}
                  onChange={e => setForm({ ...form, telephone: e.target.value })}
                />
              </div>
              {!editing && (
                <div>
                  <label>Mot de passe *</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={form.motDePasse}
                    onChange={e => setForm({ ...form, motDePasse: e.target.value })}
                    required
                  />
                </div>
              )}
              <div>
                <label>Rôle *</label>
                <select
                  className="input-field"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  required
                >
                  <option value="SURVEILLANT">Surveillant</option>
                  <option value="RESPONSABLE">Responsable</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                  setForm({ nom: '', prenom: '', email: '', motDePasse: '', role: 'SURVEILLANT', telephone: '' });
                }}
              >
                Annuler
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader size={24} className="animate-spin" style={{ marginRight: 12, color: 'var(--text-secondary)' }} />
          Chargement des utilisateurs...
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="card" style={{ padding: 16, background: 'var(--tile-rose)', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Filtres et tableau */}
      {!loading && !error && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <input
              type="text"
              className="input-field"
              placeholder="🔍 Rechercher par nom ou email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />
            <select
              className="input-field"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ width: 200 }}
            >
              <option value="">Tous les rôles</option>
              <option value="ADMIN">Administrateur</option>
              <option value="RESPONSABLE">Responsable</option>
              <option value="SURVEILLANT">Surveillant</option>
            </select>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Utilisateur', 'Email', 'Téléphone', 'Rôle', 'Créé le', 'Actions'].map((h, index) => (
                    <th key={index} style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((u, i) => (
                    <tr
                      key={u._id}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 500, color: 'var(--text-primary)', fontSize: 14 }}>
                        {u.prenom} {u.nom}
                       </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {u.email}
                       </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                        {u.telephone || '—'}
                       </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${ROLE_COLORS[u.role]}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                       </td>
                      <td style={{ padding: '14px 20px', fontSize: 12, color: 'var(--text-muted)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                       </td>
                      <td style={{ padding: '14px 20px', display: 'flex', gap: 6 }}>
                        <button
                          className="btn-ghost"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => handleEdit(u)}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="btn-ghost"
                          style={{ padding: '6px 10px', fontSize: 12, color: 'var(--accent-red)' }}
                          onClick={() => handleDelete(u._id)}
                        >
                          <Trash2 size={12} />
                        </button>
                       </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}