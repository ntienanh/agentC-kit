import React from 'react';

export default function FrontOfficeLoading() {
  return (
    <div className='min-h-[calc(100vh-4rem)] w-full max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse'>
      <div className='space-y-3'>
        <div className='h-8 w-48 bg-muted rounded-lg' />
        <div className='h-4 w-96 bg-muted/60 rounded-md' />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[1, 2, 3, 4, 5, 6].map(key => (
          <div key={key} className='border border-border/50 rounded-2xl p-6 space-y-4 bg-card/40'>
            <div className='h-10 w-10 rounded-xl bg-muted' />
            <div className='h-5 w-3/4 bg-muted rounded-md' />
            <div className='space-y-2'>
              <div className='h-3.5 w-full bg-muted/60 rounded' />
              <div className='h-3.5 w-5/6 bg-muted/60 rounded' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
