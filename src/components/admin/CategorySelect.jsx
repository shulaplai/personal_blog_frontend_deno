import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAppSelector } from '@/store/hooks';

export default function CategorySelect({ value, onChange }) {
  const { items: categories } = useAppSelector((state) => state.publicCategories);

  return (
    <FormControl fullWidth>
      <InputLabel>分類</InputLabel>
      <Select value={value || ''} label="分類" onChange={(e) => onChange(e.target.value)}>
        <MenuItem value="">無分類</MenuItem>
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
