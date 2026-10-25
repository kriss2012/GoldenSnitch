import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import Photo from './Photo';

const ROLES = [
  {
    title: 'General Manager',
    tag: 'ROLE_GM',
    badge: 'FRANCHISE EXECUTIVE',
    desc: 'Approves signings, manages payroll cap, and maintains board governance.',
    img: 'team-huddle.webp',
  },
  {
    title: 'Head Coach / Analyst',
    tag: 'ROLE_COACH',
    badge: 'TACTICAL STRATEGIST',
    desc: 'Runs swap simulations, reviews IGL intel, and directs roster chemistry.',
    img: 'analyst-screens.webp',
  },
  {
    title: 'Talent Scout',
    tag: 'ROLE_SCOUT',
    badge: 'TALENT EVALUATOR',
    desc: 'Scouts candidate pools, files consensus ratings, and ingests telemetry.',
    img: 'setup-neon.webp',
  },
];

export default function Roles() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from('.rc', {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      });
    },
    { scope: root },
  );

  return (
    <section id="roles" ref={root} className="max-w-7xl mx-auto px-6 lg:px-12 py-24 bg-[#050505]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <p className="font-mono text-gold text-[11px] tracking-widest uppercase mb-1">
            [ FRONT OFFICE ACCESS ]
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-white leading-tight">
            Built for the Whole Staff.
          </h2>
        </div>
        <p className="text-neutral-400 text-xs font-mono">
          STRICT RBAC PERMISSIONS PREVENT LEAKS
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {ROLES.map((r) => (
          <article
            key={r.title}
            className="rc group relative overflow-hidden rounded-2xl bg-[#0E0D0C] border border-white/10 shadow-xl transition-all duration-500 hover:-translate-y-1 hover:border-gold/50"
          >
            {/* BIG Esports Photo */}
            <div className="relative overflow-hidden h-72 sm:h-80 bg-black">
              <Photo
                src={`/images/${r.img}`}
                alt={r.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0C] via-[#0E0D0C]/40 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="font-mono text-[10px] font-bold px-2.5 py-1 rounded bg-black/70 backdrop-blur border border-white/10 text-gold">
                  {r.badge}
                </span>
              </div>
            </div>

            {/* SMALL Minimal Text */}
            <div className="p-5 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold tracking-widest text-gold">
                  [ {r.tag} ]
                </span>
                <span className="text-[10px] font-mono text-neutral-500">SECURE ACCESS</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-white group-hover:text-gold transition-colors">
                {r.title}
              </h3>
              <p className="mt-1.5 text-neutral-400 text-xs leading-relaxed">{r.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
