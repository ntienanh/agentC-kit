'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

interface AppNotFoundViewProps {
  readonly badge: string;
  readonly headingPrefix: string;
  readonly headingHighlight: string;
  readonly description: string;
  readonly backLabel: string;
  readonly backHref: string;
  readonly primaryLabel: string;
  readonly primaryHref: string;
}

export function AppNotFoundView({
  badge,
  headingPrefix,
  headingHighlight,
  description,
  backLabel,
  backHref,
  primaryLabel,
  primaryHref,
}: AppNotFoundViewProps) {
  return (
    <div className='nf nf--in'>
      <div className='nf-orb nf-orb-1' />
      <div className='nf-orb nf-orb-2' />
      <div className='nf-orb nf-orb-3' />

      <div className='nf-noise' />

      <div className='nf-center'>
        <div className='nf-hero'>
          <div className='nf-big'>
            <span className='nf-digit nf-d1'>4</span>
            <div className='nf-cube-wrap'>
              <div className='nf-cube'>
                <div className='nf-c-face nf-c-front' />
                <div className='nf-c-face nf-c-back' />
                <div className='nf-c-face nf-c-top' />
                <div className='nf-c-face nf-c-bottom' />
                <div className='nf-c-face nf-c-left' />
                <div className='nf-c-face nf-c-right' />
              </div>
            </div>
            <span className='nf-digit nf-d2'>4</span>
          </div>

          <div className='nf-sparkles'>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`s-${i}`} className='nf-spark' style={{ '--i': i } as CSSProperties} />
            ))}
          </div>

          <div className='nf-ring-pulse' />
          <div className='nf-ring-pulse nf-ring-2' />
        </div>

        <div className='nf-text'>
          <p className='nf-tag'>{badge}</p>
          <h1 className='nf-heading'>
            {headingPrefix}
            <em>{headingHighlight}</em>
          </h1>
          <p className='nf-sub'>{description}</p>

          <div className='nf-actions'>
            <Link href={backHref} className='nf-btn nf-btn-outline'>
              {backLabel}
            </Link>
            <Link href={primaryHref} className='nf-btn nf-btn-fill'>
              {primaryLabel}
              <span className='nf-btn-glow' />
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .nf {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--background);
          overflow: hidden;
          font-family: var(--font-sans, 'DM Sans', system-ui, sans-serif);
        }

        .nf .nf-center {
          opacity: 0;
          transform: translateY(1.5rem);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nf--in .nf-center {
          opacity: 1;
          transform: translateY(0);
        }

        .nf .nf-hero {
          transform: scale(0.85);
          transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
        }
        .nf--in .nf-hero {
          transform: scale(1);
        }

        .nf-noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.03;
          mix-blend-mode: multiply;
          pointer-events: none;
        }

        .nf-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
        }
        .nf-orb-1 {
          width: 30vw;
          height: 30vw;
          max-width: 25rem;
          max-height: 25rem;
          background: radial-gradient(circle, var(--primary) 0%, #b5634a 100%);
          top: -10%;
          right: -5%;
          opacity: 0.35;
          animation: orb 14s ease-in-out infinite;
        }
        .nf-orb-2 {
          width: 22vw;
          height: 22vw;
          max-width: 18rem;
          max-height: 18rem;
          background: radial-gradient(circle, var(--success) 0%, #467260 100%);
          bottom: -8%;
          left: -3%;
          opacity: 0.3;
          animation: orb 18s ease-in-out infinite -6s;
        }
        .nf-orb-3 {
          width: 12vw;
          height: 12vw;
          max-width: 10rem;
          max-height: 10rem;
          background: radial-gradient(circle, #d4af4c 0%, #c9a84c 100%);
          top: 35%;
          left: 55%;
          opacity: 0.18;
          animation: orb 11s ease-in-out infinite -3s;
        }

        .nf-center {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.75rem;
        }

        .nf-hero {
          position: relative;
        }

        .nf-big {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .nf-digit {
          font-family: var(--font-serif, 'Newsreader', Georgia, serif);
          font-size: clamp(5rem, 12vw, 8rem);
          font-weight: 700;
          font-style: italic;
          color: var(--primary);
          line-height: 1;
          text-shadow:
            0 2px 0 #f9d5c7,
            0 4px 8px rgba(204, 120, 92, 0.15);
          position: relative;
          z-index: 2;
        }

        .nf-d1 {
          animation: digit-bob 3s ease-in-out infinite;
        }
        .nf-d2 {
          animation: digit-bob 3s ease-in-out infinite -1.5s;
        }

        .nf-cube-wrap {
          width: clamp(3.5rem, 8vw, 5.5rem);
          height: clamp(3.5rem, 8vw, 5.5rem);
          perspective: 600px;
          position: relative;
          z-index: 2;
        }

        .nf-cube {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: cube-spin 8s linear infinite;
        }

        .nf-c-face {
          position: absolute;
          inset: 0;
          border: 1.5px solid rgba(204, 120, 92, 0.2);
          border-radius: 0.5rem;
        }

        .nf-c-front {
          background: linear-gradient(135deg, #fef7f4 0%, #f9d5c7 100%);
          transform: translateZ(calc(clamp(1.75rem, 4vw, 2.75rem)));
          box-shadow: inset 0 0 1.5rem rgba(204, 120, 92, 0.08);
        }

        .nf-c-back {
          background: linear-gradient(135deg, rgba(204, 120, 92, 0.2), rgba(212, 175, 76, 0.12));
          transform: rotateY(180deg) translateZ(calc(clamp(1.75rem, 4vw, 2.75rem)));
        }

        .nf-c-left {
          background: linear-gradient(180deg, rgba(92, 142, 122, 0.16), rgba(92, 142, 122, 0.06));
          transform: rotateY(-90deg) translateZ(calc(clamp(1.75rem, 4vw, 2.75rem)));
        }

        .nf-c-right {
          background: linear-gradient(180deg, rgba(204, 120, 92, 0.16), rgba(204, 120, 92, 0.06));
          transform: rotateY(90deg) translateZ(calc(clamp(1.75rem, 4vw, 2.75rem)));
        }

        .nf-c-top {
          background: linear-gradient(180deg, rgba(212, 175, 76, 0.24), rgba(212, 175, 76, 0.08));
          transform: rotateX(90deg) translateZ(calc(clamp(1.75rem, 4vw, 2.75rem)));
        }

        .nf-c-bottom {
          background: linear-gradient(180deg, rgba(92, 142, 122, 0.16), rgba(204, 120, 92, 0.08));
          transform: rotateX(-90deg) translateZ(calc(clamp(1.75rem, 4vw, 2.75rem)));
        }

        .nf-ring-pulse {
          position: absolute;
          inset: 50% auto auto 50%;
          width: clamp(7rem, 18vw, 11rem);
          height: clamp(7rem, 18vw, 11rem);
          border-radius: 50%;
          border: 1px solid rgba(204, 120, 92, 0.24);
          transform: translate(-50%, -50%);
          animation: pulse-ring 3.5s ease-out infinite;
        }
        .nf-ring-2 {
          animation-delay: 1.75s;
        }

        .nf-sparkles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .nf-spark {
          --size: 0.42rem;
          position: absolute;
          top: 50%;
          left: 50%;
          width: var(--size);
          height: var(--size);
          margin-left: calc(var(--size) / -2);
          margin-top: calc(var(--size) / -2);
          border-radius: 999px;
          background: linear-gradient(180deg, #d4af4c, #b5634a);
          box-shadow: 0 0 12px rgba(212, 175, 76, 0.55);
          transform: rotate(calc(var(--i) * 30deg)) translateY(calc(-1 * clamp(3.7rem, 9vw, 5.4rem)));
          animation: sparkle 2.6s ease-in-out infinite;
          animation-delay: calc(var(--i) * -0.18s);
        }

        .nf-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.9rem;
          text-align: center;
          max-width: min(42rem, calc(100vw - 2.5rem));
        }

        .nf-tag {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--success);
          margin: 0;
        }

        .nf-heading {
          margin: 0;
          font-family: var(--font-serif, 'Newsreader', Georgia, serif);
          font-size: clamp(1.9rem, 4vw, 3.15rem);
          line-height: 1;
          color: var(--foreground);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nf-heading em {
          font-style: italic;
          color: var(--primary);
        }

        .nf-sub {
          margin: 0;
          color: var(--text-subtle);
          font-size: clamp(0.98rem, 2vw, 1.08rem);
          line-height: 1.7;
          max-width: 34rem;
        }

        .nf-actions {
          margin-top: 0.5rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.9rem;
        }

        .nf-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 10.75rem;
          padding: 0.95rem 1.35rem;
          border-radius: 999px;
          font-weight: 700;
          text-decoration: none;
          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            border-color 0.22s ease,
            background 0.22s ease;
          overflow: hidden;
        }
        .nf-btn:hover {
          transform: translateY(-2px);
        }

        .nf-btn-outline {
          color: var(--foreground);
          border: 1px solid rgba(92, 142, 122, 0.26);
          background: color-mix(in srgb, var(--card) 68%, transparent);
          box-shadow: 0 8px 18px rgba(92, 142, 122, 0.08);
        }
        .nf-btn-outline:hover {
          border-color: color-mix(in srgb, var(--success) 42%, transparent);
          box-shadow: 0 14px 24px rgba(92, 142, 122, 0.12);
        }

        .nf-btn-fill {
          color: var(--primary-foreground);
          background: linear-gradient(135deg, var(--primary) 0%, #b5634a 100%);
          box-shadow: 0 16px 30px rgba(181, 99, 74, 0.28);
        }
        .nf-btn-fill:hover {
          box-shadow: 0 20px 34px rgba(181, 99, 74, 0.36);
        }

        .nf-btn-glow {
          position: absolute;
          inset: -120% auto auto -40%;
          width: 55%;
          height: 280%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
          transform: rotate(18deg);
          animation: btn-shine 3.5s linear infinite;
          pointer-events: none;
        }

        @keyframes cube-spin {
          0% {
            transform: rotateX(-20deg) rotateY(0deg) rotateZ(0deg);
          }
          50% {
            transform: rotateX(18deg) rotateY(180deg) rotateZ(4deg);
          }
          100% {
            transform: rotateX(-20deg) rotateY(360deg) rotateZ(0deg);
          }
        }

        @keyframes digit-bob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-0.3rem);
          }
        }

        @keyframes pulse-ring {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          35% {
            opacity: 0.38;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.35);
          }
        }

        @keyframes sparkle {
          0%,
          100% {
            opacity: 0.28;
            transform: rotate(calc(var(--i) * 30deg)) translateY(calc(-1 * clamp(3.45rem, 8.2vw, 5rem))) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: rotate(calc(var(--i) * 30deg)) translateY(calc(-1 * clamp(4rem, 9.8vw, 5.8rem))) scale(1.1);
          }
        }

        @keyframes orb {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(1.4rem, -1rem, 0);
          }
        }

        @keyframes btn-shine {
          0% {
            transform: translateX(-220%) rotate(18deg);
          }
          100% {
            transform: translateX(320%) rotate(18deg);
          }
        }

        @media (max-width: 768px) {
          .nf {
            padding: 1.5rem;
          }

          .nf-center {
            gap: 1.2rem;
          }

          .nf-big {
            gap: 0.1rem;
          }

          .nf-actions {
            width: 100%;
            flex-direction: column;
          }

          .nf-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
