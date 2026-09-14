import { AbilityBuilder, createMongoAbility, type MongoAbility, type MongoQuery } from '@casl/ability';
import type { Permission } from './types';

type AnyObject = Record<PropertyKey, unknown>;
type AppAbilityTuple = [string, string | AnyObject];
type AppConditions = MongoQuery<AnyObject>;

export type AppAbility = MongoAbility<AppAbilityTuple, AppConditions>;

function isConditions(value: unknown): value is AppConditions {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function defineAbility(permissions: Permission[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  permissions.forEach((perm: Permission) => {
    const hasFields = Array.isArray(perm.fields) && perm.fields.length > 0;
    const conditions = isConditions(perm.conditions) ? perm.conditions : undefined;
    const hasConditions = Boolean(conditions);

    if (hasFields && hasConditions) {
      can(perm.action, perm.subject, perm.fields, conditions);
      return;
    }

    if (hasFields) {
      can(perm.action, perm.subject, perm.fields);
      return;
    }

    if (hasConditions) {
      can(perm.action, perm.subject, conditions);
      return;
    }

    can(perm.action, perm.subject);
  });

  return build();
}
