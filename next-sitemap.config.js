/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.colorwall.xyz',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  exclude: ['/api/*', '/server-sitemap.xml'],
  changefreq: 'daily',
  priority: 0.7,
  // boost wallpapers page priority for seo
  transform: async (config, path) => {
    const custom = {
      '/wallpapers': { priority: 0.9, changefreq: 'daily' },
      '/': { priority: 1.0, changefreq: 'daily' },
      '/download': { priority: 0.9, changefreq: 'weekly' },
    };
    const override = custom[path] || {};
    return {
      loc: path,
      changefreq: override.changefreq || config.changefreq,
      priority: override.priority || config.priority,
      lastmod: new Date().toISOString(),
    };
  },
}