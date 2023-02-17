import { createEmotionCache, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { StylesPlaceholder } from '@mantine/remix';
import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useFetcher,
    useLoaderData,
} from '@remix-run/react';
import { createBrowserClient } from '@supabase/auth-helpers-remix';
import acceptLanguage from 'accept-language-parser';
import { useEffect, useState } from 'react';
import createServerClient from '~/utils/createServerClient.server';
import LoadingProgress from './LoadingProgress';

export const meta: MetaFunction = () => ({
    charset: 'utf-8',
    title: 'N Note',
    viewport: 'width=device-width,initial-scale=1',
});

export const links: LinksFunction = () => [
    {
        rel: 'icon',
        href: '/icon.svg',
    },
];

createEmotionCache({ key: 'mantine' });

export const loader = async ({ request }: LoaderArgs) => {
    const env = {
        SUPABASE_URL: process.env.SUPABASE_URL!,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    };

    const { supabase, headers } = createServerClient(request);

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const languages = acceptLanguage.parse(request.headers.get('Accept-Language')!);
    const locale = languages[0]
        ? languages[0].region
            ? `${languages[0].code}-${languages[0].region.toLowerCase()}`
            : languages[0].code
        : 'en-us';

    return json(
        {
            env,
            session,
            locale,
        },
        { headers },
    );
};

export default function App() {
    const { env, session, locale } = useLoaderData<typeof loader>();
    const fetcher = useFetcher();

    const [supabase] = useState(createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY));

    const accessToken = session?.access_token;

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_, session) => {
            if (session?.access_token !== accessToken) {
                fetcher.submit(null, {
                    method: 'post',
                    action: '/handle-supabase-auth',
                });
            }
            if (location.href.endsWith('#')) location.replace(location.href.slice(0, -1));
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [accessToken, supabase, fetcher]);

    return (
        <MantineProvider withGlobalStyles withNormalizeCSS>
            <ModalsProvider>
                <html lang='ja'>
                    <head>
                        <StylesPlaceholder />
                        <Meta />
                        <Links />
                    </head>
                    <body>
                        <LoadingProgress />
                        <Outlet context={{ supabase, session, locale }} />
                        <ScrollRestoration />
                        <Scripts />
                        <LiveReload />
                    </body>
                </html>
            </ModalsProvider>
        </MantineProvider>
    );
}
