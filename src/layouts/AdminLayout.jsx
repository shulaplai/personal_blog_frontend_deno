import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText,
  useMediaQuery, useTheme, Avatar, Menu, MenuItem, Divider,
} from '@mui/material';
import MenuIconMui from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import CodeIcon from '@mui/icons-material/Code';
import BookIcon from '@mui/icons-material/Book';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { useDarkMode } from '@/context/ThemeContext';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: '儀表板', path: '/admin', icon: <DashboardIcon /> },
  { label: '文章管理', path: '/admin/posts', icon: <ArticleIcon /> },
  { label: '作品管理', path: '/admin/projects', icon: <CodeIcon /> },
  { label: '小說管理', path: '/admin/novels', icon: <BookIcon /> },
  { label: '媒體庫', path: '/admin/media', icon: <FolderIcon /> },
  { label: '網站設定', path: '/admin/settings', icon: <SettingsIcon /> },
];

export default function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handleLogout = async () => {
    setAnchorEl(null);
    await dispatch(logoutUser());
    navigate('/admin/login');
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          CMS
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setSidebarOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      {/* Skip-to-content for keyboard users */}
      <Box component="a" href="#admin-main-content" sx={{ srOnly: true, '&:focus': { position: 'fixed', top: 8, left: 8, zIndex: 9999, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 4 } }}>
        Skip to main content
      </Box>
      <List sx={{ flex: 1, pt: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={isActive}
                onClick={() => isMobile && setSidebarOpen(false)}
                sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="persistent"
          open={sidebarOpen}
          sx={{
            width: sidebarOpen ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" color="default" elevation={1}>
          <Toolbar>
            {(!sidebarOpen || isMobile) && (
              <IconButton edge="start" onClick={() => setSidebarOpen(true)} sx={{ mr: 1 }}>
                <MenuIconMui />
              </IconButton>
            )}
            {!isMobile && !sidebarOpen && (
              <IconButton edge="start" onClick={() => setSidebarOpen(true)} sx={{ mr: 1 }}>
                <MenuIconMui />
              </IconButton>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={toggleDarkMode} sx={{ mr: 1 }}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Typography variant="body2">{user?.name || user?.email}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                登出
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flex: 1, p: 3 }} id="admin-main-content">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
