import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '@/lib/gsap';
import Photo from './Photo';

export default function FinalCTA() {
  const root = useRef<HTMLElement>(null);
  const { contextSafe } = useGSAP({ scope: root });

  useGSAP(
    () => {
      gsap.from('.cta-box', {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 75%' },
      });
      gsap.fromTo(
        '.cta-bg',
        { yPercent: -8 },
        { yPercent: 8, ease: 'none', scrollTrigger: { trigger: root.current, scrub: true } },
      );
    },
    { scope: root },
  );

  const mag = contextSafe((e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    gsap.to(e.currentTarget, {
      x: (e.clientX - r.left - r.width / 2) * 0.25,
      y: (e.clientY - r.top - r.height / 2) * 0.25,
      duration: 0.35,
    });
  });

  const reset = contextSafe((e: React.MouseEvent<HTMLElement>) =>
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1,.4)',
    }),
  );

  return (
    <section
      ref={root}
      className="relative overflow-hidden min-h-[75vh] flex items-center justify-center text-center px-6 bg-[#050505]"
    >
      {/* BIG Arena Lights Photo */}
      <Photo
        src="/images/crowd-lights.webp"
        alt="Arena crowd lights"
        className="cta-bg absolute inset-0 w-full h-[120%] opacity-30 object-cover pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-[#050505] pointer-events-none" />

      {/* Small, Elegant CTA Card */}
      <div className="cta-box relative z-10 max-w-lg mx-auto py-12">
        <span className="font-mono text-[11px] text-gold tracking-widest uppercase block mb-3">
          [ CHAMPIONSHIP READY ]
        </span>
        <h2 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-wide leading-tight">
          Your next championship <br />
          <span className="text-gold">starts here.</span>
        </h2>
        <p className="mt-3 text-xs sm:text-sm font-sans text-neutral-400 max-w-sm mx-auto">
          Scout the player your team actually needs. Pure synergy, zero highlight bias.
        </p>

        <div className="mt-8">
          <Link
            to="/app"
            onMouseMove={mag}
            onMouseLeave={reset}
            style={{ backgroundColor: '#F5B83D', color: '#000000' }}
            className="inline-flex items-center justify-center font-mono text-xs font-black tracking-wider uppercase px-9 py-4 rounded-full shadow-[0_0_35px_rgba(245,184,61,0.6)] hover:brightness-110 transition-all cursor-pointer"
          >
            Launch Golden Snitch →
          </Link>
        </div>
      </div>
    </section>
  );
}
