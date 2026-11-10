const MOTES = [
  { left: "14%", top: "62%", size: 3, delay: "0s", duration: "17s" },
  { left: "28%", top: "70%", size: 2, delay: "3s", duration: "19s" },
  { left: "46%", top: "48%", size: 3, delay: "1.4s", duration: "15s" },
  { left: "61%", top: "66%", size: 2, delay: "5s", duration: "18s" },
  { left: "73%", top: "40%", size: 4, delay: "2.2s", duration: "21s" },
  { left: "38%", top: "34%", size: 2, delay: "7s", duration: "16s" },
  { left: "82%", top: "58%", size: 3, delay: "4s", duration: "20s" },
  { left: "22%", top: "44%", size: 2, delay: "8s", duration: "14s" },
];

export function DustParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {MOTES.map((mote) => (
        <span
          key={`${mote.left}-${mote.delay}`}
          className="mote"
          style={{
            left: mote.left,
            top: mote.top,
            width: mote.size,
            height: mote.size,
            animationDelay: mote.delay,
            animationDuration: mote.duration,
          }}
        />
      ))}
    </div>
  );
}
