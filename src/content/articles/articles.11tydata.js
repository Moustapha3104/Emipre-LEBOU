const previewBuild = process.env.CONTEXT === "deploy-preview";

module.exports = {
  layout: "layouts/article.njk",
  eleventyComputed: {
    permalink: (data) => {
      if (data.published !== true && !previewBuild) return false;
      const slug = data.slug || data.page.fileSlug;
      return `/blog/${slug}/index.html`;
    },
  },
};
