import { Flex, Group, Pagination, Tabs } from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { IconHeart, IconNote } from '@tabler/icons';
import createServerClient from '~/utils/createServerClient.server';
import NoteCard from '../../components/NoteCard';

export const loader = async ({ request }: LoaderArgs) => {
    const { supabase, response } = createServerClient(request);
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw redirect('/');

    const url = new URL(request.url);
    const type = url.searchParams.get('type') ?? 'own';
    const page = parseInt(url.searchParams.get('page') ?? '1');

    const count = (await supabase.from('note').select('*', { count: 'exact', head: true })).count;
    const table = supabase.from('note').select('id, title, created_at');
    const items = (
        await table
            .eq('author', user.id)
            .order('created_at')
            .range((page - 1) * 10, 10)
    ).data;

    if (!count || !items) throw new Error();

    return json(
        {
            count,
            items,
            author: user,
        },
        { headers: response.headers }
    );
};

export default function Library() {
    const { count, items, author } = useLoaderData<typeof loader>();

    const location = useLocation();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    const type = query.get('type') ?? 'own';
    const page = parseInt(query.get('page') ?? '1');

    return (
        <Tabs value={type} onTabChange={(tab) => navigate(`/library?type=${tab}`)}>
            <Tabs.List>
                <Tabs.Tab value='own' icon={<IconNote />}>
                    自分のノート
                </Tabs.Tab>
                <Tabs.Tab value='like' icon={<IconHeart />}>
                    いいねしたノート
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value={type} pt='md'>
                <Flex wrap='wrap' align='flex-start' sx={{ alignContent: 'flex-start' }} gap={16}>
                    {items.map((item) => (
                        <NoteCard {...item} author={author} key={item.id} />
                    ))}
                </Flex>
                <Group position='center' mt='md'>
                    <Pagination page={page} total={Math.max(Math.ceil(count / 10), 1)} />
                </Group>
            </Tabs.Panel>
        </Tabs>
    );
}
