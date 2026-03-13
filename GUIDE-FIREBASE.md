# 🔥 Guide de Configuration Firebase pour Décor Pro

## Étape 1 : Créer un projet Firebase (5 minutes)

1. Allez sur **https://console.firebase.google.com**
2. Connectez-vous avec un compte Google
3. Cliquez sur **"Créer un projet"**
4. Nom du projet : `decor-pro` (ou ce que vous voulez)
5. Désactivez Google Analytics (pas nécessaire)
6. Cliquez **"Créer le projet"**

---

## Étape 2 : Activer Firestore Database (3 minutes)

1. Dans le menu gauche, cliquez **"Firestore Database"**
2. Cliquez **"Créer une base de données"**
3. Choisissez **"Mode production"**
4. Sélectionnez la région **"eur3 (europe-west)"** (plus proche de la France)
5. Cliquez **"Activer"**

---

## Étape 3 : Activer le Storage pour les photos (2 minutes)

1. Dans le menu gauche, cliquez **"Storage"**
2. Cliquez **"Commencer"**
3. Acceptez les règles par défaut
4. Même région **"eur3"**
5. Cliquez **"OK"**

---

## Étape 4 : Configurer les règles de sécurité (2 minutes)

### Pour Firestore :
1. Allez dans **Firestore Database → Règles**
2. Remplacez le contenu par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectCode}/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Cliquez **"Publier"**

### Pour Storage :
1. Allez dans **Storage → Règles**
2. Remplacez par :

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{projectCode}/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

3. Cliquez **"Publier"**

---

## Étape 5 : Récupérer vos identifiants (1 minute)

1. Cliquez sur l'icône ⚙️ (roue dentée) → **"Paramètres du projet"**
2. Descendez jusqu'à **"Vos applications"**
3. Cliquez sur l'icône **</>** (Web)
4. Nom de l'app : `Decor Pro Web`
5. **NE PAS** cocher "Firebase Hosting"
6. Cliquez **"Enregistrer l'application"**
7. Vous verrez un bloc de code comme celui-ci :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy.....................",
  authDomain: "decor-pro-xxxxx.firebaseapp.com",
  projectId: "decor-pro-xxxxx",
  storageBucket: "decor-pro-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

8. **COPIEZ CES VALEURS** - vous en aurez besoin pour l'application !

---

## Étape 6 : Mettre à jour l'application

Ouvrez le fichier `index.html` et cherchez la section `FIREBASE CONFIG`.
Remplacez les valeurs par les vôtres :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT.firebaseapp.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

---

## 🎉 C'est prêt !

Une fois configuré :
- Chaque projet aura un **code de 6 caractères** (ex: ABC123)
- Partagez ce code avec vos collaborateurs
- Tous ceux qui entrent le même code verront les mêmes données
- Les photos se synchronisent automatiquement
- Fonctionne même hors-ligne (synchronise au retour d'internet)

---

## 💰 Coûts Firebase (Plan Gratuit - Spark)

| Ressource | Limite gratuite | Pour Décor Pro |
|-----------|-----------------|----------------|
| Stockage Firestore | 1 Go | ~10 000 éléments avec détails |
| Stockage Photos | 5 Go | ~2 500 photos HD |
| Téléchargements | 10 Go/mois | ~5 000 photos vues/mois |
| Opérations lecture | 50 000/jour | Largement suffisant |
| Opérations écriture | 20 000/jour | Largement suffisant |

**Pour une équipe de 5-10 personnes sur un film, le plan gratuit suffit largement !**

---

## ❓ Besoin d'aide ?

Si vous avez des questions pendant la configuration, n'hésitez pas à me demander !
