import Counter from './Counter';
import Marquee from './Marquee';

const S = [
  [12400, '+', 'Player profiles scored'],
  [2, '', 'Titles: Valorant & CS2'],
  [100, '%', 'Deterministic re-scoring'],
  [0, '', 'Score variance on audit'],
];

export default function Stats() {
  return (
    <section>
      <Marquee items={['VALORANT', 'CS2', 'SCOUTING', 'SYNERGY', 'IGL INTEL', 'AUDIT TRAIL']} outline />
      <div className="max-w-container mx-auto px-6 py-24 grid grid-cols-2 lg:grid-cols-4 gap-10">
        {S.map(([n, suf, l]) => (
          <div key={String(l)}>
            <div className="font-heading text-6xl md:text-7xl text-textPrimary">
              <Counter to={n as number} suffix={suf as string} />
            </div>
            <p className="mt-2 text-textSecondary text-sm">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
