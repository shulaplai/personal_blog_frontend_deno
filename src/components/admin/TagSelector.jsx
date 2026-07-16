import { Autocomplete, TextField, Chip } from '@mui/material';
import { useAppSelector } from '@/store/hooks';

export default function TagSelector({ value = [], onChange }) {
  const { items: allTags } = useAppSelector((state) => state.publicTags);

  const selectedTags = allTags.filter((t) => value.includes(t.id));

  return (
    <Autocomplete
      multiple
      options={allTags}
      value={selectedTags}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      onChange={(_, newVal) => onChange(newVal.map((t) => t.id))}
      renderInput={(params) => <TextField {...params} label="標籤" />}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip label={option.name} {...getTagProps({ index })} key={option.id} size="small" />
        ))
      }
    />
  );
}
