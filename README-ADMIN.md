# Administration du blog Empire Lebuu

## Fonctionnement

Le site vitrine reste en HTML/CSS/JavaScript. Eleventy génère les pages du blog et le sitemap lors du build Netlify. Les articles source sont versionnés en Markdown dans `src/content/articles/`. Les images JPEG, PNG et WebP importées par le CMS sont converties en WebP, limitées à 1800 px de largeur et débarrassées de leurs métadonnées avant l'enregistrement ; le build produit ensuite les images WebP servies par le site. Les formats non pris en charge par cette conversion, comme SVG et GIF, ne sont pas acceptés par le build.

Le dépôt ne contenait pas d'articles ni de format de frontmatter existant : il n'y a donc pas de migration d'articles à effectuer. Le slug de l'URL est généré depuis le titre et peut être modifié dans le champ de slug du CMS. Il correspond au nom du fichier Markdown (et non à un champ supplémentaire du frontmatter).

En production, seuls les articles avec `published: true` sont générés. Les Deploy Previews Netlify incluent aussi les brouillons pour permettre leur relecture. Les changements de brouillon faits dans le CMS suivent le workflow éditorial et ne remplacent pas le site de production avant validation/publication.

## Activation de Netlify Identity et Git Gateway

1. Dans Netlify, ouvrez **Site configuration → Identity** et activez Identity.
2. Dans **Identity → Registration**, choisissez **Invite only**.
3. Dans **Identity → Services**, activez Git Gateway et autorisez l’accès au dépôt lié au site.
4. Dans **Site configuration → Build & deploy → Continuous deployment**, vérifiez que le dépôt GitHub `Moustapha3104/Emipre-LEBOU` est bien lié et que la branche de production est `main`.
5. Pour prévisualiser un article avant publication, activez les Deploy Previews pour les pull requests de ce dépôt. Les brouillons doivent passer par une branche et une pull request afin que Netlify produise un Deploy Preview.
6. Dans **Identity → Users**, invitez votre adresse email. Ouvrez le lien d’invitation reçu et définissez un mot de passe.
7. Ouvrez `https://empirelebou.netlify.app/admin/`, connectez-vous et vérifiez que la collection **Articles** est visible.

Les Deploy Previews ne sont pas produits par chaque sauvegarde : Netlify en construit un pour une pull request. L’aperçu intégré au CMS peut afficher le rendu du contenu, mais un Deploy Preview public requiert la pull request.

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
6. Laissez **Publié** désactivé pour conserver l’article en brouillon. Enregistrez avec le workflow éditorial.
7. Pour vérifier le rendu sur Netlify, créez/validez une pull request depuis le workflow : son Deploy Preview rend le brouillon visible à l’adresse de prévisualisation.
8. Pour publier, activez **Publié**, terminez le workflow et fusionnez la pull request dans `main`. Netlify reconstruit alors le site ; l’article apparaît dans `/blog/` et le sitemap de production.
9. Pour dépublier, désactivez **Publié** et fusionnez la modification. L’article est retiré des pages générées en production et du sitemap.

Le délai de mise en ligne dépend de la durée réelle du build et du déploiement Netlify.

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
3. Créez un article de test en brouillon avec une couverture et son alt.
4. Ouvrez une pull request pour vérifier le Deploy Preview : la page `/blog/<slug>/` doit y être visible, sans apparaître en production.
5. Passez l’article à **Publié**, fusionnez la pull request et attendez la fin du déploiement.
6. Vérifiez `/blog/`, `/blog/<slug>/` et `/sitemap.xml` sur le domaine de production.
7. Désactivez ensuite **Publié**, fusionnez à nouveau et confirmez que l’article n’est plus généré ni listé dans le sitemap.
