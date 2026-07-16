import { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';
import api from '@/services/base';

export default function TechnologySelector({ value = [], onChange }) {
  const [technologies, setTechnologies] = useState([]);

  useEffect(() => {
    // Fetch technologies from admin endpoint (or public if available)
    api.get('/admin/technologies')
      .then((res) => setTechnologies(res.data.data || res.data || []))
      .catch(() => {
        // Fallback: try to get technologies from public projects
        api.get('/projects').then((res) => {
          const techSet = new Map();
          (res.data.data || []).forEach((p) => {
            (p.technologies || []).forEach((t) => {
              if (!techSet.has(t.id)) techSet.set(t.id, t);
            });
          });
          setTechnologies(Array.from(techSet.values()));
        }).catch(() => setTechnologies([]));
      });
  }, []);

  const selected = technologies.filter((t) => value.includes(t.id));

  return (
    <Autocomplete
      multiple
      options={technologies}
      value={selected}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      onChange={(_, newVal) => onChange(newVal.map((t) => t.id))}
      renderInput={(params) => <TextField {...params} label="使用技術" />}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip label={option.name} {...getTagProps({ index })} key={option.id} size="small" />
        ))
      }
    />
  );
}
