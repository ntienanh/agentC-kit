import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { ACCESS_TOKEN } from '@/configs/core/session.config';
import { redirect } from '@/shared/i18n/navigation';
import { cookies } from 'next/headers';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const hasAuth = cookieStore.has(ACCESS_TOKEN);

  redirect({ href: hasAuth ? APP_HREFS.DASHBOARD : APP_HREFS.SIGNIN, locale });
}
