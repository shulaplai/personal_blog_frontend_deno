import { Chip } from '@mui/material';

const STATUS_MAP = {
  draft: { label: '草稿', color: 'default' },
  published: { label: '已發佈', color: 'success' },
  archived: { label: '已封存', color: 'warning' },
  ongoing: { label: '連載中', color: 'info' },
  completed: { label: '已完結', color: 'success' },
  hiatus: { label: '暫停中', color: 'warning' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || { label: status || '—', color: 'default' };
  return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
}
