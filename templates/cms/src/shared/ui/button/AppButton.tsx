import { Button, type ButtonProps } from 'antd';

export function AppButton({ className, size, ...props }: ButtonProps) {
  const sizeClass = size === 'small' ? 'text-xs! px-3!' : size === 'large' ? 'text-base! px-5!' : 'text-sm! px-4!';
  return (
    <Button
      size={size}
      {...props}
      className={`rounded-md! font-medium! transition-all duration-150 active:scale-[0.98] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${sizeClass} ${className ?? ''}`}
    />
  );
}
