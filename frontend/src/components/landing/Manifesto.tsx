import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import Photo from './Photo';

export default function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('.manifesto-box', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: root.current,
          start: 'top 80%',
        },
      });
    },
    { scope: root },
  );

  return (
    <section id="manifesto" ref={root} className="py-20 px-6 lg:px-12 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        {/* BIG Widescreen Esports Photo Card with Compact Text Overlay */}
        <div className="manifesto-box relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden border border-white/10 bg-[#0E0D0C] p-2 shadow-2xl group">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Photo
              src="/images/hero-arena.webp"
              alt="Grand championship stage"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />

            {/* Compact Centered Text Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 sm:p-12 z-20">
              <span className="font-mono text-[11px] text-gold tracking-widest uppercase mb-3">
                [ THE DOCTRINE // ZERO HIGHLIGHT BIAS ]
              </span>

              <h2 className="font-heading font-bold text-xl sm:text-2xl md:text-3xl text-white tracking-wide max-w-2xl leading-snug">
                Leaderboards sell jerseys. <br />
                <span className="text-gold">Tactical chemistry lifts trophies.</span>
              </h2>

              <p className="mt-4 font-sans text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed">
                Golden Snitch scouts what your squad actually needs: certified communication, gap coverage, and championship synergy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
