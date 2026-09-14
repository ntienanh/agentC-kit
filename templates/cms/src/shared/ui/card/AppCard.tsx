import { Card, type CardProps } from 'antd';

export interface AppCardProps extends CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: 'p-0!',
  sm: 'p-3! sm:p-4!',
  md: 'p-4! sm:p-5!',
  lg: 'p-5! sm:p-6!',
};

const headerPaddingMap = {
  none: 'p-0!',
  sm: 'px-3! pt-3! pb-0!',
  md: 'px-4! pt-4! pb-0! sm:px-5! sm:pt-5!',
  lg: 'px-5! pt-5! pb-0! sm:px-6! sm:pt-6!',
};

const bodyWithTitlePaddingMap = {
  none: 'p-0!',
  sm: 'px-3! pb-3! pt-2!',
  md: 'px-4! pb-4! pt-3! sm:px-5! sm:pb-5! sm:pt-3!',
  lg: 'px-5! pb-5! pt-3.5! sm:px-6! sm:pb-6! sm:pt-4!',
};

export function AppCard({ className, classNames, padding = 'md', ...props }: AppCardProps) {
  const customHeaderClass =
    typeof classNames === 'object' && classNames ? (classNames as Record<string, string>).header : undefined;
  const customBodyClass =
    typeof classNames === 'object' && classNames ? (classNames as Record<string, string>).body : undefined;

  const headerClass = `border-b-0! min-h-0! ${headerPaddingMap[padding]} ${customHeaderClass ?? ''}`;
  const bodyClass = `${props.title ? bodyWithTitlePaddingMap[padding] : paddingMap[padding]} ${customBodyClass ?? ''}`;

  return (
    <Card
      {...props}
      className={`border-border/60 bg-card rounded-2xl border shadow-2xs ${className ?? ''}`}
      classNames={
        typeof classNames === 'function'
          ? classNames
          : {
              ...(classNames as Record<string, string> | undefined),
              header: headerClass,
              body: bodyClass,
            }
      }
    />
  );
}
