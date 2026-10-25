import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import Photo from './Photo';

const CARDS_DATA = [
  {
    tag: 'WHAT IT IS',
    title: 'The Multi-Roster Command Center',
    accent: 'cyan',
    accentBorder: 'border-cyan/30 hover:border-cyan/70',
    glowColor: 'group-hover:shadow-[0_0_35px_rgba(130,234,244,0.18)]',
    topBar: 'from-cyan to-cyan/20',
    iconBg: 'bg-cyan/10 border-cyan/30 text-cyan',
    iconSvg: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12a14.5 14.5 0 0 0 20 0" />
        <circle cx="12" cy="12" r="3" fill="#82EAF4" fillOpacity="0.4" />
      </svg>
    ),
    body: 'A scouting and multi-roster command center for professional esports organisations running Valorant and CS2 squads.',
    chips: ['Valorant Tier-1', 'CS2 Premier', 'Live Telemetry Ingestion'],
    badge: 'STATUS: ACTIVE TELEMETRY',
  },
  {
    tag: 'WHO IT IS FOR',
    title: 'Engineered for the Whole Front Office',
    accent: 'gold',
    accentBorder: 'border-gold/30 hover:border-gold/70',
    glowColor: 'group-hover:shadow-[0_0_35px_rgba(245,184,61,0.18)]',
    topBar: 'from-gold to-gold/20',
    iconBg: 'bg-gold/10 border-gold/30 text-gold',
    iconSvg: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    body: 'General Managers, Head Coaches/Analysts and Talent Scouts, each with role-based access to exactly what they need.',
    chips: ['GM: Budget & Approvals', 'Coach: Roster Sim', 'Scout: IGL Consensus'],
    badge: 'GOVERNANCE: 3-TIER RBAC',
  },
  {
    tag: 'WHAT IT DOES',
    title: 'From Open Deficit to Cryptographic Lock',
    accent: 'cyan',
    accentBorder: 'border-cyan/30 hover:border-cyan/70',
    glowColor: 'group-hover:shadow-[0_0_35px_rgba(130,234,244,0.18)]',
    topBar: 'from-cyan via-gold to-cyan/20',
    iconBg: 'bg-cyan/10 border-cyan/30 text-cyan',
    iconSvg: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1.5" fill="#82EAF4" />
      </svg>
    ),
    body: 'Detects roster gaps, ranks candidates by fit, simulates signings, tracks IGL quality, ingests match data and locks decisions with a cryptographic audit trail.',
    chips: ['Gap Detection', 'Fit Engine', 'Swap Sim', 'SHA-256 Audit'],
    badge: 'ZERO-VARIANCE VERIFIED',
  },
];

export default function WhatItIs() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('.wi-card', {
        opacity: 0,
        y: 60,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.wi-grid', start: 'top 80%' },
      });
      gsap.fromTo(
        '.wi-img',
        { clipPath: 'inset(100% 0 0 0)', scale: 1.2 },
        {
          clipPath: 'inset(0% 0 0 0)',
          scale: 1,
          duration: 1.4,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.wi-img', start: 'top 80%' },
        },
      );
      gsap.fromTo(
        '.wi-par',
        { yPercent: -10 },
        { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.wi-img', scrub: true } },
      );
    },
    { scope: root },
  );

  return (
    <section id="what" ref={root} className="max-w-container mx-auto px-6 py-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="font-mono text-cyan text-sm mb-3 tracking-wider">
            [ ARCHITECTURE &amp; CAPABILITIES ]
          </p>
          <h2 className="font-heading text-5xl md:text-7xl max-w-4xl text-textPrimary leading-tight">
            One platform. From open slot to signed player.
          </h2>
        </div>
        <p className="text-textSecondary max-w-md text-base leading-relaxed">
          Replacing fragmented spreadsheets and instinct scouting with deterministic, telemetry-backed intelligence.
        </p>
      </div>

      <div className="wi-grid grid md:grid-cols-3 gap-6 mt-16">
        {CARDS_DATA.map((card) => (
          <article
            key={card.tag}
            className={`wi-card group relative flex flex-col justify-between bg-gradient-to-b from-[#1A1D20] to-[#111315] border ${card.accentBorder} rounded-panel p-8 transition-all duration-500 hover:-translate-y-1.5 ${card.glowColor} overflow-hidden`}
          >
            {/* Top Glowing Gradient Accent Stripe */}
            <div
              className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${card.topBar} opacity-80 group-hover:opacity-100 transition-opacity`}
            />

            <div>
              {/* Header with Icon & Monospace Tag */}
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`font-mono text-xs font-bold tracking-widest ${
                    card.accent === 'gold' ? 'text-gold' : 'text-cyan'
                  }`}
                >
                  [ {card.tag} ]
                </span>
                <div
                  className={`w-11 h-11 rounded-control border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${card.iconBg}`}
                >
                  {card.iconSvg}
                </div>
              </div>

              {/* Title & Body */}
              <h3 className="font-heading text-2xl font-bold text-textPrimary group-hover:text-white transition-colors">
                {card.title}
              </h3>
              <p className="mt-4 text-textSecondary text-sm leading-relaxed">
                {card.body}
              </p>
            </div>

            {/* Chips and Tactical Footer */}
            <div className="mt-8 pt-6 border-t border-charcoal-border/60">
              <div className="flex flex-wrap gap-2 mb-4">
                {card.chips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-block px-2.5 py-1 text-[11px] font-mono rounded bg-charcoal-card border border-charcoal-border text-textSecondary group-hover:border-charcoal-borderLight transition-colors"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-textDim pt-1">
                <span>{card.badge}</span>
                <span className="text-cyan group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="wi-img mt-16 overflow-hidden rounded-panel h-[60vh] border border-charcoal-border relative group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-main/80 via-transparent to-transparent z-10 pointer-events-none" />
        <Photo
          src="/images/analyst-screens.webp"
          alt="Analyst reviewing player data on multiple screens"
          className="wi-par w-full h-[125%]"
        />
        <div className="absolute bottom-6 left-6 z-20 font-mono text-xs text-textSecondary bg-charcoal-card/80 backdrop-blur-md px-4 py-2 rounded-control border border-charcoal-border flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
          <span>SCOUTGRID CORE TELEMETRY // REAL-TIME INGESTION ACTIVE</span>
        </div>
      </div>
    </section>
  );
}
