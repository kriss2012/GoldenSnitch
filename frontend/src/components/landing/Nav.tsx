import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap, useGSAP } from '@/lib/gsap';

import { GoldenSnitchLogo } from '@/components/common/GoldenSnitchLogo';

const LINKS = [
  { label: 'The Doctrine', href: '#manifesto' },
  { label: 'The Story', href: '#story' },
  { label: 'Staff Roles', href: '#roles' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const { contextSafe } = useGSAP({ scope: root });

  // Cleanup body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const toggle = contextSafe(() => {
    const next = !open;
    setOpen(next);
    if (next) {
      document.body.style.overflow = 'hidden';
      gsap.set('.mobile-overlay', { display: 'flex' });
      gsap.timeline()
        .fromTo('.mobile-overlay', { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
        .fromTo(
          '.nav-link-item',
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.05, duration: 0.35, ease: 'power2.out' },
          '-=0.1',
        );
    } else {
      document.body.style.overflow = '';
      gsap.to('.mobile-overlay', {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => gsap.set('.mobile-overlay', { display: 'none' }),
      });
    }
  });

  return (
    <header
      ref={root}
      className="fixed top-0 inset-x-0 z-[90] bg-[#050505]/95 backdrop-blur-xl border-b border-white/[0.08] pt-[env(safe-area-inset-top)]"
    >
      <div className="max-w-container mx-auto flex items-center justify-between px-4 sm:px-6 h-16 sm:h-[68px]">
        {/* Brand matching reference photos */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0 shrink-0">
          <GoldenSnitchLogo size={28} layout="icon-only" className="shrink-0" />
          <span className="font-heading font-black text-base sm:text-lg md:text-xl tracking-wider text-white uppercase whitespace-nowrap shrink-0">
            GOLDEN SNITCH<span className="text-gold">.</span>
          </span>
          <span className="hidden lg:inline-block font-mono text-[10px] text-textDim ml-2 pl-2 border-l border-white/10 uppercase tracking-widest whitespace-nowrap">
            OFFICIAL ESPORTS SCOUTING
          </span>
        </Link>

        {/* Center / Right Links */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-mono text-xs text-textSecondary">
            {LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-gold transition-colors tracking-widest uppercase whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-4 font-mono text-xs shrink-0">
            <Link
              to="/app"
              style={{ backgroundColor: '#F5B83D', color: '#000000' }}
              className="hidden sm:inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-mono text-xs font-black tracking-wider uppercase hover:brightness-110 transition-all shadow-[0_0_20px_rgba(245,184,61,0.35)] whitespace-nowrap"
            >
              LAUNCH PLATFORM →
            </Link>
            <button
              onClick={toggle}
              aria-expanded={open}
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden px-3 py-2 rounded-control bg-[#161616] border border-white/10 text-white hover:text-gold hover:border-gold/30 active:scale-95 transition-all cursor-pointer font-mono text-xs whitespace-nowrap min-h-[38px] flex items-center justify-center shrink-0"
            >
              [ {open ? 'CLOSE' : 'MENU'} ]
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Mobile Overlay in Solid Esports Obsidian & Gold */}
      <div
        className="mobile-overlay hidden fixed inset-x-0 top-16 z-[100] bg-[#050505] flex-col justify-between p-6 sm:p-8 border-t border-white/10 overflow-y-auto overscroll-contain"
        style={{
          backgroundColor: '#050505',
          height: 'calc(100vh - 64px)',
          maxHeight: 'calc(100dvh - 64px)',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <p className="font-mono text-xs text-gold uppercase tracking-widest">[ NAVIGATION ]</p>
            <span className="font-mono text-[11px] text-textDim uppercase">ROSTER INTELLIGENCE</span>
          </div>

          <div className="flex flex-col gap-3">
            {LINKS.map((item, idx) => (
              <a
                key={item.href}
                href={item.href}
                onClick={toggle}
                className="nav-link-item group flex items-center justify-between py-3.5 px-4 rounded-xl border border-white/5 bg-[#0D0D0D] hover:bg-white/[0.06] hover:border-gold/30 transition-all min-h-[52px]"
              >
                <span className="font-heading text-xl xs:text-2xl text-white group-hover:text-gold transition-colors font-bold tracking-tight">
                  {item.label}
                </span>
                <span className="font-mono text-xs text-gold/70 group-hover:text-gold transition-colors">
                  0{idx + 1} →
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-white/10 flex flex-col gap-3 font-mono shrink-0">
          <Link
            to="/app"
            onClick={toggle}
            className="w-full min-h-[48px] py-3.5 px-6 flex items-center justify-center gap-2 rounded-full bg-gold text-[#050505] font-black text-xs xs:text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(245,184,61,0.35)] hover:brightness-110 active:scale-[0.99] transition-all whitespace-nowrap"
          >
            <span>ENTER PLATFORM</span>
            <span>→</span>
          </Link>
          <p className="text-textDim text-center font-mono text-[11px] pt-1 tracking-wide">
            Golden Snitch // Official Esports Scouting
          </p>
        </div>
      </div>
    </header>
  );
}
