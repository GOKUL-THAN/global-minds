import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { cmsSeeds } from '../../src/data/cmsSeeds.ts';
import { defaultNavigation } from '../../src/data/navigationMenu.ts';
import { siteConfig } from '../../src/data/siteConfig.ts';
import { defaultEvents } from '../../src/pages/EventsPage.tsx';
import { projectCategories } from '../../src/pages/LiveProjectsPage.tsx';

function slugify(value: unknown, fallback: string): string {
  return String(value ?? fallback).toLowerCase().trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

const records = [
  ...Object.entries(cmsSeeds).flatMap(([section, items]) => items.map((content, index) => ({
    section,
    slug: slugify(
      [content.slug, content.id, content.name, content.title, content.question]
        .find(value => typeof value === 'string' && value.trim()),
      `item-${index + 1}`,
    ),
    content,
  }))),
  ...defaultEvents.map((content, index) => ({
    section: 'events',
    slug: slugify(content.id, `event-${index + 1}`),
    content,
  })),
  ...projectCategories.map((content, index) => ({
    section: 'live-projects',
    slug: slugify(content.id, `project-category-${index + 1}`),
    content,
  })),
  { section: 'website-menu', slug: 'site-navigation', content: defaultNavigation },
  { section: 'settings', slug: 'site-config', content: siteConfig },
].filter(record => record.slug);

const keys = new Set<string>();
for (const record of records) {
  const key = `${record.section}:${record.slug}`;
  if (keys.has(key)) throw new Error(`Duplicate site-content seed: ${key}`);
  keys.add(key);
}

const outputPath = fileURLToPath(new URL('../data/site-content.seed.json', import.meta.url));
await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`);
console.log(`Generated ${records.length} site-content records at ${outputPath}`);
