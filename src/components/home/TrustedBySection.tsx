import { Marquee } from '../ui/Marquee';
import { ShinyText } from '../ui/ShinyText';

const hiringPartners = [
  { name: 'Amazon Web Services', tag: 'Cloud / DevOps' },
  { name: 'Microsoft Azure', tag: 'Cloud & AI' },
  { name: 'Google Cloud Platform', tag: 'Data & Cloud' },
  { name: 'TCS', tag: 'Enterprise IT' },
  { name: 'Infosys', tag: 'Full Stack' },
  { name: 'Cognizant', tag: 'Automation Testing' },
  { name: 'Wipro', tag: 'Cloud & Cyber' },
  { name: 'HCLTech', tag: 'Software Testing' },
  { name: 'Accenture', tag: 'AI & Data Science' },
  { name: 'Capgemini', tag: 'Digital Engineering' },
  { name: 'Tech Mahindra', tag: 'Network & Cloud' },
  { name: 'LTIMindtree', tag: 'Full Stack' },
];

export function TrustedBySection() {
  return (
    <section className="border-y border-surface-200 bg-surface-50 py-8 sm:py-10 overflow-hidden" aria-label="Hiring partners">
      <div className="container-xl mb-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-surface-200 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShinyText text="50+ Active Hiring Network Partners" shinyColor="rgba(23, 108, 115, 0.9)" />
          </div>
          <p className="text-xs text-surface-600 font-medium">
            Our graduates work at leading technology organisations and global enterprises
          </p>
        </div>
      </div>

      <Marquee speed={32} pauseOnHover direction="left" className="py-2">
        {hiringPartners.map((partner) => (
          <div
            key={partner.name}
            className="flex items-center gap-3 rounded-2xl border border-surface-200 bg-white px-5 py-3 shadow-xs hover:border-brand-400 hover:shadow-card-md transition-all duration-200 cursor-default"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-700 font-bold text-xs border border-brand-200">
              {partner.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-surface-900 whitespace-nowrap">{partner.name}</p>
              <p className="text-[11px] text-surface-500 font-medium whitespace-nowrap">{partner.tag}</p>
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
