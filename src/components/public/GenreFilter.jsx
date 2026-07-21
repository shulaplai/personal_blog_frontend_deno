import { Chip, Box, Typography } from '@mui/material';

const COMMON_GENRES = ['科幻', '奇幻', '武俠', '愛情', '懸疑', '恐怖', '歷史', '輕小說'];

export default function GenreFilter({ activeGenre, onSelect }) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        類型
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        <Chip
          label="全部"
          size="small"
          color={!activeGenre ? 'primary' : 'default'}
          variant={!activeGenre ? 'filled' : 'outlined'}
          onClick={() => onSelect('')}
          aria-pressed={!activeGenre ? true : false}
        />
        {COMMON_GENRES.map((genre) => (
          <Chip
            key={genre}
            label={genre}
            size="small"
            color={activeGenre === genre ? 'primary' : 'default'}
            variant={activeGenre === genre ? 'filled' : 'outlined'}
            onClick={() => onSelect(genre)}
            aria-pressed={activeGenre === genre ? true : false}
          />
        ))}
      </Box>
    </Box>
  );
}
