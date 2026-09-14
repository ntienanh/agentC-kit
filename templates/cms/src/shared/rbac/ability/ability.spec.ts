import { describe, expect, it } from 'vitest';
import { defineAbility } from './ability';

describe('defineAbility (CASL RBAC Matrix)', () => {
  it('should grant permissions defined in the permissions array', () => {
    const ability = defineAbility([
      { id: 'perm-1', action: 'read', subject: 'Player' },
      { id: 'perm-2', action: 'update', subject: 'Player' },
    ]);

    expect(ability.can('read', 'Player')).toBe(true);
    expect(ability.can('update', 'Player')).toBe(true);
    expect(ability.can('delete', 'Player')).toBe(false);
  });

  it('should deny actions not present in permissions array', () => {
    const ability = defineAbility([{ id: 'perm-3', action: 'read', subject: 'Dashboard' }]);

    expect(ability.can('read', 'Dashboard')).toBe(true);
    expect(ability.can('create', 'Dashboard')).toBe(false);
    expect(ability.can('delete', 'Dashboard')).toBe(false);
  });
});
