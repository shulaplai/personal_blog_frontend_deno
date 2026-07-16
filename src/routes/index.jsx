import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import PublicRoutes from './PublicRoutes';
import AdminRoutes from './AdminRoutes';
import AdminGuestRoute from './AdminGuestRoute';

// Admin pages (lazy-loaded)
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const PostListPage = lazy(() => import('@/pages/admin/posts/PostListPage'));
const PostFormPage = lazy(() => import('@/pages/admin/posts/PostFormPage'));
const ProjectListPage = lazy(() => import('@/pages/admin/projects/ProjectListPage'));
const ProjectFormPage = lazy(() => import('@/pages/admin/projects/ProjectFormPage'));
const NovelListPage = lazy(() => import('@/pages/admin/novels/NovelListPage'));
const NovelFormPage = lazy(() => import('@/pages/admin/novels/NovelFormPage'));
const ChapterManagerPage = lazy(() => import('@/pages/admin/novels/ChapterManagerPage'));
const MediaLibraryPage = lazy(() => import('@/pages/admin/media/MediaLibraryPage'));
const SiteSettingsPage = lazy(() => import('@/pages/admin/settings/SiteSettingsPage'));

// Public pages (lazy-loaded)
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const BlogListPage = lazy(() => import('@/pages/public/BlogListPage'));
const BlogDetailPage = lazy(() => import('@/pages/public/BlogDetailPage'));
const ProjectsPage = lazy(() => import('@/pages/public/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/pages/public/ProjectDetailPage'));
const NovelsPage = lazy(() => import('@/pages/public/NovelsPage'));
const NovelDetailPage = lazy(() => import('@/pages/public/NovelDetailPage'));
const ChapterReadPage = lazy(() => import('@/pages/public/ChapterReadPage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));

function Loading() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
}

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoutes />}>
          <Route index element={<SuspenseWrapper><HomePage /></SuspenseWrapper>} />
          <Route path="blog" element={<SuspenseWrapper><BlogListPage /></SuspenseWrapper>} />
          <Route path="blog/:slug" element={<SuspenseWrapper><BlogDetailPage /></SuspenseWrapper>} />
          <Route path="projects" element={<SuspenseWrapper><ProjectsPage /></SuspenseWrapper>} />
          <Route path="projects/:slug" element={<SuspenseWrapper><ProjectDetailPage /></SuspenseWrapper>} />
          <Route path="novels" element={<SuspenseWrapper><NovelsPage /></SuspenseWrapper>} />
          <Route path="novels/:slug" element={<SuspenseWrapper><NovelDetailPage /></SuspenseWrapper>} />
          <Route path="novels/:novelSlug/chapters/:chapterNumber" element={<SuspenseWrapper><ChapterReadPage /></SuspenseWrapper>} />
          <Route path="about" element={<SuspenseWrapper><AboutPage /></SuspenseWrapper>} />
        </Route>

        {/* Admin guest routes (login) */}
        <Route element={<AdminGuestRoute />}>
          <Route path="admin/login" element={<SuspenseWrapper><LoginPage /></SuspenseWrapper>} />
        </Route>

        {/* Admin authenticated routes */}
        <Route element={<AdminRoutes />}>
          <Route element={<SuspenseWrapper><AdminLayout /></SuspenseWrapper>}>
            <Route path="admin" element={<SuspenseWrapper><DashboardPage /></SuspenseWrapper>} />
            <Route path="admin/posts" element={<SuspenseWrapper><PostListPage /></SuspenseWrapper>} />
            <Route path="admin/posts/new" element={<SuspenseWrapper><PostFormPage /></SuspenseWrapper>} />
            <Route path="admin/posts/:id/edit" element={<SuspenseWrapper><PostFormPage /></SuspenseWrapper>} />
            <Route path="admin/projects" element={<SuspenseWrapper><ProjectListPage /></SuspenseWrapper>} />
            <Route path="admin/projects/new" element={<SuspenseWrapper><ProjectFormPage /></SuspenseWrapper>} />
            <Route path="admin/projects/:id/edit" element={<SuspenseWrapper><ProjectFormPage /></SuspenseWrapper>} />
            <Route path="admin/novels" element={<SuspenseWrapper><NovelListPage /></SuspenseWrapper>} />
            <Route path="admin/novels/new" element={<SuspenseWrapper><NovelFormPage /></SuspenseWrapper>} />
            <Route path="admin/novels/:id/edit" element={<SuspenseWrapper><NovelFormPage /></SuspenseWrapper>} />
            <Route path="admin/novels/:id/chapters" element={<SuspenseWrapper><ChapterManagerPage /></SuspenseWrapper>} />
            <Route path="admin/media" element={<SuspenseWrapper><MediaLibraryPage /></SuspenseWrapper>} />
            <Route path="admin/settings" element={<SuspenseWrapper><SiteSettingsPage /></SuspenseWrapper>} />
          </Route>
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
