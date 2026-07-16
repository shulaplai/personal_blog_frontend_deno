import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, Skeleton } from '@mui/material';
import {
  Article as ArticleIcon,
  Code as CodeIcon,
  Book as BookIcon,
  MenuBook as ChapterIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';
import PageHeader from '@/components/common/PageHeader';

function StatCard({ title, value, icon, color }) {
  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: `${color}.50`, color: `${color}.main`,
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>{value ?? '—'}</Typography>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stats, status } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (status === 'loading' || !stats) {
    return (
      <Box>
        <PageHeader title="儀表板" />
        <Grid container spacing={3}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const cards = [
    {
      title: '文章',
      value: stats.posts?.total,
      icon: <ArticleIcon />,
      color: 'primary',
      subtitle: `${stats.posts?.published || 0} 已發佈 · ${stats.posts?.draft || 0} 草稿`,
      onClick: () => navigate('/admin/posts'),
    },
    {
      title: '作品',
      value: stats.projects?.total,
      icon: <CodeIcon />,
      color: 'secondary',
      subtitle: `${stats.projects?.published || 0} 已發佈 · ${stats.projects?.draft || 0} 草稿`,
      onClick: () => navigate('/admin/projects'),
    },
    {
      title: '小說',
      value: stats.novels?.total,
      icon: <BookIcon />,
      color: 'success',
      subtitle: `${stats.novels?.ongoing || 0} 連載中 · ${stats.novels?.completed || 0} 已完結`,
      onClick: () => navigate('/admin/novels'),
    },
    {
      title: '章節',
      value: stats.chapters?.total,
      icon: <ChapterIcon />,
      color: 'info',
      subtitle: `${stats.chapters?.published || 0} 已發佈 · ${stats.chapters?.draft || 0} 草稿`,
    },
    {
      title: '媒體',
      value: stats.media?.total,
      icon: <FolderIcon />,
      color: 'warning',
      subtitle: '已上傳檔案',
      onClick: () => navigate('/admin/media'),
    },
  ];

  return (
    <Box>
      <PageHeader title="儀表板" subtitle="網站內容總覽" />
      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <Card
              sx={{
                borderRadius: 3,
                height: '100%',
                cursor: card.onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': card.onClick ? {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                } : {},
              }}
              onClick={card.onClick}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: `${card.color}.50`, color: `${card.color}.main`,
                  }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h4" fontWeight={700}>{card.value ?? '—'}</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={600}>{card.title}</Typography>
                <Typography variant="body2" color="text.secondary">{card.subtitle}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
