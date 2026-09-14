import dayjs from '@/shared/utils/dayjs.util';
import qs from 'qs';
import type { FilterGroup, QueryParams } from './types';

const OPERATOR_MAP: Record<string, string> = {
  eq: '$eq',
  ne: '$ne',
  lt: '$lt',
  lte: '$lte',
  gt: '$gt',
  gte: '$gte',
  in: '$in',
  nin: '$notIn',
  contains: '$contains',
  bt: '$between',
};

type QueryInput = QueryParams & Record<string, unknown>;
type QueryOutput = Record<string, unknown>;
type FilterRecord = Record<string, unknown>;

export const QueryBuilder = {
  build(query: QueryInput = {}): string {
    const { page, pageSize, limit, sort, orderBy, orderType, populate, search, filters, ...rest } = query;
    const output: QueryOutput = { ...rest };

    if (page !== undefined) {
      output.pagination = {
        page,
        pageSize: pageSize ?? limit ?? 10,
      };
    }

    if (sort) {
      output.sort = Array.isArray(sort) ? sort : [sort];
    }

    if (orderBy) {
      const order = orderType === 'desc' ? 'desc' : 'asc';
      output.sort = [`${orderBy}:${order}`];
    }

    if (populate !== undefined) {
      output.populate = populate;
    }

    if (search) output.search = search;
    if (filters) output.filters = this.processFilters(filters);

    return qs.stringify(output, { encode: false, arrayFormat: 'indices' });
  },

  processFilters(filters: FilterGroup | undefined): FilterGroup | undefined {
    if (!filters || !isFilterRecord(filters)) return filters;

    const result: FilterRecord = {};

    for (const [key, value] of Object.entries(filters)) {
      if ((key === '$or' || key === '$and') && Array.isArray(value)) {
        result[key] = value.map(item => (isFilterRecord(item) ? this.processFilters(item as FilterGroup) : item));
      } else if (isFilterRecord(value)) {
        result[key] = processObjectFilter(value);
      } else {
        result[key] = value;
      }
    }

    return result as FilterGroup;
  },
};

function isFilterRecord(value: unknown): value is FilterRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function processObjectFilter(filter: FilterRecord): FilterRecord {
  const mapped: FilterRecord = {};

  for (const [op, opValue] of Object.entries(filter)) {
    const mappedOp = OPERATOR_MAP[op] ?? (op.startsWith('$') ? op : `$${op}`);
    mapped[mappedOp] = mapOperatorValue(op, opValue);
  }

  return mapped;
}

function mapOperatorValue(op: string, opValue: unknown): unknown {
  if (op === 'bt' && Array.isArray(opValue) && opValue.length === 2) {
    return [dayjs(opValue[0]).toISOString(), dayjs(opValue[1]).toISOString()];
  }

  if (op === 'in' || op === 'nin') {
    return Array.isArray(opValue) ? opValue : [opValue];
  }

  return opValue;
}
