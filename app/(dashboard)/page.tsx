'use client';
import { useState } from 'react';
import { Search, Edit2, ShieldAlert, UserPlus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { Role } from '@/types';

// Simulation de données pour l'exemple
const mockUsers = [
  { id: '1', nom: 'RAKOTO', prenom: 'Jean', email: 'rakoto@exam.mg', role: 'ADMIN', centre: 'National' },
  { id: '2', nom: 'RASOA', prenom: 'Marie', email: 'marie@centre.mg', role: 'RESPONSABLE', centre: 'Lycée Andohalo' },
  { id: '3', nom: 'ANDRY', prenom: 'Paul', email: 'andry@surv.mg', role: 'SURVEILLANT', centre: 'CEG Fianarantsoa' },
  { id: '4', nom: 'SOALY', prenom: 'Feno', email: 'soaly@candidat.mg', role: 'CANDIDAT', centre: '-' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  const handleRoleChange = (userId: string, newRole: Role) => {
    // Logique : appel API vers PATCH /api/v1/users/:id/role
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast.success(`Privilèges mis à jour avec succès.`);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Gestion des Utilisateurs</h1>
          <p className="text-sm text-[var(--text-secondary)]">Contrôle des accès et attribution des rôles au niveau national.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Rechercher un utilisateur..." 
              className="input-field pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="input-field w-40"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="ALL">Tous les rôles</option>
            <option value="ADMIN">Administrateurs</option>
            <option value="RESPONSABLE">Responsables</option>
            <option value="SURVEILLANT">Surveillants</option>
            <option value="CANDIDAT">Candidats</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden shadow-xl border border-[var(--bg-hover)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-hover)] text-[var(--text-muted)] text-xs uppercase font-bold tracking-wider">
              <th className="p-4">Utilisateur</th>
              <th className="p-4">Rôle & Privilèges</th>
              <th className="p-4">Centre affecté</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--bg-hover)] text-sm">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-[var(--text-primary)]">{u.prenom} {u.nom}</span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">{u.email}</span>
                  </div>
                </td>
                <td className="p-4">
                  <select 
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                    className={`badge ${u.role === 'ADMIN' ? 'badge-red' : u.role === 'RESPONSABLE' ? 'badge-violet' : u.role === 'SURVEILLANT' ? 'badge-amber' : 'badge-lime'} bg-transparent border-none cursor-pointer focus:ring-0`}
                  >
                    <option value="ADMIN">ADMIN NATIONAL</option>
                    <option value="RESPONSABLE">RESPONSABLE CENTRE</option>
                    <option value="SURVEILLANT">SURVEILLANT</option>
                    <option value="CANDIDAT">CANDIDAT</option>
                  </select>
                </td>
                <td className="p-4 text-[var(--text-secondary)] font-medium">
                  {u.centre}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="btn-icon hover:bg-blue-500/10 text-blue-400" title="Éditer les détails"><Edit2 size={16}/></button>
                    <button className="btn-icon hover:bg-red-500/10 text-red-400" title="Révoquer l'accès" onClick={() => toast.error("Action de sécurité critique")}><ShieldAlert size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}