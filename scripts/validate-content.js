const fs = require("node:fs");
const path = require("node:path");
const matter = require("@11ty/gray-matter");

const articlesDirectory = path.join(process.cwd(), "src", "content", "articles");
const mediaDirectory = path.join(process.cwd(), "public", "images", "articles");
const markdownImagePattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const errors = [];
const slugs = new Map();

function markdownFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith(".md") ? [absolutePath] : [];
  });
}

function validateArticle(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const { data, content } = matter.read(filePath);
  const requiredFields = ["title", "author", "excerpt", "cover_image", "cover_alt"];

  for (const field of requiredFields) {
    if (typeof data[field] !== "string" || data[field].trim() === "") {
      errors.push(`${relativePath}: le champ « ${field} » est obligatoire.`);
    }
  }
  const slug = typeof data.slug === "string" && data.slug.trim()
    ? data.slug.trim()
    : path.basename(filePath, ".md");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.push(`${relativePath}: le slug doit contenir uniquement des minuscules, chiffres et tirets.`);
  } else {
    const previousPath = slugs.get(slug);
    if (previousPath) errors.push(`${relativePath}: le slug « ${slug} » est déjà utilisé dans ${previousPath}.`);
    else slugs.set(slug, relativePath);
  }
  const articleDate = data.date instanceof Date ? data.date : new Date(data.date);
  if (!data.date || Number.isNaN(articleDate.getTime())) {
    errors.push(`${relativePath}: la date est absente ou invalide.`);
  }
  if (typeof data.published !== "boolean") {
    errors.push(`${relativePath}: le statut « published » doit être vrai ou faux.`);
  }
  if (!content.trim()) errors.push(`${relativePath}: le contenu de l'article est vide.`);
  if (typeof data.cover_image === "string" && data.cover_image.startsWith("/images/articles/")) {
    const relativeImage = decodeURIComponent(data.cover_image.slice("/images/articles/".length).split(/[?#]/)[0]);
    const absoluteImage = path.resolve(mediaDirectory, relativeImage);
    if (!absoluteImage.startsWith(`${path.resolve(mediaDirectory)}${path.sep}`) || !fs.existsSync(absoluteImage)) {
      errors.push(`${relativePath}: l'image de couverture « ${data.cover_image} » est introuvable.`);
    }
  }

  let match;
  while ((match = markdownImagePattern.exec(content)) !== null) {
    const [, alt, source] = match;
    if (!alt.trim()) errors.push(`${relativePath}: chaque image du contenu doit avoir un texte alternatif.`);

    if (source.startsWith("/images/articles/")) {
      const relativeImage = decodeURIComponent(source.slice("/images/articles/".length).split(/[?#]/)[0]);
      const absoluteImage = path.resolve(mediaDirectory, relativeImage);
      if (!absoluteImage.startsWith(`${path.resolve(mediaDirectory)}${path.sep}`) || !fs.existsSync(absoluteImage)) {
        errors.push(`${relativePath}: l'image « ${source} » est introuvable dans public/images/articles/.`);
      }
    }
  }
  markdownImagePattern.lastIndex = 0;
}

for (const article of markdownFiles(articlesDirectory)) validateArticle(article);

if (errors.length) {
  console.error("Validation des articles échouée :");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Validation des articles réussie.");
}
