#!/usr/bin/env node

/**
 * Vertical Slice Generator CLI for Booking Spa 4
 * Single-Point-of-Declaration Manifest (SPDM) Architecture
 *
 * Usage:
 *   node tools/generator/gen-slice.mjs <feature-name> [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveWorkspaceContext() {
  const currentDir = process.cwd();
  const scriptDir = __dirname;

  const candidates = [
    currentDir,
    path.resolve(scriptDir, '../..'),
    path.join(currentDir, 'templates'),
    path.resolve(scriptDir, '../../templates'),
  ];

  for (const root of candidates) {
    if (!fs.existsSync(root)) continue;
    for (const name of ['cms', 'cms-antd']) {
      const candidateCms = path.join(root, name);
      if (fs.existsSync(candidateCms) && fs.existsSync(path.join(candidateCms, 'package.json'))) {
        return { rootDir: root, cmsDir: candidateCms, cmsRel: name };
      }
    }
  }

  if (fs.existsSync(path.join(currentDir, 'src/manifests')) || fs.existsSync(path.join(currentDir, 'src/features'))) {
    return {
      rootDir: path.resolve(currentDir, '..'),
      cmsDir: currentDir,
      cmsRel: path.basename(currentDir),
    };
  }

  const fallbackRoot = path.resolve(scriptDir, '../..');
  const fallbackRel = fs.existsSync(path.join(fallbackRoot, 'cms')) ? 'cms' : 'cms-antd';
  return {
    rootDir: fallbackRoot,
    cmsDir: path.join(fallbackRoot, fallbackRel),
    cmsRel: fallbackRel,
  };
}

const { rootDir, cmsDir, cmsRel } = resolveWorkspaceContext();

// Helper casing functions
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toTitleCase(str) {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function toConstantCase(str) {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.toUpperCase())
    .join('_');
}

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const featureArg = args.find((arg) => !arg.startsWith('--'));

if (!featureArg) {
  console.error('\x1b[31mError: Please provide a feature name.\x1b[0m');
  console.log('\nUsage:');
  console.log('  node tools/generator/gen-slice.mjs <feature-name> [--dry-run]');
  console.log('\nExample:');
  console.log('  node tools/generator/gen-slice.mjs demo-treatment --dry-run');
  process.exit(1);
}

const kebab = toKebabCase(featureArg);
const pascal = toPascalCase(featureArg);
const camel = toCamelCase(featureArg);
const title = toTitleCase(featureArg);
const constant = toConstantCase(featureArg);

console.log('\x1b[36m=== Booking Spa 4 Vertical Slice Generator ===\x1b[0m');
console.log(`Feature Name: \x1b[32m${featureArg}\x1b[0m`);
console.log(`  Kebab:     ${kebab}`);
console.log(`  Pascal:    ${pascal}`);
console.log(`  Camel:     ${camel}`);
console.log(`  Title:     ${title}`);
console.log(`  Constant:  ${constant}`);
console.log(`  Mode:      ${isDryRun ? '\x1b[33mDRY RUN (No files written)\x1b[0m' : '\x1b[32mEXECUTE (Files will be created)\x1b[0m'}\n`);

// Template definitions
const templates = [
  // 1. Model
  {
    relativePath: `${cmsRel}/src/features/${kebab}/models/${kebab}.model.ts`,
    content: `export type ${pascal}Status = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export interface ${pascal}Item {
  id: string;
  name: string;
  code?: string;
  status: ${pascal}Status;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Create${pascal}Input {
  name: string;
  code?: string;
  status?: ${pascal}Status;
  description?: string;
}

export type Update${pascal}Input = Partial<Create${pascal}Input>;

export interface ${pascal}ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ${pascal}Status | 'ALL';
}

export interface ${pascal}ListResponse {
  items: ${pascal}Item[];
  total: number;
  page: number;
  pageSize: number;
}
`,
  },

  // 2. Service
  {
    relativePath: `${cmsRel}/src/features/${kebab}/services/${kebab}.service.ts`,
    content: `import { clientFetcher } from '@/shared/lib/http';
import type {
  Create${pascal}Input,
  ${pascal}Item,
  ${pascal}ListParams,
  ${pascal}ListResponse,
  Update${pascal}Input,
} from '../models/${kebab}.model';

export const ${constant}_ENDPOINTS = {
  LIST: '/api/v1/${kebab}',
  DETAIL: (id: string | number) => \`/api/v1/${kebab}/\${id}\`,
};

export const ${camel}Api = {
  list: async (params?: ${pascal}ListParams, signal?: AbortSignal): Promise<${pascal}ListResponse> => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const queryParams: Record<string, unknown> = {
      page,
      limit: pageSize,
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.status && params.status !== 'ALL' ? { status: params.status } : {}),
    };

    const res = await clientFetcher<
      | ${pascal}Item[]
      | { data?: ${pascal}Item[]; items?: ${pascal}Item[]; total?: number; pagination?: { total?: number } }
    >(${constant}_ENDPOINTS.LIST, { method: 'GET' }, queryParams, signal);

    const payload = res.data;
    if (Array.isArray(payload)) {
      return {
        items: payload,
        total: res.pagination?.total ?? payload.length,
        page: res.pagination?.page ?? page,
        pageSize: res.pagination?.pageSize ?? pageSize,
      };
    }

    const raw = payload as
      | { data?: ${pascal}Item[]; items?: ${pascal}Item[]; total?: number; pagination?: { total?: number } }
      | null
      | undefined;
    const items = raw?.items ?? raw?.data ?? [];
    const total = raw?.total ?? raw?.pagination?.total ?? res.pagination?.total ?? items.length;

    return {
      items,
      total,
      page: res.pagination?.page ?? page,
      pageSize: res.pagination?.pageSize ?? pageSize,
    };
  },

  getById: (id: string | number, signal?: AbortSignal) => {
    return clientFetcher<${pascal}Item>(${constant}_ENDPOINTS.DETAIL(id), { method: 'GET' }, {}, signal);
  },

  create: (data: Create${pascal}Input) => {
    return clientFetcher<${pascal}Item>(${constant}_ENDPOINTS.LIST, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string | number, data: Update${pascal}Input) => {
    return clientFetcher<${pascal}Item>(${constant}_ENDPOINTS.DETAIL(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string | number) => {
    return clientFetcher<{ success: boolean }>(${constant}_ENDPOINTS.DETAIL(id), {
      method: 'DELETE',
    });
  },
};
`,
  },

  // 3. Query Hooks
  {
    relativePath: `${cmsRel}/src/features/${kebab}/hooks/use${pascal}Query.ts`,
    content: `import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Create${pascal}Input, ${pascal}ListParams, Update${pascal}Input } from '../models/${kebab}.model';
import { ${camel}Api } from '../services/${kebab}.service';

export const ${constant}_QUERY_KEYS = {
  all: ['${kebab}'] as const,
  lists: () => [...${constant}_QUERY_KEYS.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...${constant}_QUERY_KEYS.lists(), params] as const,
  details: () => [...${constant}_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string | number) => [...${constant}_QUERY_KEYS.details(), String(id)] as const,
};

export function use${pascal}ListQuery(params?: ${pascal}ListParams) {
  return useQuery({
    queryKey: ${constant}_QUERY_KEYS.list(params as Record<string, unknown>),
    queryFn: ({ signal }) => ${camel}Api.list(params, signal),
  });
}

export function useCreate${pascal}Mutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Create${pascal}Input) => ${camel}Api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ${constant}_QUERY_KEYS.lists() });
    },
  });
}

export function useUpdate${pascal}Mutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Update${pascal}Input }) =>
      ${camel}Api.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ${constant}_QUERY_KEYS.all });
    },
  });
}

export function useDelete${pascal}Mutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => ${camel}Api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ${constant}_QUERY_KEYS.lists() });
    },
  });
}
`,
  },

  // 4. Antd Table
  {
    relativePath: `${cmsRel}/src/features/${kebab}/components/${pascal}Table.tsx`,
    content: `'use client';

import React from 'react';
import { Button, Popconfirm, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useI18n } from '@/shared/i18n';
import { AppTable } from '@/shared/ui/table/AppTable';
import type { ${pascal}Item } from '../models/${kebab}.model';

export interface ${pascal}TableProps {
  items: ${pascal}Item[];
  loading: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onDelete?: (id: string) => void;
}

export function ${pascal}Table({
  items,
  loading,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onDelete,
}: ${pascal}TableProps) {
  const t = useI18n('features.${camel}');
  const tCommon = useI18n('common');

  const columns: ColumnsType<${pascal}Item> = [
    {
      title: t('columns.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-semibold text-gray-800">{text}</span>,
    },
    {
      title: t('columns.code'),
      dataIndex: 'code',
      key: 'code',
      render: (code?: string) =>
        code ? <span className="font-mono text-xs text-gray-500">{code}</span> : '—',
    },
    {
      title: t('columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'ACTIVE' ? 'green' : status === 'INACTIVE' ? 'red' : 'blue';
        return <Tag color={color}>{status || 'ACTIVE'}</Tag>;
      },
    },
    {
      title: t('columns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '—'),
    },
    {
      title: t('columns.actions'),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          {onDelete && (
            <Popconfirm
              title={t('deleteConfirm')}
              onConfirm={() => onDelete(record.id)}
              okText={tCommon('yes')}
              cancelText={tCommon('no')}
            >
              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <AppTable<${pascal}Item>
      rowKey="id"
      columns={columns}
      dataSource={items}
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize,
        total,
        showSizeChanger: true,
        onChange: (p, ps) => onPageChange(p, ps || pageSize),
      }}
    />
  );
}
`,
  },

  // 5. Feature index
  {
    relativePath: `${cmsRel}/src/features/${kebab}/index.ts`,
    content: `export * from './models/${kebab}.model';
export * from './services/${kebab}.service';
export * from './hooks/use${pascal}Query';
export * from './components/${pascal}Table';
`,
  },

  // 6. Logic Hook
  {
    relativePath: `${cmsRel}/src/logic/${kebab}/use${pascal}Logic.ts`,
    content: `'use client';

import { useState } from 'react';
import { Form } from 'antd';
import { useDebounce, useAntdMessage } from '@/shared/hooks';
import { useI18n } from '@/shared/i18n';
import { showErrorMessage } from '@/shared/lib/error';
import {
  useCreate${pascal}Mutation,
  useDelete${pascal}Mutation,
  use${pascal}ListQuery,
  type Create${pascal}Input,
  type ${pascal}Item,
  type ${pascal}Status,
} from '@/features/${kebab}';

export interface Use${pascal}LogicReturn {
  items: ${pascal}Item[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: ${pascal}Status | 'ALL';
  isModalOpen: boolean;
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  form: ReturnType<typeof Form.useForm<Create${pascal}Input>>[0];
  setSearch: (term: string) => void;
  setPage: (page: number, pageSize?: number) => void;
  setStatusFilter: (status: ${pascal}Status | 'ALL') => void;
  setIsModalOpen: (open: boolean) => void;
  handleCreate: () => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
}

export function use${pascal}Logic(): Use${pascal}LogicReturn {
  const message = useAntdMessage();
  const t = useI18n('features.${camel}');
  const tError = useI18n('error');
  const [page, setPageState] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(10);
  const [search, setSearchState] = useState<string>('');
  const [statusFilter, setStatusFilterState] = useState<${pascal}Status | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm<Create${pascal}Input>();

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = use${pascal}ListQuery({
    page,
    pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter,
  });

  const createMutation = useCreate${pascal}Mutation();
  const deleteMutation = useDelete${pascal}Mutation();

  const setSearch = (term: string) => {
    setSearchState(term);
    setPageState(1);
  };

  const setPage = (newPage: number, newPageSize?: number) => {
    setPageState(newPage);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSizeState(newPageSize);
    }
  };

  const setStatusFilter = (status: ${pascal}Status | 'ALL') => {
    setStatusFilterState(status);
    setPageState(1);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createMutation.mutateAsync(values);
      message.success(t('createdSuccess'));
      form.resetFields();
      setIsModalOpen(false);
    } catch (error) {
      if (error && typeof error === 'object' && 'errorFields' in error) {
        return;
      }
      showErrorMessage(message, error, tError, 'RESOURCE_CREATE_FAILED');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success(t('deletedSuccess'));
    } catch (error) {
      showErrorMessage(message, error, tError, 'RESOURCE_DELETE_FAILED');
    }
  };

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    search,
    statusFilter,
    isModalOpen,
    isLoading,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    form,
    setSearch,
    setPage,
    setStatusFilter,
    setIsModalOpen,
    handleCreate,
    handleDelete,
  };
}
`,
  },

  // 7. Next.js App Router Page
  {
    relativePath: `${cmsRel}/src/app/[locale]/(protected)/${kebab}/page.tsx`,
    content: `'use client';

import React from 'react';
import { Button, Card, Form, Input, Modal, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useI18n } from '@/shared/i18n';
import { AppSearchInput } from '@/shared/ui/input/AppSearchInput';
import { ${pascal}Table } from '@/features/${kebab}';
import { use${pascal}Logic } from '@/logic/${kebab}/use${pascal}Logic';

const { Title } = Typography;

export default function ${pascal}ManagementPage() {
  const t = useI18n('features.${camel}');

  const {
    items,
    total,
    page,
    pageSize,
    search,
    isModalOpen,
    isLoading,
    isCreating,
    form,
    setSearch,
    setPage,
    setIsModalOpen,
    handleCreate,
    handleDelete,
  } = use${pascal}Logic();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-1">
            {t('title')}
          </Title>
          <p className="text-gray-500">
            {t('description')}
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          {t('createItem')}
        </Button>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="w-72">
            <AppSearchInput
              placeholder={t('searchPlaceholder')}
              defaultValue={search}
              onSearchChange={setSearch}
            />
          </div>
          {total > 0 && (
            <span className="text-xs text-gray-500">
              {t('showing', {
                from: Math.min((page - 1) * pageSize + 1, total),
                to: Math.min(page * pageSize, total),
                total,
              })}
            </span>
          )}
        </div>

        <${pascal}Table
          items={items}
          loading={isLoading}
          total={total}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onDelete={handleDelete}
        />
      </Card>

      <Modal
        title={t('form.modalTitle')}
        open={isModalOpen}
        onOk={handleCreate}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isCreating}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label={t('form.name')}
            rules={[{ required: true, message: t('form.nameRequired') }]}
          >
            <Input placeholder={t('form.namePlaceholder')} />
          </Form.Item>
          <Form.Item name="code" label={t('form.code')}>
            <Input placeholder={t('form.codePlaceholder')} />
          </Form.Item>
          <Form.Item name="description" label={t('form.description')}>
            <Input.TextArea rows={3} placeholder={t('form.descriptionPlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
`,
  },

  // 8. Manifest
  {
    relativePath: `${cmsRel}/src/manifests/${kebab}.manifest.ts`,
    content: `import type { FeatureManifest } from './types';

export const ${camel}Manifest: FeatureManifest = {
  id: '${kebab}',
  name: '${title}',
  description: 'Manage ${title.toLowerCase()} records and configurations.',
  route: '/${kebab}',
  icon: 'AppstoreOutlined',
  apiEndpoint: '/api/v1/${kebab}',
  roles: ['ADMIN', 'MANAGER', 'STAFF'],
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'string',
      required: true,
      sortable: true,
      filterable: true,
    },
    {
      name: 'code',
      label: 'Code',
      type: 'string',
      required: false,
      sortable: true,
      filterable: true,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'enum',
      required: true,
      options: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Draft', value: 'DRAFT' },
      ],
      sortable: true,
      filterable: true,
    },
  ],
  order: 50,
};
`,
  },

  // 9. English i18n dictionary
  {
    relativePath: `${cmsRel}/messages/en/features/${camel}.json`,
    content: JSON.stringify(
      {
        title: title,
        description: `Manage ${title.toLowerCase()} records, lifecycle operations, and configurations.`,
        createItem: `Create ${title}`,
        searchPlaceholder: `Search ${title.toLowerCase()}...`,
        showing: 'Showing {from}–{to} of {total}',
        tableAriaLabel: `${title} Table`,
        createdSuccess: `${title} created successfully`,
        updatedSuccess: `${title} updated successfully`,
        deletedSuccess: `${title} deleted successfully`,
        deleteConfirm: 'Are you sure you want to delete this record?',
        columns: {
          name: 'Name',
          code: 'Code',
          status: 'Status',
          createdAt: 'Created At',
          actions: 'Actions',
        },
        form: {
          modalTitle: `Create ${title}`,
          name: 'Name',
          nameRequired: 'Please enter name',
          namePlaceholder: 'Enter name',
          code: 'Code',
          codePlaceholder: 'Enter code (optional)',
          description: 'Description',
          descriptionPlaceholder: 'Enter description',
        },
      },
      null,
      2
    ) + '\n',
  },

  // 10. Vietnamese i18n dictionary
  {
    relativePath: `${cmsRel}/messages/vi/features/${camel}.json`,
    content: JSON.stringify(
      {
        title: title,
        description: `Quản lý dữ liệu, vòng đời và cấu hình ${title.toLowerCase()}.`,
        createItem: `Tạo ${title}`,
        searchPlaceholder: `Tìm kiếm ${title.toLowerCase()}...`,
        showing: 'Hiển thị {from}–{to} trong số {total}',
        tableAriaLabel: `Bảng dữ liệu ${title}`,
        createdSuccess: `Tạo ${title} thành công`,
        updatedSuccess: `Cập nhật ${title} thành công`,
        deletedSuccess: `Xóa ${title} thành công`,
        deleteConfirm: 'Bạn có chắc chắn muốn xóa bản ghi này?',
        columns: {
          name: 'Tên',
          code: 'Mã',
          status: 'Trạng thái',
          createdAt: 'Ngày tạo',
          actions: 'Thao tác',
        },
        form: {
          modalTitle: `Tạo ${title}`,
          name: 'Tên',
          nameRequired: 'Vui lòng nhập tên',
          namePlaceholder: 'Nhập tên',
          code: 'Mã',
          codePlaceholder: 'Nhập mã (tùy chọn)',
          description: 'Mô tả',
          descriptionPlaceholder: 'Nhập mô tả',
        },
      },
      null,
      2
    ) + '\n',
  },

  // 11. Co-located Logic Unit Spec (Invariant 34 & Zero Comment Invariant 31)
  {
    relativePath: `${cmsRel}/src/logic/${kebab}/use${pascal}Logic.spec.ts`,
    content: `import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { use${pascal}Logic } from './use${pascal}Logic';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({
    data: { items: [], total: 0 },
    isLoading: false,
    error: null,
  }),
  useMutation: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  }),
  useQueryClient: vi.fn().mockReturnValue({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock('antd', () => ({
  Form: {
    useForm: () => [{
      validateFields: vi.fn().mockResolvedValue({ name: 'Test ${title}' }),
      resetFields: vi.fn(),
    }],
  },
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/shared/i18n', () => ({
  useI18n: () => (key: string) => key,
}));

describe('use${pascal}Logic', () => {
  it('initializes with default state values', () => {
    const { result } = renderHook(() => use${pascal}Logic());
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.search).toBe('');
    expect(result.current.isModalOpen).toBe(false);
  });

  it('updates page and modal open state', () => {
    const { result } = renderHook(() => use${pascal}Logic());
    act(() => {
      result.current.setPage(2);
      result.current.setIsModalOpen(true);
    });
    expect(result.current.page).toBe(2);
    expect(result.current.isModalOpen).toBe(true);
  });
});
`,
  },

  // 12. Co-located Component Spec (Invariant 34 & Zero Comment Invariant 31)
  {
    relativePath: `${cmsRel}/src/features/${kebab}/components/${pascal}Table.spec.tsx`,
    content: `import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ${pascal}Table } from './${pascal}Table';

vi.mock('@/shared/i18n', () => ({
  useI18n: () => (key: string) => key,
}));

vi.mock('@/shared/ui/table/AppTable', () => ({
  AppTable: ({ dataSource, columns }: { dataSource: any[]; columns: any[] }) => (
    <div data-testid="${kebab}-table-mock">
      <span>Rows: {dataSource.length}</span>
      <span>Columns: {columns.length}</span>
    </div>
  ),
}));

describe('${pascal}Table', () => {
  it('renders table container with correct items count', () => {
    const mockItems = [
      { id: '1', name: 'Sample Item 1', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
    ];
    render(
      <${pascal}Table
        items={mockItems as any}
        loading={false}
        total={1}
        currentPage={1}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('${kebab}-table-mock')).toBeDefined();
    expect(screen.getByText('Rows: 1')).toBeDefined();
  });
});
`,
  },

  // 13. Playwright E2E Spec (Invariant 30 & Invariant 34 - Located in e2e/)
  {
    relativePath: `${cmsRel}/e2e/${kebab}.spec.ts`,
    content: `import { test, expect } from '@playwright/test';

test.describe('${title} Management E2E Flow', () => {
  test('navigates to ${kebab} page and renders management table container', async ({ page }) => {
    await page.goto('/${kebab}');
    const heading = page.locator('h2');
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('opens create modal on clicking create button', async ({ page }) => {
    await page.goto('/${kebab}');
    const createBtn = page.locator('button:has-text("${title}")');
    if (await createBtn.isVisible()) {
      await createBtn.click();
      const modal = page.locator('.ant-modal');
      await expect(modal).toBeVisible({ timeout: 5000 });
    }
  });
});
`,
  },
];

// Execute file generation or dry-run output
for (const tmpl of templates) {
  const fullPath = path.join(rootDir, tmpl.relativePath);
  if (isDryRun) {
    console.log(`[DRY-RUN] Will create: \x1b[34m${tmpl.relativePath}\x1b[0m`);
  } else {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, tmpl.content, 'utf-8');
    console.log(`[CREATED]  \x1b[32m${tmpl.relativePath}\x1b[0m`);
  }
}

// Update manifests index
const manifestIndexPath = path.join(cmsDir, 'src/manifests/index.ts');
if (fs.existsSync(manifestIndexPath)) {
  const currentContent = fs.readFileSync(manifestIndexPath, 'utf-8');
  const exportStatement = `export * from './${kebab}.manifest';`;
  const importStatement = `import { ${camel}Manifest } from './${kebab}.manifest';`;

  if (!currentContent.includes(exportStatement)) {
    if (isDryRun) {
      console.log(`[DRY-RUN] Will update: \x1b[34m${cmsRel}/src/manifests/index.ts\x1b[0m (add ${camel}Manifest)`);
    } else {
      let updatedContent = currentContent;
      updatedContent = `${importStatement}\n` + updatedContent;
      updatedContent = updatedContent.replace(
        /export const REGISTERED_MANIFESTS: FeatureManifest\[\] = \[/,
        `${exportStatement}\n\nexport const REGISTERED_MANIFESTS: FeatureManifest[] = [\n  ${camel}Manifest,`
      );
      fs.writeFileSync(manifestIndexPath, updatedContent, 'utf-8');
      console.log(`[UPDATED]  \x1b[32m${cmsRel}/src/manifests/index.ts\x1b[0m (registered ${camel}Manifest)`);
    }
  }
}

// Update navigation config and shell navigation config if navigation files exist
const navigationConfigPath = path.join(cmsDir, 'src/configs/app/features/navigation.config.tsx');
if (fs.existsSync(navigationConfigPath)) {
  const navContent = fs.readFileSync(navigationConfigPath, 'utf-8');
  if (!navContent.includes(`${constant}:`)) {
    if (isDryRun) {
      console.log(`[DRY-RUN] Will update: \x1b[34m${cmsRel}/src/configs/app/features/navigation.config.tsx\x1b[0m (add ${constant})`);
    } else {
      const target = '} as const;';
      const insertion = `  ${constant}: '/${kebab}',\n`;
      const nextNav = navContent.replace(target, `${insertion}${target}`);
      fs.writeFileSync(navigationConfigPath, nextNav, 'utf-8');
      console.log(`[UPDATED]  \x1b[32m${cmsRel}/src/configs/app/features/navigation.config.tsx\x1b[0m (added ${constant})`);
    }
  }
}

const shellNavConfigPath = path.join(cmsDir, 'src/configs/app/features/shell-navigation.config.tsx');
if (fs.existsSync(shellNavConfigPath)) {
  let shellContent = fs.readFileSync(shellNavConfigPath, 'utf-8');
  if (!shellContent.includes(`key: '${kebab}'`)) {
    if (isDryRun) {
      console.log(`[DRY-RUN] Will update: \x1b[34m${cmsRel}/src/configs/app/features/shell-navigation.config.tsx\x1b[0m (add ${kebab})`);
    } else {
      if (!shellContent.includes('AppstoreOutlined')) {
        shellContent = shellContent.replace(
          "} from '@ant-design/icons';",
          "  AppstoreOutlined,\n} from '@ant-design/icons';"
        );
      }
      const itemBlock = `  {\n    key: '${kebab}',\n    label: '${title}',\n    href: APP_HREFS.${constant},\n    icon: <AppstoreOutlined />,\n    featureKey: '${kebab}',\n  },\n`;
      const marker = '\n];\n\nexport const APP_SIDEBAR_ACTIONS';
      if (shellContent.includes(marker)) {
        shellContent = shellContent.replace(marker, `\n${itemBlock}];\n\nexport const APP_SIDEBAR_ACTIONS`);
      } else {
        const lastBracketIndex = shellContent.lastIndexOf('];');
        if (lastBracketIndex !== -1) {
          shellContent = shellContent.slice(0, lastBracketIndex) + itemBlock + shellContent.slice(lastBracketIndex);
        }
      }
      fs.writeFileSync(shellNavConfigPath, shellContent, 'utf-8');
      console.log(`[UPDATED]  \x1b[32m${cmsRel}/src/configs/app/features/shell-navigation.config.tsx\x1b[0m (added ${kebab})`);
    }
  }
}

// Update i18n messages registry
const i18nMessagesPath = path.join(cmsDir, 'src/shared/i18n/messages.ts');
if (fs.existsSync(i18nMessagesPath)) {
  const currentContent = fs.readFileSync(i18nMessagesPath, 'utf-8');
  const importName = `features${pascal}`;
  const importStatement = `import ${importName} from '../../../messages/en/features/${camel}.json';`;
  const namespaceEntry = `'features.${camel}',`;

  if (!currentContent.includes(namespaceEntry)) {
    if (isDryRun) {
      console.log(`[DRY-RUN] Will update: \x1b[34m${cmsRel}/src/shared/i18n/messages.ts\x1b[0m (register namespace features.${camel})`);
    } else {
      let updatedContent = currentContent;
      const lastFeatureImport = updatedContent.lastIndexOf("import features");
      if (lastFeatureImport !== -1) {
        const endOfLine = updatedContent.indexOf('\n', lastFeatureImport);
        updatedContent = updatedContent.slice(0, endOfLine + 1) + `${importStatement}\n` + updatedContent.slice(endOfLine + 1);
      } else {
        updatedContent = `${importStatement}\n` + updatedContent;
      }

      updatedContent = updatedContent.replace(
        /(features:\s*\{[\s\S]*?)(\n  \},)/,
        `$1\n    ${camel}: ${importName},$2`
      );

      updatedContent = updatedContent.replace(
        /(export const I18N_NAMESPACES = \[[\s\S]*?)(\n\] as const;)/,
        `$1\n  'features.${camel}',$2`
      );

      fs.writeFileSync(i18nMessagesPath, updatedContent, 'utf-8');
      console.log(`[UPDATED]  \x1b[32m${cmsRel}/src/shared/i18n/messages.ts\x1b[0m (registered features.${camel})`);
    }
  }
}

console.log(`\n\x1b[32m✔ Slice "${featureArg}" generation ${isDryRun ? 'dry-run completed' : 'completed successfully'}!\x1b[0m`);

if (!isDryRun) {
  try {
    const { execSync } = await import('node:child_process');
    const auditScript = [
      path.join(rootDir, 'tools/audit/verify-invariants.mjs'),
      path.join(rootDir, 'templates/tools/audit/verify-invariants.mjs'),
      path.resolve(__dirname, '../audit/verify-invariants.mjs'),
    ].find((p) => fs.existsSync(p));

    if (auditScript) {
      console.log('\n[VERIFY] Running automated Invariant verification post-generation...');
      execSync(`node "${auditScript}"`, { stdio: 'inherit' });
    }
  } catch (err) {
    console.error('\n[VERIFY] ✗ Invariant violation detected!');
    process.exit(1);
  }
}


