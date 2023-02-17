import { Box, ButtonGroup, Snackbar, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { PlayArrow as PlayArrowIcon, Stop as StopIcon } from '@mui/icons-material';
import { useAtom } from 'jotai';
import { isProcessingState, isRunningState } from './states';
import { useState } from 'react';

type AlertType = 'start_success' | 'start_failed' | 'stop_success' | 'stop_failed';

const Controls = () => {
    const [isRunning, setIsRunning] = useAtom(isRunningState);
    const [isProcessing, setIsProcessing] = useAtom(isProcessingState);
    const [isShowAlert, setIsShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<AlertType>();
    const start = async () => {
        setIsProcessing(true);
        if (await window.api.start()) {
            showAlert('start_success');
            setIsRunning(true);
        } else {
            showAlert('start_failed');
        }
        setIsProcessing(false);
    };
    const stop = async () => {
        setIsProcessing(true);
        if (await window.api.stop()) {
            showAlert('stop_success');
            setIsRunning(false);
        } else {
            showAlert('stop_failed');
        }
        setIsProcessing(false);
    };
    const showAlert = (alertType: AlertType) => {
        setAlertType(alertType);
        setIsShowAlert(true);
    };
    const closeAlert = () => setIsShowAlert(false);
    return (
        <Box sx={{ flexShrink: 0, mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <ButtonGroup>
                <LoadingButton
                    variant='contained'
                    disabled={isRunning || isProcessing}
                    loading={isProcessing && !isRunning}
                    onClick={start}
                >
                    <PlayArrowIcon />
                </LoadingButton>
                <LoadingButton
                    variant='contained'
                    disabled={!isRunning || isProcessing}
                    loading={isProcessing && isRunning}
                    onClick={stop}
                >
                    <StopIcon />
                </LoadingButton>
            </ButtonGroup>
            <Snackbar
                open={isShowAlert}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                onClose={closeAlert}
            >
                <Alert
                    severity={alertType?.endsWith('success') ? 'success' : 'error'}
                    onClose={closeAlert}
                >
                    {alertType?.endsWith('success')
                        ? `サーバーが正常に${
                              alertType === 'start_success' ? '起動' : '停止'
                          }しました`
                        : `サーバーの${
                              alertType === 'start_failed' ? '起動' : '停止'
                          }に失敗しました`}
                </Alert>
            </Snackbar>
        </Box>
    );
};
export default Controls;
