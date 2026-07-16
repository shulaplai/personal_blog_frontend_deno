import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

export default function EmptyState({ message = '暫無內容', icon: Icon = InboxIcon }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, color: 'text.secondary' }}>
      <Icon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
      <Typography variant="body1">{message}</Typography>
    </Box>
  );
}
