import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

const MODULES = [
  {
    icon: '🏢',
    num: '01',
    accent: 'cyan',
    tag: 'ROSTER OPERATIONS',
    title: 'Multi-Roster Operations',
    desc: 'All squads, all titles in one command center: tactical profiles, synergy index, payroll vs cap and vacancy alerts.',
    features: ['Multi-Squad Synchronized', 'Payroll Cap Telemetry', 'Active Vacancy Alerts'],
  },
  {
    icon: '🎯',
    num: '02',
    accent: 'gold',
    tag: 'AI SCOUTING ENGINE',
    title: 'AI Talent Scouting',
    desc: 'Role-specific ranking with ranked / provisional / unranked tiers and anchor-metric rules.',
    features: ['Anchor Metric Guardrails', 'Tier-1 to Tier-3 Tiers', 'Zero Highlight Bias'],
  },
  {
    icon: '🧠',
    num: '03',
    accent: 'cyan',
    tag: 'LEADERSHIP INTEL',
    title: 'IGL & Shotcalling Hub',
    desc: 'Shotcall impact, mid-round decision quality and certified scout consensus per captain.',
    features: ['Mid-Round Quality Index', 'Certified Scout Notes', 'Consensus Verification'],
  },
  {
    icon: '🧪',
    num: '04',
    accent: 'gold',
    tag: 'SIMULATION LAB',
    title: 'Roster Synergy Simulator',
    desc: 'Counterfactual signing: before/after synergy, win-rate delta, payroll and buyout.',
    features: ['Win-Rate Delta Model', 'Buyout Amortization', 'Swap Preview'],
  },
  {
    icon: '⚖️',
    num: '05',
    accent: 'cyan',
    tag: 'HEAD-TO-HEAD',
    title: 'Candidate Duel & Compare',
    desc: 'Up to 3 candidates side by side with radar overlay, strengths and trade-offs.',
    features: ['3-Way Radar Overlay', 'Strengths Matrix', 'Role Deficit Check'],
  },
  {
    icon: '📊',
    num: '06',
    accent: 'gold',
    tag: 'DATA TELEMETRY',
    title: 'Match Telemetry & CSV',
    desc: 'Tournament match logs, situational highlights and SHA-256 verified, formula-sanitised CSV ingestion.',
    features: ['SHA-256 Cryptographic Hash', 'Formula Sanitization', 'Raw VOD Sync'],
  },
  {
    icon: '🔒',
    num: '07',
    accent: 'cyan',
    tag: 'AUDIT GOVERNANCE',
    title: 'Decision Audit Trail',
    desc: 'Immutable recommendation snapshots re-verifiable with zero variance.',
    features: ['Zero Score Variance', 'Immutable Snapshots', 'Governance Ready'],
  },
];

export default function FeatureRail() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width:1024px) and (prefers-reduced-motion:no-preference)', () => {
        const dist = () => track.current!.scrollWidth - window.innerWidth;
        gsap.to(track.current, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            pin: true,
            scrub: 1,
            end: () => '+=' + dist(),
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      id="features"
      ref={root}
      className="overflow-hidden py-24 lg:py-0 lg:h-screen lg:flex lg:flex-col lg:justify-center bg-charcoal-sidebar/60"
    >
      <div className="max-w-container mx-auto w-full px-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-mono text-cyan text-sm tracking-wider mb-2">[ CORE MODULES ]</p>
          <h2 className="font-heading text-5xl md:text-7xl text-textPrimary leading-tight">
            Seven modules. One workflow.
          </h2>
        </div>
        <p className="text-textSecondary text-sm font-mono">
          SCROLL TO EXPLORE ARCHITECTURE →
        </p>
      </div>

      <div ref={track} className="flex flex-col lg:flex-row gap-6 px-6 lg:w-max">
        {MODULES.map((mod) => (
          <article
            key={mod.title}
            className={`lg:w-[35vw] shrink-0 relative flex flex-col justify-between bg-gradient-to-b from-[#1C1F22] to-[#121416] border ${
              mod.accent === 'gold' ? 'border-gold/30 hover:border-gold/70' : 'border-cyan/30 hover:border-cyan/70'
            } rounded-panel p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(130,234,244,0.14)] overflow-hidden group`}
          >
            {/* Top Glowing Stripe */}
            <div
              className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${
                mod.accent === 'gold' ? 'from-gold via-gold/50 to-transparent' : 'from-cyan via-cyan/50 to-transparent'
              }`}
            />

            <div>
              {/* Header with Icon and Module Number */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded bg-charcoal-elevated border border-charcoal-border">
                    {mod.icon}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold tracking-wider ${
                      mod.accent === 'gold' ? 'text-gold' : 'text-cyan'
                    }`}
                  >
                    [ {mod.tag} ]
                  </span>
                </div>
                <span className="font-mono text-textDim text-sm font-bold">
                  {mod.num} / 07
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="font-heading text-3xl font-bold text-textPrimary group-hover:text-white transition-colors">
                {mod.title}
              </h3>
              <p className="mt-4 text-textSecondary text-sm leading-relaxed">
                {mod.desc}
              </p>
            </div>

            {/* Feature Chips */}
            <div className="mt-8 pt-6 border-t border-charcoal-border/70 flex flex-wrap gap-2">
              {mod.features.map((feat) => (
                <span
                  key={feat}
                  className="px-2.5 py-1 text-[11px] font-mono rounded bg-charcoal-card border border-charcoal-border text-textSecondary"
                >
                  ✓ {feat}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
