import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  FormControlLabel, Switch, Paper, Grid,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNovel, createNovel, updateNovel, clearCurrentNovel } from '@/store/slices/novelsSlice';
import PageHeader from '@/components/common/PageHeader';

export default function NovelFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { currentItem, saveStatus } = useAppSelector((state) => state.novels);

  const [form, setForm] = useState({
    title: '', slug: '', description: '', cover_image: '',
    genre: '', status: 'ongoing', is_featured: false,
  });

  useEffect(() => {
    if (isEdit) dispatch(fetchNovel(id));
    return () => { dispatch(clearCurrentNovel()); };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && currentItem) {
      setForm({
        title: currentItem.title || '', slug: currentItem.slug || '',
        description: currentItem.description || '', cover_image: currentItem.cover_image || '',
        genre: currentItem.genre || '', status: currentItem.status || 'ongoing',
        is_featured: currentItem.is_featured || false,
      });
    }
  }, [isEdit, currentItem]);

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEdit ? updateNovel({ id, data: form }) : createNovel(form);
    const result = await dispatch(action);
    if (action.fulfilled.match(result)) {
      enqueueSnackbar(isEdit ? '小說已更新' : '小說已建立', { variant: 'success' });
      navigate('/admin/novels');
    } else {
      enqueueSnackbar(result.payload || '儲存失敗', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader title={isEdit ? '編輯小說' : '新增小說'} onAction={() => navigate('/admin/novels')} actionLabel="返回列表" />
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}><TextField label="名稱" fullWidth required value={form.title} onChange={handleChange('title')} /></Grid>
            <Grid item xs={12} sm={4}><TextField label="Slug" fullWidth value={form.slug} onChange={handleChange('slug')} /></Grid>
            <Grid item xs={12}><TextField label="簡介" fullWidth multiline rows={3} value={form.description} onChange={handleChange('description')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="封面圖片 URL" fullWidth value={form.cover_image} onChange={handleChange('cover_image')} /></Grid>
            <Grid item xs={12} sm={3}><TextField label="類型" fullWidth value={form.genre} onChange={handleChange('genre')} placeholder="科幻、奇幻、武俠…" /></Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth><InputLabel>狀態</InputLabel><Select value={form.status} label="狀態" onChange={handleChange('status')}><MenuItem value="ongoing">連載中</MenuItem><MenuItem value="completed">已完結</MenuItem><MenuItem value="hiatus">暫停中</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12}><FormControlLabel control={<Switch checked={form.is_featured} onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))} />} label="精選" /></Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saveStatus === 'loading'}>{saveStatus === 'loading' ? '儲存中…' : '儲存'}</Button>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/novels')}>取消</Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
