// src/pages/Podcasts.tsx
import { useState, useEffect } from "react";
import { Plus, Grid3x3, List, Search, Loader2, RefreshCw, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ContentCard from "@/components/dashboard/ContentCard";
import UploadModal from "@/components/dashboard/UploadModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Content, mapBackendType } from "@/lib/types";

interface SeriesGroup {
  seriesTitle: string;
  episodes: Content[];
  totalSeasons: number;
  totalEpisodes: number;
}

const Podcasts = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupBySeries, setGroupBySeries] = useState(true);

  const fetchContent = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      console.log('📥 Fetching podcasts...');
      const response = await apiClient.getContent(1, 100);

      if (response.success && response.data) {
        const podcastsContent: Content[] = response.data.data
          .filter((item: any) => item.type === 'podcast')
          .map((item: any) => ({
            _id: item._id,
            id: item._id,
            title: item.title,
            description: item.description || '',
            type: mapBackendType(item.type),
            status: item.status,
            uploaderId: item.uploaderId,
            storage: item.storage || {},
            series: item.series,
            season: item.season,
            episode: item.episode,
            metadata: {
              ...item.metadata,
              mediaType: mapBackendType(item.metadata?.mediaType || item.type),
              season: item.season,
              episode: item.episode,
            },
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));

        setContent(podcastsContent);
        console.log(`✅ Loaded ${podcastsContent.length} podcast episodes`);
      } else {
        console.error('❌ Failed to fetch content:', response.error);
        toast({
          title: 'Error',
          description: response.error || 'Failed to load podcasts',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load podcasts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const groupedSeries = (): SeriesGroup[] => {
    const seriesMap = new Map<string, Content[]>();

    content.forEach((item) => {
      const seriesTitle = (item as any).series?.title || 'Standalone Podcasts';
      if (!seriesMap.has(seriesTitle)) {
        seriesMap.set(seriesTitle, []);
      }
      seriesMap.get(seriesTitle)!.push(item);
    });

    return Array.from(seriesMap.entries()).map(([seriesTitle, episodes]) => {
      const seasons = new Set(episodes.map(e => (e as any).season).filter(Boolean));
      return {
        seriesTitle,
        episodes: episodes.sort((a, b) => {
          const aSeason = (a as any).season || 0;
          const bSeason = (b as any).season || 0;
          const aEpisode = (a as any).episode || 0;
          const bEpisode = (b as any).episode || 0;
          
          if (aSeason !== bSeason) return aSeason - bSeason;
          return aEpisode - bEpisode;
        }),
        totalSeasons: seasons.size,
        totalEpisodes: episodes.length,
      };
    });
  };

  const filteredContent = content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item as any).series?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this podcast?')) return;

    try {
      const response = await apiClient.deleteContent(id);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Podcast deleted successfully',
        });
        setContent(content.filter(item => item._id !== id));
      } else {
        throw new Error(response.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete podcast',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (content: Content) => {
    console.log('Edit podcast:', content);
    toast({
      title: 'Coming soon',
      description: 'Edit functionality will be added',
    });
  };

  const handleUploadModalClose = (open: boolean) => {
    setUploadModalOpen(open);
    if (!open) {
      fetchContent(false);
    }
  };

  const series = groupedSeries();
  const totalSeasons = series.reduce((sum, s) => sum + s.totalSeasons, 0);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Mic className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Podcasts
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your podcast episodes
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setUploadModalOpen(true)}
                className="bg-purple-500 hover:bg-purple-600 transition-all duration-300 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload Episode
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchContent(false)}
                disabled={refreshing}
                className="border-border/20"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Shows</p>
            <p className="text-2xl font-bold">{series.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Seasons</p>
            <p className="text-2xl font-bold">{totalSeasons}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Episodes</p>
            <p className="text-2xl font-bold">{content.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Ready</p>
            <p className="text-2xl font-bold">{content.filter(c => c.status === 'uploaded').length}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search podcasts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={groupBySeries ? "default" : "secondary"}
              onClick={() => setGroupBySeries(true)}
            >
              Group by Show
            </Button>
            <Button
              variant={!groupBySeries ? "default" : "secondary"}
              onClick={() => setGroupBySeries(false)}
            >
              All Episodes
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "secondary"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "secondary"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        )}

        {!loading && (
          <>
            {content.length > 0 ? (
              groupBySeries ? (
                <div className="space-y-8">
                  {series.map((seriesGroup) => (
                    <div key={seriesGroup.seriesTitle} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold">{seriesGroup.seriesTitle}</h2>
                          <p className="text-sm text-muted-foreground">
                            {seriesGroup.totalSeasons > 0 && `${seriesGroup.totalSeasons} Season${seriesGroup.totalSeasons !== 1 ? 's' : ''} · `}
                            {seriesGroup.totalEpisodes} Episode{seriesGroup.totalEpisodes !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className={viewMode === "grid" 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                        : "flex flex-col gap-4"
                      }>
                        {seriesGroup.episodes
                          .filter(ep => 
                            ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            ep.description?.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((episode) => (
                            <div key={episode._id} className="relative">
                              {episode.season && episode.episode && (
                                <Badge className="absolute -top-2 -right-2 z-10 bg-purple-500">
                                  S{episode.season}E{episode.episode}
                                </Badge>
                              )}
                              {!episode.season && episode.episode && (
                                <Badge className="absolute -top-2 -right-2 z-10 bg-purple-500">
                                  Ep {episode.episode}
                                </Badge>
                              )}
                              <ContentCard 
                                content={episode} 
                                viewMode={viewMode}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                  : "flex flex-col gap-4"
                }>
                  {filteredContent.map((item) => (
                    <div key={item._id} className="relative">
                      {item.season && item.episode && (
                        <Badge className="absolute -top-2 -right-2 z-10 bg-purple-500">
                          S{item.season}E{item.episode}
                        </Badge>
                      )}
                      {!item.season && item.episode && (
                        <Badge className="absolute -top-2 -right-2 z-10 bg-purple-500">
                          Ep {item.episode}
                        </Badge>
                      )}
                      <ContentCard 
                        content={item} 
                        viewMode={viewMode}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <Mic className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-4">
                  {searchQuery ? 'No podcasts found matching your search' : 'No podcasts uploaded yet'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setUploadModalOpen(true)} className="bg-purple-500 hover:bg-purple-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Your First Podcast
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <UploadModal open={uploadModalOpen} onOpenChange={handleUploadModalClose} />
    </DashboardLayout>
  );
};

export default Podcasts;