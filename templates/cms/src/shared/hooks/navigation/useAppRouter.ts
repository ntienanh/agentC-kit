import { usePathname, useRouter } from '@/shared/i18n/navigation';
import { useLocale } from 'next-intl';
import { useCallback } from 'react';

type RouterPushParams = Parameters<ReturnType<typeof useRouter>['push']>;
type RouterReplaceParams = Parameters<ReturnType<typeof useRouter>['replace']>;

function isSamePath(current: string, target: RouterPushParams[0]): boolean {
  const targetStr = typeof target === 'string' ? target : (target?.pathname ?? '');
  const stripped = current.replace(/^\/(en|vi)/, '') || '/';
  return stripped === targetStr || current === targetStr;
}

export const useAppRouter = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const push = useCallback(
    (...args: RouterPushParams) => {
      if (isSamePath(pathname, args[0])) return;
      return router.push(...args);
    },
    [router, pathname],
  );

  const replace = useCallback(
    (...args: RouterReplaceParams) => {
      if (isSamePath(pathname, args[0])) return;
      return router.replace(...args);
    },
    [router, pathname],
  );

  return {
    back: router.back,
    push,
    replace,
    locale,
  };
};
