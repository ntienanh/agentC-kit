import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/core/i18n/routing';
import { QueryClientProvider } from '@/logic/QueryClientProvider';
import { AppToastProvider } from '@/core/providers/AppToastProvider';
import { AmbientBackground } from '@/layouts/AmbientBackground';
import { LayoutShell } from '@/layouts/LayoutShell';
import 'react-toastify/dist/ReactToastify.css';
import '@/app/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
};

export const metadata: Metadata = {
  title: {
    default: 'Enterprise Client Portal Starter',
    template: '%s | Enterprise Portal',
  },
  description: 'Modern multi-tenant enterprise client portal starter with modular architecture and role-based access control.',
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className="min-h-full bg-background text-foreground antialiased relative">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryClientProvider>
            <AmbientBackground />
            <LayoutShell>{children}</LayoutShell>
            <AppToastProvider />
          </QueryClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
