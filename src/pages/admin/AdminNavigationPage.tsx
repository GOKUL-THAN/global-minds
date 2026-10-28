import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Plus,
  Save, Trash2, X,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { defaultNavigation, readNavigationContent, type MenuItem, type MenuLink, type NavigationContent } from '../../data/navigationMenu';
import { cmsService, type CmsRecord } from '../../services/cmsService';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';

const navigationSlug = 'site-navigation';
const cmsContentLimit = 64 * 1024;

interface MenuItemForm {
  label: string;
  href: string;
  section: 'primary' | 'more';
  visible: boolean;
  icon: string;
}

interface MenuLinkForm {
  label: string;
  href: string;
  visible: boolean;
  icon: string;
}

const emptyMenuItemForm: MenuItemForm = {
  label: '',
  href: '',
  section: 'primary',
  visible: true,
  icon: '',
};

const emptyMenuLinkForm: MenuLinkForm = { label: '', href: '', visible: true, icon: '' };

function copyDefaults(): NavigationContent {
  return {
    primary: defaultNavigation.primary.map(item => ({
      ...item,
      children: item.children.map(child => ({ ...child })),
    })),
    more: defaultNavigation.more.map(item => ({
      ...item,
      children: item.children.map(child => ({ ...child })),
    })),
  };
}

function readNavigation(record?: CmsRecord): NavigationContent | undefined {
  return record ? readNavigationContent(record.content) : undefined;
}

function sortItems<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.order - right.order);
}

function validHref(value: string): boolean {
  const href = value.trim();
  if (!href || href.length > 500 || href.startsWith('//')) return false;
  if (href.startsWith('/')) return !href.includes('\\');
  try {
    const url = new URL(href);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

function readImage(file?: File): Promise<string> {
  if (!file) return Promise.resolve('');
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    return Promise.reject(new Error('Choose a PNG, JPEG, or WebP image.'));
  }
  if (file.size > 12 * 1024) {
    return Promise.reject(new Error('Each menu image must be 12 KB or smaller.'));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('Unable to read the selected image.'));
    reader.onerror = () => reject(new Error('Unable to read the selected image.'));
    reader.readAsDataURL(file);
  });
}

function iconData(value: string): boolean {
  return value.startsWith('data:image/png;base64,')
    || value.startsWith('data:image/jpeg;base64,')
    || value.startsWith('data:image/webp;base64,');
}

export default function AdminNavigationPage() {
  const [navigation, setNavigation] = useState<NavigationContent>(copyDefaults);
  const [record, setRecord] = useState<CmsRecord | undefined>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [menuItemForm, setMenuItemForm] = useState<MenuItemForm>(emptyMenuItemForm);
  const [managingItemId, setManagingItemId] = useState<string | null>(null);
  const [showMenuLinkForm, setShowMenuLinkForm] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [menuLinkForm, setMenuLinkForm] = useState<MenuLinkForm>(emptyMenuLinkForm);

  const loadNavigation = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const records = await cmsService.listAdmin('website-menu');
      const current = records.find(item => item.slug === navigationSlug);
      const loaded = readNavigation(current);
      if (current && !loaded) {
        throw new Error('Saved navigation data is invalid. Contact an administrator before changing the menu.');
      }
      setRecord(current);
      setNavigation(loaded ?? copyDefaults());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load navigation menu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNavigation();
  }, [loadNavigation]);

  const saveNavigation = async (next: NavigationContent, successMessage: string): Promise<boolean> => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const content: Record<string, unknown> = { primary: next.primary, more: next.more };
      if (new TextEncoder().encode(JSON.stringify(content)).byteLength > cmsContentLimit) {
        throw new Error('Menu content and uploaded images exceed the 64 KB limit. Remove an image or reduce the number of uploaded images.');
      }

      let saved = record;
      if (saved?.status === 'archived') saved = await cmsService.restore('website-menu', saved.slug);
      saved = saved
        ? await cmsService.update('website-menu', saved.slug, content)
        : await cmsService.create('website-menu', navigationSlug, content);
      saved = await cmsService.publish('website-menu', saved.slug);

      setRecord(saved);
      setNavigation(next);
      setNotice(successMessage);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save navigation changes.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const orderedItems = useMemo(() => ({
    primary: sortItems(navigation.primary),
    more: sortItems(navigation.more),
  }), [navigation]);
  const managingItem = [...navigation.primary, ...navigation.more].find(item => item.id === managingItemId);

  const openNewMenuItem = (section: 'primary' | 'more') => {
    setEditingItemId(null);
    setMenuItemForm({ ...emptyMenuItemForm, section });
    setShowMenuItemForm(true);
    setError('');
  };

  const openEditMenuItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setMenuItemForm({
      label: item.label,
      href: item.href,
      section: item.section,
      visible: item.visible,
      icon: item.icon,
    });
    setShowMenuItemForm(true);
    setError('');
  };

  const submitMenuItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = menuItemForm.label.trim();
    const href = menuItemForm.href.trim();
    if (label.length < 2 || label.length > 120) {
      setError('Menu label must be between 2 and 120 characters.');
      return;
    }
    if (!validHref(href)) {
      setError('Enter a site path starting with / or a secure https:// URL.');
      return;
    }

    const target = navigation[menuItemForm.section];
    const existing = target.find(item => item.id === editingItemId)
      ?? navigation.primary.find(item => item.id === editingItemId)
      ?? navigation.more.find(item => item.id === editingItemId);
    const nextItem: MenuItem = {
      id: editingItemId ?? crypto.randomUUID(),
      label,
      href,
      section: menuItemForm.section,
      visible: menuItemForm.visible,
      order: existing?.section === menuItemForm.section
        ? existing.order
        : Math.max(0, ...target.map(item => item.order)) + 1,
      icon: menuItemForm.icon,
      children: existing?.children ?? [],
    };
    const next: NavigationContent = {
      primary: navigation.primary.filter(item => item.id !== nextItem.id),
      more: navigation.more.filter(item => item.id !== nextItem.id),
    };
    next[menuItemForm.section] = [...next[menuItemForm.section], nextItem];
    if (await saveNavigation(next, `${label} saved and published.`)) setShowMenuItemForm(false);
  };

  const deleteMenuItem = async (item: MenuItem) => {
    if (!window.confirm(`Remove “${item.label}” and all its submenu links from the website?`)) return;
    const next: NavigationContent = {
      primary: navigation.primary.filter(entry => entry.id !== item.id),
      more: navigation.more.filter(entry => entry.id !== item.id),
    };
    await saveNavigation(next, `${item.label} removed from the website menu.`);
    if (managingItemId === item.id) setManagingItemId(null);
  };

  const toggleMenuItem = async (item: MenuItem) => {
    const next: NavigationContent = {
      primary: navigation.primary.map(entry => entry.id === item.id ? { ...entry, visible: !entry.visible } : entry),
      more: navigation.more.map(entry => entry.id === item.id ? { ...entry, visible: !entry.visible } : entry),
    };
    await saveNavigation(next, `${item.label} ${item.visible ? 'hidden' : 'shown'} on the website.`);
  };

  const moveMenuItem = async (item: MenuItem, direction: 'up' | 'down') => {
    const sectionItems = sortItems(navigation[item.section]);
    const index = sectionItems.findIndex(entry => entry.id === item.id);
    const swap = sectionItems[index + (direction === 'up' ? -1 : 1)];
    if (!swap) return;
    const next: NavigationContent = {
      primary: navigation.primary.map(entry => entry.id === item.id
        ? { ...entry, order: swap.order }
        : entry.id === swap.id ? { ...entry, order: item.order } : entry),
      more: navigation.more.map(entry => entry.id === item.id
        ? { ...entry, order: swap.order }
        : entry.id === swap.id ? { ...entry, order: item.order } : entry),
    };
    await saveNavigation(next, 'Menu order updated and published.');
  };

  const openNewMenuLink = () => {
    setEditingLinkId(null);
    setMenuLinkForm(emptyMenuLinkForm);
    setShowMenuLinkForm(true);
    setError('');
  };

  const openEditMenuLink = (link: MenuLink) => {
    setEditingLinkId(link.id);
    setMenuLinkForm({ label: link.label, href: link.href, visible: link.visible, icon: link.icon });
    setShowMenuLinkForm(true);
    setError('');
  };

  const submitMenuLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!managingItem) return;
    const label = menuLinkForm.label.trim();
    const href = menuLinkForm.href.trim();
    if (label.length < 2 || label.length > 120) {
      setError('Submenu label must be between 2 and 120 characters.');
      return;
    }
    if (!validHref(href)) {
      setError('Enter a site path starting with / or a secure https:// URL.');
      return;
    }

    const oldLink = managingItem.children.find(link => link.id === editingLinkId);
    const links = managingItem.children.filter(link => link.id !== editingLinkId);
    const nextLink: MenuLink = {
      id: editingLinkId ?? crypto.randomUUID(),
      label,
      href,
      visible: menuLinkForm.visible,
      order: oldLink?.order ?? Math.max(0, ...links.map(link => link.order)) + 1,
      icon: menuLinkForm.icon,
    };
    const updateItem = (item: MenuItem): MenuItem => item.id === managingItem.id
      ? { ...item, children: [...links, nextLink] }
      : item;
    const next: NavigationContent = {
      primary: navigation.primary.map(updateItem),
      more: navigation.more.map(updateItem),
    };
    if (await saveNavigation(next, `${label} saved and published under ${managingItem.label}.`)) setShowMenuLinkForm(false);
  };

  const removeMenuLink = async (link: MenuLink) => {
    if (!managingItem || !window.confirm(`Remove “${link.label}” from ${managingItem.label}?`)) return;
    const updateItem = (item: MenuItem): MenuItem => item.id === managingItem.id
      ? { ...item, children: item.children.filter(child => child.id !== link.id) }
      : item;
    await saveNavigation({
      primary: navigation.primary.map(updateItem),
      more: navigation.more.map(updateItem),
    }, `${link.label} removed from ${managingItem.label}.`);
  };

  const toggleMenuLink = async (link: MenuLink) => {
    if (!managingItem) return;
    const updateItem = (item: MenuItem): MenuItem => item.id === managingItem.id
      ? { ...item, children: item.children.map(child => child.id === link.id ? { ...child, visible: !child.visible } : child) }
      : item;
    await saveNavigation({
      primary: navigation.primary.map(updateItem),
      more: navigation.more.map(updateItem),
    }, `${link.label} ${link.visible ? 'hidden' : 'shown'} in ${managingItem.label}.`);
  };

  const moveMenuLink = async (link: MenuLink, direction: 'up' | 'down') => {
    if (!managingItem) return;
    const links = sortItems(managingItem.children);
    const index = links.findIndex(item => item.id === link.id);
    const swap = links[index + (direction === 'up' ? -1 : 1)];
    if (!swap) return;
    const children = managingItem.children.map(item => item.id === link.id
      ? { ...item, order: swap.order }
      : item.id === swap.id ? { ...item, order: link.order } : item);
    const updateItem = (item: MenuItem): MenuItem => item.id === managingItem.id ? { ...item, children } : item;
    await saveNavigation({
      primary: navigation.primary.map(updateItem),
      more: navigation.more.map(updateItem),
    }, 'Submenu order updated and published.');
  };

  const uploadIcon = async (
    event: ChangeEvent<HTMLInputElement>,
    setValue: (value: string) => void,
  ) => {
    try {
      const image = await readImage(event.target.files?.[0]);
      if (image) setValue(image);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to read the selected image.');
    } finally {
      event.target.value = '';
    }
  };

  const ImageField = ({
    id,
    value,
    onChange,
  }: {
    id: string;
    value: string;
    onChange: (next: string) => void;
  }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-surface-700">Menu image (optional)</label>
      <input id={id} type="file" accept="image/png,image/jpeg,image/webp"
        className="form-input" onChange={event => void uploadIcon(event, onChange)} />
      <p className="text-xs text-surface-400">PNG, JPEG, or WebP. Maximum 12 KB per image.</p>
      {iconData(value) && (
        <div className="flex items-center gap-3">
          <img src={value} alt="Menu image preview" className="h-12 w-12 rounded-lg border border-surface-200 object-contain p-1" />
          <button type="button" onClick={() => onChange('')}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-red-700 hover:bg-red-50">
            <X className="h-4 w-4" /> Remove image
          </button>
        </div>
      )}
    </div>
  );

  const MenuTable = ({ section, title }: { section: 'primary' | 'more'; title: string }) => {
    const items = orderedItems[section];
    return (
      <SpotlightCard className="h-full">
        <section className="overflow-hidden rounded-2xl border border-surface-200 bg-white h-full">
        <div className="flex items-center justify-between gap-3 border-b border-surface-100 px-4 py-3">
          <h2 className="font-semibold text-surface-900">{title}</h2>
          <button type="button" disabled={busy} onClick={() => openNewMenuItem(section)}
            className="btn-primary btn inline-flex items-center gap-1.5 text-sm">
            <Plus className="h-4 w-4" /> Add item
          </button>
        </div>
        {items.length === 0 ? (
          <p className="p-5 text-sm text-surface-500">No menu items yet. Add an item to show it on the website.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-left text-xs uppercase tracking-wide text-surface-500">
                <tr>
                  <th className="px-4 py-2.5">Order</th>
                  <th className="px-4 py-2.5">Menu item</th>
                  <th className="hidden px-4 py-2.5 md:table-cell">Link</th>
                  <th className="px-4 py-2.5">Visibility</th>
                  <th className="px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {items.map((item, index) => (
                  <tr key={item.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3">
                      <button type="button" disabled={busy || index === 0} onClick={() => void moveMenuItem(item, 'up')}
                        title="Move up" className="rounded p-1 text-surface-500 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-30">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button type="button" disabled={busy || index === items.length - 1} onClick={() => void moveMenuItem(item, 'down')}
                        title="Move down" className="rounded p-1 text-surface-500 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-30">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <span className="ml-1 text-surface-500">{item.order}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-medium text-surface-900">
                        {iconData(item.icon)
                          ? <img src={item.icon} alt="" className="h-7 w-7 rounded object-contain" />
                          : null}
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs text-surface-500">{item.children.length} submenu links</span>
                    </td>
                    <td className="hidden max-w-64 truncate px-4 py-3 font-mono text-xs text-surface-500 md:table-cell">{item.href}</td>
                    <td className="px-4 py-3">
                      {item.visible ? <Badge variant="green">Visible</Badge> : <Badge variant="gray">Hidden</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button type="button" disabled={busy} onClick={() => setManagingItemId(managingItemId === item.id ? null : item.id)}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                          {managingItemId === item.id ? 'Close submenu' : 'Edit submenu'}
                        </button>
                        <button type="button" disabled={busy} onClick={() => openEditMenuItem(item)}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-surface-700 hover:bg-surface-100">Edit</button>
                        <button type="button" disabled={busy} onClick={() => void toggleMenuItem(item)}
                          aria-label={item.visible ? `Hide ${item.label}` : `Show ${item.label}`}
                          className="rounded-lg p-1.5 text-surface-500 hover:bg-amber-50 hover:text-amber-700">
                          {item.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button type="button" disabled={busy} onClick={() => void deleteMenuItem(item)}
                          aria-label={`Remove ${item.label}`}
                          className="rounded-lg p-1.5 text-surface-500 hover:bg-red-50 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      </SpotlightCard>
    );
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-surface-900">
          <ShinyText text="Navigation Menu" shinyColor="rgba(23, 108, 115, 0.9)" />
        </h1>
        <p className="mt-1 text-sm text-surface-500 font-medium">Manage menu links and submenu content. Changes are saved and published to the website.</p>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{notice}</div>}
      {loading && <p role="status" className="text-sm text-surface-500">Loading saved navigation…</p>}
      {busy && <p role="status" className="flex items-center gap-2 text-sm text-surface-500"><Loader2 className="h-4 w-4 animate-spin" /> Saving and publishing navigation…</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <MenuTable section="primary" title="Primary Navigation" />
        <MenuTable section="more" title="More Menu" />
      </div>

      {managingItem && (
        <section className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-100 p-4">
            <div>
              <h2 className="font-semibold text-surface-900">Submenu: {managingItem.label}</h2>
              <p className="mt-1 text-xs text-surface-500">Add or update links displayed inside this menu item.</p>
            </div>
            <button type="button" disabled={busy} onClick={openNewMenuLink} className="btn-primary btn inline-flex items-center gap-2 text-sm">
              <Plus className="h-4 w-4" /> Add submenu link
            </button>
          </div>
          {managingItem.children.length === 0 ? (
            <p className="p-5 text-sm text-surface-500">This menu has no submenu links yet.</p>
          ) : (
            <div className="divide-y divide-surface-100">
              {sortItems(managingItem.children).map((link, index, links) => (
                <div key={link.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {iconData(link.icon) && <img src={link.icon} alt="" className="h-9 w-9 rounded object-contain" />}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-surface-900">{link.label}</p>
                      <p className="truncate font-mono text-xs text-surface-500">{link.href}</p>
                    </div>
                    {link.visible ? <Badge variant="green">Visible</Badge> : <Badge variant="gray">Hidden</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" disabled={busy || index === 0} onClick={() => void moveMenuLink(link, 'up')} title="Move up"
                      className="rounded p-1.5 text-surface-500 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-30">
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button type="button" disabled={busy || index === links.length - 1} onClick={() => void moveMenuLink(link, 'down')} title="Move down"
                      className="rounded p-1.5 text-surface-500 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-30">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button type="button" disabled={busy} onClick={() => openEditMenuLink(link)}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-surface-700 hover:bg-surface-100">Edit</button>
                    <button type="button" disabled={busy} onClick={() => void toggleMenuLink(link)}
                      aria-label={link.visible ? `Hide ${link.label}` : `Show ${link.label}`}
                      className="rounded-lg p-1.5 text-surface-500 hover:bg-amber-50 hover:text-amber-700">
                      {link.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button type="button" disabled={busy} onClick={() => void removeMenuLink(link)}
                      aria-label={`Remove ${link.label}`}
                      className="rounded-lg p-1.5 text-surface-500 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-surface-200 bg-white p-5">
        <h2 className="font-semibold text-surface-900">Website menu preview</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-surface-950 p-3">
          {orderedItems.primary.filter(item => item.visible).map(item => (
            <span key={item.id} className="rounded-lg px-3 py-1.5 text-sm font-medium text-surface-100">
              {item.label}
            </span>
          ))}
          {orderedItems.more.some(item => item.visible) && (
            <span className="rounded-lg bg-surface-800 px-3 py-1.5 text-sm font-medium text-surface-100">
              More · {orderedItems.more.filter(item => item.visible).length}
            </span>
          )}
        </div>
        {managingItem && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sortItems(managingItem.children).filter(link => link.visible).map(link => (
              <span key={link.id} className="rounded-full bg-surface-100 px-3 py-1 text-xs text-surface-700">{link.label}</span>
            ))}
          </div>
        )}
      </section>

      {showMenuItemForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <form onSubmit={event => void submitMenuItem(event)} className="my-8 max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-surface-900">{editingItemId ? 'Edit navigation item' : 'Add navigation item'}</h2>
              <button type="button" onClick={() => setShowMenuItemForm(false)} aria-label="Close form" className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block text-sm font-medium text-surface-700">
              Menu label *
              <input className="form-input mt-1.5" value={menuItemForm.label} onChange={event => setMenuItemForm(form => ({ ...form, label: event.target.value }))} maxLength={120} required />
            </label>
            <label className="block text-sm font-medium text-surface-700">
              Link URL *
              <input className="form-input mt-1.5" value={menuItemForm.href} onChange={event => setMenuItemForm(form => ({ ...form, href: event.target.value }))} placeholder="/about" maxLength={500} required />
            </label>
            <label className="block text-sm font-medium text-surface-700">
              Menu placement
              <select className="form-select mt-1.5" value={menuItemForm.section} onChange={event => setMenuItemForm(form => ({ ...form, section: event.target.value as MenuItemForm['section'] }))}>
                <option value="primary">Primary Navigation</option>
                <option value="more">More Menu</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-surface-700">
              <input type="checkbox" checked={menuItemForm.visible} onChange={event => setMenuItemForm(form => ({ ...form, visible: event.target.checked }))} />
              Show this item on the website
            </label>
            <ImageField id="nav-menu-image" value={menuItemForm.icon} onChange={icon => setMenuItemForm(form => ({ ...form, icon }))} />
            <div className="flex justify-end gap-2 border-t border-surface-100 pt-4">
              <button type="button" onClick={() => setShowMenuItemForm(false)} className="btn-secondary btn">Cancel</button>
              <button type="submit" disabled={busy} className="btn-primary btn inline-flex items-center gap-2">
                <Save className="h-4 w-4" /> Save and publish
              </button>
            </div>
          </form>
        </div>
      )}

      {showMenuLinkForm && managingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <form onSubmit={event => void submitMenuLink(event)} className="my-8 max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-surface-900">{editingLinkId ? 'Edit submenu link' : 'Add submenu link'}</h2>
                <p className="mt-1 text-xs text-surface-500">Menu: {managingItem.label}</p>
              </div>
              <button type="button" onClick={() => setShowMenuLinkForm(false)} aria-label="Close form" className="rounded-lg p-1.5 text-surface-500 hover:bg-surface-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="block text-sm font-medium text-surface-700">
              Link label *
              <input className="form-input mt-1.5" value={menuLinkForm.label} onChange={event => setMenuLinkForm(form => ({ ...form, label: event.target.value }))} maxLength={120} required />
            </label>
            <label className="block text-sm font-medium text-surface-700">
              Link URL *
              <input className="form-input mt-1.5" value={menuLinkForm.href} onChange={event => setMenuLinkForm(form => ({ ...form, href: event.target.value }))} placeholder="/page" maxLength={500} required />
            </label>
            <label className="flex items-center gap-2 text-sm text-surface-700">
              <input type="checkbox" checked={menuLinkForm.visible} onChange={event => setMenuLinkForm(form => ({ ...form, visible: event.target.checked }))} />
              Show this submenu link
            </label>
            <ImageField id="nav-submenu-image" value={menuLinkForm.icon} onChange={icon => setMenuLinkForm(form => ({ ...form, icon }))} />
            <div className="flex justify-end gap-2 border-t border-surface-100 pt-4">
              <button type="button" onClick={() => setShowMenuLinkForm(false)} className="btn-secondary btn">Cancel</button>
              <button type="submit" disabled={busy} className="btn-primary btn inline-flex items-center gap-2">
                <Save className="h-4 w-4" /> Save and publish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
