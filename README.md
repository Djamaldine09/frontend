# Frontend — Système de Gestion des Examens MG

Frontend **Next.js 15** (App Router) connecté au backend `Djamaldine09/backend-gestion`.

## Stack technique

- **Next.js 15** avec App Router & TypeScript
- **Tailwind CSS** + CSS variables custom (thème sombre)
- **Axios** avec intercepteurs (JWT auto-inject & 401 redirect)
- **react-hot-toast** pour les notifications
- **Sora** (Google Fonts) comme typographie principale

## Lancer le projet

```bash
npm install
# Configurer l'URL du backend dans .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure des routes

| Route | Rôles | Description |
|-------|-------|-------------|
| `/login` | Tous | Page de connexion |
| `/register` | Tous | Création de compte |
| `/dashboard` | Tous | Tableau de bord selon le rôle |
| `/candidats` | ADMIN, RESPONSABLE, SURVEILLANT | Gestion des dossiers |
| `/examens` | Tous | Liste et création d'examens |
| `/resultats` | Tous | Saisie et consultation des notes |
| `/paiements` | ADMIN, RESPONSABLE, CANDIDAT | Suivi des paiements |
| `/centres` | ADMIN, RESPONSABLE | Gestion des centres |

## Rôles et accès

- **ADMIN** — accès complet
- **RESPONSABLE** — validation dossiers, saisie résultats, centres
- **SURVEILLANT** — saisie des notes uniquement
- **CANDIDAT** — dossier personnel, paiement, résultats, téléchargement relevé PDF

## Variables d'environnement

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Connexion API

Le fichier `lib/api.ts` centralise tous les appels :
- Token JWT stocké dans `localStorage`, injecté automatiquement
- Redirection `/login` sur 401
