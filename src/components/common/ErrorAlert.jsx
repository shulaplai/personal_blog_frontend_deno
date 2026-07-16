import { Alert, AlertTitle, Button, Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Displays an error alert with optional retry callback.
 * Use on data-fetching pages when status === 'failed'.
 */
export default function ErrorAlert({ message, onRetry, sx }) {
  return (
    <Box sx={{ my: 4, ...sx }}>
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
            >
              重試
            </Button>
          ) : undefined
        }
      >
        <AlertTitle>載入失敗</AlertTitle>
        {message || '無法載入資料，請檢查網絡連接後重試。'}
      </Alert>
    </Box>
  );
}
