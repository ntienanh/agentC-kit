'use client';

import { useAbility } from '../ability';

export interface FieldPermissionOptions {
  subject: string;
  field: string;
  action?: string;
}

export function useCanAccessField({ subject, field, action = 'read' }: FieldPermissionOptions): boolean {
  const ability = useAbility();
  return ability.can(action, subject, field);
}

export function useAllowedFields({ subject, action = 'read' }: Omit<FieldPermissionOptions, 'field'>): string[] | null {
  const ability = useAbility();
  const rules = ability.rulesFor(action, subject);
  const fields = rules.flatMap(rule => rule.fields ?? []);

  return fields.length > 0 ? Array.from(new Set(fields)) : null;
}

export function useFieldPermissions(subject: string, fields: string[], action = 'read'): Record<string, boolean> {
  const ability = useAbility();

  return fields.reduce<Record<string, boolean>>((acc, field) => {
    acc[field] = ability.can(action, subject, field);
    return acc;
  }, {});
}
