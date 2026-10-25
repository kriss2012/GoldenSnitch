import { useRef, useState } from 'react';
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

  const toggle = contextSafe(() => {
    const next = !open;
    setOpen(next);
    if (next) {
      gsap.set('.mobile-overlay', { display: 'flex' });
      gsap.timeline()
        .fromTo('.mobile-overlay', { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' })
        .fromTo('.nav-link-item', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.45, ease: 'expo.out' }, '-=0.2');
    } else {
      gsap.to('.mobile-overlay', {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => gsap.set('.mobile-overlay', { display: 'none' }),
      });
    }
  });

  return (
    <header ref={root} className="fixed top-0 inset-x-0 z-[80] bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-container mx-auto flex items-center justify-between px-6 py-3.5">
        {/* Brand matching reference photos */}
        <Link to="/" className="flex items-center gap-3 group">
          <GoldenSnitchLogo size={32} layout="icon-only" />
          <span className="font-heading font-black text-xl tracking-wider text-white uppercase">
            GOLDEN SNITCH<span className="text-gold">.</span>
          </span>
          <span className="hidden md:inline-block font-mono text-[10px] text-textDim ml-2 pl-2 border-l border-white/10 uppercase tracking-widest">
            OFFICIAL ESPORTS SCOUTING
          </span>
        </Link>

        {/* Center / Right Links */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs text-textSecondary">
            {LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-gold transition-colors tracking-widest uppercase"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 font-mono text-xs">
            <Link
              to="/app"
              style={{ backgroundColor: '#F5B83D', color: '#000000' }}
              className="px-5 py-2.5 rounded-full font-mono text-xs font-black tracking-wider uppercase hover:brightness-110 transition-all shadow-[0_0_20px_rgba(245,184,61,0.35)]"
            >
              LAUNCH PLATFORM →
            </Link>
            <button
              onClick={toggle}
              aria-expanded={open}
              className="md:hidden px-3 py-2 rounded-control bg-[#161616] border border-white/10 text-white hover:text-gold cursor-pointer"
            >
              [ {open ? 'CLOSE' : 'MENU'} ]
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Mobile Overlay in Obsidian & Gold */}
      <div
        className="mobile-overlay hidden fixed inset-0 top-[65px] bg-[#050505]/98 backdrop-blur-2xl flex-col justify-between p-8 z-[90] border-t border-white/10"
        style={{ height: 'calc(100vh - 65px)' }}
      >
        <div className="space-y-6 pt-6">
          <p className="font-mono text-xs text-gold uppercase tracking-widest">[ NAVIGATION ]</p>
          <div className="flex flex-col gap-5">
            {LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={toggle}
                className="nav-link-item font-heading text-4xl text-white hover:text-gold transition-colors font-bold tracking-tight"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col gap-3 font-mono text-xs">
          <Link
            to="/app"
            onClick={toggle}
            className="w-full py-4 text-center rounded-full bg-gold text-[#050505] font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(245,184,61,0.3)]"
          >
            ENTER PLATFORM →
          </Link>
          <p className="text-textDim text-center text-[11px] pt-1">
            Golden Snitch // Pure Parallax Experience
          </p>
        </div>
      </div>
    </header>
  );
}
