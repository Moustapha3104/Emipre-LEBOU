# Administration du blog Empire Lebuu

## Fonctionnement

Le site vitrine reste en HTML/CSS/JavaScript. Le CMS gère les produits du catalogue et les articles du blog. Les produits sont versionnés en JSON dans `src/content/products/`; Eleventy génère le fichier de catalogue utilisé par les cartes existantes. Les articles sont versionnés en Markdown dans `src/content/articles/`. Les images JPEG, PNG et WebP importées par le CMS sont converties en WebP, limitées à 1800 px de largeur et débarrassées de leurs métadonnées pendant le build. Les formats non pris en charge, comme SVG et GIF, ne sont pas acceptés par le build.

Le dépôt ne contenait pas d'articles ni de format de frontmatter existant : il n'y a donc pas de migration d'articles à effectuer. Le slug de l'URL est généré depuis le titre et peut être modifié dans le champ de slug du CMS. Il correspond au nom du fichier Markdown (et non à un champ supplémentaire du frontmatter).

En production, seuls les articles et produits avec `published: true` sont affichés. Le CMS enregistre directement sur `main` : chaque enregistrement déclenche un build Netlify. Un produit apparaît dans sa catégorie après avoir activé **Publié**, enregistré et attendu la fin du déploiement. Un brouillon enregistré avec **Publié** désactivé n'apparaît pas. Les Deploy Previews issus de pull requests restent disponibles pour prévisualiser les changements.

## Activation de Netlify Identity et Git Gateway

1. Dans Netlify, ouvrez **Site configuration → Identity** et activez Identity.
2. Dans **Identity → Registration**, choisissez **Invite only**.
3. Dans **Identity → Services**, activez Git Gateway et autorisez l’accès au dépôt lié au site.
4. Dans **Site configuration → Build & deploy → Continuous deployment**, vérifiez que le dépôt GitHub `Moustapha3104/Emipre-LEBOU` est bien lié et que la branche de production est `main`.
5. Activez les Deploy Previews pour les pull requests de ce dépôt si vous souhaitez prévisualiser les changements faits hors du CMS. Le CMS enregistre directement sur `main` pour déclencher la mise en ligne automatique.
6. Dans **Identity → Users**, invitez votre adresse email. Ouvrez le lien d’invitation reçu et définissez un mot de passe.
7. Ouvrez `https://empirelebou.netlify.app/admin/`, connectez-vous et vérifiez que la collection **Articles** est visible.
8. La collection **Produits** permet d'ajouter les articles affichés dans le catalogue Homme, Femme ou Unisexe.

Chaque enregistrement dans le CMS déclenche le build de production. Les Deploy Previews ne sont produits que pour les pull requests et ne sont pas nécessaires pour publier un produit.

### Lien de réinitialisation du mot de passe

Les modèles d'e-mail personnalisés ne sont pas nécessaires. Avec le modèle Netlify standard, le lien arrive à la racine du site avec un jeton dans le fragment de l'URL. `js/app.js` transfère ce jeton vers `/admin/recovery.html`, une page dédiée qui charge le widget Identity sans le routeur Decap CMS. Cette séparation évite que la navigation interne du CMS efface le jeton avant son traitement.

1. Déployez la version qui contient `admin/recovery.html` et `js/identity-locale.js`.
2. Depuis `/admin/`, demandez un nouvel e-mail avec **Forgot password?** ; les anciens liens ne changent pas.
3. Ouvrez le nouveau lien. Le formulaire Netlify doit afficher la demande de nouveau mot de passe, puis vous pourrez vous connecter à `/admin/`.

## Rédiger un article

1. Dans `/admin/`, sélectionnez **Articles → Nouvel article**.
2. Remplissez le titre, la date, l’auteur et le résumé. Ces champs alimentent directement la carte du journal et l'en-tête de l'article. Le slug est généré depuis le titre ; modifiez le champ de slug du CMS uniquement pour définir une URL personnalisée.
3. Choisissez l’image de couverture et renseignez son texte alternatif descriptif.
4. Rédigez le contenu en Markdown. Le CMS fournit un aperçu du Markdown. Donnez un texte alternatif à chaque image du corps, par exemple `![Robe rose portée en extérieur](/images/articles/robe-rose.webp)`.
5. Complétez les étiquettes et, si besoin, les champs SEO. À défaut, le titre et le résumé servent de valeurs SEO.
6. Laissez **Publié** désactivé pour conserver l’article en brouillon, puis enregistrez. Le fichier est enregistré sur `main`, mais reste absent du site public.
7. Pour publier, activez **Publié** et enregistrez. Netlify reconstruit le site ; l’article apparaît dans `/blog/` et le sitemap après la fin du déploiement.
8. Pour dépublier, désactivez **Publié** et enregistrez. L’article est retiré des pages générées en production et du sitemap après le prochain déploiement.

Le délai de mise en ligne dépend de la durée réelle du build et du déploiement Netlify.

## Ajouter un produit au catalogue

1. Dans `/admin/`, ouvrez **Produits → Créer un produit**.
2. Choisissez **Homme**, **Femme** ou **Unisexe**, puis renseignez l'image, le titre et la description.
3. Activez **Publié** et enregistrez. Le CMS commit directement la fiche sur `main` ; Netlify lance le build et le produit rejoint automatiquement la catégorie choisie sur la page d'accueil.
4. Pour garder le produit en brouillon, laissez **Publié** désactivé. Pour le retirer du catalogue, désactivez ce champ et enregistrez.

Les cartes déjà présentes dans le code restent en place ; les nouveaux produits du CMS s'ajoutent à la fin de la catégorie correspondante. L'image est optimisée en WebP lors du build. Le texte alternatif de la carte est généré à partir du titre afin de ne pas ajouter de champ à remplir.

### En cas de « Failed to fetch » à l'enregistrement

L'enregistrement Git Gateway nécessite une session Netlify Identity active. Vérifiez d'abord que le CMS affiche votre compte connecté, puis reconnectez-vous sur le domaine `empirelebou.netlify.app`. Dans **Identity → Users**, le compte doit exister et avoir terminé son invitation. Si le message persiste, ouvrez les outils développeur du navigateur, filtrez **Network** sur `/.netlify/git/` et relevez uniquement le chemin de la requête et son code HTTP ; ne partagez jamais de jeton, cookie ou en-tête `Authorization`.

## Configuration de build et variables

`netlify.toml` définit `npm run build` et le dossier de publication `_site`. Le build valide les champs, les images et leurs textes alternatifs avant de générer le site.

Variable non secrète définie par défaut dans `netlify.toml` :

| Variable | Valeur par défaut | Utilité |
| --- | --- | --- |
| `SITE_URL` | `https://empirelebou.netlify.app` | Domaine utilisé pour les URL canoniques, Open Graph et le sitemap. Remplacez-la par votre domaine personnalisé si nécessaire. |

Aucun secret ou jeton ne doit être ajouté au dépôt ni à une variable de build pour l’authentification : Identity et Git Gateway gèrent cette connexion.

Si le domaine du site change, mettez à jour `SITE_URL` dans `netlify.toml`, puis `site_url` et `display_url` dans `admin/config.yml` ainsi que l'adresse du sitemap dans `robots.txt`.

## Vérification après configuration

1. Vérifiez dans le tableau de bord Netlify que le build utilise `npm run build` et publie `_site`.
2. Invitez votre email, puis connectez-vous à `/admin/`.
3. Créez un produit test, choisissez une catégorie et renseignez son image, son titre et sa description.
4. Enregistrez-le avec **Publié** désactivé ; attendez le build et vérifiez qu'il n'apparaît pas dans le catalogue public.
5. Réactivez **Publié** et enregistrez. Après le build Netlify, vérifiez que sa carte apparaît dans la bonne catégorie.
6. Désactivez **Publié** et enregistrez une nouvelle fois ; confirmez qu'il disparaît après le build.
7. Pour tester aussi le blog, publiez un article de test et vérifiez `/blog/`, sa page `/blog/<slug>/` et `/sitemap.xml`.
