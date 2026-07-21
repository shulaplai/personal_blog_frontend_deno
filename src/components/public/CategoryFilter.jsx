import { List, ListItemButton, ListItemText, Typography, Box } from '@mui/material';

export default function CategoryFilter({ categories, activeCategory, onSelect }) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, px: 1 }}>
        分類
      </Typography>
      <List dense disablePadding>
        <ListItemButton
          selected={!activeCategory}
          onClick={() => onSelect('')}
          sx={{ borderRadius: 1 }}
          aria-current={!activeCategory ? 'page' : undefined}
        >
          <ListItemText
            primary={`全部 (${categories.reduce((sum, c) => sum + (c.posts_count || 0), 0)})`}
          />
        </ListItemButton>
        {categories.map((cat) => (
          <ListItemButton
            key={cat.id}
            selected={activeCategory === cat.slug}
            onClick={() => onSelect(cat.slug)}
            sx={{ borderRadius: 1 }}
            aria-current={activeCategory === cat.slug ? 'page' : undefined}
          >
            <ListItemText primary={`${cat.name} (${cat.posts_count || 0})`} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
