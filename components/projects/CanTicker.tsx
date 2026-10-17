"use client";

import { useEffect, useState } from "react";

type Frame = { n: number; temp: number };

// Illustrative sliding-window filter. Replace with the real firmware snippet.
const SNIPPET = `// Illustrative example (not the production firmware).
// Sliding-window average over the last N DS18B20 readings.
template <size_t N>
class SlidingWindow {
 public:
  float update(float sample) {
    sum_ += sample - buf_[head_];   // drop oldest, add newest
    buf_[head_] = sample;
    head_ = (head_ + 1) % N;
    if (count_ < N) ++count_;
    return sum_ / count_;
  }

 private:
  float buf_[N] = {};
  float sum_ = 0.0f;
  size_t head_ = 0, count_ = 0;
};

SlidingWindow<8> filter;
float temp_c = filter.update(read_ds18b20());`;

export default function CanTicker() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    let n = 0;
    let temp = 42.3;
    const push = () => {
      temp = Math.min(46, Math.max(39, temp + (Math.random() - 0.5) * 0.8));
      n += 1;
      setFrames((f) => [...f.slice(-5), { n, temp }]);
    };
    push();
    const id = setInterval(push, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-mono text-xs text-muted">
          <span className="live-dot" aria-hidden />
          Simulated CAN bus feed
        </p>
        <button
          type="button"
          onClick={() => setShowCode((v) => !v)}
          aria-expanded={showCode}
          className="glass-btn !min-h-[36px] !px-3 !text-[0.8rem]"
        >
          {showCode ? "Show telemetry" : "View C++ filter"}
        </button>
      </div>

      {showCode ? (
        <pre
          tabIndex={0}
          className="fade-up mt-3 overflow-x-auto rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--tire))] p-4 font-mono text-[0.78rem] leading-relaxed text-[rgb(var(--paper))]"
        >
          <code>{SNIPPET}</code>
        </pre>
      ) : (
        <div
          role="log"
          aria-label="Simulated CAN telemetry"
          className="mt-3 rounded-lg border-2 border-[rgb(var(--edge))] bg-[rgb(var(--tire))] p-4 font-mono text-[0.82rem] leading-7 text-[rgb(var(--paper))]"
        >
          {frames.map((f, i) => (
            <p
              key={f.n}
              className={i === frames.length - 1 ? "" : "opacity-50"}
              style={{ opacity: i === frames.length - 1 ? 1 : 0.35 + (i / frames.length) * 0.35 }}
            >
              <span className="text-[rgb(var(--g1))]">ID: 0x401</span> | Temp: {f.temp.toFixed(1)}°C |
              Status: <span className="text-[rgb(var(--g1))]">OK</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
