import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPosts, deletePost } from '@/store/slices/postsSlice';
import { useSnackbar } from 'notistack';
import { useDebounce } from '@/utils/useDebounce';
import PageHeader from '@/components/common/PageHeader';
import ErrorAlert from '@/components/common/ErrorAlert';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusBadge from '@/components/admin/StatusBadge';
import { formatDateTime } from '@/utils/formatters';

export default function PostListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { items, pagination, status, error } = useAppSelector((state) => state.posts);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Debounce search to avoid firing an API call on every keystroke
  const debouncedSearch = useDebounce(search, 300);

  const loadPosts = useCallback(() => {
    const params = { page: page + 1, per_page: pageSize };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchPosts(params));
  }, [dispatch, page, pageSize, debouncedSearch, statusFilter]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deletePost(deleteTarget.id));
    if (deletePost.fulfilled.match(result)) {
      enqueueSnackbar('文章已刪除', { variant: 'success' });
    } else {
      enqueueSnackbar(result.payload || '刪除失敗', { variant: 'error' });
    }
    setDeleteTarget(null);
  };

  const columns = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: '標題', flex: 1, minWidth: 200 },
    {
      field: 'category', headerName: '分類', width: 120,
      valueGetter: (_, row) => row.category?.name || '—',
    },
    {
      field: 'status', headerName: '狀態', width: 100,
      renderCell: (params) => <StatusBadge status={params.value} />,
    },
    {
      field: 'published_at', headerName: '發佈日期', width: 160,
      valueFormatter: (value) => formatDateTime(value),
    },
    {
      field: 'actions', headerName: '操作', width: 140, sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" startIcon={<EditIcon />} onClick={() => navigate(`/admin/posts/${params.row.id}/edit`)}>編輯</Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteTarget(params.row)}>刪除</Button>
        </Box>
      ),
    },
  ], []);

  return (
    <Box>
      <PageHeader title="文章管理" subtitle={`共 ${pagination.total} 篇文章`} actionLabel="新增文章" onAction={() => navigate('/admin/posts/new')} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField size="small" placeholder="搜尋標題…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ minWidth: 200 }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>狀態</InputLabel>
          <Select value={statusFilter} label="狀態" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="draft">草稿</MenuItem>
            <MenuItem value="published">已發佈</MenuItem>
            <MenuItem value="archived">已封存</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {status === 'failed' && <ErrorAlert message={error || '無法載入文章'} onRetry={loadPosts} />}
      <DataGrid
        rows={items}
        columns={columns}
        rowCount={pagination.total}
        loading={status === 'loading'}
        pageSizeOptions={[15, 25, 50]}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
        autoHeight
        disableRowSelectionOnClick
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
      />
      <ConfirmDialog open={Boolean(deleteTarget)} title="刪除文章" message={`確定要刪除「${deleteTarget?.title}」嗎？此操作無法復原。`} confirmLabel="刪除" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  );
}
