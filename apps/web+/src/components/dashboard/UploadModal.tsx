import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Film, Music, Tv, Video, Radio, Clapperboard, Upload, CheckCircle2, XCircle, Plus, X } from 'lucide-react';
import { apiClient, contentApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

type MediaType = 'miniseries' | 'reelfilm' | 'stageplay' | 'tvshow' | 'movie' | 'podcast' | 'music';
type Step = 'select' | 'series-choice' | 'details' | 'uploading' | 'processing' | 'success' | 'error';

const TYPES = [
  { type: 'miniseries' as MediaType, label: 'Miniseries', icon: Video, needsSeries: true, dbType: 'minisode' },
  { type: 'tvshow' as MediaType, label: 'TV Show', icon: Tv, needsSeries: true, dbType: 'tv_episode' },
  { type: 'podcast' as MediaType, label: 'Podcast', icon: Radio, needsSeries: true, dbType: 'podcast' },
  { type: 'movie' as MediaType, label: 'Movie', icon: Clapperboard, needsSeries: false, dbType: 'movie' },
  { type: 'reelfilm' as MediaType, label: 'Reel Film', icon: Film, needsSeries: false, dbType: 'reelfilm' },
  { type: 'stageplay' as MediaType, label: 'Stage Play', icon: Clapperboard, needsSeries: false, dbType: 'stageplay' },
  { type: 'music' as MediaType, label: 'Music', icon: Music, needsSeries: false, dbType: 'music' },
];

const GENRES = ['African Drama', 'African Comedy', 'Drama', 'Comedy', 'Action', 'Thriller', 'Documentary'];
const RATINGS = ['G', 'PG', 'PG-13', 'R', 'TV-14', 'TV-MA', 'NR'];

export default function UploadModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<Step>('select');
  const [selectedType, setSelectedType] = useState<MediaType | null>(null);
  const [seriesChoice, setSeriesChoice] = useState<'new' | 'existing' | 'standalone'>('new');
  const [availableSeries, setAvailableSeries] = useState<any[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [season, setSeason] = useState('');
  const [episode, setEpisode] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [cast, setCast] = useState<string[]>([]);
  const [castInput, setCastInput] = useState('');
  const [director, setDirector] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [rating, setRating] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesDescription, setSeriesDescription] = useState('');
  const [selectedSeriesTitle, setSelectedSeriesTitle] = useState('');
  
  const [featured, setFeatured] = useState(false);
  const [isOriginal, setIsOriginal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState('');
  
  const fileRef = useRef<HTMLInputElement>(null);
  const config = TYPES.find(t => t.type === selectedType);
  const needsSeries = config?.needsSeries || false;

  useEffect(() => {
    if (selectedType && needsSeries) {
      fetchExistingSeries();
    }
  }, [selectedType]);

  const fetchExistingSeries = async () => {
    try {
      const dbType = config?.dbType || selectedType;
      const data = await contentApi.getContentByType(dbType!, 1, 100);
      
      const seriesMap = new Map();
      data.forEach((item: any) => {
        const title = item.series?.title;
        if (title && !seriesMap.has(title)) {
          seriesMap.set(title, { title, type: item.type });
        }
      });
      
      setAvailableSeries(Array.from(seriesMap.values()));
    } catch (err) {
      console.error('Error fetching series:', err);
      setAvailableSeries([]);
    }
  };

  const handleTypeSelect = (type: MediaType) => {
    setSelectedType(type);
    const typeConfig = TYPES.find(t => t.type === type);
    if (typeConfig?.needsSeries) {
      setStep('series-choice');
    } else {
      setStep('details');
    }
  };

  const handleSeriesChoiceSelect = (choice: 'new' | 'existing' | 'standalone') => {
    if (choice === 'existing' && availableSeries.length === 0) {
      toast({ title: 'No series found', description: 'Create a new series first', variant: 'destructive' });
      return;
    }
    setSeriesChoice(choice);
    setStep('details');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const validTypes = selectedType === 'music' ? ['audio/mpeg', 'audio/wav', 'audio/mp4'] : ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(f.type)) {
      toast({ title: 'Invalid file', description: 'Please upload correct format', variant: 'destructive' });
      return;
    }

    if (f.size > 5 * 1024 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5GB', variant: 'destructive' });
      return;
    }
    
    setFile(f);
  };

  const handleStartUpload = async () => {
    if (!title.trim() || !file || !selectedType) {
      toast({ title: 'Missing required fields', variant: 'destructive' });
      return;
    }

    if (seriesChoice === 'new' && !seriesTitle.trim()) {
      toast({ title: 'Series title required', variant: 'destructive' });
      return;
    }

    if (seriesChoice === 'existing' && !selectedSeriesTitle) {
      toast({ title: 'Please select a series', variant: 'destructive' });
      return;
    }

    if (seriesChoice !== 'standalone' && (!season || !episode)) {
      toast({ title: 'Season/Episode required', variant: 'destructive' });
      return;
    }
    
    setStep('uploading');
    setUploadProgress(0);
    
    try {
      const contentType = file.type.startsWith('video/') ? 'video' : 'audio';
      
      const draftPayload: any = {
        mediaType: selectedType,
        title: title.trim(),
        type: contentType,
        fileName: file.name,
        fileSize: file.size,
        storageMethod: 'stream',
        description: description.trim(),
        cast,
        director: director.trim(),
        genre: genres,
        rating,
        releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
        language: 'English',
        featured,
        isOriginal,
        isPremium,
      };
      
      if (seriesChoice === 'new' && seriesTitle) {
        draftPayload.series = {
          title: seriesTitle.trim(),
          description: seriesDescription.trim(),
          genres,
          rating,
          isOriginal,
        };
        draftPayload.season = parseInt(season);
        draftPayload.episode = parseInt(episode);
      } else if (seriesChoice === 'existing' && selectedSeriesTitle) {
        draftPayload.series = {
          title: selectedSeriesTitle,
          description: '',
          genres,
          rating,
          isOriginal,
        };
        draftPayload.season = parseInt(season);
        draftPayload.episode = parseInt(episode);
      }
      
      const draftResponse = await apiClient.createDraft(draftPayload);
      if (draftResponse.error || !draftResponse.data?.id) {
        throw new Error(draftResponse.error || 'Failed to create draft');
      }
      
      const draftId = draftResponse.data.id;
      
      const streamResponse = await apiClient.uploadToStream(draftId, file, (progress) => {
        setUploadProgress(progress * 0.5);
      });
      
      if (streamResponse.error || !streamResponse.data?.streamId) {
        throw new Error(streamResponse.error || 'Stream upload failed');
      }
      
      setUploadProgress(60);
      setStep('processing');
      
      const maxAttempts = 180;
      let attempts = 0;
      let ready = false;
      
      while (attempts < maxAttempts && !ready) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const statusResponse = await apiClient.getStreamStatus(draftId);
        
        if (statusResponse.data) {
          setProcessingProgress(statusResponse.data.progress || 0);
          ready = statusResponse.data.ready;
          
          if (statusResponse.data.state === 'error') {
            throw new Error('Stream processing failed');
          }
        }
        attempts++;
      }
      
      setUploadProgress(90);
      
      const completePayload: any = {
        title: title.trim(),
        description: description.trim(),
        storageMethod: 'stream',
        cloudflareStreamId: streamResponse.data.streamId,
        fileSize: file.size,
        cast,
        director: director.trim(),
        genre: genres,
        rating,
        releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
        language: 'English',
        featured,
        isOriginal,
        isPremium,
      };
      
      if (seriesChoice === 'new') {
        completePayload.series = {
          title: seriesTitle.trim(),
          description: seriesDescription.trim(),
          genres,
          rating,
          isOriginal,
        };
        completePayload.season = parseInt(season);
        completePayload.episode = parseInt(episode);
      } else if (seriesChoice === 'existing') {
        completePayload.series = {
          title: selectedSeriesTitle,
          description: '',
          genres,
          rating,
          isOriginal,
        };
        completePayload.season = parseInt(season);
        completePayload.episode = parseInt(episode);
      }
      
      await apiClient.completeUpload(draftId, completePayload);
      
      setUploadProgress(100);
      setStep('success');
      
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 2000);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStep('error');
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedType(null);
    setTitle('');
    setDescription('');
    setCast([]);
    setGenres([]);
    setFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' && 'Select Content Type'}
            {step === 'series-choice' && 'Choose Series Option'}
            {step === 'details' && 'Content Details'}
            {step === 'uploading' && 'Uploading...'}
            {step === 'processing' && 'Processing...'}
            {step === 'success' && 'Upload Complete'}
            {step === 'error' && 'Upload Failed'}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
            {TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border bg-card/50 hover:bg-card hover:border-primary/50 transition-all group"
              >
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-base font-medium text-center">{label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 'series-choice' && (
          <div className="space-y-4 py-6">
            <button onClick={() => handleSeriesChoiceSelect('new')} className="w-full flex items-center gap-4 p-4 rounded-lg border-2 hover:border-primary/50 bg-card/30 hover:bg-card/50 transition-all text-left">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><Plus className="h-6 w-6 text-primary" /></div>
              <div>
                <p className="font-semibold">Create New Series</p>
                <p className="text-sm text-muted-foreground">Start a new series</p>
              </div>
            </button>

            {availableSeries.length > 0 && (
              <button onClick={() => handleSeriesChoiceSelect('existing')} className="w-full flex items-center gap-4 p-4 rounded-lg border-2 hover:border-primary/50 bg-card/30 hover:bg-card/50 transition-all text-left">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center"><Tv className="h-6 w-6 text-blue-500" /></div>
                <div>
                  <p className="font-semibold">Add to Existing Series</p>
                  <p className="text-sm text-muted-foreground">{availableSeries.length} series available</p>
                </div>
              </button>
            )}

            <button onClick={() => handleSeriesChoiceSelect('standalone')} className="w-full flex items-center gap-4 p-4 rounded-lg border-2 hover:border-primary/50 bg-card/30 hover:bg-card/50 transition-all text-left">
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center"><Video className="h-6 w-6 text-purple-500" /></div>
              <div>
                <p className="font-semibold">Standalone Episode</p>
                <p className="text-sm text-muted-foreground">Upload without series</p>
              </div>
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
            {seriesChoice === 'new' && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                <Label>New Series Title *</Label>
                <Input value={seriesTitle} onChange={(e) => setSeriesTitle(e.target.value)} />
                <Label>Series Description</Label>
                <Textarea value={seriesDescription} onChange={(e) => setSeriesDescription(e.target.value)} rows={2} />
              </div>
            )}

            {seriesChoice === 'existing' && (
              <div className="space-y-2">
                <Label>Select Series *</Label>
                <select value={selectedSeriesTitle} onChange={(e) => setSelectedSeriesTitle(e.target.value)} className="w-full px-3 py-2 bg-input border rounded-md">
                  <option value="">-- Select Series --</option>
                  {availableSeries.map((s) => (
                    <option key={s.title} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Episode Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>

            {seriesChoice !== 'standalone' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Season *</Label>
                  <Input type="number" value={season} onChange={(e) => setSeason(e.target.value)} min="1" />
                </div>
                <div className="space-y-2">
                  <Label>Episode *</Label>
                  <Input type="number" value={episode} onChange={(e) => setEpisode(e.target.value)} min="1" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Cast</Label>
              <div className="flex gap-2">
                <Input value={castInput} onChange={(e) => setCastInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), cast.push(castInput.trim()), setCast([...cast]), setCastInput(''))} />
                <Button type="button" onClick={() => { if (castInput.trim()) { setCast([...cast, castInput.trim()]); setCastInput(''); } }}>Add</Button>
              </div>
              {cast.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {cast.map((actor, i) => (
                    <span key={i} className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {actor}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setCast(cast.filter((_, idx) => idx !== i))} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Director</Label>
                <Input value={director} onChange={(e) => setDirector(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Release Year</Label>
                <Input type="number" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Genres</Label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer p-2 rounded border">
                    <input type="checkbox" checked={genres.includes(g)} onChange={() => setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])} />
                    <span className="text-sm">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full px-3 py-2 border rounded">
                  <option value="">Select</option>
                  {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2 p-4 border rounded">
              <Label>Flags</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /><span className="text-sm">Featured</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={isOriginal} onChange={(e) => setIsOriginal(e.target.checked)} /><span className="text-sm">Original</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} /><span className="text-sm">Premium</span></label>
              </div>
            </div>

            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <input ref={fileRef} type="file" onChange={handleFileSelect} accept={selectedType === 'music' ? 'audio/*' : 'video/*'} className="hidden" />
              {!file ? (
                <>
                  <Upload className="h-8 w-8 text-primary mx-auto" />
                  <p className="font-medium">Select {selectedType === 'music' ? 'audio' : 'video'} file</p>
                  <Button onClick={() => fileRef.current?.click()}>Choose File</Button>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <Button variant="outline" onClick={() => fileRef.current?.click()}>Change</Button>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(needsSeries ? 'series-choice' : 'select')} className="flex-1">Back</Button>
              <Button onClick={handleStartUpload} disabled={!file} className="flex-1">Upload</Button>
            </div>
          </div>
        )}

        {step === 'uploading' && (
          <div className="space-y-6 py-8 text-center">
            <Upload className="h-10 w-10 text-primary animate-pulse mx-auto" />
            <p className="font-medium">Uploading to Cloudflare Stream...</p>
            <Progress value={uploadProgress} />
            <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</p>
          </div>
        )}

        {step === 'processing' && (
          <div className="space-y-6 py-8 text-center">
            <Video className="h-10 w-10 text-blue-500 animate-pulse mx-auto" />
            <p className="font-medium">Processing...</p>
            <Progress value={processingProgress} />
            <p className="text-sm text-muted-foreground">{Math.round(processingProgress)}%</p>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6 py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
            <p className="text-xl font-bold text-success">Upload Successful!</p>
          </div>
        )}

        {step === 'error' && (
          <div className="space-y-6 py-8 text-center">
            <XCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-xl font-bold text-destructive">Upload Failed</p>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => setStep('details')}>Try Again</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}