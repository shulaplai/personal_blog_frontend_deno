import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ChapterIcon from '@mui/icons-material/MenuBook';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNovels, deleteNovel } from '@/store/slices/novelsSlice';
import { useSnackbar } from 'notistack';
import PageHeader from '@/components/common/PageHeader';
import ErrorAlert from '@/components/common/ErrorAlert';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusBadge from '@/components/admin/StatusBadge';

export default function NovelListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { items, pagination, status, error } = useAppSelector((state) => state.novels);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadNovels = useCallback(() => {
    const params = { page: page + 1, per_page: pageSize };
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchNovels(params));
  }, [dispatch, page, pageSize, statusFilter]);

  useEffect(() => { loadNovels(); }, [loadNovels]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteNovel(deleteTarget.id));
    if (deleteNovel.fulfilled.match(result)) {
      enqueueSnackbar('小說已刪除', { variant: 'success' });
    } else {
      enqueueSnackbar(result.payload || '刪除失敗', { variant: 'error' });
    }
    setDeleteTarget(null);
  };

  const columns = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: '名稱', flex: 1, minWidth: 200 },
    { field: 'genre', headerName: '類型', width: 100, valueFormatter: (v) => v || '—' },
    {
      field: 'status', headerName: '狀態', width: 100,
      renderCell: (params) => <StatusBadge status={params.value} />,
    },
    {
      field: 'chapters_count', headerName: '章節數', width: 80,
    },
    {
      field: 'actions', headerName: '操作', width: 200, sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" startIcon={<ChapterIcon />} onClick={() => navigate(`/admin/novels/${params.row.id}/chapters`)}>章節</Button>
          <Button size="small" startIcon={<EditIcon />} onClick={() => navigate(`/admin/novels/${params.row.id}/edit`)}>編輯</Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteTarget(params.row)}>刪除</Button>
        </Box>
      ),
    },
  ], []);

  return (
    <Box>
      <PageHeader title="小說管理" subtitle={`共 ${pagination.total} 本小說`} actionLabel="新增小說" onAction={() => navigate('/admin/novels/new')} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>狀態</InputLabel>
          <Select value={statusFilter} label="狀態" onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">全部</MenuItem>
            <MenuItem value="ongoing">連載中</MenuItem>
            <MenuItem value="completed">已完結</MenuItem>
            <MenuItem value="hiatus">暫停中</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {status === 'failed' && <ErrorAlert message={error || '無法載入小說'} onRetry={loadNovels} />}
      <DataGrid
        rows={items} columns={columns} rowCount={pagination.total}
        loading={status === 'loading'} pageSizeOptions={[15, 25, 50]}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={(m) => { setPage(m.page); setPageSize(m.pageSize); }}
        autoHeight disableRowSelectionOnClick
        sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
      />
      <ConfirmDialog open={Boolean(deleteTarget)} title="刪除小說" message={`確定要刪除「${deleteTarget?.title}」嗎？所有章節也會一併刪除。`} confirmLabel="刪除" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  );
}
