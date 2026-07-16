import { Chip } from '@mui/material';

export default function TagChip({ tag, active = false, onClick }) {
  return (
    <Chip
      label={`${tag.name} (${tag.posts_count || 0})`}
      size="small"
      color={active ? 'primary' : 'default'}
      variant={active ? 'filled' : 'outlined'}
      onClick={onClick}
      clickable
    />
  );
}
