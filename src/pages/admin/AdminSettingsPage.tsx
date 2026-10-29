import { siteConfig } from '../../data/siteConfig';
import { Settings, ExternalLink } from 'lucide-react';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { ShinyText } from '../../components/ui/ShinyText';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-surface-900">
          <ShinyText text="Settings" shinyColor="rgba(23, 108, 115, 0.9)" />
        </h1>
        <p className="text-surface-500 text-sm mt-0.5 font-medium">Global Minds Technologies site configuration — edit <code className="bg-surface-100 px-1 rounded">src/data/siteConfig.ts</code> to update</p>
      </div>

      <SpotlightCard>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 mb-1">Configuration via Data Files</h3>
              <p className="text-amber-700 text-sm font-medium">
                All site-wide settings are currently managed in <code>src/data/siteConfig.ts</code>. 
                A full settings UI with persistence requires a backend API. Below is a read-only view of current config.
              </p>
            </div>
          </div>
        </div>
      </SpotlightCard>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Brand */}
        <SpotlightCard>
          <div className="bg-white rounded-2xl border border-surface-100 p-6 h-full">
            <h2 className="font-semibold text-surface-900 mb-4">Brand</h2>
            <dl className="space-y-3">
              {[
                { label: 'Brand Name', value: siteConfig.brandName },
                { label: 'Tagline', value: siteConfig.tagline },
                { label: 'Founded', value: String(siteConfig.foundedYear) },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <dt className="text-sm text-surface-500 flex-shrink-0 font-medium">{item.label}</dt>
                  <dd className="text-sm font-medium text-surface-900 text-right">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </SpotlightCard>

        {/* Contact */}
        <SpotlightCard>
          <div className="bg-white rounded-2xl border border-surface-100 p-6 h-full">
            <h2 className="font-semibold text-surface-900 mb-4">Contact</h2>
            <dl className="space-y-3">
              {[
                { label: 'Email', value: siteConfig.email },
                { label: 'Phone', value: siteConfig.phone },
                { label: 'WhatsApp', value: siteConfig.whatsapp },
                { label: 'Hours', value: siteConfig.businessHours },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between gap-4">
                  <dt className="text-sm text-surface-500 flex-shrink-0 font-medium">{item.label}</dt>
                  <dd className="text-sm font-medium text-surface-900 text-right break-all">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </SpotlightCard>

        {/* Social */}
        <SpotlightCard>
          <div className="bg-white rounded-2xl border border-surface-100 p-6 h-full">
            <h2 className="font-semibold text-surface-900 mb-4">Social Links</h2>
            <dl className="space-y-3">
              {Object.entries(siteConfig.socialLinks).map(([platform, url]) => (
                <div key={platform} className="flex items-center justify-between gap-4">
                  <dt className="text-sm text-surface-500 capitalize font-medium">{platform}</dt>
                  <dd>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 font-semibold">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </SpotlightCard>

        {/* SEO */}
        <SpotlightCard>
          <div className="bg-white rounded-2xl border border-surface-100 p-6 h-full">
            <h2 className="font-semibold text-surface-900 mb-4">SEO Defaults</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-surface-500 mb-1 font-medium">Default Title</dt>
                <dd className="text-xs bg-surface-50 rounded-lg p-2 text-surface-700 font-mono">{siteConfig.seo.defaultTitle}</dd>
              </div>
              <div>
                <dt className="text-sm text-surface-500 mb-1 font-medium">Default Description</dt>
                <dd className="text-xs bg-surface-50 rounded-lg p-2 text-surface-700 line-clamp-3 leading-relaxed">{siteConfig.seo.defaultDescription}</dd>
              </div>
            </dl>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
