const apiFetch = fetch;
'use client';

import { ENV_CLIENT } from '@/configs/app/env/client.config';
import { UPLOAD_CONFIG } from '@/configs/core/upload.config';
import { useAntdMessage } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { createAuthorizationHeader } from '@/shared/lib/http/auth-header';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react';

export interface UploadImageProps {
  value?: string | string[];
  onChange?: (value?: string | string[]) => void;
  multiple?: boolean;
  maxCount?: number;
  maxSizeMB?: number;
  accept?: string;
  action?: string;
  customRequest?: UploadProps['customRequest'];
  listType?: UploadProps['listType'];
  disabled?: boolean;
  children?: React.ReactNode;
}

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const normalizeFileList = (value?: string | string[]): UploadFile[] => {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];

  return arr.map((url, index) => ({
    uid: `${index}`,
    name: url.split('/').pop() || 'image',
    status: 'done',
    url,
  }));
};

const normalizeOutputValue = (fileList: UploadFile[], multiple?: boolean) => {
  const urls = fileList
    .filter(f => f.status === 'done')
    .map(f => {
      if (Array.isArray(f.response)) {
        return ENV_CLIENT.UPLOAD_SERVICE_URL + f.response[0]?.url;
      }
      return f.response?.url || f.url;
    })
    .filter(Boolean) as string[];

  return multiple ? urls : urls[0];
};

export const UploadImage: React.FC<UploadImageProps> = ({
  value,
  onChange,
  multiple = false,
  maxCount,
  maxSizeMB = UPLOAD_CONFIG.MAX_SIZE / UPLOAD_CONFIG.BYTES_IN_MB,
  accept = UPLOAD_CONFIG.DEFAULT_ACCEPT,
  action = `${ENV_CLIENT.UPLOAD_SERVICE_URL}${UPLOAD_CONFIG.API_PATH}`,
  customRequest,
  listType = UPLOAD_CONFIG.DEFAULT_LIST_TYPE,
  disabled = false,
  children,
}) => {
  const message = useAntdMessage();
  const tError = useI18n('error');
  const tCommon = useI18n('common');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const validateFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error(tError('ONLY_IMAGE_FILES_ALLOWED'));
      return Upload.LIST_IGNORE;
    }
    if (file.size / UPLOAD_CONFIG.BYTES_IN_MB > maxSizeMB) {
      message.error(tError('IMAGE_MAX_SIZE_EXCEEDED').replace('{maxSizeMB}', `${maxSizeMB}`));
      return Upload.LIST_IGNORE;
    }
    return true;
  };
  const syncedRef = useRef(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  useEffect(() => {
    if (!syncedRef.current) {
      setFileList(normalizeFileList(value));
      syncedRef.current = true;
    }
  }, [value]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewTitle(file.name || '');
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList }) => {
    setFileList(fileList);
    onChange?.(normalizeOutputValue(fileList, multiple));
  };

  const internalCustomRequest: UploadProps['customRequest'] = ({ file, onSuccess, onError }) => {
    const doUpload = async () => {
      const fileToUpload = file as File;
      const formData = new FormData();
      formData.append('files', fileToUpload);

      const token = Cookies.get('accessToken');

      try {
        const res = await apiFetch(action, {
          method: 'POST',
          headers: createAuthorizationHeader(token),
          body: formData,
        });

        if (!res.ok) throw new Error(tError('UPLOAD_FAILED'));

        const data = await res.json();
        onSuccess?.(data);
      } catch (err) {
        message.error(tError('UPLOAD_FAILED'));
        onError?.(err as Error);
      }
    };

    doUpload();
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{tCommon('upload')}</div>
    </div>
  );

  return (
    <>
      <Upload
        name='files'
        listType={listType}
        fileList={fileList}
        multiple={multiple}
        maxCount={multiple ? maxCount || UPLOAD_CONFIG.DEFAULT_MAX_FILES : 1}
        accept={accept}
        disabled={disabled}
        beforeUpload={file => validateFile(file)}
        onPreview={handlePreview}
        onChange={handleChange}
        customRequest={customRequest || internalCustomRequest}
      >
        {(() => {
          const maxFiles = multiple ? maxCount || UPLOAD_CONFIG.DEFAULT_MAX_FILES : 1;
          return fileList.length >= maxFiles ? null : children || uploadButton;
        })()}
      </Upload>

      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
        <img alt='preview' style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};
