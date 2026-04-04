// src/pages/Movies.tsx - FIXED STATUS COMPARISON
import { useState, useEffect } from "react";
import { Plus, Grid3x3, List, Search, Loader2, RefreshCw, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ContentCard from "@/components/dashboard/ContentCard";
import MovieUploadForm from "@/components/upload/MovieUploadForm";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Content, mapBackendType, formatDuration } from "@/lib/types";

const Movies = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContent = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      console.log('📥 Fetching movies...');
      const response = await apiClient.getContent(1, 100);

      if (response.success && response.data) {
        const moviesContent: Content[] = response.data.data
          .filter((item: any) => item.type === 'movie')
          .map((item: any) => ({
            _id: item._id,
            id: item._id,
            title: item.title,
            description: item.description || '',
            type: mapBackendType(item.type),
            status: item.status,
            uploaderId: item.uploaderId,
            storage: item.storage || {},
            metadata: {
              ...item.metadata,
              mediaType: mapBackendType(item.metadata?.mediaType || item.type),
            },
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));

        setContent(moviesContent);
        console.log(`✅ Loaded ${moviesContent.length} movies`);
      } else {
        console.error('❌ Failed to fetch content:', response.error);
        toast({
          title: 'Error',
          description: response.error || 'Failed to load movies',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load movies',
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

  const filteredContent = content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
      const response = await apiClient.deleteContent(id);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Movie deleted successfully',
        });
        setContent(content.filter(item => item._id !== id));
      } else {
        throw new Error(response.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete movie',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (content: Content) => {
    console.log('Edit movie:', content);
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

  // Calculate total runtime
  const totalRuntime = content.reduce((sum, item) => sum + (item.metadata?.duration || 0), 0);
  const avgRuntime = content.length > 0 ? totalRuntime / content.length : 0;
  
  // ✅ FIXED: Count ready content (status is a string from backend)
  const readyCount = content.filter(c => c.status === 'ready' || c.status === 'uploaded').length;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Film className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Movies
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your movie collection
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setUploadModalOpen(true)}
                className="bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload Movie
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
            <p className="text-sm text-muted-foreground">Total Movies</p>
            <p className="text-2xl font-bold">{content.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Ready</p>
            <p className="text-2xl font-bold">{readyCount}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Avg Runtime</p>
            <p className="text-2xl font-bold">{formatDuration(avgRuntime)}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Runtime</p>
            <p className="text-2xl font-bold">{formatDuration(totalRuntime)}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <div className="flex gap-2">
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
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        )}

        {!loading && (
          <>
            {filteredContent.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "flex flex-col gap-4"
              }>
                {filteredContent.map((item) => (
                  <ContentCard 
                    key={item._id} 
                    content={item} 
                    viewMode={viewMode}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-4">
                  {searchQuery ? 'No movies found matching your search' : 'No movies uploaded yet'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setUploadModalOpen(true)} className="bg-red-500 hover:bg-red-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Your First Movie
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <MovieUploadForm open={uploadModalOpen} onOpenChange={handleUploadModalClose} />
    </DashboardLayout>
  );
};

export default Movies;