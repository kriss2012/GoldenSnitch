import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';

export default function Marquee({
  items,
  outline = false,
}: {
  items: string[];
  outline?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tw = gsap.to('.mq', { xPercent: -50, duration: 32, ease: 'none', repeat: -1 });
      ScrollTrigger.create({
        onUpdate(self) {
          gsap.to(tw, {
            timeScale: (1 + Math.min(Math.abs(self.getVelocity()) / 400, 5)) * self.direction,
            duration: 0.2,
            overwrite: true,
          });
          gsap.to(tw, { timeScale: self.direction, duration: 1, delay: 0.2, overwrite: 'auto' });
        },
      });
    },
    { scope: root },
  );

  const row = [...items, ...items];
  return (
    <div ref={root} className="overflow-hidden border-y border-charcoal-border py-6" aria-hidden>
      <div className="mq flex w-max gap-16 whitespace-nowrap font-heading text-5xl md:text-7xl">
        {row.map((t, i) => (
          <span key={i} className={outline ? 'text-stroke' : 'text-textPrimary'}>
            {t} <span className="text-cyan">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
