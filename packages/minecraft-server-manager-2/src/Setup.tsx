import { Check as CheckIcon } from '@mui/icons-material';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from '@mui/material';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Version } from './API';
import { profilesState } from './states';

const versions: Version[] = [
    '1.19.2',
    'Paper1.19.2',
    '1.19',
    '1.18.2',
    '1.17.1',
    '1.16.5',
    '1.15.2',
    '1.14.4',
    '1.13.2',
    '1.12.2',
];

const Setup = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const profiles = useAtomValue(profilesState);
    const [currentJavaVersion, setCurrentJavaVersion] = useState(-1);
    const [javaVersionState, setJavaVersionState] = useState<'needInstall' | 'notRecommended'>();
    const [recommendedJavaVersion, setRecommendedJavaVersion] = useState<number>(0);
    const [version, setVersion] = useState<Version>(versions[0]);
    const [eulaChecked, setEulaChecked] = useState(false);
    const [installState, setInstallState] = useState<number>();
    useEffect(() => {
        window.api.getJavaVersion().then((javaVersion) => setCurrentJavaVersion(javaVersion));
    }, []);
    useEffect(() => {
        if (currentJavaVersion < 0) return;
        if (currentJavaVersion === 0) {
            setJavaVersionState('needInstall');
        } else {
            const minorVersion = parseInt(version.match(/(?<=1\.)\d+?(?=\.|$)/)![0]);
            const recommended = minorVersion <= 16 ? 8 : minorVersion === 17 ? 16 : 17;
            setRecommendedJavaVersion(recommended);
            if (currentJavaVersion < recommended) {
                setJavaVersionState('needInstall');
            } else if (currentJavaVersion === recommended) {
                setJavaVersionState(undefined);
            } else {
                setJavaVersionState('notRecommended');
            }
        }
    }, [version, currentJavaVersion]);
    const install = async () => {
        window.api.installVanilla(profiles[id!].path, version);
        setInstallState(0);
        await window.api.getDownloadState();
        setInstallState(1);
        await window.api.getInstallState();
        setInstallState(2);
    };
    if (!id) {
        navigate('/');
        return null;
    }
    return (
        <Box
            sx={{
                flexGrow: 1,
                mx: 8,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Typography variant='h5' sx={{ mb: 2 }}>
                セットアップ
            </Typography>
            {installState === undefined ? (
                <>
                    <Autocomplete
                        disableClearable
                        disablePortal
                        options={versions}
                        value={version}
                        onChange={(_, version) => setVersion(version)}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label='バージョン' />}
                    ></Autocomplete>
                    <Alert
                        severity={
                            javaVersionState
                                ? javaVersionState === 'needInstall'
                                    ? 'error'
                                    : 'warning'
                                : 'success'
                        }
                    >
                        {javaVersionState
                            ? javaVersionState === 'needInstall'
                                ? `Javaがインストールされていないかバージョンが低いです。推奨:Java${recommendedJavaVersion}`
                                : `インストールされたJavaのバージョンが推奨バージョンより高いため正常に動作しない可能性があります。推奨:Java${recommendedJavaVersion}, インストール済み:Java${currentJavaVersion}`
                            : '推奨バージョンのJavaがインストールされています。'}
                    </Alert>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={eulaChecked}
                                onChange={(e) => setEulaChecked(e.target.checked)}
                            />
                        }
                        label={
                            <>
                                <a
                                    href='https://aka.ms/MinecraftEULA'
                                    target='_blank'
                                    style={{ color: 'inherit' }}
                                >
                                    MINECRAFT エンド ユーザー ライセンス条項
                                </a>
                                に同意する
                            </>
                        }
                    />
                    <Button variant='contained' disabled={!eulaChecked} onClick={install}>
                        インストール
                    </Button>
                </>
            ) : (
                <>
                    <Stepper activeStep={installState} sx={{ width: 300 }}>
                        <Step completed={installState >= 1}>
                            <StepLabel>ダウンロード</StepLabel>
                        </Step>
                        <Step completed={installState >= 2}>
                            <StepLabel>インストール</StepLabel>
                        </Step>
                    </Stepper>
                    {installState === 2 && (
                        <Button
                            variant='contained'
                            onClick={() => navigate(`/manage/${id}`)}
                            sx={{ mt: 1 }}
                        >
                            コンソールへ進む
                        </Button>
                    )}
                </>
            )}
        </Box>
    );
};
export default Setup;
