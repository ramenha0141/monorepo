import { ActionIcon, Button, Flex, Group, Select, Text, TextInput } from '@mantine/core';
import { closeAllModals, openConfirmModal, openModal } from '@mantine/modals';
import { Link, RichTextEditor } from '@mantine/tiptap';
import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate, useOutletContext } from '@remix-run/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { IconSettings, IconTrash } from '@tabler/icons';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import SubScript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import { BubbleMenu, FloatingMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { FocusEvent } from 'react';
import { useEffect, useState } from 'react';
import type { Database } from '~/../database';
import createServerClient from '~/utils/createServerClient.server';
import lowlight from '~/utils/lowlight.client';

export const loader = async ({ params, request }: LoaderArgs) => {
    const id = params.id!;

    const { supabase, headers } = createServerClient(request);

    const [user, note] = await Promise.all([
        supabase.auth.getUser().then((data) => data.data.user),
        supabase
            .from('note')
            .select()
            .eq('id', id)
            .then((data) => data.data?.[0]),
    ]);
    if (!note) throw json(null, { status: 404, headers });
    if (!user || note.author !== user.id) throw redirect(`/note/${id}`);

    return json(
        {
            note,
        },
        { headers },
    );
};

export const headers = () => ({
    'Cache-Control': 'no-cache',
});

export const meta: MetaFunction<typeof loader> = ({ data }) => ({
    title: data ? `編集：${data.note.title} / N Note` : 'ノートが見つかりませんでした',
});

export default function EditNote() {
    const { note } = useLoaderData<typeof loader>();

    const navigate = useNavigate();

    const { supabase } = useOutletContext<{ supabase: SupabaseClient<Database> }>();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            Highlight,
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Superscript,
            SubScript,
            Link,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Typography,
        ],
        content: note.content,
    });

    const [hasChange, setHasChange] = useState(false);

    useEffect(() => {
        editor?.on('update', () => setHasChange(true));
    }, [editor]);

    const handleChangeTitle = async (e: FocusEvent<HTMLInputElement>) =>
        await supabase.from('note').update({ id: note.id, title: e.target.value });

    const showSettingsModal = () =>
        openModal({
            title: '設定',
            centered: true,
            children: (
                <Flex direction='column' align='flex-start' gap={16}>
                    <Select
                        data={['非公開', '公開']}
                        label='公開設定'
                        defaultValue={note.isPublic ? '公開' : '非公開'}
                        onChange={handleChangeVisibility}
                    />
                    <Button color='red' leftIcon={<IconTrash />} onClick={handleDelete}>
                        ノートを削除
                    </Button>
                </Flex>
            ),
        });

    const handleChangeVisibility = async (visibility: string) =>
        await supabase.from('note').update({ id: note.id, isPublic: visibility === '公開' });

    const handleDelete = async () => {
        openConfirmModal({
            title: 'ノートを削除',
            centered: true,
            children: (
                <>
                    <Text size='sm'>
                        ノートを削除すると永遠に復元できません。{'\n'}削除しますか？
                    </Text>
                </>
            ),
            labels: { confirm: '削除', cancel: 'キャンセル' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                closeAllModals();
                const error = (await supabase.from('note').delete().eq('id', note.id)).error;
                if (!error) navigate('/');
            },
        });
    };

    const handleSave = async () => {
        setHasChange(false);
        return await supabase.from('note').update({
            id: note.id,
            content: editor!.getHTML(),
            updated_at: new Date().toISOString(),
        });
    };

    return (
        <>
            <Group mb={8}>
                <TextInput
                    size='lg'
                    placeholder='タイトル'
                    wrapperProps={{ style: { flexGrow: 1 } }}
                    defaultValue={note.title}
                    onBlur={handleChangeTitle}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                />
                <ActionIcon size='xl' onClick={showSettingsModal}>
                    <IconSettings />
                </ActionIcon>
                <Button disabled={!hasChange} onClick={handleSave}>
                    保存
                </Button>
            </Group>
            <RichTextEditor editor={editor}>
                <RichTextEditor.Toolbar sticky stickyOffset={59}>
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.H1 />
                        <RichTextEditor.H2 />
                        <RichTextEditor.H3 />
                        <RichTextEditor.H4 />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Underline />
                        <RichTextEditor.Strikethrough />
                        <RichTextEditor.ColorPicker colors={[]} />
                        <RichTextEditor.ClearFormatting />
                        <RichTextEditor.Highlight />
                        <RichTextEditor.Code />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Blockquote />
                        <RichTextEditor.Hr />
                        <RichTextEditor.BulletList />
                        <RichTextEditor.OrderedList />
                        <RichTextEditor.Subscript />
                        <RichTextEditor.Superscript />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Link />
                        <RichTextEditor.Unlink />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.CodeBlock />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.AlignLeft />
                        <RichTextEditor.AlignCenter />
                        <RichTextEditor.AlignJustify />
                        <RichTextEditor.AlignRight />
                    </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>

                {editor && (
                    <BubbleMenu editor={editor}>
                        <RichTextEditor.ControlsGroup>
                            <RichTextEditor.Bold />
                            <RichTextEditor.Italic />
                            <RichTextEditor.Underline />
                            <RichTextEditor.Strikethrough />
                            <RichTextEditor.ColorPicker colors={[]} />
                        </RichTextEditor.ControlsGroup>
                    </BubbleMenu>
                )}

                {editor && (
                    <FloatingMenu editor={editor}>
                        <RichTextEditor.ControlsGroup>
                            <RichTextEditor.H1 />
                            <RichTextEditor.H2 />
                            <RichTextEditor.H3 />
                            <RichTextEditor.H4 />
                            <RichTextEditor.BulletList />
                        </RichTextEditor.ControlsGroup>
                    </FloatingMenu>
                )}

                <RichTextEditor.Content />
            </RichTextEditor>
        </>
    );
}
