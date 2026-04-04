// src/components/upload/MovieUploadForm.tsx
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle2, XCircle, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import RegionalSelector from './RegionalSelector';
import { GenreSelector } from './GenreSelector';
import FlagsSelector from './FlagsSelector';
import ThemeSelector from './ThemeSelector';

const FILM_GENRES = [
  'Drama', 'Comedy', 'Romance', 'Thriller', 'Crime', 'Action',
  'Documentary', 'Animation', 'Historical', 'Coming-of-Age', 'Family',
];

const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'];

interface MovieUploadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'details' | 'uploading' | 'processing' | 'success' | 'error';

function MovieUploadForm({ open, onOpenChange }: MovieUploadFormProps) {
  const [step, setStep] = useState<Step>('details');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  // Cast & Crew
  const [cast, setCast] = useState<string[]>([]);
  const [castInput, setCastInput] = useState('');
  const [director, setDirector] = useState('');
  const [writer, setWriter] = useState('');
  const [producer, setProducer] = useState('');
  
  // Genres & Rating
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [rating, setRating] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  
  // Regional
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [country, setCountry] = useState('');
  
  // Themes
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  
  // Flags
  const [featured, setFeatured] = useState(false);
  const [isOriginal, setIsOriginal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [voiceOfWomen, setVoiceOfWomen] = useState(false);
  const [isDiaspora, setIsDiaspora] = useState(false);
  const [hasWonAwards, setHasWonAwards] = useState(false);
  const [isFestivalSelection, setIsFestivalSelection] = useState(false);
  
  // Awards & Festivals
  const [awardsList, setAwardsList] = useState<string[]>([]);
  const [festivalsList, setFestivalsList] = useState<string[]>([]);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState('');
  
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith('video/')) {
      toast({ title: 'Invalid file', description: 'Please upload a video file', variant: 'destructive' });
      return;
    }

    if (f.size > 5 * 1024 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5GB', variant: 'destructive' });
      return;
    }
    
    setFile(f);
  };

  const addCast = () => {
    if (castInput.trim()) {
      setCast([...cast, castInput.trim()]);
      setCastInput('');
    }
  };

  const removeCast = (index: number) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (!title.trim() || !file || selectedGenres.length === 0 || selectedRegions.length === 0) {
      toast({ title: 'Missing required fields', description: 'Fill in all required fields', variant: 'destructive' });
      return;
    }
    
    setStep('uploading');
    setUploadProgress(0);
    
    try {
      // Create draft
      const draftPayload: any = {
        mediaType: 'movie',
        title: title.trim(),
        type: 'video',
        fileName: file.name,
        fileSize: file.size,
        storageMethod: 'stream',
        description: description.trim(),
        
        // Cast & Crew
        cast,
        director: director.trim(),
        writer: writer.trim(),
        producer: producer.trim(),
        
        // Genres
        genre: selectedGenres,
        
        // Release
        rating,
        releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
        language: 'English',
        
        // Regional
        region: selectedRegions,
        country: country || undefined,
        
        // Themes
        themes: selectedThemes,
        
        // Flags
        featured,
        isOriginal,
        isPremium,
        voiceOfWomen,
        isDiaspora,
        hasWonAwards,
        isFestivalSelection,
        
        // Awards & Festivals
        awardsList: hasWonAwards ? awardsList : undefined,
        festivalsList: isFestivalSelection ? festivalsList : undefined,
      };
      
      const draftResponse = await apiClient.createDraft(draftPayload);
      if (draftResponse.error || !draftResponse.data?.id) {
        throw new Error(draftResponse.error || 'Failed to create draft');
      }
      
      const draftId = draftResponse.data.id;
      
      // Upload to Stream
      const streamResponse = await apiClient.uploadToStream(draftId, file, (progress) => {
        setUploadProgress(progress * 0.5);
      });
      
      if (streamResponse.error || !streamResponse.data?.streamId) {
        throw new Error(streamResponse.error || 'Stream upload failed');
      }
      
      setUploadProgress(60);
      setStep('processing');
      
      // Poll for ready status
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
      
      // Complete upload
      const completePayload: any = {
        ...draftPayload,
        cloudflareStreamId: streamResponse.data.streamId,
        fileSize: file.size,
      };
      
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
    setStep('details');
    setTitle('');
    setDescription('');
    setCast([]);
    setSelectedGenres([]);
    setFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'details' && 'Upload Movie'}
            {step === 'uploading' && 'Uploading...'}
            {step === 'processing' && 'Processing...'}
            {step === 'success' && 'Upload Complete'}
            {step === 'error' && 'Upload Failed'}
          </DialogTitle>
        </DialogHeader>

        {step === 'details' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto py-4">
            <div className="space-y-2">
              <Label>Movie Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>

            <GenreSelector
              title="Film Genres"
              genres={[]}
              availableGenres={FILM_GENRES}
              selectedGenres={selectedGenres}
              setSelectedGenres={setSelectedGenres}
              min={1}
              max={4}
            />

            <RegionalSelector
              selectedRegions={selectedRegions}
              setSelectedRegions={setSelectedRegions}
              country={country}
              setCountry={setCountry}
            />

            <div className="space-y-2">
              <Label>Cast</Label>
              <div className="flex gap-2">
                <Input 
                  value={castInput} 
                  onChange={(e) => setCastInput(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCast())}
                />
                <Button type="button" onClick={addCast}>Add</Button>
              </div>
              {cast.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {cast.map((actor, i) => (
                    <span key={i} className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {actor}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeCast(i)} />
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
              <Label>Rating</Label>
              <select 
                value={rating} 
                onChange={(e) => setRating(e.target.value)} 
                className="w-full px-3 py-2 bg-secondary text-foreground border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select</option>
                {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <ThemeSelector selectedThemes={selectedThemes} setSelectedThemes={setSelectedThemes} />

            <FlagsSelector
              featured={featured}
              setFeatured={setFeatured}
              isOriginal={isOriginal}
              setIsOriginal={setIsOriginal}
              isPremium={isPremium}
              setIsPremium={setIsPremium}
              voiceOfWomen={voiceOfWomen}
              setVoiceOfWomen={setVoiceOfWomen}
              isDiaspora={isDiaspora}
              setIsDiaspora={setIsDiaspora}
              hasWonAwards={hasWonAwards}
              setHasWonAwards={setHasWonAwards}
              isFestivalSelection={isFestivalSelection}
              setIsFestivalSelection={setIsFestivalSelection}
            />

            <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
              <input ref={fileRef} type="file" onChange={handleFileSelect} accept="video/*" className="hidden" />
              {!file ? (
                <>
                  <Upload className="h-8 w-8 text-primary mx-auto" />
                  <p className="font-medium">Select video file</p>
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
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
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
            <Upload className="h-10 w-10 text-blue-500 animate-pulse mx-auto" />
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

export default MovieUploadForm;