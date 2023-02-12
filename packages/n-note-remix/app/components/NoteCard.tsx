import { Avatar, Card, Group, Text } from '@mantine/core';
import { Link, useOutletContext } from '@remix-run/react';
import type { User } from '@supabase/supabase-js';

interface Props {
    id: number;
    title: string;
    created_at: string;
    author: User;
}

export default function NoteCard({ id, title, created_at, author }: Props) {
    const { locale } = useOutletContext<{ locale: string }>();

    return (
        <Card component={Link} shadow='sm' radius='md' withBorder to={`/note/${id}`}>
            <Text size='xl'>{title}</Text>
            <Group spacing={6}>
                <Avatar radius='xl' size={28} src={author.user_metadata.avatar_url} />
                <Text size='sm'>{author.user_metadata.name}</Text>
            </Group>
            <Text size='sm'>{new Date(created_at).toLocaleDateString(locale)}</Text>
        </Card>
    );
}
