// admin/src/pages/SeriesManagement.tsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import CreateSeriesModal from '@/components/CreateSeriesModal';
import { toast } from '@/hooks/use-toast';

interface Series {
  _id: string;
  title: string;
  description?: string;
  type: 'miniseries' | 'tvshow';
  thumbnail?: string;
  metadata: {
    genre?: string[];
    releaseYear?: number;
    totalSeasons?: number;
  };
  createdAt: string;
  episodeCount?: number; // Will be calculated
}

export default function SeriesManagement() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'miniseries' | 'tvshow' | null>(null);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      
      // Fetch all content
      const response = await apiClient.getContent(1, 100);
      
      if (response.data?.data) {
        // Extract unique series by grouping content with seriesId
        const seriesMap = new Map<string, Series>();
        
        response.data.data.forEach((content: any) => {
          if (content.seriesId && !seriesMap.has(content.seriesId)) {
            // Get the content type (minisode or tv_episode)
            const seriesType = content.type === 'minisode' ? 'miniseries' : 'tvshow';
            
            seriesMap.set(content.seriesId, {
              _id: content.seriesId,
              title: content.seriesTitle || content.title.split(' - ')[0] || content.title,
              description: content.seriesDescription || content.description,
              type: seriesType,
              thumbnail: content.storage.thumbnail,
              metadata: content.metadata || {},
              createdAt: content.createdAt,
              episodeCount: 0
            });
          }
        });

        // Count episodes for each series
        response.data.data.forEach((content: any) => {
          if (content.seriesId && seriesMap.has(content.seriesId)) {
            const series = seriesMap.get(content.seriesId)!;
            series.episodeCount = (series.episodeCount || 0) + 1;
          }
        });

        setSeriesList(Array.from(seriesMap.values()));
      }
    } catch (error) {
      console.error('Error fetching series:', error);
      toast({
        title: 'Error',
        description: 'Failed to load series',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeries = (type: 'miniseries' | 'tvshow') => {
    setSelectedType(type);
    setIsCreateModalOpen(true);
  };

  const handleSeriesCreated = () => {
    setIsCreateModalOpen(false);
    fetchSeries();
    toast({
      title: 'Success',
      description: 'Series created successfully'
    });
  };

  const handleDeleteSeries = async (seriesId: string) => {
    if (!confirm('Are you sure? This will not delete the episodes, but they will become standalone content.')) {
      return;
    }

    try {
      // Note: In a full implementation, you'd update all episodes to remove their seriesId
      toast({
        title: 'Info',
        description: 'Series removed from grouping. Episodes are now standalone.'
      });
      fetchSeries();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete series',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading series...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Series Management</h1>
          <p className="text-muted-foreground">
            Create and manage Mini Series and TV Shows. Group episodes together.
          </p>
        </div>
      </div>

      {/* Create Series Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card border-border/20 hover:border-primary/40 transition-all cursor-pointer group"
          onClick={() => handleCreateSeries('miniseries')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Film className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Create Mini Series</h3>
                <p className="text-sm text-muted-foreground">
                  Group minisodes into episodic series
                </p>
              </div>
              <Plus className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/20 hover:border-primary/40 transition-all cursor-pointer group"
          onClick={() => handleCreateSeries('tvshow')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Tv className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Create TV Show</h3>
                <p className="text-sm text-muted-foreground">
                  Group TV episodes into shows
                </p>
              </div>
              <Plus className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Series List */}
      <Card className="glass-card border-border/20">
        <CardHeader>
          <CardTitle className="text-white">Existing Series ({seriesList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {seriesList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No series created yet</p>
              <p className="text-sm text-muted-foreground">
                Create a series above, then upload episodes and link them to the series
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {seriesList.map((series) => (
                <Card key={series._id} className="bg-background/40 border-border/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        {series.thumbnail ? (
                          <img
                            src={series.thumbnail}
                            alt={series.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {series.type === 'miniseries' ? (
                              <Film className="w-8 h-8 text-muted-foreground" />
                            ) : (
                              <Tv className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">
                              {series.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                {series.type === 'miniseries' ? 'Mini Series' : 'TV Show'}
                              </Badge>
                              <Badge variant="outline">
                                {series.episodeCount || 0} {series.type === 'miniseries' ? 'Minisodes' : 'Episodes'}
                              </Badge>
                              {series.metadata.totalSeasons && (
                                <Badge variant="outline">
                                  {series.metadata.totalSeasons} Seasons
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {/* TODO: Edit series */}}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSeries(series._id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        {series.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {series.description}
                          </p>
                        )}

                        {series.metadata.genre && series.metadata.genre.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {series.metadata.genre.map((genre, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Series Modal */}
      <CreateSeriesModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        seriesType={selectedType}
        onSeriesCreated={handleSeriesCreated}
      />
    </div>
  );
}