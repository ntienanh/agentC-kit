import { APP_CONFIG } from '@/configs/app/app.config';
import { ErrorHandlingProvider } from '@/layouts/errors-layout';
import { routing } from '@/shared/i18n';
import { AntdConfigProvider, QueryClientWrapperProvider, ThemeProvider } from '@/shared/providers';
import { ThemeCssVars } from '@/shared/providers/ThemeCssVars';
import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../../shared/styles/globals.css';
import '../../shared/styles/typography.css';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>): Promise<Metadata> {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  return {
    title: {
      default: APP_CONFIG.identity.name,
      template: tCommon('appTitleTemplate'),
    },
    description: tCommon('appDescription'),
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className='antialiased' suppressHydrationWarning>
        <ThemeCssVars />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <AntdConfigProvider>
              <ErrorHandlingProvider>
                <NuqsAdapter>
                  <QueryClientWrapperProvider>{children}</QueryClientWrapperProvider>
                </NuqsAdapter>
              </ErrorHandlingProvider>
            </AntdConfigProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
