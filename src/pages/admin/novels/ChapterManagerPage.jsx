import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNovel } from '@/store/slices/novelsSlice';
import { fetchChapters, createChapter, updateChapter, deleteChapter, clearCurrentChapter } from '@/store/slices/chaptersSlice';
import PageHeader from '@/components/common/PageHeader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusBadge from '@/components/admin/StatusBadge';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { formatDateTime, formatWordCount } from '@/utils/formatters';

export default function ChapterManagerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { currentItem: novel } = useAppSelector((state) => state.novels);
  const { items, status, saveStatus } = useAppSelector((state) => state.chapters);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ title: '', chapter_number: 1, content: '', status: 'draft' });

  useEffect(() => {
    dispatch(fetchNovel(id));
    dispatch(fetchChapters(id));
  }, [dispatch, id]);

  const openCreateDialog = () => {
    setEditingChapter(null);
    const nextNum = items.length > 0 ? Math.max(...items.map((c) => c.chapter_number)) + 1 : 1;
    setForm({ title: '', chapter_number: nextNum, content: '', status: 'draft' });
    setDialogOpen(true);
  };

  const openEditDialog = (chapter) => {
    setEditingChapter(chapter);
    setForm({
      title: chapter.title || '', chapter_number: chapter.chapter_number || 1,
      content: chapter.content || '', status: chapter.status || 'draft',
    });
    setDialogOpen(true);
  };

  const handleDialogSave = async () => {
    if (editingChapter) {
      const result = await dispatch(updateChapter({ novelId: id, chapterId: editingChapter.id, data: form }));
      if (updateChapter.fulfilled.match(result)) {
        enqueueSnackbar('章節已更新', { variant: 'success' });
        setDialogOpen(false);
        dispatch(fetchChapters(id));
      } else {
        enqueueSnackbar(result.payload || '更新失敗', { variant: 'error' });
      }
    } else {
      const result = await dispatch(createChapter({ novelId: id, data: form }));
      if (createChapter.fulfilled.match(result)) {
        enqueueSnackbar('章節已建立', { variant: 'success' });
        setDialogOpen(false);
        dispatch(fetchChapters(id));
      } else {
        enqueueSnackbar(result.payload || '建立失敗', { variant: 'error' });
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteChapter({ novelId: id, chapterId: deleteTarget.id }));
    if (deleteChapter.fulfilled.match(result)) {
      enqueueSnackbar('章節已刪除', { variant: 'success' });
    } else {
      enqueueSnackbar(result.payload || '刪除失敗', { variant: 'error' });
    }
    setDeleteTarget(null);
  };

  const columns = [
    { field: 'chapter_number', headerName: '#', width: 60 },
    { field: 'title', headerName: '章節標題', flex: 1, minWidth: 200 },
    {
      field: 'word_count', headerName: '字數', width: 100,
      valueFormatter: (v) => formatWordCount(v),
    },
    {
      field: 'status', headerName: '狀態', width: 100,
      renderCell: (params) => <StatusBadge status={params.value} />,
    },
    {
      field: 'published_at', headerName: '發佈日期', width: 160,
      valueFormatter: (v) => formatDateTime(v),
    },
    {
      field: 'actions', headerName: '操作', width: 140, sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" startIcon={<EditIcon />} onClick={() => openEditDialog(params.row)}>編輯</Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteTarget(params.row)}>刪除</Button>
        </Box>
      ),
    },
  ];

  // Note: columns not wrapped in useMemo here because they depend on openEditDialog
  // which is a component-local function that changes each render.
  // If performance becomes an issue, wrap openEditDialog in useCallback first.

  return (
    <Box>
      <PageHeader
        title={novel ? `章節管理：${novel.title}` : '章節管理'}
        subtitle={novel ? `類型：${novel.genre || '—'} · ${items.length} 章` : ''}
        actionLabel="返回小說列表"
        onAction={() => navigate('/admin/novels')}
      />
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>新增章節</Button>
      </Box>
      <DataGrid
        rows={items} columns={columns}
        loading={status === 'loading'} autoHeight disableRowSelectionOnClick
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
      />

      {/* Chapter Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingChapter ? '編輯章節' : '新增章節'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}><TextField label="章節標題" fullWidth required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></Grid>
            <Grid item xs={12} sm={3}><TextField label="章節號" type="number" fullWidth value={form.chapter_number} onChange={(e) => setForm((p) => ({ ...p, chapter_number: Number(e.target.value) }))} /></Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth><InputLabel>狀態</InputLabel><Select value={form.status} label="狀態" onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><MenuItem value="draft">草稿</MenuItem><MenuItem value="published">已發佈</MenuItem></Select></FormControl>
            </Grid>
            <Grid item xs={12}><Typography variant="subtitle2" sx={{ mb: 1 }}>內容</Typography><RichTextEditor value={form.content} onChange={(v) => setForm((p) => ({ ...p, content: v }))} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleDialogSave} disabled={saveStatus === 'loading'}>{saveStatus === 'loading' ? '儲存中…' : '儲存'}</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={Boolean(deleteTarget)} title="刪除章節" message={`確定要刪除「第 ${deleteTarget?.chapter_number} 章 ${deleteTarget?.title}」嗎？`} confirmLabel="刪除" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  );
}
