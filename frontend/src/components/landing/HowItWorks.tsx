import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import Photo from './Photo';

const SCROLL_CHAPTERS = [
  {
    num: '01 / 04',
    tag: 'ROSTER DEFICIT',
    title: 'Catch the Gap.',
    desc: 'When a player departs, chemistry collapses. Identify the tactical void before it costs you the season.',
    img: 'team-huddle.webp',
    caption: 'Squad Huddle // Arena Stage',
    reticle: 'DEFICIT FLAGGED',
  },
  {
    num: '02 / 04',
    tag: 'THE ANCHOR',
    title: 'Scout the Anchor.',
    desc: 'Beyond combat leaderboards lies the utility anchor who controls the map and protects your stars.',
    img: 'setup-neon.webp',
    caption: 'Pro Battlestations // Neon Rig',
    reticle: 'ROLE ALIGNED',
  },
  {
    num: '03 / 04',
    tag: 'SIMULATION',
    title: 'Predict Glory.',
    desc: 'Simulate any roster swap before committing capital. Forecast synergy and round win-rate deltas.',
    img: 'analyst-screens.webp',
    caption: 'War Room // Telemetry Ingestion',
    reticle: 'SYNERGY MODEL',
  },
  {
    num: '04 / 04',
    tag: 'GOVERNANCE',
    title: 'Seal the Title.',
    desc: 'Lock decisions into an immutable, audit-ready snapshot. Transparent front-office alignment.',
    img: 'crowd-lights.webp',
    caption: 'Championship Arena // Trophy Ceremony',
    reticle: 'DECISION LOCKED',
  },
];

export default function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const textPanels = gsap.utils.toArray<HTMLElement>('.story-text-pane');
        const imagePanels = gsap.utils.toArray<HTMLElement>('.story-image-pane');

        // Initial states: first item fully visible, subsequent items hidden
        textPanels.forEach((el, idx) => {
          gsap.set(el, { autoAlpha: idx === 0 ? 1 : 0, y: idx === 0 ? 0 : 25 });
        });
        imagePanels.forEach((el, idx) => {
          gsap.set(el, { autoAlpha: idx === 0 ? 1 : 0, scale: idx === 0 ? 1 : 0.96 });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => '+=' + window.innerHeight * (SCROLL_CHAPTERS.length - 0.5),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Top progress bar
        tl.to('.story-progress-bar', { scaleX: 1, ease: 'none', duration: SCROLL_CHAPTERS.length - 1 }, 0);

        // Synchronized, clean crossfades between chapters
        for (let i = 1; i < SCROLL_CHAPTERS.length; i++) {
          const startTime = i - 1;
          tl.to(
            textPanels[i - 1],
            { autoAlpha: 0, y: -20, duration: 0.45, ease: 'power2.inOut' },
            startTime + 0.35,
          )
            .to(
              imagePanels[i - 1],
              { autoAlpha: 0, scale: 0.96, duration: 0.45, ease: 'power2.inOut' },
              startTime + 0.35,
            )
            .fromTo(
              textPanels[i],
              { autoAlpha: 0, y: 20 },
              { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.inOut' },
              startTime + 0.65,
            )
            .fromTo(
              imagePanels[i],
              { autoAlpha: 0, scale: 0.96 },
              { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power2.inOut' },
              startTime + 0.65,
            );
        }
      });
    },
    { scope: root },
  );

  return (
    <section id="story" ref={root} className="relative bg-[#050505] min-h-screen flex items-center justify-center">
      {/* Top Ambient Progress Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-white/10 z-30">
        <div className="story-progress-bar h-full bg-gold origin-left scale-x-0" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center px-6 lg:px-12 py-20 lg:py-0">
        {/* Left Column: SMALL, Compact Text */}
        <div className="lg:col-span-4 flex flex-col justify-center">
          <p className="font-mono text-gold text-[11px] tracking-widest uppercase mb-4">
            [ THE 4-STEP SQUAD JOURNEY ]
          </p>

          <div className="relative lg:h-52">
            {SCROLL_CHAPTERS.map((ch, i) => (
              <div
                key={ch.title}
                className="story-text-pane lg:absolute inset-0 mb-10 lg:mb-0 flex flex-col justify-center"
              >
                <div className="flex items-center gap-2 font-mono text-[11px] mb-2 text-neutral-400">
                  <span className="text-gold font-bold">{ch.num}</span>
                  <span>|</span>
                  <span className="tracking-wider">{ch.tag}</span>
                </div>

                {/* Small Clean Title */}
                <h3 className="font-heading text-2xl sm:text-3xl font-black text-white leading-tight">
                  {ch.title}
                </h3>

                {/* Small Description */}
                <p className="mt-3 text-neutral-400 text-xs sm:text-sm font-sans leading-relaxed max-w-sm">
                  {ch.desc}
                </p>

                <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                  <span>CHAPTER 0{i + 1} OF 04 ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: HUGE Cinematic Esports Photo Cards */}
        <div className="lg:col-span-8 relative w-full h-[450px] sm:h-[550px] lg:h-[620px] flex items-center justify-center">
          {SCROLL_CHAPTERS.map((ch, i) => (
            <div
              key={ch.title}
              className="story-image-pane lg:absolute inset-0 w-full h-full rounded-3xl overflow-hidden border border-white/15 bg-[#0E0D0C] p-2 shadow-[0_25px_70px_rgba(0,0,0,0.9)] glow-gold group mb-8 lg:mb-0"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black">
                <Photo
                  src={`/images/${ch.img}`}
                  alt={ch.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/30" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 font-mono text-[10px] px-3 py-1 rounded bg-black/70 backdrop-blur border border-white/10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_#F5B83D]" />
                  <span className="text-gold font-bold">{ch.reticle}</span>
                </div>

                {/* Red-Amber Tactical Reticle from user reference photo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 border-2 border-[#FF4D4D]/70 rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(255,77,77,0.5)]">
                    <div className="w-2.5 h-2.5 bg-gold rounded-full shadow-[0_0_10px_#F5B83D]" />
                  </div>
                </div>

                {/* Small Bottom Info Bar */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-white font-medium">{ch.caption}</span>
                  <span className="text-gold">STAGE 0{i + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
