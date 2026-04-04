// admin/src/components/CreateSeriesModal.tsx
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Image, Film, Tv, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CreateSeriesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesType: 'miniseries' | 'tvshow' | null;
  onSeriesCreated: (seriesId: string) => void;
}

const CreateSeriesModal: React.FC<CreateSeriesModalProps> = ({
  open,
  onOpenChange,
  seriesType,
  onSeriesCreated
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalSeasons, setTotalSeasons] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [genre, setGenre] = useState('');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid image (JPG, PNG, WebP)',
        variant: 'destructive'
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Maximum poster size is 5MB',
        variant: 'destructive'
      });
      return;
    }

    setPosterFile(file);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a series title',
        variant: 'destructive'
      });
      return;
    }

    if (!totalSeasons || parseInt(totalSeasons) < 1) {
      toast({
        title: 'Seasons required',
        description: 'Please enter the total number of seasons',
        variant: 'destructive'
      });
      return;
    }

    try {
      setCreating(true);

      // Generate a unique series ID (timestamp + random)
      const seriesId = `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // In a real implementation, you would:
      // 1. Upload the poster image to Cloudflare R2
      // 2. Save series metadata to a "series" collection in MongoDB
      // 3. Return the seriesId to be used when uploading episodes

      // For now, we'll simulate success
      console.log('📺 Creating series:', {
        seriesId,
        title,
        type: seriesType,
        totalSeasons: parseInt(totalSeasons),
        description,
        releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
        genre: genre.split(',').map(g => g.trim()).filter(Boolean)
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Store in localStorage for now (in production, this goes to MongoDB)
      const existingSeries = JSON.parse(localStorage.getItem('series_list') || '[]');
      existingSeries.push({
        seriesId,
        title,
        type: seriesType,
        description,
        totalSeasons: parseInt(totalSeasons),
        releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
        genre: genre.split(',').map(g => g.trim()).filter(Boolean),
        posterUrl: posterFile ? URL.createObjectURL(posterFile) : undefined,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('series_list', JSON.stringify(existingSeries));

      toast({
        title: 'Series created!',
        description: `${title} has been created. Now upload episodes and select this series.`
      });

      handleClose();
      onSeriesCreated(seriesId);
    } catch (error) {
      console.error('Error creating series:', error);
      toast({
        title: 'Creation failed',
        description: 'Failed to create series',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setTotalSeasons('');
    setReleaseYear('');
    setGenre('');
    setPosterFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] glass-card border-border/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            {seriesType === 'miniseries' ? (
              <>
                <Film className="w-6 h-6 text-primary" />
                Create Mini Series
              </>
            ) : (
              <>
                <Tv className="w-6 h-6 text-primary" />
                Create TV Show
              </>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a series container, then upload {seriesType === 'miniseries' ? 'minisodes' : 'episodes'} and link them to this series.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="series-title">Series Title *</Label>
            <Input
              id="series-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g., "Lie or Die"`}
              className="bg-input border-border/20 focus:border-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="series-description">Description</Label>
            <Textarea
              id="series-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the series..."
              rows={4}
              className="bg-input border-border/20 focus:border-primary resize-none"
            />
          </div>

          {/* Total Seasons & Release Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total-seasons">Total Seasons *</Label>
              <Input
                id="total-seasons"
                type="number"
                value={totalSeasons}
                onChange={(e) => setTotalSeasons(e.target.value)}
                placeholder="e.g., 3"
                min="1"
                className="bg-input border-border/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="release-year">Release Year</Label>
              <Input
                id="release-year"
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                placeholder="e.g., 2024"
                min="1900"
                max={new Date().getFullYear() + 1}
                className="bg-input border-border/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label htmlFor="genre">Genres (comma-separated)</Label>
            <Input
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g., Drama, Thriller, Mystery"
              className="bg-input border-border/20 focus:border-primary"
            />
          </div>

          {/* Poster Upload */}
          <div className="space-y-2">
            <Label>Series Poster (Optional)</Label>
            <div className="border-2 border-dashed border-border/40 rounded-lg p-6 text-center">
              <input
                ref={posterInputRef}
                type="file"
                onChange={handlePosterSelect}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
              />
              {!posterFile ? (
                <>
                  <div className="flex justify-center mb-3">
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Image className="h-6 w-6 text-secondary" />
                    </div>
                  </div>
                  <p className="text-sm font-medium mb-1">Upload Series Poster</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    JPG, PNG, WebP up to 5MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => posterInputRef.current?.click()}
                  >
                    Choose Image
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-3">
                    <img
                      src={URL.createObjectURL(posterFile)}
                      alt="Poster preview"
                      className="h-32 w-24 object-cover rounded"
                    />
                  </div>
                  <p className="text-sm font-medium mb-2">{posterFile.name}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => posterInputRef.current?.click()}
                  >
                    Change Image
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1 bg-primary hover:bg-primary-hover"
              disabled={creating}
            >
              {creating ? (
                'Creating...'
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Create Series
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSeriesModal;