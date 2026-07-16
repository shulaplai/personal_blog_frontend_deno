import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({ open, title, message, confirmLabel = '確認', cancelLabel = '取消', onConfirm, onCancel, loading = false }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? '處理中…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
