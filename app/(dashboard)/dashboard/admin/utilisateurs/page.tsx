'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI, type AdminUser } from '@/lib/api';
import { Plus, Edit2, Trash2, Shield, Users, Mail, Phone, RefreshCw } from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'badge-red',
  RESPONSABLE: 'badge-blue',
  SURVEILLANT: 'badge-yellow',
  CORRECTEUR: 'badge-purple',
  CANDIDAT: 'badge-green',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  RESPONSABLE: 'Responsable',
  SURVEILLANT: 'Surveillant',
  CORRECTEUR: 'Correcteur',
  CANDIDAT: 'Candidat',
};

export default function UtilisateursAdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
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

  // 🔥 CHARGER LES VRAIES DONNÉES DU BACKEND
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (err: any) {
      console.error('Erreur chargement utilisateurs:', err);
      toast.error('Impossible de charger la liste des utilisateurs');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user]);

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
    
    // Validation
    if (!form.nom || !form.prenom || !form.email) {
      toast.error('Le nom, prénom et email sont requis');
      return;
    }
    
    if (!editing && !form.motDePasse) {
      toast.error('Le mot de passe est requis pour un nouvel utilisateur');
      return;
    }

    if (form.motDePasse && form.motDePasse.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        // Pour la modification, on n'envoie le mot de passe que s'il est rempli
        const updateData = { ...form };
        if (!updateData.motDePasse) {
          delete updateData.motDePasse;
        }
        await adminAPI.updateUser(editing, updateData);
        toast.success('Utilisateur modifié avec succès');
      } else {
        await adminAPI.createUser(form);
        toast.success('Utilisateur créé avec succès');
      }
      
      // Reset form et recharger
      setForm({ nom: '', prenom: '', email: '', motDePasse: '', role: 'SURVEILLANT', telephone: '' });
      setShowForm(false);
      setEditing(null);
      await fetchUsers(); // Recharger la liste
    } catch (err: any) {
      console.error('Erreur:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de l\'opération';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return;
    
    try {
      await adminAPI.deleteUser(id);
      toast.success('Utilisateur supprimé avec succès');
      await fetchUsers(); // Recharger la liste
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleEdit = (u: AdminUser) => {
    setForm({
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      motDePasse: '', // On laisse vide pour la modification
      role: u.role,
      telephone: u.telephone || '',
    });
    setEditing(u._id);
    setShowForm(true);
  };

  // Filtrer les utilisateurs
  const filtered = users.filter(u => {
    const matchSearch = `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Statistiques
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    responsables: users.filter(u => u.role === 'RESPONSABLE').length,
    surveillants: users.filter(u => u.role === 'SURVEILLANT').length,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 14 }}>Chargement des utilisateurs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.6px', color: 'var(--text-primary)' }}>
            Gestion des utilisateurs
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            Créer et gérer les comptes utilisateurs (admins, surveillants, responsables, correcteurs)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn-ghost"
            onClick={fetchUsers}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCw size={16} />
            Actualiser
          </button>
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
      </div>

      {/* Statistiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total', value: stats.total, tone: 'var(--tile-sky)' },
          { label: 'Administrateurs', value: stats.admins, tone: 'var(--tile-rose)' },
          { label: 'Responsables', value: stats.responsables, tone: 'var(--tile-lila)' },
          { label: 'Surveillants', value: stats.surveillants, tone: 'var(--tile-mint)' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </div>
          </div>
        ))}
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
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Nom *</label>
                <input
                  className="input-field"
                  placeholder="Rakoto"
                  value={form.nom}
                  onChange={e => setForm({ ...form, nom: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Prénom *</label>
                <input
                  className="input-field"
                  placeholder="Jean"
                  value={form.prenom}
                  onChange={e => setForm({ ...form, prenom: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Email *</label>
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
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Téléphone</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+261 34 XX XXX XX"
                  value={form.telephone}
                  onChange={e => setForm({ ...form, telephone: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                  Mot de passe {!editing && '*'}
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder={editing ? 'Laissez vide pour conserver' : '••••••••'}
                  value={form.motDePasse}
                  onChange={e => setForm({ ...form, motDePasse: e.target.value })}
                  required={!editing}
                  minLength={6}
                />
                {editing && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Laissez vide pour conserver le mot de passe actuel
                  </p>
                )}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Rôle *</label>
                <select
                  className="input-field"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  required
                >
                  <option value="SURVEILLANT">Surveillant</option>
                  <option value="RESPONSABLE">Responsable</option>
                  <option value="CORRECTEUR">Correcteur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
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

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input-field"
          placeholder="🔍 Rechercher par nom, prénom ou email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
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
          <option value="CORRECTEUR">Correcteur</option>
        </select>
      </div>

      {/* Tableau des utilisateurs */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Aucun utilisateur trouvé</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {users.length === 0 
              ? 'Commencez par créer votre premier utilisateur' 
              : 'Aucun utilisateur ne correspond à vos critères de recherche'}
          </p>
          {users.length === 0 && (
            <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: 16 }}>
              <Plus size={16} /> Créer un utilisateur
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Utilisateur', 'Email', 'Téléphone', 'Rôle', 'Créé le', 'Actions'].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
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
                      {ROLE_LABELS[u.role] || u.role}
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
                      title="Modifier"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ padding: '6px 10px', fontSize: 12, color: 'var(--accent-red)' }}
                      onClick={() => handleDelete(u._id)}
                      title="Supprimer"
                      disabled={u._id === user._id} // Empêcher la suppression de son propre compte
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Note de sécurité */}
      {filtered.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, background: 'var(--tile-sky)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Shield size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Note: Vous ne pouvez pas supprimer votre propre compte. Pour modifier votre mot de passe, utilisez la page "Mon profil".
        </div>
      )}
    </div>
  );
}