export function resolveAbilityAction(action: string): string {
  const actionAliasMap: Record<string, string> = {
    clone: 'create',
  };

  return actionAliasMap[action] ?? action;
}
