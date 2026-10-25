import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '@/lib/gsap';
import Photo from './Photo';

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.to('.hero-image-frame', {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.from('.hero-fade', {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: 'power3.out',
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 px-6 lg:px-12 bg-[#050505] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left: Compact, Understated Typography (Small Text) */}
        <div className="lg:col-span-4 flex flex-col justify-center order-2 lg:order-1">
          {/* Status & Coordinates */}
          <div className="hero-fade flex items-center gap-2 font-mono text-[11px] text-gold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
            <span>• 53.2280° N // ONLINE</span>
          </div>

          {/* Compact Headline */}
          <h1 className="hero-fade font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-wide text-white leading-tight">
            CATCH <br />
            <span className="text-gold">CHAMPIONS.</span>
          </h1>

          {/* Small 1-Line Description */}
          <p className="hero-fade mt-4 text-xs sm:text-sm font-sans text-neutral-400 leading-relaxed max-w-sm">
            Roster synergy over highlight reels. Scout the missing piece before the championship starts.
          </p>

          {/* Action CTAs */}
          <div className="hero-fade mt-6 flex items-center gap-4">
            <Link
              to="/app"
              style={{ backgroundColor: '#F5B83D', color: '#000000' }}
              className="px-8 py-3.5 rounded-full font-mono text-xs font-black tracking-wider uppercase shadow-[0_0_25px_rgba(245,184,61,0.5)] hover:brightness-110 transition-all inline-flex items-center gap-2"
            >
              LAUNCH PLATFORM →
            </Link>

            <a
              href="#story"
              className="font-mono text-[11px] text-neutral-400 hover:text-gold transition-colors tracking-widest uppercase"
            >
              [ SCROLL TO SCOUT ↓ ]
            </a>
          </div>

          {/* Sequence Counter */}
          <div className="hero-fade mt-10 pt-4 border-t border-white/10 flex items-center gap-4 font-mono text-[11px] text-neutral-500">
            <span className="text-gold font-bold">01 — 04</span>
            <span>PRO SQUADS</span>
            <span>•</span>
            <span>PURE PARALLAX</span>
          </div>
        </div>

        {/* Right: BIG Cinematic Esports Image Showcase (Dominant Visual) */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="hero-image-frame relative w-full h-[420px] sm:h-[520px] lg:h-[620px] rounded-3xl overflow-hidden border border-white/15 bg-[#0E0D0C] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.9)] glow-gold group">
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black">
              <Photo
                src="/images/team-huddle.webp"
                alt="Champions squad huddle under arena stadium lights"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-[#050505]/20" />

              {/* Top Minimal Pill */}
              <div className="absolute top-4 left-4 font-mono text-[10px] px-2.5 py-1 rounded bg-black/70 backdrop-blur border border-white/10 text-gold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                <span>01 // THE ROSTER CORE</span>
              </div>

              {/* Red-Amber Tactical Reticle from user reference photo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 border-2 border-[#FF4D4D]/80 rotate-45 flex items-center justify-center shadow-[0_0_25px_rgba(255,77,77,0.6)]">
                    <div className="w-2.5 h-2.5 bg-gold rounded-full shadow-[0_0_12px_#F5B83D]" />
                  </div>
                </div>
              </div>

              {/* Small Minimal Bottom Caption */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                <span className="text-white font-medium">SENTINELS // CHAMPIONS STAGE</span>
                <span className="text-gold">STAGE 01 OF 04</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
