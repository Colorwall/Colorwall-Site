import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.colorwall.xyz';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/download',
    '/wallpapers',
    '/changelog',
    '/about',
    '/feedback',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/download' ? 0.9 : 0.8,
  }));

  return routes;
}
