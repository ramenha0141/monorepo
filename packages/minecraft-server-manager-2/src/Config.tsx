import {
    CircularProgress,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import { useState, useEffect } from 'react';
import propertiesData from './propertiesData';

const Config = () => {
    const [properties, setProperties] = useState<{ [key: string]: string }>();
    useEffect(() => {
        window.api.getProperties().then((properties) => setProperties(properties));
    }, []);
    const handleChange = (key: string, value: string) => {
        const newProperties = { ...properties, [key]: value };
        setProperties(newProperties);
        window.api.setProperties(newProperties);
    };
    if (!properties)
        return (
            <CircularProgress
                color='inherit'
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />
        );
    return (
        <TableContainer
            component={Paper}
            sx={{ flexGrow: 1, flexBasis: 0, overflowY: 'scroll', scrollBehavior: 'smooth' }}
        >
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>キー</TableCell>
                        <TableCell align='right'>値</TableCell>
                        <TableCell align='right'>デフォルト値</TableCell>
                        <TableCell align='right'>説明</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody sx={{ userSelect: 'text' }}>
                    {Object.entries(propertiesData).map(
                        ([key, { isBool, defaultValue, detail }]) => (
                            <TableRow
                                key={key}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>{key}</TableCell>
                                <TableCell align='right'>
                                    {isBool ? (
                                        <Select
                                            variant='standard'
                                            size='small'
                                            value={properties[key] ?? defaultValue}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                            sx={{
                                                color:
                                                    (properties[key] ?? defaultValue) === 'true'
                                                        ? 'green'
                                                        : 'red',
                                            }}
                                        >
                                            <MenuItem value='true' sx={{ color: 'green' }}>
                                                true
                                            </MenuItem>
                                            <MenuItem value='false' sx={{ color: 'red' }}>
                                                false
                                            </MenuItem>
                                        </Select>
                                    ) : (
                                        <TextField
                                            variant='standard'
                                            value={properties[key] ?? defaultValue}
                                            onChange={(e) => handleChange(key, e.target.value)}
                                            sx={{ input: { textAlign: 'center' } }}
                                            disabled={key === 'level-name'}
                                        ></TextField>
                                    )}
                                </TableCell>
                                <TableCell
                                    align='right'
                                    sx={
                                        isBool
                                            ? {
                                                  color: defaultValue === 'true' ? 'green' : 'red',
                                                  textAlign: 'center',
                                              }
                                            : { textAlign: 'center' }
                                    }
                                >
                                    {defaultValue}
                                </TableCell>
                                <TableCell align='right'>{detail}</TableCell>
                            </TableRow>
                        ),
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
export default Config;
