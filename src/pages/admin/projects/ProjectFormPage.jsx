import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  FormControlLabel, Switch, Typography, Paper, Grid,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProject, createProject, updateProject, clearCurrentProject } from '@/store/slices/projectsSlice';
import PageHeader from '@/components/common/PageHeader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import TechnologySelector from '@/components/admin/TechnologySelector';

export default function ProjectFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { currentItem, saveStatus } = useAppSelector((state) => state.projects);

  const [form, setForm] = useState({
    title: '', slug: '', short_description: '', content: '', cover_image: '',
    project_url: '', github_url: '', status: 'draft', is_featured: false,
    sort_order: 0, completed_at: '', technologies: [],
  });

  useEffect(() => {
    if (isEdit) dispatch(fetchProject(id));
    return () => { dispatch(clearCurrentProject()); };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && currentItem) {
      setForm({
        title: currentItem.title || '', slug: currentItem.slug || '',
        short_description: currentItem.short_description || '', content: currentItem.content || '',
        cover_image: currentItem.cover_image || '', project_url: currentItem.project_url || '',
        github_url: currentItem.github_url || '', status: currentItem.status || 'draft',
        is_featured: currentItem.is_featured || false, sort_order: currentItem.sort_order || 0,
        completed_at: currentItem.completed_at || '',
        technologies: currentItem.technologies?.map((t) => t.id) || [],
      });
    }
  }, [isEdit, currentItem]);

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEdit ? updateProject({ id, data: form }) : createProject(form);
    const result = await dispatch(action);
    if (action.fulfilled.match(result)) {
      enqueueSnackbar(isEdit ? '作品已更新' : '作品已建立', { variant: 'success' });
      navigate('/admin/projects');
    } else {
      enqueueSnackbar(result.payload || '儲存失敗', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader title={isEdit ? '編輯作品' : '新增作品'} onAction={() => navigate('/admin/projects')} actionLabel="返回列表" />
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}><TextField label="名稱" fullWidth required value={form.title} onChange={handleChange('title')} /></Grid>
            <Grid item xs={12} sm={4}><TextField label="Slug" fullWidth value={form.slug} onChange={handleChange('slug')} /></Grid>
            <Grid item xs={12}><TextField label="簡介" fullWidth multiline rows={2} value={form.short_description} onChange={handleChange('short_description')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="封面圖片 URL" fullWidth value={form.cover_image} onChange={handleChange('cover_image')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="專案網址" fullWidth value={form.project_url} onChange={handleChange('project_url')} /></Grid>
            <Grid item xs={12} sm={6}><TextField label="GitHub 網址" fullWidth value={form.github_url} onChange={handleChange('github_url')} /></Grid>
            <Grid item xs={12}>
              <TechnologySelector value={form.technologies} onChange={(v) => setForm((p) => ({ ...p, technologies: v }))} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth><InputLabel>狀態</InputLabel><Select value={form.status} label="狀態" onChange={handleChange('status')}><MenuItem value="draft">草稿</MenuItem><MenuItem value="published">已發佈</MenuItem><MenuItem value="archived">已封存</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12} sm={2}><FormControlLabel control={<Switch checked={form.is_featured} onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))} />} label="精選" /></Grid>
            <Grid item xs={12} sm={2}><TextField label="排序" type="number" fullWidth value={form.sort_order} onChange={handleChange('sort_order')} /></Grid>
            <Grid item xs={12} sm={2}><TextField label="完成日期" type="date" fullWidth value={form.completed_at} onChange={handleChange('completed_at')} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><Typography variant="subtitle2" sx={{ mb: 1 }}>詳細內容</Typography><RichTextEditor value={form.content} onChange={(v) => setForm((p) => ({ ...p, content: v }))} /></Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saveStatus === 'loading'}>{saveStatus === 'loading' ? '儲存中…' : '儲存'}</Button>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/projects')}>取消</Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
