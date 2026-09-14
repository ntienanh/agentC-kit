import { I18N_NAMESPACES } from './messages';

type MessageValue = string | MessageTree;
interface MessageTree {
  [key: string]: MessageValue;
}
type Messages = MessageTree;

function namespaceToPath(namespace: string) {
  return namespace.split('.').join('/');
}

export async function loadMessages(locale: string): Promise<Messages> {
  const entries = await Promise.all(
    I18N_NAMESPACES.map(async file => [
      file,
      await import(`../../../messages/${locale}/${namespaceToPath(file)}.json`).then(m => m.default).catch(() => ({})),
    ]),
  );

  return entries.reduce<Messages>((messages, [namespace, value]) => {
    setNamespaceValue(messages, namespace, value as MessageTree);
    return messages;
  }, {});
}

function setNamespaceValue(messages: Messages, namespace: string, value: MessageTree) {
  const segments = namespace.split('.');
  let current = messages;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value;
      return;
    }

    const next = current[segment];
    if (!isMessageTree(next)) {
      current[segment] = {};
    }

    current = current[segment] as MessageTree;
  });
}

function isMessageTree(value: MessageValue | undefined): value is MessageTree {
  return typeof value === 'object' && value !== null;
}
