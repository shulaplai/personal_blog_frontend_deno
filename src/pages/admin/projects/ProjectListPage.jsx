import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProjects, deleteProject } from '@/store/slices/projectsSlice';
import { useSnackbar } from 'notistack';
import PageHeader from '@/components/common/PageHeader';
import ErrorAlert from '@/components/common/ErrorAlert';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusBadge from '@/components/admin/StatusBadge';

export default function ProjectListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { items, pagination, status, error } = useAppSelector((state) => state.projects);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProjects = useCallback(() => {
    const params = { page: page + 1, per_page: pageSize };
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchProjects(params));
  }, [dispatch, page, pageSize, statusFilter]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteProject(deleteTarget.id));
    if (deleteProject.fulfilled.match(result)) {
      enqueueSnackbar('作品已刪除', { variant: 'success' });
    } else {
      enqueueSnackbar(result.payload || '刪除失敗', { variant: 'error' });
    }
    setDeleteTarget(null);
  };

  const columns = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: '名稱', flex: 1, minWidth: 200 },
    {
      field: 'status', headerName: '狀態', width: 100,
      renderCell: (params) => <StatusBadge status={params.value} />,
    },
    {
      field: 'sort_order', headerName: '排序', width: 80,
    },
    {
      field: 'actions', headerName: '操作', width: 140, sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" startIcon={<EditIcon />} onClick={() => navigate(`/admin/projects/${params.row.id}/edit`)}>編輯</Button>
          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteTarget(params.row)}>刪除</Button>
        </Box>
      ),
    },
  ], []);

  return (
    <Box>
      <PageHeader title="作品管理" subtitle={`共 ${pagination.total} 個作品`} actionLabel="新增作品" onAction={() => navigate('/admin/projects/new')} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
      {status === 'failed' && <ErrorAlert message={error || '無法載入作品'} onRetry={loadProjects} />}
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
      <ConfirmDialog open={Boolean(deleteTarget)} title="刪除作品" message={`確定要刪除「${deleteTarget?.title}」嗎？`} confirmLabel="刪除" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </Box>
  );
}
