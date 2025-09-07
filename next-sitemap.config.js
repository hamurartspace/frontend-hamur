/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://yourdomain.com", // Ganti dengan domain kamu
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/admin", "/private"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://yourdomain.com/sitemap.xml"],
  },
};
