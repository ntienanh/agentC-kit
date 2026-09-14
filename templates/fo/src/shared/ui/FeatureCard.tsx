'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';

export interface SharedFeatureCardData {
  id: string;
  name: string;
  description: string;
  category?: string;
  badge?: string;
  imagePath?: string;
  actionHref: string;
  actionLabel?: string;
  detailsHref?: string;
  highlights?: string[];
  priceLabel?: string;
}

export interface SharedFeatureCardProps {
  feature?: SharedFeatureCardData;
  isSelected?: boolean;
  className?: string;
  onSelect?: () => void;
}

export function FeatureCard({
  feature,
  isSelected,
  className = '',
  onSelect,
}: SharedFeatureCardProps) {
  const data = feature;
  if (!data) return null;

  const actionHref = data.actionHref || '#';
  const actionLabel = data.actionLabel || 'Learn More';
  const highlights = data.highlights || [];

  return (
    <article
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-3xl bg-card transition-all duration-300 flex flex-col justify-between h-full border border-border hover:border-primary/50 shadow-xs hover:shadow-xl hover:-translate-y-1 ${
        isSelected
          ? 'border-2 border-primary ring-4 ring-primary/10 shadow-xl'
          : ''
      } ${className}`}
      data-testid="content-feature-card"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          {data.badge ? (
            <Badge className="bg-primary text-primary-foreground border-none text-[10px] font-bold uppercase tracking-wider">
              {data.badge}
            </Badge>
          ) : data.category ? (
            <Badge variant="outline" className="text-xs">
              {data.category}
            </Badge>
          ) : null}

          {data.priceLabel && (
            <span className="text-xs font-bold font-mono text-muted-foreground">
              {data.priceLabel}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            {data.detailsHref ? (
              <Link href={data.detailsHref}>
                {data.name}
              </Link>
            ) : (
              data.name
            )}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {data.description}
          </p>
        </div>

        {highlights.length > 0 && (
          <div className="space-y-1.5 text-xs text-foreground/80 font-medium border-t border-border pt-3">
            {highlights.slice(0, 3).map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 pt-0">
        <Button asChild className="w-full rounded-xl h-11">
          <Link href={actionHref} className="flex items-center justify-center gap-2">
            <span>{actionLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
