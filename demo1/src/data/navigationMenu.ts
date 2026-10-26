import { categories } from './categories';
import { publicCourseCatalog } from './publicCourseCatalog';

export interface MenuLink {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  order: number;
  icon: string;
  /** Optional group label for organizing children into sections within a dropdown */
  group?: string;
}

export interface MenuItem extends MenuLink {
  section: 'primary' | 'more';
  children: MenuLink[];
}

export interface NavigationContent {
  primary: MenuItem[];
  more: MenuItem[];
}

function isMenuLink(value: unknown): value is MenuLink {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string'
    && typeof item.label === 'string'
    && typeof item.href === 'string'
    && typeof item.visible === 'boolean'
    && typeof item.order === 'number'
    && typeof item.icon === 'string';
}

function readMenuItems(value: unknown, section: 'primary' | 'more'): MenuItem[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items: MenuItem[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') return undefined;
    const item = entry as Record<string, unknown>;
    if (!isMenuLink(item) || item.section !== section || !Array.isArray(item.children)
      || !item.children.every(isMenuLink)) return undefined;
    items.push({
      id: item.id,
      label: item.label,
      href: item.href,
      visible: item.visible,
      order: item.order,
      icon: item.icon,
      section,
      children: item.children.map((child: MenuLink) => ({
        ...child,
        group: typeof child.group === 'string' ? child.group : undefined,
      })),
    });
  }
  return items;
}

export function readNavigationContent(value: unknown): NavigationContent | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const content = value as Record<string, unknown>;
  const primary = readMenuItems(content.primary, 'primary');
  const more = readMenuItems(content.more, 'more');
  if (!primary || !more) return undefined;

  const isTrainerLink = (link: MenuLink) =>
    link.href.split(/[?#]/, 1)[0].replace(/\/+$/, '').toLowerCase() === '/trainers'
    || /^(expert )?trainers?$/i.test(link.label.trim());
  const courseSlugs = new Set(publicCourseCatalog.map(course => course.sourceSlug));
  const categorySlugs = new Set(publicCourseCatalog.map(course => course.category));
  const isAllowedLink = (link: MenuLink) => {
    const path = link.href.split(/[?#]/, 1)[0].replace(/\/+$/, '').toLowerCase();
    if (path === '/courses' || path === '') return true;
    if (path === '/master-programs' || path.startsWith('/master-programs/')) return true;
    if (path.startsWith('/courses/')) return courseSlugs.has(path.slice('/courses/'.length));
    if (path.startsWith('/categories/')) return categorySlugs.has(path.slice('/categories/'.length));
    return true;
  };
  const normalizeCourseLink = (link: MenuLink): MenuLink => {
    const path = link.href.split(/[?#]/, 1)[0].replace(/\/+$/, '').toLowerCase();
    if (path.startsWith('/courses/')) {
      const course = publicCourseCatalog.find(item => item.sourceSlug === path.slice('/courses/'.length));
      return course ? { ...link, label: course.title } : link;
    }
    if (path.startsWith('/categories/')) {
      const course = publicCourseCatalog.find(item => item.category === path.slice('/categories/'.length));
      return course ? { ...link, label: course.title } : link;
    }
    if (path === '/courses') return { ...link, label: 'Courses' };
    return link;
  };
  const normalizedPrimary = primary
      .filter(item => !isTrainerLink(item) && isAllowedLink(item))
      .map(item => ({
        ...normalizeCourseLink(item),
        section: item.section,
        children: item.children
          .filter(child => !isTrainerLink(child) && isAllowedLink(child))
          .map(normalizeCourseLink),
      }));
  const normalizedMore = more
    .filter(item => !isTrainerLink(item) && isAllowedLink(item))
    .map(item => ({
      ...normalizeCourseLink(item),
      section: item.section,
      children: item.children,
    }));
  const masterProgramsItem = normalizedPrimary.find(item => item.href === '/master-programs');
  if (masterProgramsItem) {
    masterProgramsItem.label = 'Master Programs';
    masterProgramsItem.visible = true;
    masterProgramsItem.children = [];
  } else {
    normalizedPrimary.push({
      id: 'master-programs',
      label: 'Master Programs',
      href: '/master-programs',
      section: 'primary',
      visible: true,
      order: Math.max(0, ...normalizedPrimary.map(item => item.order)) + 1,
      icon: '',
      children: [],
    });
  }
  const isCertificationsLink = (item: MenuLink) =>
    item.href.split(/[?#]/, 1)[0].replace(/\/+$/, '').toLowerCase() === '/certifications';
  const primaryCertificationsItem = normalizedPrimary.find(isCertificationsLink);
  const existingCertificationsItem = normalizedMore.find(isCertificationsLink);
  const certificationsItem = existingCertificationsItem ?? primaryCertificationsItem ?? {
    id: 'certifications',
    label: 'Certifications',
    href: '/certifications',
    section: 'more' as const,
    visible: true,
    order: Math.max(0, ...normalizedMore.map(item => item.order)) + 1,
    icon: '',
    children: [],
  };
  const primaryWithoutCertifications = normalizedPrimary.filter(item => !isCertificationsLink(item));
  const moreWithoutDuplicateCertifications = normalizedMore.filter(item => !isCertificationsLink(item));
  moreWithoutDuplicateCertifications.push({
    ...certificationsItem,
    label: 'Certifications',
    section: 'more',
    visible: true,
    children: [],
  });
  return {
    primary: primaryWithoutCertifications,
    more: moreWithoutDuplicateCertifications,
  };
}

const createLinks = (items: Array<[string, string]>): MenuLink[] =>
  items.map(([label, href], index) => ({
    id: `${index + 1}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    label,
    href,
    visible: true,
    order: index + 1,
    icon: '',
  }));

/** Create links with group labels for organized mega-menu sections */
const createGroupedLinks = (groups: Array<{ group: string; items: Array<[string, string]> }>): MenuLink[] => {
  let order = 1;
  const links: MenuLink[] = [];
  for (const { group, items } of groups) {
    for (const [label, href] of items) {
      links.push({
        id: `${order}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        label,
        href,
        visible: true,
        order: order++,
        icon: '',
        group,
      });
    }
  }
  return links;
};

export const defaultNavigation: NavigationContent = {
  primary: [
    {
      id: 'courses',
      label: 'Courses',
      href: '/courses',
      section: 'primary',
      visible: true,
      order: 1,
      icon: '',
      children: categories.slice(0, 8).map((category, index) => ({
        id: `course-category-${category.slug}`,
        label: category.title,
        href: `/categories/${category.slug}`,
        visible: true,
        order: index + 1,
        icon: '',
      })),
    },
    { id: 'master-programs', label: 'Master Programs', href: '/master-programs', section: 'primary', visible: true, order: 2, icon: '', children: [] },
    { id: 'placement', label: 'Placement Records', href: '/placement-records', section: 'primary', visible: true, order: 3, icon: '', children: [] },
    { id: 'corporate-training', label: 'Corporate', href: '/corporate-training', section: 'primary', visible: true, order: 4, icon: '', children: [] },
    { id: 'colleges', label: 'College', href: '/colleges', section: 'primary', visible: true, order: 5, icon: '', children: [] },
  ],
  more: createLinks([
    ['Batch Schedule', '/batch-schedule'],
    ['Events', '/events'],
    ['About', '/about'],
    ['Blog', '/blog'],
    ['Contact', '/contact'],
    ['Certifications', '/certifications'],
    ['Internships', '/internships'],
    ['Scholarships', '/scholarships'],
    ['Online Training', '/online-training'],
    ['Classroom Training', '/classroom-training'],
    ['Free Demo Class', '/demo-class'],
    ['Skill Assessment', '/skill-assessment'],
    ['Career & Placement', '/career'],
    ['Interview Prep', '/career/interview-preparation'],
    ['Mock Interview', '/career/mock-interview'],
    ['Live Projects', '/live-projects'],
    ['Refer & Earn', '/refer-earn'],
    ['Locations', '/locations'],
  ]).map((item, index) => ({ ...item, section: 'more' as const, children: [], order: index + 1 })),
};
