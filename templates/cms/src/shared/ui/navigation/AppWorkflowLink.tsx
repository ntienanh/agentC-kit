import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export type AppWorkflowLinkProps = Readonly<{
  href: string;
  label: string;
  description?: string;
  className?: string;
}>;

export function AppWorkflowLink({ href, label, description, className }: AppWorkflowLinkProps) {
  return (
    <Link
      href={href}
      className={`border-border/60 text-foreground hover:border-primary/50 hover:bg-primary/5 flex min-w-0 items-center justify-between gap-3 rounded-md! border px-3 py-2 text-xs font-medium transition-all duration-150 ${className ?? ''}`}
    >
      <span className='min-w-0'>
        <span className='block truncate'>{label}</span>
        {description ? (
          <span className='text-muted-foreground mt-1 block text-xs leading-5 font-normal'>{description}</span>
        ) : null}
      </span>
      <ArrowUpRight size={14} className='text-muted-foreground shrink-0' aria-hidden='true' />
    </Link>
  );
}
