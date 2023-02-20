import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    MouseSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Button, createStyles, Text, TextInput } from '@mantine/core';
import { closeAllModals, openModal } from '@mantine/modals';
import { Storage } from '@plasmohq/storage';
import { useEffect, useRef, useState } from 'react';
import { navigate } from './useSearch';

const useStyles = createStyles({
    bookmark: {
        flexGrow: 6,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        gap: 8,
        overflowY: 'auto',
    },

    bookmarkItem: {
        position: 'relative',
        width: 86,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
    },

    bookmarkItem_active: {
        cursor: 'grabbing',
    },

    bookmarkItem_icon: {
        width: 64,
        height: 64,
        borderRadius: 12,
    },

    bookmarkItem_text: {
        width: 86,
        marginTop: 0.5,
        marginBottom: 0,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: '#fff',
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        fontSize: 16,
    },
});

export interface Bookmark {
    id: string;
    title: string;
    url: string;
}

export default function Bookmark() {
    const { classes, cx } = useStyles();

    const [bookmarkItems, setBookmarkItems] = useBookmarkItems();
    const [draggingId, setDraggingId] = useState<string | null>(null);

    const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 8 } }));

    const onDragStart = ({ active }: DragStartEvent) => setDraggingId(active.id as string);
    const onDragEnd = ({ active, over }: DragEndEvent) => {
        setDraggingId(null);

        if (!(active && over) || active.id === over.id) return;

        const newItems = [...bookmarkItems];
        const oldIndex = bookmarkItems.findIndex((item) => item.id === (active.id as string));
        const newIndex = bookmarkItems.findIndex((item) => item.id === (over.id as string));
        newItems.splice(newIndex, 0, newItems.splice(oldIndex, 1)[0]);
        setBookmarkItems(newItems);
    };

    const titleRef = useRef<HTMLInputElement>(null);
    const urlRef = useRef<HTMLInputElement>(null);

    return (
        <DndContext {...{ sensors, onDragStart, onDragEnd }}>
            <SortableContext items={bookmarkItems}>
                <div className={classes.bookmark}>
                    {bookmarkItems.map((item, i) => (
                        <BookmarkItem
                            key={item.id}
                            item={item}
                            dragging={item.id === draggingId}
                            onContextMenu={() =>
                                openModal({
                                    title: 'ブックマークを編集',
                                    centered: true,
                                    children: (
                                        <>
                                            <TextInput
                                                label='タイトル'
                                                placeholder='Example Page'
                                                autoComplete='off'
                                                data-autofocus
                                                ref={titleRef}
                                                defaultValue={item.title}
                                            />
                                            <TextInput
                                                label='URL'
                                                placeholder='https://example.com'
                                                autoComplete='off'
                                                ref={urlRef}
                                                defaultValue={item.url}
                                            />
                                            <Button
                                                fullWidth
                                                mt='md'
                                                onClick={() => {
                                                    const newBookmarkItems = [...bookmarkItems];
                                                    newBookmarkItems.splice(i, 1, {
                                                        id: item.id,
                                                        title: titleRef.current!.value,
                                                        url: urlRef.current!.value,
                                                    });
                                                    setBookmarkItems(newBookmarkItems);
                                                    closeAllModals();
                                                }}
                                            >
                                                保存
                                            </Button>
                                            <Button
                                                variant='outline'
                                                color='red'
                                                fullWidth
                                                mt='md'
                                                onClick={() => {
                                                    const newBookmarkItems = [...bookmarkItems];
                                                    newBookmarkItems.splice(i, 1);
                                                    setBookmarkItems(newBookmarkItems);
                                                    closeAllModals();
                                                }}
                                            >
                                                削除
                                            </Button>
                                        </>
                                    ),
                                })
                            }
                        />
                    ))}
                    <ActionIcon variant='transparent' w={86} h={86} sx={{ userSelect: 'none' }}>
                        <Text
                            size={24}
                            onClick={() =>
                                openModal({
                                    title: 'ブックマークを追加',
                                    centered: true,
                                    children: (
                                        <>
                                            <TextInput
                                                label='タイトル'
                                                placeholder='Example Page'
                                                autoComplete='off'
                                                data-autofocus
                                                ref={titleRef}
                                            />
                                            <TextInput
                                                label='URL'
                                                placeholder='https://example.com'
                                                autoComplete='off'
                                                ref={urlRef}
                                            />
                                            <Button
                                                fullWidth
                                                mt='md'
                                                onClick={() => {
                                                    setBookmarkItems([
                                                        ...bookmarkItems,
                                                        {
                                                            id: crypto.randomUUID(),
                                                            title: titleRef.current!.value,
                                                            url: urlRef.current!.value,
                                                        },
                                                    ]);
                                                    closeAllModals();
                                                }}
                                            >
                                                追加
                                            </Button>
                                        </>
                                    ),
                                })
                            }
                        >
                            ＋
                        </Text>
                    </ActionIcon>
                </div>
            </SortableContext>
        </DndContext>
    );
}

const BookmarkItem = ({
    item,
    dragging,
    onContextMenu,
}: { item: Bookmark; dragging: boolean; onContextMenu: () => void }) => {
    const { classes, cx } = useStyles();

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: item.id,
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {/* rome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div
                className={cx(classes.bookmarkItem, { [classes.bookmarkItem_active]: dragging })}
                onClick={() => navigate(item.url)}
                onContextMenu={(e) => {
                    onContextMenu();
                    e.preventDefault();
                }}
            >
                <img
                    className={classes.bookmarkItem_icon}
                    src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${item.url}&sz=64`}
                    alt={item.title}
                />
                <p className={classes.bookmarkItem_text}>{item.title}</p>
            </div>
        </div>
    );
};

const storage = new Storage();

const useBookmarkItems = (): [Bookmark[], (bookmarkItems: Bookmark[]) => void] => {
    const [bookmarkItems, setBookmarkItems] = useState<Bookmark[] | null>(null);

    useEffect(() => {
        storage.get('bookmarkItems').then((json) => setBookmarkItems(JSON.parse(json ?? '[]')));
    }, []);

    return [
        bookmarkItems ?? [],
        (items: Bookmark[]) => {
            if (!bookmarkItems) return;
            setBookmarkItems(items);
            storage.set('bookmarkItems', JSON.stringify(items));
        },
    ];
};
