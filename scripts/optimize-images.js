const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const sourceDirectory = path.join(process.cwd(), "public", "images", "articles");
const outputDirectory = path.join(process.cwd(), "_site", "images", "articles");
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function imageFiles(directory) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await imageFiles(absolutePath)));
    } else if (entry.isFile()) {
      if (entry.name.startsWith(".")) continue;
      const extension = path.extname(entry.name).toLowerCase();
      if (!supportedExtensions.has(extension)) {
        throw new Error(`Format d'image non pris en charge : ${path.relative(sourceDirectory, absolutePath)}`);
      }
      files.push(absolutePath);
    }
  }
  return files;
}

async function main() {
  const files = await imageFiles(sourceDirectory);
  await fs.mkdir(outputDirectory, { recursive: true });

  for (const file of files) {
    const relativePath = path.relative(sourceDirectory, file);
    const outputPath = path.join(outputDirectory, relativePath).replace(/\.(jpe?g|png|webp)$/i, ".webp");
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(file)
      .rotate()
      .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(outputPath);
  }

  console.log(`${files.length} image(s) optimisée(s) en WebP.`);
}

main().catch((error) => {
  console.error("L'optimisation des images a échoué :", error);
  process.exitCode = 1;
});
