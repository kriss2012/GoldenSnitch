import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

const TRUST_POINTS = [
  {
    icon: '🛡️',
    title: 'SHA-256 Verified Telemetry Data',
    desc: 'Every CSV match import is cryptographically hashed, range bound-checked, and formula-injection sanitised before storage.',
    tag: 'INTEGRITY VERIFIED',
  },
  {
    icon: '⚡',
    title: 'Deterministic Multi-Vector Scoring',
    desc: 'Same tactical inputs produce the exact same algorithm fit score, every single time. Zero statistical drift or black-box opacity.',
    tag: 'REPRODUCIBLE',
  },
  {
    icon: '🎯',
    title: 'Honest Competitive Rankings',
    desc: 'Missing anchor metrics or under 100 competitive rounds? Candidates are explicitly marked provisional or unranked, never inflated.',
    tag: 'ANTI-HIGHLIGHT BIAS',
  },
  {
    icon: '🔒',
    title: 'Audit-Ready Executive Snapshots',
    desc: 'Decision snapshots are immutable records re-evaluable with zero variance for team ownership, league inquiries, and board governance.',
    tag: 'ZERO VARIANCE',
  },
];

export default function Trust() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('.tr', {
        opacity: 0,
        x: -50,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      });
    },
    { scope: root },
  );

  return (
    <section id="trust" ref={root} className="bg-charcoal-sidebar py-32 px-6 border-t border-charcoal-border">
      <div className="max-w-container mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-16 items-start">
        <div className="sticky top-28">
          <p className="font-mono text-gold text-sm tracking-wider">[ WHY TRUST THE NUMBERS ]</p>
          <h2 className="font-heading text-5xl md:text-6xl mt-4 text-textPrimary leading-tight">
            Transparent by design.
          </h2>
          <p className="mt-6 text-textSecondary text-base leading-relaxed">
            In tier-1 esports where contracts reach seven figures, scouting decisions cannot rely on intuition or black-box guesses. We built Golden Snitch on reproducible mathematics and immutable governance.
          </p>

          <div className="mt-8 p-4 rounded-panel bg-charcoal-card border border-charcoal-border flex items-center gap-4">
            <span className="w-3 h-3 rounded-full bg-cyan shadow-[0_0_10px_#82EAF4]" />
            <div className="text-xs font-mono text-textSecondary">
              <span className="text-cyan font-bold block">GOVERNANCE GUARANTEE</span>
              <span>Re-running any saved snapshot reproduces identical scores.</span>
            </div>
          </div>
        </div>

        <ul className="space-y-4">
          {TRUST_POINTS.map((item) => (
            <li
              key={item.title}
              className="tr p-6 rounded-panel bg-gradient-to-r from-charcoal-card to-charcoal-sidebar border border-charcoal-border hover:border-cyan/50 transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <h3 className="font-heading text-2xl font-bold text-cyan">{item.title}</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-charcoal-elevated text-gold border border-gold/30">
                  {item.tag}
                </span>
              </div>
              <p className="mt-2 text-textSecondary text-sm leading-relaxed pl-8">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
