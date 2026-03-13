import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef } from "react";

type ConeSpec = {
  size: number;
  opacityLight: number;
  opacityDark: number;
  // Initial position as viewport fractions (0..1). (0,0) top-left.
  startX: number;
  startY: number;
  // Initial velocity in px/s.
  vx: number;
  vy: number;
  bounceMs: number;
  wobbleMs: number;
  delayMs: number;
};

type ConeSim = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

// Global animated background layer. Keep it behind the app content.
export default function BackgroundFX() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const coneRefs = useRef<Array<HTMLDivElement | null>>([]);

  const cones: ConeSpec[] = [
    {
      size: 78,
      opacityLight: 0.16,
      opacityDark: 0.22,
      startX: 0.08,
      startY: 0.78,
      vx: 120,
      vy: -90,
      bounceMs: 1800,
      wobbleMs: 4200,
      delayMs: 0,
    },
    {
      size: 58,
      opacityLight: 0.12,
      opacityDark: 0.18,
      startX: 0.74,
      startY: 0.60,
      vx: -140,
      vy: 110,
      bounceMs: 1600,
      wobbleMs: 3800,
      delayMs: 350,
    },
    {
      size: 46,
      opacityLight: 0.10,
      opacityDark: 0.16,
      startX: 0.22,
      startY: 0.18,
      vx: 160,
      vy: 130,
      bounceMs: 2000,
      wobbleMs: 5200,
      delayMs: 900,
    },
    {
      size: 70,
      opacityLight: 0.11,
      opacityDark: 0.17,
      startX: 0.86,
      startY: 0.22,
      vx: -110,
      vy: -150,
      bounceMs: 1750,
      wobbleMs: 4600,
      delayMs: 650,
    },
  ];

  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (mql?.matches) return;

    const els = coneRefs.current.slice(0, cones.length);
    if (els.some((el) => !el)) return;

    const sims: ConeSim[] = cones.map((c) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = Math.max(0, Math.min(w - c.size, Math.round(c.startX * (w - c.size))));
      const y = Math.max(0, Math.min(h - c.size, Math.round(c.startY * (h - c.size))));
      return { x, y, vx: c.vx, vy: c.vy, size: c.size };
    });

    // Seed initial transforms.
    sims.forEach((s, i) => {
      const el = els[i] as HTMLDivElement;
      el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
    });

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const w = window.innerWidth;
      const h = window.innerHeight;

      for (let i = 0; i < sims.length; i += 1) {
        const sim = sims[i];

        sim.x += sim.vx * dt;
        sim.y += sim.vy * dt;

        // Bounce against viewport edges.
        if (sim.x <= 0) {
          sim.x = 0;
          sim.vx = Math.abs(sim.vx);
        } else if (sim.x + sim.size >= w) {
          sim.x = Math.max(0, w - sim.size);
          sim.vx = -Math.abs(sim.vx);
        }

        if (sim.y <= 0) {
          sim.y = 0;
          sim.vy = Math.abs(sim.vy);
        } else if (sim.y + sim.size >= h) {
          sim.y = Math.max(0, h - sim.size);
          sim.vy = -Math.abs(sim.vy);
        }

        const el = els[i] as HTMLDivElement;
        el.style.transform = `translate3d(${sim.x}px, ${sim.y}px, 0)`;
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);

    const onChange = () => {
      if (mql?.matches) {
        window.cancelAnimationFrame(raf);
      }
    };

    mql?.addEventListener?.("change", onChange);

    return () => {
      mql?.removeEventListener?.("change", onChange);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  const coneSvg = (
    <svg viewBox="0 0 128 128" width="100%" height="100%" role="presentation">
      <defs>
        <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a00" />
          <stop offset="1" stopColor="#ff5c00" />
        </linearGradient>
      </defs>

      <path
        d="M18 106h92c4 0 7 3 7 7v5H11v-5c0-4 3-7 7-7z"
        fill={isDark ? "rgba(245,245,245,0.55)" : "rgba(15,15,15,0.45)"}
      />

      <path d="M56 14h16l28 92H28L56 14z" fill="url(#coneGrad)" />

      <path d="M43 62h42l5 16H38l5-16z" fill="rgba(255,255,255,0.85)" />
      <path d="M50 36h28l4 12H46l4-12z" fill="rgba(255,255,255,0.75)" />

      <path
        d="M63 18h2l-18 86h-6L63 18z"
        fill={isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.22)"}
      />
    </svg>
  );

  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: isDark
          ? "radial-gradient(900px circle at 20% 20%, rgba(141, 146, 106, 0.18), transparent 55%), radial-gradient(900px circle at 80% 10%, rgba(102, 104, 46, 0.14), transparent 45%), linear-gradient(160deg, #0B0A06 0%, #12120e 70%, #0B0A06 100%)"
          : "radial-gradient(900px circle at 15% 15%, rgba(102, 104, 46, 0.20), transparent 55%), radial-gradient(900px circle at 85% 10%, rgba(141, 146, 106, 0.18), transparent 45%), linear-gradient(160deg, #f5f5f5 0%, #fafafa 70%, #f5f5f5 100%)",
        "&:before": {
          content: '""',
          position: "absolute",
          inset: -160,
          background: isDark
            ? "conic-gradient(from 180deg at 50% 50%, rgba(141,146,106,0.18), rgba(102,104,46,0.10), rgba(141,146,106,0.18))"
            : "conic-gradient(from 180deg at 50% 50%, rgba(102,104,46,0.18), rgba(141,146,106,0.12), rgba(102,104,46,0.18))",
          filter: "blur(44px)",
          opacity: isDark ? 0.32 : 0.42,
          animation: "bgSpin 20s linear infinite",
        },
        "&:after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.018) 0 2px, rgba(0,0,0,0.018) 2px 4px)",
          opacity: isDark ? 0.35 : 0.25,
          mixBlendMode: isDark ? "screen" : "multiply",
        },
        "@keyframes bgSpin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "@keyframes coneBounce": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-24px)" },
        },
        "@keyframes coneWobble": {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "&:before": { animation: "none" },
        },
      }}
    >
      {cones.map((c, idx) => (
        <Box
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          ref={(el: HTMLDivElement | null) => {
            coneRefs.current[idx] = el;
          }}
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            width: c.size,
            opacity: isDark ? c.opacityDark : c.opacityLight,
            filter: isDark
              ? "drop-shadow(0 18px 35px rgba(0,0,0,0.55))"
              : "drop-shadow(0 18px 35px rgba(0,0,0,0.18))",
            willChange: "transform",
            transform: "translate3d(0,0,0)",
            "@media (prefers-reduced-motion: reduce)": {
              left: `${Math.round(c.startX * 100)}%`,
              top: `${Math.round(c.startY * 100)}%`,
              transform: "translate3d(0,0,0)",
            },
          }}
        >
          <Box
            sx={{
              transformOrigin: "50% 90%",
              animation: `coneBounce ${c.bounceMs}ms cubic-bezier(.21,.61,.35,1) infinite`,
              animationDelay: `${c.delayMs}ms`,
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          >
            <Box
              sx={{
                animation: `coneWobble ${c.wobbleMs}ms ease-in-out infinite`,
                "@media (prefers-reduced-motion: reduce)": {
                  animation: "none",
                },
              }}
            >
              {coneSvg}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
