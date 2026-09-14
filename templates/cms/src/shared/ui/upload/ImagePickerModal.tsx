'use client';

import { useI18n } from '@/shared/i18n';
import type { MediaItem } from '@/shared/models/media-contract';
import { Button, Empty, Modal, Spin, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useCollectionListQuery } from '@/shared/hooks/media/useCollectionQuery';
import { useMediaListQuery } from '@/shared/hooks/media/useMediaQuery';

const { Text } = Typography;

export interface ImagePickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (images: MediaItem[]) => void;
  mode?: 'single' | 'multiple';
  selectedIds?: string[];
  title?: string;
}

export const ImagePickerModal = ({
  open,
  onClose,
  onSelect,
  mode = 'single',
  selectedIds = [],
  title,
}: ImagePickerModalProps) => {
  const t = useI18n('features.mediaLibrary');
  const resolvedTitle = title ?? t('imagePicker.selectImage');

  const [activeCollectionId] = useState<string | null>(null);
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);

  const {
    isLoading: isLoadingCollections,
    isError: isCollectionsError,
    error: collectionsQueryError,
    refetch: refetchCollections,
  } = useCollectionListQuery(open);

  const {
    medias,
    isLoading: isLoadingMedias,
    isError: isMediasError,
    error: mediasQueryError,
    refetch: refetchMedias,
  } = useMediaListQuery({ collectionId: activeCollectionId ?? undefined }, open);

  const imageMedias = useMemo(() => {
    return medias.filter((media: MediaItem) => media.mimeType?.startsWith('image/'));
  }, [medias]);

  const handleToggle = (id: string) => {
    if (mode === 'single') {
      setLocalSelectedIds([id]);
    } else {
      setLocalSelectedIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
    }
  };

  const handleConfirm = () => {
    const selectedImages = imageMedias.filter((media: MediaItem) => localSelectedIds.includes(media.id));
    onSelect(selectedImages);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedIds);
    onClose();
  };

  const selectedCount = localSelectedIds.length;

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={handleConfirm}
      title={resolvedTitle}
      width={900}
      okText={`Select ${mode === 'multiple' && selectedCount > 0 ? `(${selectedCount})` : ''}`}
      cancelText={t('imagePicker.cancel')}
      okButtonProps={{
        disabled: selectedCount === 0,
      }}
    >
      <div className='flex h-[450px] gap-4'>
        <div className='flex-1 overflow-y-auto p-2'>
          {isLoadingMedias || isLoadingCollections ? (
            <div className='flex h-full items-center justify-center'>
              <Spin size='large' />
            </div>
          ) : isMediasError || isCollectionsError ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className='flex flex-col items-center gap-3'>
                  <span>
                    {(mediasQueryError ?? collectionsQueryError) instanceof Error
                      ? (mediasQueryError ?? collectionsQueryError)?.message
                      : 'Images unavailable'}
                  </span>
                  <Button
                    onClick={() => {
                      void refetchMedias();
                      void refetchCollections();
                    }}
                  >
                    Retry
                  </Button>
                </div>
              }
              className='py-20'
            />
          ) : imageMedias.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('imagePicker.noImages')} className='py-20' />
          ) : (
            <div className='grid grid-cols-4 gap-3'>
              {imageMedias.map((media: MediaItem) => {
                const isSelected = localSelectedIds.includes(media.id);
                return (
                  <button
                    key={media.id}
                    type='button'
                    onClick={() => handleToggle(media.id)}
                    className={`relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                      isSelected ? 'border-primary shadow-md' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={media.url} alt={media.filename} className='h-full w-full object-cover' />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {mode === 'multiple' && selectedCount > 0 && (
        <div className='mt-4 flex items-center justify-between border-t pt-4'>
          <Text type='secondary'>
            {selectedCount} image{selectedCount > 1 ? 's' : ''} selected
          </Text>
          <button
            type='button'
            className='text-primary hover:text-primary/80 text-sm'
            onClick={() => setLocalSelectedIds([])}
          >
            Clear all
          </button>
        </div>
      )}
    </Modal>
  );
};
