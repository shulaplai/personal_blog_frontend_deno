import { useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { CloudUpload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import UrlPromptDialog from './UrlPromptDialog';

let imageIdCounter = 0;

export default function ImageUploader({ images = [], onChange }) {
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);

  const handleUrlSubmit = (url) => {
    const caption = window.prompt('圖片說明（可選）:');
    const id = `img_${Date.now()}_${imageIdCounter++}`;
    onChange([...images, { id, image_path: url, caption: caption || '', sort_order: images.length }]);
  };

  const removeImage = (imgToRemove) => {
    onChange(images.filter((img) => img !== imgToRemove));
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>作品圖片</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
        {images.map((img) => (
          <Box key={img.id || img.image_path} sx={{ position: 'relative', width: 120, height: 120 }}>
            <img src={img.image_path} alt={img.caption || `Image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
            <IconButton
              size="small"
              onClick={() => removeImage(img)}
              sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            {img.caption && (
              <Typography variant="caption" sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', p: 0.5, textAlign: 'center', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                {img.caption}
              </Typography>
            )}
          </Box>
        ))}
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => setUrlDialogOpen(true)}
          sx={{ width: 120, height: 120, borderRadius: 2, flexDirection: 'column', gap: 0.5 }}
        >
          新增圖片
        </Button>
      </Box>
      <UrlPromptDialog
        open={urlDialogOpen}
        onClose={() => setUrlDialogOpen(false)}
        onSubmit={handleUrlSubmit}
        title="新增圖片"
        label="圖片 URL"
        placeholder="https://example.com/image.jpg"
      />
    </Box>
  );
}
