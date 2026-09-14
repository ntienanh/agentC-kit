'use client';

import type { ModalProps } from 'antd';
import { Modal } from 'antd';
import type { ReactNode } from 'react';

export interface AppModalProps extends Omit<ModalProps, 'open' | 'title' | 'onCancel' | 'children'> {
  title: ReactNode;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  showFooter?: boolean;
}

export function AppModal({
  title,
  open,
  onClose,
  children,
  width = 480,
  showFooter = false,
  footer,
  ...modalProps
}: Readonly<AppModalProps>) {
  return (
    <Modal
      {...modalProps}
      title={title}
      open={open}
      onCancel={onClose}
      footer={showFooter ? footer : (footer ?? null)}
      destroyOnHidden
      centered
      width={width}
    >
      <div className='pt-1'>{children}</div>
    </Modal>
  );
}
