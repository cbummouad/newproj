# Rapport de Stage

## Introduction
Ce rapport décrit le projet de stage axé sur le développement d'un tableau de bord administrateur pour la gestion des plaintes des utilisateurs et des rôles des utilisateurs. Le projet vise à rationaliser le processus de traitement des retours des utilisateurs et des tâches administratives.

## Structure du Projet
Le projet se compose de plusieurs composants clés :
- **Tableau de Bord Administrateur** : Une interface basée sur React qui permet aux administrateurs de visualiser et de gérer les plaintes des utilisateurs et les rôles des utilisateurs.
- **Gestion des Utilisateurs** : Fonctionnalité pour mettre à jour les rôles des utilisateurs et gérer les comptes utilisateurs.
- **Gestion des Plaintes** : Fonctionnalités pour visualiser, répondre et mettre à jour le statut des plaintes des utilisateurs.

## Fonctionnalité Backend
Le backend est implémenté en utilisant Laravel, avec le contrôleur principal étant `AdminDashboardController`. Ce contrôleur comprend plusieurs méthodes :
- `index()`: Rendre le tableau de bord administrateur.
- `getComplaints()`: Récupérer toutes les plaintes du modèle `FormData`.
- `manageUsers()`: Récupérer tous les utilisateurs pour la gestion.
- `updateRole()`: Mettre à jour le rôle d'un utilisateur spécifié.
- `updateComplaintStatus()`: Mettre à jour le statut d'une plainte spécifique.

## Implémentation Frontend
Le frontend est construit en utilisant React, spécifiquement dans le composant `AdminDashboard.jsx`. Les fonctionnalités clés incluent :
- Gestion d'état pour les notifications, les plaintes et les utilisateurs.
- Récupération de données depuis le backend à l'aide d'appels asynchrones.
- Interactions utilisateur pour changer les rôles et répondre aux plaintes.

## Modèle de Données
Le modèle `FormData` représente la structure des données de plainte dans l'application. Il comprend les attributs suivants :
- `image`: Une image optionnelle associée à la plainte.
- `location`: La localisation liée à la plainte.
- `title`: Le titre de la plainte.
- `type`: Le type de plainte.
- `status`: Le statut actuel de la plainte.

## Conclusion
Ce projet de stage met en œuvre avec succès un tableau de bord administrateur qui améliore la gestion des plaintes des utilisateurs et des rôles. La combinaison de Laravel pour le backend et de React pour le frontend fournit une solution robuste pour les tâches administratives.
