import { APP_HREFS } from '@/configs/app/features/navigation.config';
import { NotFoundView } from '@/shared/sections/not-found/NotFoundView';

export default function LocaleNotFound() {
  return <NotFoundView dashboardHref={APP_HREFS.DASHBOARD} />;
}
