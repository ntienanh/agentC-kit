'use client';

import { SESSION_TIMING } from '@/configs/core/session.config';
import { hexToRgba, palette } from '@/shared/styles/palette';
import { motion } from 'framer-motion';
import { Clock, RefreshCw, ShieldCheck } from 'lucide-react';
import dayjs from '@/shared/utils/dayjs.util';
import { useTokenCountdown } from '../hooks/useTokenCountdown';

const WARNING_THRESHOLD_CRITICAL = 0.2;
const WARNING_THRESHOLD_MEDIUM = 0.5;
const RING_ANIMATION_DURATION_SECONDS = 0.5;
const PERCENT_MULTIPLIER = 100;
const OVERLAY_ALPHA = 0.5;

const TIME_UNITS = {
  SECONDS_PER_MINUTE: 60,
  SECONDS_PER_HOUR: 60 * 60,
} as const;

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / SESSION_TIMING.ONE_SECOND_MS);
  const h = Math.floor(totalSec / TIME_UNITS.SECONDS_PER_HOUR);
  const m = Math.floor((totalSec % TIME_UNITS.SECONDS_PER_HOUR) / TIME_UNITS.SECONDS_PER_MINUTE);
  const s = totalSec % TIME_UNITS.SECONDS_PER_MINUTE;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function getStatusColor(remaining: number, total: number) {
  if (remaining <= 0) return { bg: palette.warmRed[50], border: palette.warmRed[200], text: palette.warmRed[600] };
  const ratio = remaining / total;
  if (ratio < WARNING_THRESHOLD_CRITICAL)
    return { bg: palette.warmRed[50], border: palette.warmRed[200], text: palette.warmRed[600] };
  if (ratio < WARNING_THRESHOLD_MEDIUM)
    return { bg: palette.gold[50], border: palette.gold[200], text: palette.gold[700] };
  return { bg: palette.sage[50], border: palette.sage[200], text: palette.sage[700] };
}

function ProgressRing({
  percentage,
  color,
  size = 48,
}: {
  readonly percentage: number;
  readonly color: string;
  readonly size?: number;
}) {
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(percentage, 1));

  return (
    <svg width={size} height={size} className='-rotate-90'>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke={hexToRgba(color, 0.15)}
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: RING_ANIMATION_DURATION_SECONDS, ease: 'easeOut' }}
      />
    </svg>
  );
}

function TokenCard({
  label,
  icon,
  remaining,
  total,
  expiresAt,
  isExpired,
  hasToken,
}: {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly remaining: number;
  readonly total: number;
  readonly expiresAt: Date | null;
  readonly isExpired: boolean;
  readonly hasToken: boolean;
}) {
  const tc = palette.terracotta;
  const status = hasToken
    ? getStatusColor(remaining, total)
    : { bg: palette.zinc[50], border: palette.zinc[200], text: palette.zinc[400] };
  const percentage = total > 0 ? remaining / total : 0;

  const getStatusLabel = () => {
    if (!hasToken) return 'Not found';
    if (isExpired) return 'Expires at';
    return 'Active';
  };
  const statusLabel = getStatusLabel();

  return (
    <div
      className='bg-card relative overflow-hidden rounded-xl border p-5'
      style={{
        borderColor: status.border,
      }}
    >
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(status.bg, OVERLAY_ALPHA)} 0%, transparent 60%)`,
        }}
      />

      <div className='relative z-10'>
        <div className='mb-4 flex items-center justify-between'>
          <div className='flex items-center gap-2.5'>
            <div
              className='flex h-8 w-8 items-center justify-center rounded-lg'
              style={{ backgroundColor: hexToRgba(status.text, 0.1) }}
            >
              {icon}
            </div>
            <div>
              <p className='text-xs font-semibold' style={{ color: tc[800] }}>
                {label}
              </p>
              <p className='text-[0.625rem] font-medium' style={{ color: status.text }}>
                {statusLabel}
              </p>
            </div>
          </div>

          <div className='relative flex items-center justify-center'>
            <ProgressRing percentage={percentage} color={status.text} />
            <span className='absolute text-[0.5625rem] font-bold' style={{ color: status.text }}>
              {hasToken && total > 0 ? `${Math.round(percentage * PERCENT_MULTIPLIER)}%` : '—'}
            </span>
          </div>
        </div>

        <div className='flex items-end justify-between'>
          <div>
            <p className='text-[0.625rem] font-medium' style={{ color: tc[400] }}>
              Time remaining
            </p>
            <p
              className='text-2xl font-bold tracking-tight tabular-nums'
              style={{ color: status.text, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}
            >
              {hasToken ? formatTime(remaining) : '--:--'}
            </p>
          </div>
          <div className='text-right'>
            {expiresAt && (
              <p className='text-[0.625rem] tabular-nums' style={{ color: tc[400] }}>
                Expires at:{' '}
                {dayjs(expiresAt).format('hh:mm:ss A')}
              </p>
            )}
            <p className='text-[0.625rem] tabular-nums' style={{ color: tc[400] }}>
              Current:{' '}
              {dayjs().format('hh:mm:ss A')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TokenCountdown() {
  const { accessToken, refreshToken } = useTokenCountdown();
  const tc = palette.terracotta;

  return (
    <div className='bg-card rounded-xl border p-5' style={{ borderColor: hexToRgba(tc[200], 0.6) }}>
      <div className='mb-4 flex items-center gap-2'>
        <ShieldCheck size={16} style={{ color: tc[500] }} />
        <h3 className='text-sm font-bold' style={{ color: tc[900] }}>
          Token Status
        </h3>
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <TokenCard
          label='Access Token'
          icon={<Clock size={16} style={{ color: getStatusColor(accessToken.remaining, accessToken.total).text }} />}
          remaining={accessToken.remaining}
          total={accessToken.total}
          expiresAt={accessToken.expiresAt}
          isExpired={accessToken.isExpired}
          hasToken={accessToken.total > 0}
        />
        <TokenCard
          label='Refresh Token'
          icon={
            <RefreshCw size={16} style={{ color: getStatusColor(refreshToken.remaining, refreshToken.total).text }} />
          }
          remaining={refreshToken.remaining}
          total={refreshToken.total}
          expiresAt={refreshToken.expiresAt}
          isExpired={refreshToken.isExpired}
          hasToken={refreshToken.total > 0}
        />
      </div>
    </div>
  );
}
