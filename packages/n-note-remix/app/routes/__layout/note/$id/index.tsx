import { Avatar, Badge, Box, Button, Flex, Group, Text } from '@mantine/core';
import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate, useOutletContext } from '@remix-run/react';
import { IconPencil } from '@tabler/icons';
import createServerClient from '~/utils/createServerClient.server';
import supabaseAdminClientServer from '~/utils/supabaseAdminClient.server';

export const loader = async ({ params, request }: LoaderArgs) => {
    const id = params.id!;

    const { supabase, headers } = createServerClient(request);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const note = (await supabase.from('note').select().eq('id', id)).data?.[0];
    if (!note) throw json(null, { status: 404, headers });

    const isMine = note.author === user?.id;

    if (isMine)
        return json(
            {
                note,
                author: user,
                isMine,
            },
            { headers }
        );

    const {
        data: { user: author },
    } = await supabaseAdminClientServer.auth.admin.getUserById(note.author);
    if (!author) throw json(null, { status: 404 });

    return json(
        {
            note,
            author,
            isMine,
        },
        { headers }
    );
};

export const meta: MetaFunction<typeof loader> = ({ data }) => ({
    title: data ? `${data.note.title} / N Note` : 'ノートが見つかりませんでした',
});

export default function Note() {
    const { note, author, isMine } = useLoaderData<typeof loader>();

    const navigate = useNavigate();

    const { locale } = useOutletContext<{ locale: string }>();
    return (
        <>
            <Flex direction='column' align='center' sx={{ position: 'relative' }}>
                <Text size={36} weight='bold'>
                    {note.title}
                </Text>
                <Text>
                    作成日：{new Date(note.created_at).toLocaleDateString(locale)}
                    {'　'}
                    更新日：{new Date(note.updated_at).toLocaleDateString(locale)}
                </Text>
                <Group spacing='xs' my={4}>
                    <Avatar radius='xl' src={author.user_metadata.avatar_url} />
                    <Text>{author.user_metadata.name}</Text>
                    {author.email?.endsWith('nnn.ed.jp') && (
                        <Badge variant='filled' size='sm'>
                            N高生
                        </Badge>
                    )}
                </Group>
                {isMine && (
                    <Button
                        variant='filled'
                        leftIcon={<IconPencil />}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        onClick={() => navigate('edit')}
                    >
                        編集
                    </Button>
                )}
            </Flex>
            <Box dangerouslySetInnerHTML={{ __html: note.content }} />
        </>
    );
}
