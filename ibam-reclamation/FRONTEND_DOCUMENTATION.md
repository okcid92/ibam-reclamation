# 📱 Frontend IBAM Réclamations - Documentation

## 🏗️ Architecture

Le frontend est construit avec **React 19** et **Tailwind CSS 4**, suivant une architecture modulaire et professionnelle.

### Structure des dossiers

```
resources/js/
├── components/          # Composants réutilisables
│   ├── StatusBadge.jsx     # Badge de statut des réclamations
│   ├── ClaimCard.jsx       # Carte d'affichage des réclamations
│   └── ClaimFilters.jsx    # Filtres pour les réclamations
├── context/             # Contextes React
│   └── AuthContext.jsx     # Gestion de l'authentification
├── layouts/             # Layouts de page
│   └── Layout.jsx          # Layout principal avec navigation
├── pages/               # Pages de l'application
│   ├── LoginNew.jsx        # Page de connexion améliorée
│   ├── DashboardStudentNew.jsx      # Dashboard étudiant
│   ├── DashboardTeacher.jsx         # Dashboard enseignant
│   ├── DashboardScolarite.jsx       # Dashboard scolarité
│   ├── DashboardDirector.jsx        # Dashboard directeur académique
│   ├── DashboardAssistantDirector.jsx # Dashboard DA adjoint
│   └── CreateClaimNew.jsx           # Formulaire de réclamation
├── app-new.jsx          # Point d'entrée avec routage
└── bootstrap.js         # Configuration Axios
```

## 👥 Rôles et Accès

### 🎓 Étudiant (`ETUDIANT`)
- **Routes:** `/student/*`
- **Fonctionnalités:**
  - Consulter ses réclamations avec statistiques
  - Créer une nouvelle réclamation avec upload de fichiers
  - Suivre l'état d'avancement en temps réel
  - Filtrer par statut (toutes, en cours, validées, rejetées)

### 👨🏫 Enseignant (`ENSEIGNANT`)
- **Routes:** `/teacher/*`
- **Fonctionnalités:**
  - Voir uniquement les réclamations de ses matières
  - Traiter les demandes (approuver/rejeter)
  - Proposer une note corrigée
  - Ajouter des commentaires détaillés

### 🏫 Scolarité (`SCOLARITE`)
- **Routes:** `/scolarite/*`
- **Fonctionnalités:**
  - Réceptionner toutes les nouvelles réclamations
  - Vérifier la recevabilité des demandes
  - Finaliser les corrections de notes
  - Informer les étudiants des décisions

### 🎓 Directeur Académique (`DIRECTEUR_ACADEMIQUE`)
- **Routes:** `/director/*`
- **Fonctionnalités:**
  - Supervision globale du processus
  - Transmission aux enseignants concernés
  - Vue d'ensemble de toutes les réclamations
  - Rapports et statistiques

### 🎓 Directeur Académique Adjoint (`DIRECTEUR_ACADEMIQUE_ADJOINT`)
- **Routes:** `/assistant-director/*`
- **Fonctionnalités:**
  - Centraliser les retours des enseignants
  - Valider les décisions intermédiaires
  - Transmettre à la scolarité
  - Suivi des délais de traitement

## 🔄 Workflow Implémenté

Le frontend respecte exactement le workflow défini dans le README :

1. **Étudiant** → Crée une réclamation
2. **Scolarité** → Vérifie la recevabilité
3. **Directeur Académique** → Transmet à l'enseignant
4. **Enseignant** → Traite la demande
5. **DA Adjoint** → Valide la décision
6. **Scolarité** → Finalise et informe l'étudiant

## 🎨 Design System

### Couleurs
- **Primaire:** Bleu (`blue-600`, `blue-700`)
- **Succès:** Vert (`green-600`, `green-100`)
- **Erreur:** Rouge (`red-600`, `red-100`)
- **Attention:** Jaune (`yellow-600`, `yellow-100`)
- **Info:** Indigo (`indigo-600`, `indigo-100`)

### Composants Réutilisables

#### StatusBadge
```jsx
<StatusBadge status="validee" size="lg" />
```
Affiche le statut avec les bonnes couleurs et libellés.

#### ClaimCard
```jsx
<ClaimCard 
    claim={claim}
    onAction={handleAction}
    canProcess={true}
    userRole="ENSEIGNANT"
    showActions={true}
/>
```
Carte complète pour afficher une réclamation avec actions contextuelles.

#### ClaimFilters
```jsx
<ClaimFilters 
    currentFilter={filter}
    onFilterChange={setFilter}
    userRole="SCOLARITE"
    claimCounts={counts}
/>
```
Filtres intelligents adaptés au rôle de l'utilisateur.

## 🔐 Sécurité Frontend

### Authentification
- Token JWT stocké dans localStorage
- Vérification automatique au chargement
- Redirection selon le rôle
- Déconnexion sécurisée

### Contrôle d'Accès
- Routes protégées par rôle
- Composant `PrivateRoute` avec validation
- Redirection automatique vers le bon dashboard
- Gestion des erreurs d'autorisation

### Validation des Données
- Validation côté client des formulaires
- Vérification des types de fichiers
- Limitation de taille des uploads (5MB)
- Sanitisation des entrées utilisateur

## 📱 Responsive Design

- **Mobile First:** Optimisé pour tous les écrans
- **Breakpoints Tailwind:** `sm`, `md`, `lg`, `xl`
- **Navigation adaptative:** Menu burger sur mobile
- **Cartes empilables:** Layout flexible selon l'écran
- **Tableaux responsifs:** Scroll horizontal si nécessaire

## 🚀 Performance

### Optimisations
- **Lazy Loading:** Chargement différé des composants
- **Memoization:** React.memo pour les composants lourds
- **Debouncing:** Recherche et filtres optimisés
- **Pagination:** Limitation des résultats affichés

### Bundle Splitting
- Séparation par routes avec React.lazy
- Chunks optimisés par Vite
- CSS critique inline
- Assets optimisés automatiquement

## 🧪 Tests et Qualité

### Structure de Tests
```
tests/
├── components/          # Tests des composants
├── pages/              # Tests des pages
├── context/            # Tests des contextes
└── utils/              # Tests des utilitaires
```

### Outils Recommandés
- **Jest:** Framework de test
- **React Testing Library:** Tests des composants
- **MSW:** Mock des API
- **Cypress:** Tests E2E

## 🔧 Configuration

### Variables d'Environnement
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="IBAM Réclamations"
VITE_UPLOAD_MAX_SIZE=5242880
```

### Scripts NPM
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "jest",
  "test:e2e": "cypress run"
}
```

## 📊 Monitoring

### Métriques Importantes
- Temps de chargement des pages
- Taux d'erreur des requêtes API
- Utilisation des fonctionnalités par rôle
- Performance des uploads de fichiers

### Logging
- Erreurs JavaScript capturées
- Actions utilisateur trackées
- Performance des composants mesurée
- Erreurs API loggées avec contexte

## 🔄 Déploiement

### Build de Production
```bash
npm run build
```

### Optimisations Automatiques
- Minification CSS/JS
- Compression des images
- Tree shaking
- Code splitting
- Cache busting

## 📚 Ressources

### Documentation Technique
- [React 19 Documentation](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Vite Build Tool](https://vitejs.dev/)
- [React Router v6](https://reactrouter.com/)

### Standards de Code
- **ESLint:** Configuration stricte
- **Prettier:** Formatage automatique
- **Husky:** Git hooks pour la qualité
- **Conventional Commits:** Messages standardisés

---

## 🎯 Prochaines Améliorations

1. **Notifications en temps réel** avec WebSockets
2. **Mode sombre** pour l'interface
3. **PWA** pour l'utilisation mobile
4. **Internationalisation** (i18n)
5. **Analytics** avancées
6. **Export PDF** des réclamations
7. **Signature électronique** des décisions
8. **Chat intégré** entre acteurs