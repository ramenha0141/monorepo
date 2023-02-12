import { Button, Flex, TextInput } from '@mantine/core';
import type { ActionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useState } from 'react';
import createServerClient from '~/utils/createServerClient.server';

export default function CreateNote() {
    const fetcher = useFetcher();

    const [title, setTitle] = useState('');

    const handleCreate = () => fetcher.submit({ title }, { method: 'post' });

    return (
        <Flex direction='column' justify='center' gap={16} w='100%' h='100%'>
            <TextInput
                autoFocus
                label='タイトル'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <Button disabled={!title} loading={fetcher.state !== 'idle'} onClick={handleCreate}>
                作成
            </Button>
        </Flex>
    );
}

export const action = async ({ request }: ActionArgs) => {
    const { supabase } = createServerClient(request);

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error();

    const data = await request.formData();
    const title = data.get('title');
    if (typeof title !== 'string') throw new Error();

    const note = (
        await supabase.from('note').insert({ title, author: user.id, isPublic: false }).select()
    ).data?.[0];
    if (!note) throw new Error();

    throw redirect(`/note/${note.id}/edit`);
};
