// src/components/upload/PodcastUploadForm.tsx

const PODCAST_GENRES = [
  'Documentary', 'Interview', 'Talk Show', 
  'Investigative Journalism', 'Storytelling / Narrative',
  'Business & Technology', 'Culture & Society', 'History',
  'Wellness & Mental Health', 'Faith & Spirituality', 
  'Education', 'Comedy Podcast',
];

export default function PodcastUploadForm({ open, onOpenChange }) {
  // Podcast-specific fields:
  const [host, setHost] = useState('');
  const [guests, setGuests] = useState<string[]>([]);
  const [episodeNumber, setEpisodeNumber] = useState('');
  
  // ... rest is same as MovieUploadForm
  
  // In form:
  <div className="space-y-2">
    <Label>Host *</Label>
    <Input value={host} onChange={(e) => setHost(e.target.value)} />
  </div>
  
  // Use PODCAST_GENRES
  <GenreSelector
    title="Podcast Genres"
    availableGenres={PODCAST_GENRES}
    selectedGenres={selectedGenres}
    setSelectedGenres={setSelectedGenres}
  />
  
  // In draftPayload:
  mediaType: 'podcast',
  podcastGenre: selectedGenres,  // ✅ Use podcastGenre field
  host: host.trim(),
  guests: guests,
}