# La MontreⓇ — Site Web

Site e-commerce statique (aucun serveur requis) pour La MontreⓇ, importateur
et distributeur de montres haut de gamme au Maroc. Paiement à la livraison
(COD), confirmé via WhatsApp.

## Catalogue actuel

Le fichier `js/products.js` contient **391 montres réelles**, importées
directement de vos fichiers `Homme.xlsx` / `femme.xlsx` (titres et prix) et
de vos dossiers `Montre_Homme.zip` / `Montre_Femme.zip` (photos) :

| Marque | Nombre de montres |
|---|---|
| Tissot | 66 |
| Michael Kors | 63 |
| Guess | 58 |
| GC | 42 |
| Calvin Klein | 37 |
| Hugo Boss | 37 |
| Versace | 27 |
| Tag Heuer | 17 |
| Emporio Armani | 14 |
| Longines | 13 |
| Rolex | 9 |
| Tommy Hilfiger, Breitling, Raymond Weil, Frédérique Constant, Guess Collection | 2 ou 1 chacune |

Chaque montre a été automatiquement associée à sa photo grâce à son nom de
fichier / titre, avec son prix exact tiré de votre tableau. Deux fichiers
n'ont pas pu être utilisés : `PISS.jfif` (fichier visiblement indésirable,
ignoré) et une photo "Tissot Flamingo" sans ligne de prix correspondante
dans votre tableau (aucune donnée à lui associer). Si vous avez un prix
pour cette dernière, envoyez-le-moi et je l'ajouterai.

Les fiches produits utilisent une description générique ("Montre {marque}
pour homme/femme, référence {ref}...") car les tableaux sources ne
contenaient pas de description rédigée par montre — seulement des
caractéristiques techniques éparpillées et peu fiables à extraire
automatiquement. Vous pouvez enrichir n'importe quelle fiche à la main dans
`products.js` si vous voulez une description plus détaillée pour un modèle
en particulier.

## Structure du projet

```
la-montre-shop/
├── index.html          Page d'accueil
├── shop.html            Boutique (recherche, filtre par marque, tri, pagination)
├── product.html          Fiche produit (contenu généré depuis products.js)
├── cart.html             Panier + formulaire de commande
├── contact.html          Page contact
├── css/style.css         Tout le design du site
├── js/
│   ├── products.js       ⭐ VOS PRODUITS — le seul fichier à éditer souvent
│   ├── main.js            Config du site (nom, garantie, WhatsApp) + panier + en-tête/pied de page
│   ├── shop.js            Logique de la boutique
│   ├── product.js         Logique de la fiche produit
│   └── cart.js            Logique du panier et de la commande WhatsApp
└── images/
    ├── logo.png           Votre logo
    └── products/          Mettez vos photos de montres ici
```

## 1. Ajouter votre dossier de montres (images, titres, prix)

Ouvrez `js/products.js`. Chaque montre est un bloc comme celui-ci :

```js
{
  id: "lm-013",                 // unique, ne jamais réutiliser un id existant
  title: "Nom du modèle",
  category: "Rolex",            // la MARQUE — Rolex, Tissot, Longines, Gucci... (libre)
  price: 2200,                  // en MAD, sans texte
  oldPrice: null,                // mettre un nombre pour afficher un prix barré
  tag: "New",                    // "New", "Sale", "Bestseller", ou null
  image: "images/products/ma-montre.jpg",
  images: ["images/products/ma-montre.jpg"],
  description: "Description courte et vendeuse.",
  specs: {
    Movement: "Automatique",
    Case: "40mm acier",
    Strap: "Cuir",
    Water_Resistance: "50m",
    Warranty: "3 ans (cachet V-T-S)"
  },
  stock: 10,
  featured: false               // true = apparaît sur la page d'accueil
}
```

Le champ `category` sert de **marque** : c'est ce qui alimente automatiquement
le filtre de la boutique (Rolex, Tissot, Longines...). Pas besoin de
maintenir une liste à part.

**Pour vos 100+ montres :** copiez vos photos dans `images/products/`, puis
copiez-collez un bloc par montre dans le tableau `PRODUCTS`. Aucune autre
partie du code n'a besoin d'être modifiée — la boutique, la recherche, les
filtres et la pagination s'adaptent automatiquement au nombre de produits.

Si vos données sont dans un tableau Excel/CSV, dites-le moi et je peux
générer tout le fichier `products.js` automatiquement à partir de votre
fichier — ce sera plus rapide que de tout copier à la main.

## 2. Configurer votre boutique

Ouvrez `js/main.js`, tout en haut, et modifiez :

```js
const CONFIG = {
  shopName: "La MontreⓇ",
  tagline: "N°1 au Maroc — Importation & distribution de montres haut de gamme",
  legalName: "La MontreⓇ Sarl / Visual Trading System (Sarl)",
  currency: "MAD",
  whatsappNumber: "212600000000",   // ⚠️ mettez votre vrai numéro WhatsApp
  contactPhone: "+212 6 00 00 00 00",
  contactEmail: "contact@la-montre.ma",
  contactAddress: "Casablanca, Maroc",
  instagram: "https://www.instagram.com/la.montre.ma/",
  facebook: "https://www.facebook.com/La.montre.boutique/",
  freeDelivery: true,
  warrantyYears: 3,
  warrantyNote: "Garantie 3 ans avec cachet de la société (V-T-S) — exclusivité La MontreⓇ"
};
```

The `whatsappNumber` est essentiel : c'est le numéro qui reçoit toutes les
commandes passées sur le site (format : indicatif pays + numéro, sans
espace ni "+", ex. `212612345678`). Mettez aussi à jour `instagram` et
`facebook` avec vos vrais liens si besoin.

## 3. Comment fonctionne une commande (sans paiement en ligne)

1. Le client ajoute des montres au panier.
2. Il remplit ses informations (nom, téléphone, adresse, ville) sur la page panier.
3. En cliquant sur "Confirmer la commande via WhatsApp", un message
   pré-rempli s'ouvre dans WhatsApp avec le détail de la commande.
4. Vous recevez le message, appelez le client pour confirmer, puis livrez
   gratuitement avec paiement en espèces à la réception.

Aucune carte bancaire, aucun compte marchand, aucune commission — mais cela
veut aussi dire qu'il n'y a pas de suivi de stock automatique après
commande : pensez à mettre à jour le champ `stock` dans `products.js`
manuellement si une montre n'est plus disponible.

## 3bis. Recevoir un email automatique à chaque commande

En plus de la confirmation WhatsApp, vous pouvez recevoir un **email automatique**
à chaque fois qu'un client confirme une commande sur `cart.html`. Le site étant
100% statique (pas de serveur), ceci utilise un service gratuit appelé **EmailJS**
qui permet d'envoyer un email directement depuis le navigateur du client.

**Configuration (5 minutes, une seule fois) :**

1. Créez un compte gratuit sur [emailjs.com](https://www.emailjs.com/) (200 emails/mois gratuits).
2. Dans **Email Services**, ajoutez votre adresse email (Gmail, Outlook, etc.) — notez le **Service ID** généré.
3. Dans **Email Templates**, créez un modèle avec ces variables (copiez-collez tel quel dans le corps du template) :
   ```
   Nouvelle commande — {{customer_name}}

   Téléphone : {{customer_phone}}
   Adresse : {{customer_address}}
   Note : {{customer_notes}}

   Articles :
   {{order_lines}}

   Total : {{order_total}}
   ```
   Notez le **Template ID**.
4. Dans **Account → API Keys**, copiez votre **Public Key**.
5. Ouvrez `js/main.js`, tout en haut, et remplissez :
   ```js
   notifyEmail: "contact@la-montre.ma",   // où vous voulez recevoir les commandes
   emailjsPublicKey: "VOTRE_PUBLIC_KEY",
   emailjsServiceId: "VOTRE_SERVICE_ID",
   emailjsTemplateId: "VOTRE_TEMPLATE_ID"
   ```

Tant que ces champs sont vides, le site fonctionne normalement (WhatsApp
uniquement) — l'email est une couche supplémentaire, pas un remplacement.

## 4. Mettre le site en ligne

Ce site est 100% statique (HTML/CSS/JS), il peut être hébergé gratuitement
sur :
- **Netlify** ou **Vercel** : glissez-déposez le dossier, en ligne en 30 secondes.
- **GitHub Pages** : gratuit, bon pour une mise à jour régulière via Git.
- Tout hébergement mutuel classique (OVH, Hostinger, etc.) : uploadez le
  dossier tel quel via FTP.

Aucune base de données, aucun backend, aucune installation nécessaire.

## 5. Note sur ce rebrand

Ce site a été mis à jour pour refléter les informations publiques trouvées
en ligne sur La MontreⓇ (N°1 au Maroc, Visual Trading System Sarl, livraison
gratuite, garantie 3 ans avec cachet V-T-S). Je n'ai pas pu accéder
directement à la mise en page de la-montre.ma (protection anti-robot
Cloudflare), donc la structure visuelle reste celle conçue précédemment,
avec le contenu et le positionnement mis à jour. Si vous avez des captures
d'écran de votre site actuel ou des textes précis à reprendre mot pour mot,
partagez-les et j'ajusterai la mise en page en conséquence.

## 6. Prochaines améliorations possibles

- Remplacer les images placeholder par vos vraies photos dans `images/products/`.
- Ajouter un vrai nom de domaine (la-montre.ma).
- Si vous voulez plus tard accepter les paiements en ligne (Stripe/CMI),
  ou un panneau d'administration pour gérer les produits sans toucher au
  code, on peut faire évoluer ce projet vers une version avec backend.

