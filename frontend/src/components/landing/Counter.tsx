import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

export default function Counter({
  to,
  suffix = '',
  decimals = 0,
}: {
  to: number;
  suffix?: string;
  decimals?: number;
}) {
  const el = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const o = { v: 0 };
      gsap.to(o, {
        v: to,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el.current, start: 'top 88%', once: true },
        onUpdate: () => {
          if (el.current) el.current.textContent = o.v.toFixed(decimals) + suffix;
        },
      });
    },
    { scope: el },
  );

  return <span ref={el} className="tabular-nums">0{suffix}</span>;
}
