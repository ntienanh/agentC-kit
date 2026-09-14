'use client';

import { Bold, Heading1, Heading2, Italic, Link, List, ListOrdered, RemoveFormatting, Underline } from 'lucide-react';
import type { ReactNode } from 'react';

export interface AppRichTextToolbarProps {
  onFormat?: (formatType: string) => void;
  className?: string;
  extraControls?: ReactNode;
}

export function AppRichTextToolbar({ onFormat, className = '', extraControls }: Readonly<AppRichTextToolbarProps>) {
  function handleFormat(type: string) {
    if (onFormat) {
      onFormat(type);
    }
  }

  const buttonClass =
    'flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border/60 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer';

  return (
    <div
      className={`border-border/60 bg-surface-subtle flex flex-wrap items-center gap-1 rounded-xl border p-1.5 shadow-2xs ${className}`}
    >
      <button
        type='button'
        title='Bold (Ctrl+B)'
        aria-label='Bold'
        className={buttonClass}
        onClick={() => handleFormat('bold')}
      >
        <Bold size={14} />
      </button>
      <button
        type='button'
        title='Italic (Ctrl+I)'
        aria-label='Italic'
        className={buttonClass}
        onClick={() => handleFormat('italic')}
      >
        <Italic size={14} />
      </button>
      <button
        type='button'
        title='Underline (Ctrl+U)'
        aria-label='Underline'
        className={buttonClass}
        onClick={() => handleFormat('underline')}
      >
        <Underline size={14} />
      </button>
      <div className='bg-border/60 mx-1 h-4 w-px' />
      <button
        type='button'
        title='Heading 1'
        aria-label='Heading 1'
        className={buttonClass}
        onClick={() => handleFormat('h1')}
      >
        <Heading1 size={14} />
      </button>
      <button
        type='button'
        title='Heading 2'
        aria-label='Heading 2'
        className={buttonClass}
        onClick={() => handleFormat('h2')}
      >
        <Heading2 size={14} />
      </button>
      <div className='bg-border/60 mx-1 h-4 w-px' />
      <button
        type='button'
        title='Bullet List'
        aria-label='Bullet List'
        className={buttonClass}
        onClick={() => handleFormat('bullet')}
      >
        <List size={14} />
      </button>
      <button
        type='button'
        title='Numbered List'
        aria-label='Numbered List'
        className={buttonClass}
        onClick={() => handleFormat('number')}
      >
        <ListOrdered size={14} />
      </button>
      <button
        type='button'
        title='Insert Link'
        aria-label='Insert Link'
        className={buttonClass}
        onClick={() => handleFormat('link')}
      >
        <Link size={14} />
      </button>
      <div className='bg-border/60 mx-1 h-4 w-px' />
      <button
        type='button'
        title='Clear Formatting'
        aria-label='Clear Formatting'
        className={buttonClass}
        onClick={() => handleFormat('clear')}
      >
        <RemoveFormatting size={14} />
      </button>
      {extraControls ? <div className='ms-auto flex items-center gap-1'>{extraControls}</div> : null}
    </div>
  );
}
