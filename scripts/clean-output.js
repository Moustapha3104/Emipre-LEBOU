const fs = require("node:fs/promises");
const path = require("node:path");

const outputDirectory = path.resolve(process.cwd(), "_site");
const expectedOutputDirectory = path.join(process.cwd(), "_site");

if (outputDirectory !== expectedOutputDirectory || path.basename(outputDirectory) !== "_site") {
  throw new Error(`Refus de nettoyer un dossier de sortie inattendu : ${outputDirectory}`);
}

async function main() {
  try {
    await fs.rm(outputDirectory, { recursive: true, force: true });
  } catch (error) {
    console.error("Impossible de nettoyer le dossier de build :", error);
    process.exitCode = 1;
  }
}

main();
