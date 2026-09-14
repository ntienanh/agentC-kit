'use client';

import { Skeleton } from 'antd';
import { AppCard } from '../card/AppCard';

interface AppSkeletonListProps {
  rows?: number;
}

function ListSkeleton({ rows = 5 }: Readonly<AppSkeletonListProps>) {
  return (
    <div className='flex w-full flex-col gap-4'>
      <div className='bg-card border-border/40 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3'>
        <Skeleton.Input active size='small' className='w-48!' />
        <div className='flex items-center gap-2'>
          <Skeleton.Button active size='small' className='w-24!' />
          <Skeleton.Button active size='small' className='w-28!' />
        </div>
      </div>

      <AppCard padding='sm' className='overflow-hidden'>
        <div className='space-y-3 p-2'>
          <div className='border-border/40 flex items-center justify-between border-b pb-2'>
            <Skeleton.Input active size='small' className='w-32!' />
            <Skeleton.Input active size='small' className='w-20!' />
          </div>
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className='border-border/20 flex items-center justify-between border-b py-2 last:border-0'>
              <div className='flex items-center gap-3'>
                <Skeleton.Avatar active size={28} shape='circle' />
                <Skeleton.Input active size='small' className='w-40!' />
              </div>
              <Skeleton.Input active size='small' className='w-24!' />
            </div>
          ))}
        </div>
      </AppCard>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className='flex w-full flex-col gap-5'>
      <div className='flex items-center justify-between gap-3'>
        <Skeleton.Button active size='small' className='w-36!' />
        <div className='flex items-center gap-2'>
          <Skeleton.Button active size='small' className='w-24!' />
          <Skeleton.Button active size='small' className='w-28!' />
        </div>
      </div>

      <AppCard>
        <div className='flex flex-wrap items-center justify-between gap-4 p-2'>
          <div className='flex min-w-[280px] items-center gap-4'>
            <Skeleton.Avatar active size={64} shape='circle' />
            <div className='flex-1 space-y-2'>
              <Skeleton.Input active size='small' className='w-48!' />
              <div className='flex items-center gap-2'>
                <Skeleton.Button active size='small' className='w-20!' />
                <Skeleton.Button active size='small' className='w-24!' />
              </div>
            </div>
          </div>
          <Skeleton.Button active size='small' className='w-32!' />
        </div>
      </AppCard>

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
        <div className='flex flex-col space-y-5'>
          <AppCard>
            <Skeleton active paragraph={{ rows: 4 }} />
          </AppCard>
          <AppCard>
            <Skeleton active paragraph={{ rows: 4 }} />
          </AppCard>
        </div>
        <div className='flex flex-col space-y-5'>
          <AppCard>
            <Skeleton active paragraph={{ rows: 4 }} />
          </AppCard>
          <AppCard>
            <Skeleton active paragraph={{ rows: 4 }} />
          </AppCard>
        </div>
      </div>
    </div>
  );
}

interface AppSkeletonModalProps {
  rows?: number;
}

function ModalSkeleton({ rows = 3 }: Readonly<AppSkeletonModalProps>) {
  return (
    <div className='w-full space-y-4 py-2'>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className='space-y-1.5'>
          <Skeleton.Input active size='small' className='w-28!' />
          <Skeleton.Input active size='default' className='w-full!' />
        </div>
      ))}
      <div className='border-border/40 mt-4 flex items-center justify-end gap-2 border-t pt-4'>
        <Skeleton.Button active size='small' className='w-20!' />
        <Skeleton.Button active size='small' className='w-24!' />
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <AppCard>
      <Skeleton active paragraph={{ rows: 3 }} />
    </AppCard>
  );
}

export const AppSkeleton = {
  List: ListSkeleton,
  Detail: DetailSkeleton,
  Modal: ModalSkeleton,
  Card: CardSkeleton,
};
