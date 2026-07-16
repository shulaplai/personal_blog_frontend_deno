import { useEffect, useState } from 'react';
import { Box, TextField, Button, Paper, Grid, Typography } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSettings, updateSettings } from '@/store/slices/settingsSlice';
import PageHeader from '@/components/common/PageHeader';

const SETTING_FIELDS = [
  { key: 'site_name', label: '網站名稱', type: 'text' },
  { key: 'site_description', label: '網站描述', type: 'multiline', rows: 2 },
  { key: 'about_me', label: '關於我', type: 'multiline', rows: 6 },
  { key: 'social_github', label: 'GitHub 網址', type: 'url' },
  { key: 'social_linkedin', label: 'LinkedIn 網址', type: 'url' },
  { key: 'home_seo_title', label: 'SEO 標題', type: 'text' },
  { key: 'home_seo_description', label: 'SEO 描述', type: 'multiline', rows: 3 },
];

export default function SiteSettingsPage() {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { settings, status } = useAppSelector((state) => state.settings);
  const [form, setForm] = useState({});

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = SETTING_FIELDS.map(({ key }) => ({ key, value: form[key] || '' }));
    const result = await dispatch(updateSettings(data));
    if (updateSettings.fulfilled.match(result)) {
      enqueueSnackbar('設定已儲存', { variant: 'success' });
    } else {
      enqueueSnackbar(result.payload || '儲存失敗', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader title="網站設定" subtitle="管理網站基本資訊與社交連結" />
      <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 700 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {SETTING_FIELDS.map((field) => (
              <Grid item xs={12} key={field.key}>
                <TextField
                  label={field.label}
                  fullWidth
                  value={form[field.key] || ''}
                  onChange={handleChange(field.key)}
                  multiline={field.type === 'multiline'}
                  rows={field.rows || 1}
                  helperText={`Key: ${field.key}`}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={status === 'loading'}>
                {status === 'loading' ? '儲存中…' : '儲存設定'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
