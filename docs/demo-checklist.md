# Demonstration du projet

Ordre simple pour presenter le projet au formateur.

## 1. Base de donnees

Montrer pgAdmin et les quatre tables :

- authors
- members
- books
- loans

Montrer rapidement les relations entre les tables.

## 2. API

Lancer le projet :

```bash
npm start
```

Puis ouvrir Postman.

Tester :

1. `GET /api/health`
2. `GET /api/authors`
3. `GET /api/members`
4. `GET /api/books?page=1&limit=10`
5. `GET /api/loans?status=overdue`
6. `GET /api/loans/stats`

## 3. Regle importante des emprunts

Avec un livre disponible :

1. Creer un emprunt avec `POST /api/loans`.
2. Refaire un emprunt avec le meme livre.
3. Montrer que l'API refuse avec le message `Le livre est deja emprunte.`.

## 4. Retour

Faire :

`PUT /api/loans/ID/return`

Puis refaire :

`GET /api/books?page=1&limit=10`

Le livre doit apparaitre comme `available`.

## 5. Frontend

Ouvrir :

`http://localhost:3000`

Montrer :

- Tableau de bord
- Auteurs
- Adherents
- Livres
- Emprunts

## 6. Recherche et pagination

Dans Livres :

- chercher un titre
- chercher un auteur
- passer a la page suivante

## 7. Historique adherent

Dans Adherents :

- choisir un adherent
- afficher son historique
- montrer un emprunt en cours ou passe

## 8. Retards

Le `seed.sql` ajoute un emprunt arrive a echeance pour faciliter la demonstration du retard.


## 9. Version en ligne

Ouvrir l'adresse du projet en ligne (patienter jusqu'a une minute si le service etait en veille) :

`https://NOM-DU-SERVICE.onrender.com`

Verifier :

1. `https://NOM-DU-SERVICE.onrender.com/api/health` repond `"status":"ok"`.
2. Le tableau de bord affiche les statistiques.
3. Un emprunt peut etre cree puis rendu depuis la page Emprunts.

Dans Postman, changer la variable `baseUrl` de la collection pour tester l'API en ligne.

