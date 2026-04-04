// src/components/ContentCard.tsx
import { Film, Music, Mic, Tv, Video, Clapperboard, Clock, HardDrive, MoreVertical, Trash2, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Content, MediaType, formatFileSize, formatDuration } from "@/lib/types";

interface ContentCardProps {
  content: Content;
  viewMode: "grid" | "list";
  onDelete?: (id: string) => void;
  onEdit?: (content: Content) => void;
}

const mediaTypeIcons: Record<MediaType, React.ReactNode> = {
  "miniseries": <Video className="h-5 w-5" />,
  "reelfilm": <Clapperboard className="h-5 w-5" />,
  "tvshow": <Tv className="h-5 w-5" />,
  "stageplay": <Clapperboard className="h-5 w-5" />,
  "movie": <Film className="h-5 w-5" />,
  "podcast": <Mic className="h-5 w-5" />,
  "music": <Music className="h-5 w-5" />,
};

const mediaTypeLabels: Record<MediaType, string> = {
  "miniseries": "Mini Series",
  "reelfilm": "Reel Film",
  "tvshow": "TV Show",
  "stageplay": "Stage Play",
  "movie": "Movie",
  "podcast": "Podcast",
  "music": "Music",
};

const statusColors = {
  draft: "bg-info/20 text-info-foreground border-info/50",
  uploaded: "bg-success/20 text-success-foreground border-success/50",
  processing: "bg-warning/20 text-warning-foreground border-warning/50",
  error: "bg-destructive/20 text-destructive-foreground border-destructive/50",
};

const ContentCard = ({ content, viewMode, onDelete, onEdit }: ContentCardProps) => {
  const fileSize = formatFileSize(content.storage?.size || content.metadata?.fileSize);
  const duration = formatDuration(content.metadata?.duration);
  const uploadDate = new Date(content.createdAt).toLocaleDateString();
  const mediaType = (content.metadata?.mediaType as MediaType) || content.type;
  const icon = mediaTypeIcons[mediaType] || mediaTypeIcons.reelfilm;
  const label = mediaTypeLabels[mediaType] || 'Content';

  if (viewMode === "list") {
    return (
      <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden mb-3">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-32 h-20 bg-secondary rounded-lg flex items-center justify-center">
              <div className="text-muted-foreground">{icon}</div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{content.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{content.description || 'No description'}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && <DropdownMenuItem onClick={() => onEdit(content)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>}
                    {onDelete && <DropdownMenuItem className="text-destructive" onClick={() => onDelete(content._id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                <Badge variant="outline" className={statusColors[content.status]}>{content.status}</Badge>
                <span className="text-muted-foreground">{label}</span>
                {duration !== 'N/A' && <div className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" />{duration}</div>}
                {fileSize !== 'N/A' && <div className="flex items-center gap-1 text-muted-foreground"><HardDrive className="h-3 w-3" />{fileSize}</div>}
                <span className="text-muted-foreground text-xs">{uploadDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-lg">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-secondary flex items-center justify-center overflow-hidden">
          <div className="text-muted-foreground group-hover:scale-110 transition-transform duration-300">{icon}</div>
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && <DropdownMenuItem onClick={() => onEdit(content)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>}
                {onDelete && <DropdownMenuItem className="text-destructive" onClick={() => onDelete(content._id)}><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Badge variant="outline" className={`absolute top-2 left-2 ${statusColors[content.status]}`}>{content.status}</Badge>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-1 truncate">{content.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{content.description || 'No description'}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{label}</span>
            {duration !== 'N/A' && <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{duration}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentCard;

/* 
USAGE: Wrap in a container with gap utilities

Grid View:
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {contents.map(content => <ContentCard key={content._id} content={content} viewMode="grid" />)}
</div>

List View:
<div className="flex flex-col gap-3">
  {contents.map(content => <ContentCard key={content._id} content={content} viewMode="list" />)}
</div>
*/