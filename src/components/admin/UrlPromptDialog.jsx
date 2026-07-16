import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * Reusable URL input dialog — replaces window.prompt() for accessibility.
 * @param {object} props
 * @param {boolean} props.open
 * @param {function} props.onClose - () => void
 * @param {function} props.onSubmit - (url: string) => void
 * @param {string} [props.title] - Dialog title
 * @param {string} [props.label] - TextField label
 * @param {string} [props.placeholder]
 * @param {string} [props.initialValue]
 */
export default function UrlPromptDialog({
  open,
  onClose,
  onSubmit,
  title = '輸入 URL',
  label = '網址',
  placeholder = 'https://...',
  initialValue = '',
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('請輸入網址');
      return;
    }
    onSubmit(trimmed);
    setValue('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setValue('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          error={Boolean(error)}
          helperText={error}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button variant="contained" onClick={handleSubmit}>確定</Button>
      </DialogActions>
    </Dialog>
  );
}
