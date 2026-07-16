import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box, IconButton } from '@mui/material';
import { Image as ImageIcon, Close as CloseIcon } from '@mui/icons-material';
import UrlPromptDialog from './UrlPromptDialog';

export default function MediaPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);

  const handleSelect = (url) => {
    onSelect(url);
    setOpen(false);
  };

  return (
    <>
      <Button variant="outlined" startIcon={<ImageIcon />} onClick={() => setOpen(true)}>
        選擇媒體
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          選擇媒體
          <IconButton onClick={() => setOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <p>請直接輸入圖片 URL，或前往 <a href="/admin/media" target="_blank">媒體庫</a> 上傳並複製網址</p>
            <Button variant="contained" onClick={() => setUrlDialogOpen(true)}>
              輸入 URL
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <UrlPromptDialog
        open={urlDialogOpen}
        onClose={() => setUrlDialogOpen(false)}
        onSubmit={handleSelect}
        title="輸入圖片 URL"
        label="圖片網址"
        placeholder="https://example.com/image.jpg"
      />
    </>
  );
}
