import { GoldenSnitchLogo } from '@/components/common/GoldenSnitchLogo';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 text-xs font-mono text-neutral-500 bg-[#050505]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <GoldenSnitchLogo size={20} layout="icon-only" />
          <span className="font-heading font-black text-sm text-white tracking-wider uppercase">
            Golden Snitch<span className="text-gold">.</span>
          </span>
        </div>
        <span>ESPORTS SCOUTING &amp; MULTI-ROSTER INTELLIGENCE</span>
        <span>© {new Date().getFullYear()} ALL RIGHTS RESERVED</span>
      </div>
    </footer>
  );
}
