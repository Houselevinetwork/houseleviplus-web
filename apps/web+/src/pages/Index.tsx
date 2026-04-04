// src/pages/Index.tsx
import { useState, useEffect } from "react";
import { Plus, Grid3x3, List, Search, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ContentCard from "@/components/dashboard/ContentCard";
import UploadModal from "@/components/dashboard/UploadModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Content, mapBackendType } from "@/lib/types";

const Index = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch content from backend
  const fetchContent = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      console.log('📥 Fetching content from backend...');
      const response = await apiClient.getContent(1, 100);

      if (response.success && response.data) {
        console.log('✅ Content fetched:', response.data);
        
        // Map backend content to frontend format with proper type conversion
        const mappedContent: Content[] = response.data.data.map((item: any) => ({
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

        setContent(mappedContent);
        console.log(`✅ Loaded ${mappedContent.length} items`);
      } else {
        console.error('❌ Failed to fetch content:', response.error);
        toast({
          title: 'Error',
          description: response.error || 'Failed to load content',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error fetching content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchContent();
  }, []);

  // Filter content based on search
  const filteredContent = content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.metadata?.mediaType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await apiClient.deleteContent(id);
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Content deleted successfully',
        });
        setContent(content.filter(item => item._id !== id));
      } else {
        throw new Error(response.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete content',
        variant: 'destructive',
      });
    }
  };

  // Handle edit (placeholder)
  const handleEdit = (content: Content) => {
    console.log('Edit content:', content);
    toast({
      title: 'Coming soon',
      description: 'Edit functionality will be added',
    });
  };

  // Handle upload modal close with refresh
  const handleUploadModalClose = (open: boolean) => {
    setUploadModalOpen(open);
    if (!open) {
      fetchContent(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, {user?.firstName || user?.email?.split('@')[0]}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setUploadModalOpen(true)}
                className="bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload Content
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Content</p>
            <p className="text-2xl font-bold">{content.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Ready</p>
            <p className="text-2xl font-bold">{content.filter(c => c.status === 'uploaded').length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Drafts</p>
            <p className="text-2xl font-bold">{content.filter(c => c.status === 'draft').length}</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Content Grid */}
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
                <p className="text-muted-foreground text-lg mb-4">
                  {searchQuery ? 'No content found matching your search' : 'No content uploaded yet'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setUploadModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Your First Content
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

export default Index;