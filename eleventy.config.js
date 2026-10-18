const markdownIt = require("markdown-it");

const productionSiteUrl = "https://empirelebou.netlify.app";

function optimizedArticleImage(source) {
  if (typeof source !== "string") return "";
  return source.replace(/\/images\/articles\/(.+)\.(jpe?g|png|webp)$/i, "/images/articles/$1.webp");
}

module.exports = function (eleventyConfig) {
  const markdown = markdownIt({ html: false, linkify: true });
  const defaultImageRenderer = markdown.renderer.rules.image;

  markdown.renderer.rules.image = (tokens, index, options, env, renderer) => {
    const token = tokens[index];
    const source = token.attrGet("src");
    if (source) token.attrSet("src", optimizedArticleImage(source));
    return defaultImageRenderer(tokens, index, options, env, renderer);
  };
  eleventyConfig.setLibrary("md", markdown);

  eleventyConfig.addCollection("publishedArticles", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/content/articles/*.md")
      .filter((article) => article.data.published === true)
      .sort((left, right) => new Date(right.data.date) - new Date(left.data.date)),
  );

  eleventyConfig.addCollection("blogArticles", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/content/articles/*.md")
      .filter((article) => article.data.published === true || process.env.CONTEXT === "deploy-preview")
      .sort((left, right) => new Date(right.data.date) - new Date(left.data.date)),
  );

  eleventyConfig.addFilter("articleImage", optimizedArticleImage);
  eleventyConfig.addFilter("dateIso", (value) => new Date(value).toISOString());
  eleventyConfig.addFilter("dateFr", (value) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value)),
  );
  eleventyConfig.addGlobalData("site", {
    url: process.env.SITE_URL || productionSiteUrl,
    name: "Empire Lebuu",
    year: new Date().getFullYear(),
    preview: process.env.CONTEXT === "deploy-preview",
  });

  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("identity");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("products");
  eleventyConfig.addPassthroughCopy("collection");
  eleventyConfig.addPassthroughCopy({ "public/images/articles": "images/articles" });
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("404.html");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy("hero-photo.jpg");
  eleventyConfig.addPassthroughCopy("logo.png");
  eleventyConfig.addPassthroughCopy("logo-transparent.png");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("README-ADMIN.md");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
