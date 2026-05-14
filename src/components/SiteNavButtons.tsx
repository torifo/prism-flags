export function SiteNavButtons() {
  return (
    <div className="flex gap-3 px-5 py-4 border-t border-theme">

      {/* slate-errors: chalkboard */}
      <a
        href="https://torifo.github.io/slate-errors/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 h-[90px] rounded-lg overflow-hidden relative cursor-pointer no-underline"
        style={{
          background: '#1c2a1e',
          border: '2px solid #2e3d2f',
          backgroundImage:
            'repeating-linear-gradient(180deg, transparent 0px, transparent 18px, rgba(255,255,255,0.04) 18px, rgba(255,255,255,0.04) 19px)',
        }}
      >
        {/* chalk dust */}
        <span
          className="absolute top-2 right-3 rounded-full"
          style={{ width: 50, height: 10, background: 'rgba(220,215,200,0.07)', filter: 'blur(4px)' }}
        />
        {/* error codes watermark */}
        <span
          className="absolute top-2 right-3 text-[8px] tracking-wider"
          style={{ color: 'rgba(220,215,200,0.22)', fontFamily: 'Georgia, serif' }}
        >
          No.403 404 500
        </span>
        {/* chalk tray */}
        <span
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 10, background: '#3a2a1a', borderTop: '1px solid #4a3a28' }}
        />
        {/* content */}
        <div className="absolute inset-0 flex items-end pb-5 pl-4 gap-3">
          <span className="text-xl opacity-55">🖊</span>
          <div>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#ddd8c4', letterSpacing: '0.06em', opacity: 0.92 }}>
              slate-errors
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 9, color: '#7a7a60', marginTop: 2 }}>
              放課後の黒板で、HTTPエラーを学び直す →
            </p>
          </div>
        </div>
      </a>

      {/* anchor-ports: night sea */}
      <a
        href="https://torifo.github.io/anchor-ports/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 h-[90px] rounded-lg overflow-hidden relative cursor-pointer no-underline"
        style={{ border: '2px solid #1a3a5c' }}
      >
        {/* ocean bg */}
        <span className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a1a2e 0%, #0d2a4a 45%, #0a3d6b 68%, #041828 100%)' }} />
        {/* stars */}
        <span className="absolute" style={{ top: 0, left: 0, right: 0, height: 36, backgroundImage: 'radial-gradient(1px 1px at 12% 25%, rgba(255,255,255,0.8) 0%, transparent 100%), radial-gradient(1px 1px at 28% 40%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 50% 20%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 88% 18%, rgba(255,255,255,0.7) 0%, transparent 100%)' }} />
        {/* moon — right side, above ship, does not overlap text */}
        <span className="absolute rounded-full" style={{ top: 7, right: 46, width: 13, height: 13, background: 'radial-gradient(circle at 38% 38%, #fef3c7, #fbbf24)', boxShadow: '0 0 8px rgba(251,191,36,0.45)' }} />
        {/* waves */}
        <span className="absolute overflow-hidden" style={{ bottom: 0, left: 0, right: 0, height: 26 }}>
          <span className="absolute" style={{ bottom: 19, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(150,210,255,0.35), rgba(200,230,255,0.55), transparent)' }} />
          <span className="absolute" style={{ bottom: 10, left: -20, right: -20, height: 20, background: 'rgba(10,60,120,0.6)', borderRadius: '50% 50% 0 0 / 10px 10px 0 0' }} />
          <span className="absolute" style={{ bottom: 5, left: -20, right: -20, height: 20, background: 'rgba(8,50,100,0.7)', borderRadius: '50% 50% 0 0 / 10px 10px 0 0' }} />
          <span className="absolute" style={{ bottom: 0, left: -20, right: -20, height: 20, background: '#041828', borderRadius: '50% 50% 0 0 / 10px 10px 0 0' }} />
        </span>
        {/* ship */}
        <span className="absolute" style={{ right: 14, bottom: 18, fontSize: 26, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))', opacity: 0.88 }}>⛵</span>
        {/* text — maxWidth keeps text from overlapping ship area */}
        <div className="absolute top-0 left-0 p-3 z-10" style={{ maxWidth: '62%' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#93c5fd', textShadow: '0 0 10px rgba(96,165,250,0.5)' }}>
            ⚓ anchor-ports
          </p>
          <p style={{ fontSize: 8, color: '#3b6fd4', marginTop: 3, letterSpacing: '0.04em' }}>
            Cyber Nautical Port Ledger
          </p>
          <span style={{ display: 'inline-block', marginTop: 5, background: 'rgba(127,29,29,0.85)', color: '#fca5a5', border: '1px solid rgba(185,28,28,0.5)', fontSize: 7, padding: '1px 6px', borderRadius: 2, letterSpacing: '0.08em' }}>
            PORT REGISTRY
          </span>
        </div>
      </a>

    </div>
  );
}
