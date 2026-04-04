// src/components/upload/TVShowUploadForm.tsx

export default function TVShowUploadForm({ open, onOpenChange }) {
  const [seriesChoice, setSeriesChoice] = useState<'new' | 'existing'>('new');
  const [seriesTitle, setSeriesTitle] = useState('');
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');
  
  // ... same upload flow
  
  // In draftPayload:
  mediaType: 'tvshow',
  series: {
    title: seriesTitle,
    description: '',
    genres: selectedGenres,
  },
  season: parseInt(season),
  episode: parseInt(episode),
}