import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel,
  FormControlLabel, Switch, Typography, Paper, Grid,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPost, createPost, updatePost, clearCurrentPost } from '@/store/slices/postsSlice';
import { fetchPublicCategories } from '@/store/slices/publicCategoriesSlice';
import { fetchPublicTags } from '@/store/slices/publicTagsSlice';
import PageHeader from '@/components/common/PageHeader';
import RichTextEditor from '@/components/admin/RichTextEditor';
import CategorySelect from '@/components/admin/CategorySelect';
import TagSelector from '@/components/admin/TagSelector';

export default function PostFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { currentItem, saveStatus } = useAppSelector((state) => state.posts);

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', cover_image: '',
    category_id: '', status: 'draft', is_featured: false, published_at: '', tags: [],
  });

  useEffect(() => {
    dispatch(fetchPublicCategories());
    dispatch(fetchPublicTags());
    if (isEdit) {
      dispatch(fetchPost(id));
    }
    return () => { dispatch(clearCurrentPost()); };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && currentItem) {
      setForm({
        title: currentItem.title || '',
        slug: currentItem.slug || '',
        excerpt: currentItem.excerpt || '',
        content: currentItem.content || '',
        cover_image: currentItem.cover_image || '',
        category_id: currentItem.category_id || '',
        status: currentItem.status || 'draft',
        is_featured: currentItem.is_featured || false,
        published_at: currentItem.published_at || '',
        tags: currentItem.tags?.map((t) => t.id) || [],
      });
    }
  }, [isEdit, currentItem]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEdit ? updatePost({ id, data: form }) : createPost(form);
    const result = await dispatch(action);
    if (action.fulfilled.match(result)) {
      enqueueSnackbar(isEdit ? '文章已更新' : '文章已建立', { variant: 'success' });
      navigate('/admin/posts');
    } else {
      enqueueSnackbar(result.payload || '儲存失敗', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader title={isEdit ? '編輯文章' : '新增文章'} onAction={() => navigate('/admin/posts')} actionLabel="返回列表" />
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="標題" fullWidth required value={form.title} onChange={handleChange('title')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Slug" fullWidth value={form.slug} onChange={handleChange('slug')} helperText="留空則自動從標題生成" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CategorySelect value={form.category_id} onChange={(v) => setForm((p) => ({ ...p, category_id: v }))} />
            </Grid>
            <Grid item xs={12}>
              <TagSelector value={form.tags} onChange={(v) => setForm((p) => ({ ...p, tags: v }))} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="摘要" fullWidth multiline rows={2} value={form.excerpt} onChange={handleChange('excerpt')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="封面圖片 URL" fullWidth value={form.cover_image} onChange={handleChange('cover_image')} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>狀態</InputLabel>
                <Select value={form.status} label="狀態" onChange={handleChange('status')}>
                  <MenuItem value="draft">草稿</MenuItem>
                  <MenuItem value="published">已發佈</MenuItem>
                  <MenuItem value="archived">已封存</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControlLabel control={<Switch checked={form.is_featured} onChange={(e) => setForm((p) => ({ ...p, is_featured: e.target.checked }))} />} label="精選" />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField label="發佈日期" type="datetime-local" fullWidth value={form.published_at} onChange={handleChange('published_at')} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>內容</Typography>
              <RichTextEditor value={form.content} onChange={(v) => setForm((p) => ({ ...p, content: v }))} />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saveStatus === 'loading'}>
                  {saveStatus === 'loading' ? '儲存中…' : '儲存'}
                </Button>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/posts')}>取消</Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
