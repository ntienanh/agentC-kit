/**
 * Next.js Instrumentation API
 * Provides server lifecycle observability and error monitoring
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const appName = process.env.APP_NAME || 'Admin Panel';
        const env = process.env.NODE_ENV || 'development';

        console.log(`✅ [${appName}] Server started in ${env} mode`);
        console.log(`📍 Runtime: Node.js ${process.version}`);
    }
}

/**
 * Error handler for all server-side errors
 * Captures errors from Server Components, Server Actions, Route Handlers, and Middleware
 */
export async function onRequestError(
    err: Error & { digest?: string },
    request: Request,
    context: {
        routerKind: 'Pages Router' | 'App Router';
        routePath: string;
        routeType: 'render' | 'route' | 'action' | 'middleware';
    },
) {
    const errorInfo = {
        timestamp: new Date().toISOString(),
        message: err.message,
        digest: err.digest,
        stack: err.stack,
        url: request.url,
        method: request.method,
        routerKind: context.routerKind,
        routePath: context.routePath,
        routeType: context.routeType,
        userAgent: request.headers.get('user-agent'),
    };

    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Request Error:', {
            route: context.routePath,
            type: context.routeType,
            message: err.message,
            url: request.url,
        });
    } else {
        console.error('❌ Request Error:', JSON.stringify(errorInfo, null, 2));
    }
}
