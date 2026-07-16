import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box, CardMedia, Typography, IconButton, Button,
  ImageList, ImageListItem, ImageListItemBar, Pagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import CopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMedia, uploadMedia, deleteMedia } from '@/store/slices/mediaSlice';
import PageHeader from '@/components/common/PageHeader';
import ErrorAlert from '@/components/common/ErrorAlert';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/utils/formatters';

export default function MediaLibraryPage() {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { items, pagination, status, error } = useAppSelector((state) => state.media);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileInputRef = useRef(null);

  const loadMedia = useCallback(() => {
    dispatch(fetchMedia({ page, per_page: 20 }));
  }, [dispatch, page]);

  useEffect(() => { loadMedia(); }, [loadMedia]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await dispatch(uploadMedia(file));
    if (uploadMedia.fulfilled.match(result)) {
      enqueueSnackbar('上傳成功', { variant: 'success' });
      loadMedia();
    } else {
      enqueueSnackbar(result.payload || '上傳失敗', { variant: 'error' });
    }
    e.target.value = '';
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteMedia(deleteTarget.id));
    if (deleteMedia.fulfilled.match(result)) {
      enqueueSnackbar('媒體已刪除', { variant: 'success' });
    } else {
      enqueueSnackbar(result.payload || '刪除失敗', { variant: 'error' });
    }
    setDeleteTarget(null);
  };

  const copyUrl = (path) => {
    navigator.clipboard.writeText(path).then(() => {
      enqueueSnackbar('已複製 URL', { variant: 'success' });
    });
  };

  const isImage = (mimeType) => mimeType?.startsWith('image/');

  return (
    <Box>
      <PageHeader title="媒體庫" subtitle={`共 ${pagination.total} 個檔案`} />
      <Box sx={{ mb: 2 }}>
        <input ref={fileInputRef} type="file" hidden onChange={handleUpload} accept="image/*,.pdf,.svg" />
        <Button variant="contained" startIcon={<UploadIcon />} onClick={() => fileInputRef.current?.click()}>
          上傳檔案
        </Button>
      </Box>

      {status === 'loading' && <LoadingSpinner />}

      {status === 'failed' && <ErrorAlert message={error || '無法載入媒體'} onRetry={loadMedia} />}

      {status === 'succeeded' && items.length === 0 && (
        <EmptyState message="尚未上傳任何媒體檔案" icon={UploadIcon} />
      )}

      {items.length > 0 && status !== 'failed' && (
        <>
          <ImageList cols={4} gap={12}>
            {items.map((item) => (
              <ImageListItem key={item.id}>
                {isImage(item.mime_type) ? (
                  <CardMedia component="img" image={item.path} alt={item.alt_text || item.filename} sx={{ height: 180, objectFit: 'cover', borderRadius: 1 }} />
                ) : (
                  <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200', borderRadius: 1 }}>
                    <Typography variant="h4" color="text.secondary">{item.mime_type?.split('/')[0] || 'FILE'}</Typography>
                  </Box>
                )}
                <ImageListItemBar
                  title={item.filename}
                  subtitle={formatDate(item.created_at)}
                  actionIcon={
                    <Box>
                      <IconButton size="small" sx={{ color: 'white' }} onClick={() => copyUrl(item.path)}><CopyIcon fontSize="small" /></IconButton>
                      <IconButton size="small" sx={{ color: 'white' }} onClick={() => setDeleteTarget(item)}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
          {pagination.lastPage > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={pagination.lastPage} page={page} onChange={(_, p) => setPage(p)} />
            </Box>
          )}
        </>
      )}

      <ConfirmDialog open={Boolean(deleteTarget)} title="刪除媒體" message={`確定要刪除「${deleteTarget?.filename}」嗎？`} confirmLabel="刪除" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  );
}
