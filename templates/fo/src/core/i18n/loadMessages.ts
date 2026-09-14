type MessageValue = string | MessageTree;
interface MessageTree {
  [key: string]: MessageValue;
}
type Messages = MessageTree;

const DOMAINS = ['common', 'auth', 'portal'] as const;

export async function loadMessages(locale: string): Promise<Messages> {
  const entries = await Promise.all(
    DOMAINS.map(async (domain) => [
      domain,
      await import(`../../../messages/${locale}/${domain}.json`)
        .then((m) => m.default)
        .catch(() => ({})),
    ]),
  );

  return entries.reduce<Messages>((messages, [domain, value]) => {
    messages[domain as string] = value as MessageTree;
    return messages;
  }, {});
}
