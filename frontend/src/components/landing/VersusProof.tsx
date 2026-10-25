import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

export default function VersusProof() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion:no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=1400',
            scrub: true,
            pin: true,
          },
        });
        tl.from('.vs-card', { y: 80, opacity: 0, stagger: 0.2, duration: 1 })
          .to('.v-acs', { textContent: 285, snap: { textContent: 1 }, duration: 1 }, '>')
          .to('.v-util', { textContent: 30, snap: { textContent: 1 }, duration: 1 }, '<')
          .to('.v-fit', { textContent: 49.3, snap: { textContent: 0.1 }, duration: 1 }, '<')
          .to('.m-util', { textContent: 80, snap: { textContent: 1 }, duration: 1 }, '>')
          .to('.m-fit', { textContent: 74.8, snap: { textContent: 0.1 }, duration: 1 }, '<')
          .to('.m-card', { scale: 1.05, borderColor: '#82EAF4', duration: 1 })
          .from('.vs-verdict', { opacity: 0, y: 30, duration: 1 });
      });
    },
    { scope: root },
  );

  const row = (l: string, c: string, v: number, sub?: string, isWarning?: boolean) => (
    <div className="flex justify-between items-center border-b border-charcoal-border/70 py-3.5">
      <div>
        <span className="text-textSecondary text-sm font-medium">{l}</span>
        {sub && <span className="block text-[11px] font-mono text-textDim">{sub}</span>}
      </div>
      <div className="text-right">
        <b className={`${c} tabular-nums text-lg font-mono ${isWarning ? 'text-gold' : 'text-textPrimary'}`}>
          {v}
        </b>
      </div>
    </div>
  );

  return (
    <section id="proof" ref={root} className="min-h-screen grid place-items-center px-6 py-24 bg-gradient-to-b from-charcoal-main via-charcoal-sidebar to-charcoal-main">
      <div className="max-w-5xl w-full">
        <div className="flex items-center justify-between">
          <p className="font-mono text-gold text-sm tracking-wider">[ PROOF · CASE STUDY ]</p>
          <span className="text-xs font-mono text-cyan bg-cyan/10 px-3 py-1 rounded border border-cyan/30 uppercase tracking-wider">
            VCT AMERICAS ROSTER VACANCY
          </span>
        </div>
        <h2 className="font-heading text-4xl md:text-6xl mt-4 text-textPrimary leading-tight">
          The loudest stats are not the right fit.
        </h2>
        <p className="mt-3 text-textSecondary max-w-2xl text-base">
          Recruiting by combat leaderboard alone damages team synergy. Here is what happens when two real candidates are evaluated against Sentinels’ open controller slot.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mt-12 items-stretch">
          {/* Voltz - Decoy Card */}
          <div className="vs-card relative flex flex-col justify-between bg-gradient-to-b from-[#1A1817] to-[#121111] border border-gold/30 rounded-panel p-8 shadow-[0_0_30px_rgba(245,184,61,0.08)]">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gold/80 to-transparent" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono text-gold bg-gold/15 px-2.5 py-0.5 rounded border border-gold/40 font-bold">
                  ⚠️ STATISTICAL DECOY
                </span>
                <span className="text-xs font-mono text-textDim">#1 BY LEADERBOARD</span>
              </div>
              <h3 className="font-heading text-3xl text-textPrimary font-bold">
                Voltz
              </h3>
              <p className="text-xs text-textDim font-mono mt-1 mb-6">Role: Duelist / Aggressive Flex</p>

              {row('Combat Rating (ACS)', 'v-acs', 0, 'Ranked #1 overall in tournament')}
              {row('Utility Effectiveness', 'v-util', 0, 'Severe deficit: fails Sentinel needs', true)}

              <div className="flex justify-between items-center border-b border-charcoal-border/70 py-3.5">
                <div>
                  <span className="text-textSecondary text-sm font-medium">Shotcall / IGL Capability</span>
                  <span className="block text-[11px] font-mono text-textDim">Requires established captain</span>
                </div>
                <b className="text-textDim font-mono text-sm">None</b>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-charcoal-border/60">
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-mono text-xs text-textDim uppercase tracking-wider">Strategic Fit Index</p>
                  <p className="font-heading text-6xl text-gold font-black tabular-nums mt-1 drop-shadow-[0_0_15px_rgba(245,184,61,0.4)]">
                    <span className="v-fit">0</span>
                    <span className="text-2xl text-textDim font-normal font-sans">/100</span>
                  </p>
                </div>
                <span className="px-3 py-1 rounded bg-gold/15 text-gold font-mono text-xs font-bold border border-gold/30 mb-2">
                  MISFIT RISK
                </span>
              </div>
            </div>
          </div>

          {/* Mirage - Top Pick Card */}
          <div className="vs-card m-card relative flex flex-col justify-between bg-gradient-to-b from-[#182326] to-[#101618] border-2 border-cyan/50 rounded-panel p-8 shadow-[0_0_40px_rgba(130,234,244,0.22)]">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-cyan via-cyan to-transparent" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono text-cyan bg-cyan/15 px-2.5 py-0.5 rounded border border-cyan/40 font-bold">
                  ★ RECOMMENDED SIGNING
                </span>
                <span className="text-xs font-mono text-cyan font-bold">OPTIMAL ROSTER FIT</span>
              </div>
              <h3 className="font-heading text-3xl text-textPrimary font-bold flex items-center gap-2">
                Mirage <span className="text-cyan text-xl">✦</span>
              </h3>
              <p className="text-xs text-cyan font-mono mt-1 mb-6">Role: Primary Controller / Site Anchor</p>

              {row('Utility Effectiveness', 'm-util', 0, 'Directly resolves 35 → 70 gap')}
              <div className="flex justify-between items-center border-b border-charcoal-border/70 py-3.5">
                <div>
                  <span className="text-textSecondary text-sm font-medium">Shotcall / IGL Capability</span>
                  <span className="block text-[11px] font-mono text-textDim">Certified Tier-1 Mid-Round Caller</span>
                </div>
                <b className="text-cyan font-mono text-base font-bold">✓ Tier-1 Certified</b>
              </div>
              <div className="flex justify-between items-center border-b border-charcoal-border/70 py-3.5">
                <div>
                  <span className="text-textSecondary text-sm font-medium">Synergy Boost</span>
                  <span className="block text-[11px] font-mono text-textDim">Predicted round win-rate impact</span>
                </div>
                <b className="text-cyan font-mono text-base font-bold">+19% (+6.2% WR)</b>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-charcoal-border/60">
              <div className="flex items-end justify-between">
                <div>
                  <p className="font-mono text-xs text-textDim uppercase tracking-wider">Strategic Fit Index</p>
                  <p className="font-heading text-6xl text-cyan font-black tabular-nums mt-1 drop-shadow-[0_0_20px_rgba(130,234,244,0.6)]">
                    <span className="m-fit">0</span>
                    <span className="text-2xl text-textDim font-normal font-sans">/100</span>
                  </p>
                </div>
                <span className="px-3 py-1 rounded bg-cyan/20 text-cyan font-mono text-xs font-bold border border-cyan/50 mb-2 shadow-[0_0_10px_#82EAF4]">
                  SIGNING VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verdict Callout */}
        <div className="vs-verdict mt-12 p-6 rounded-panel bg-charcoal-card border border-charcoal-border flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-cyan/10 border border-cyan/40 text-cyan flex items-center justify-center text-xl shrink-0">
            ⚖️
          </div>
          <p className="text-lg text-textSecondary leading-relaxed">
            <b className="text-textPrimary">The Decision:</b> Mirage covers Sentinels' 35-vs-70 utility deficit and brings certified shot-calling. Voltz tops the combat board with 285 ACS, but leaves the defensive core exposed.
          </p>
        </div>
      </div>
    </section>
  );
}
