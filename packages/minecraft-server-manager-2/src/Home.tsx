import { Add as AddIcon, Delete as DeleteIcon, Folder as FolderIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { profilesState } from './states';
import useManageOrSetup from './useManageOrSetup';

const Home = () => {
    const profiles = useAtomValue(profilesState);
    const [showAddDialog, setAddDialog] = useState(false);
    const [showDeleteDialog, setDeleteDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState('');
    const manageOrSetup = useManageOrSetup();
    const toggleAddDialog = () => setAddDialog((open) => !open);
    const toggleDeleteDialog = () => setDeleteDialog((open) => !open);
    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box
                sx={{
                    flexGrow: 1,
                    mx: 10,
                    mt: 2,
                    mb: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box
                    sx={{
                        flexShrink: 0,
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                >
                    <IconButton onClick={toggleAddDialog}>
                        <AddIcon />
                    </IconButton>
                </Box>
                <List component={Paper} sx={{ flexGrow: 1 }}>
                    {Object.entries(profiles).map(([id, { name, path }]) => (
                        <ListItem
                            key={id}
                            disablePadding
                            secondaryAction={
                                <IconButton
                                    onClick={() => {
                                        setDeleteTarget(id);
                                        toggleDeleteDialog();
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemButton onClick={() => manageOrSetup(id)}>
                                <ListItemText primary={name} secondary={path} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
            <AddProfileDialog open={showAddDialog} onClose={toggleAddDialog} />
            <DeleteProfileDialog
                open={showDeleteDialog}
                onClose={toggleDeleteDialog}
                deleteTarget={deleteTarget}
            />
        </Box>
    );
};
export default Home;

const AddProfileDialog = (props: { open: boolean; onClose: () => void }) => {
    const [profiles, setProfiles] = useAtom(profilesState);
    const [name, setName] = useState('');
    const [path, setPath] = useState('');
    const [isEmpty, setIsEmpty] = useState(true);
    useEffect(() => {
        setName('');
        setPath('');
    }, [props.open]);
    const openFolder = async () => {
        const result = await window.api.openFolder();
        setPath(result?.[0] ?? '');
        setIsEmpty(result?.[1] ?? true);
    };
    const handleAdd = () => {
        setProfiles({ ...profiles, [uuid()]: { name, path } });
        props.onClose();
    };
    return (
        <Dialog fullWidth={true} open={props.open} onClose={props.onClose}>
            <DialogTitle>プロファイルを追加</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
                <TextField
                    variant='standard'
                    required
                    label='名前'
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
                <TextField
                    variant='standard'
                    required
                    label='パス'
                    value={path}
                    onChange={(event) => setPath(event.target.value)}
                    InputProps={{
                        readOnly: true,
                        endAdornment: (
                            <InputAdornment position='end'>
                                <IconButton onClick={openFolder}>
                                    <FolderIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mt: 1 }}
                />
                {!isEmpty && (
                    <Alert severity='warning' sx={{ mt: 2 }}>
                        フォルダが空ではありません
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button disabled={!name || !path} onClick={handleAdd}>
                    追加
                </Button>
                <Button onClick={props.onClose}>キャンセル</Button>
            </DialogActions>
        </Dialog>
    );
};

const DeleteProfileDialog = (props: {
    open: boolean;
    onClose: () => void;
    deleteTarget: string;
}) => {
    const [profiles, setProfiles] = useAtom(profilesState);
    const handleDelete = () => {
        delete profiles[props.deleteTarget];
        setProfiles(profiles);
        props.onClose();
    };
    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogTitle>プロファイルを削除</DialogTitle>
            <DialogContent>
                <Typography variant='body1'>
                    <code
                        style={{
                            padding: '0 4px',
                            fontFamily: 'Consolas, "Courier New", Courier, Monaco, monospace',
                        }}
                    >
                        {profiles[props.deleteTarget]?.name}
                    </code>
                    を削除しますか？
                </Typography>
                <Typography variant='body2'>
                    (プロファイルを削除してもデータは失われません)
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button color='error' onClick={handleDelete}>
                    削除
                </Button>
                <Button onClick={props.onClose}>キャンセル</Button>
            </DialogActions>
        </Dialog>
    );
};
