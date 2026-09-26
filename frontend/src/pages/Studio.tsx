import React, { useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, CircularProgress, Container,
  FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

type ContentType = 'image' | 'video' | 'audio' | 'speech';

const Studio: React.FC = () => {
  const { t } = useTranslation();
  const [type, setType] = useState<ContentType>('image');
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('fa');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const response = type === 'image'
        ? await api.generateImage(prompt)
        : type === 'video'
          ? await api.generateVideo(prompt)
          : type === 'audio'
            ? await api.generateAudio(prompt)
            : await api.generateSpeech(prompt, language);
      const url = response.image_url || response.video_url || response.audio_url;
      if (!url) throw new Error(response.message || 'The provider did not return a media URL');
      setResult(url);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('common.error'));
    } finally { setLoading(false); }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>{t('pages.studio')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>{t('creation.whatToCreate')}</Typography>
        <Card component="form" onSubmit={handleGenerate}>
          <CardContent>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel id="content-type-label">{t('creation.selectType')}</InputLabel>
                <Select labelId="content-type-label" value={type} label={t('creation.selectType')} onChange={(event) => setType(event.target.value as ContentType)}>
                  <MenuItem value="image">{t('creation.image')}</MenuItem>
                  <MenuItem value="video">{t('creation.video')}</MenuItem>
                  <MenuItem value="audio">{t('creation.audio')}</MenuItem>
                  <MenuItem value="speech">{t('creation.speech')}</MenuItem>
                </Select>
              </FormControl>
              {type === 'speech' && <FormControl fullWidth><InputLabel id="language-label">{t('creation.language')}</InputLabel><Select labelId="language-label" value={language} label={t('creation.language')} onChange={(event) => setLanguage(event.target.value)}><MenuItem value="fa">فارسی</MenuItem><MenuItem value="en">English</MenuItem></Select></FormControl>}
              <TextField value={prompt} onChange={(event) => setPrompt(event.target.value)} label={type === 'speech' ? t('creation.text') : t('creation.describe')} multiline minRows={5} required fullWidth />
              <Button type="submit" variant="contained" size="large" disabled={loading || !prompt.trim()}>{loading ? <CircularProgress size={24} color="inherit" /> : t('creation.generate')}</Button>
              {error && <Alert severity="error">{error}</Alert>}
              {result && <Alert severity="success"><Stack spacing={1}><Typography>{t('common.success')}</Typography><Button component="a" href={result} target="_blank" rel="noreferrer">{t('job.download')}</Button></Stack></Alert>}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Studio;
