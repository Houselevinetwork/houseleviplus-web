import { Label } from "@/components/ui/label";

interface GenreSelectorProps {
  title: string;
  genres: string[];
  availableGenres: string[];
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
  min?: number;
  max?: number;
}

export function GenreSelector({ 
  title, 
  genres, 
  availableGenres, 
  selectedGenres, 
  setSelectedGenres,
  min = 1,
  max = 4
}: GenreSelectorProps) {
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else if (selectedGenres.length < max) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{title} *</Label>
      <p className="text-xs text-muted-foreground">Select {min}-{max} genres</p>
      <div className="flex flex-wrap gap-2">
        {availableGenres.map(genre => (
          <label 
            key={genre} 
            className={`flex items-center gap-2 cursor-pointer p-2 rounded border text-sm ${
              selectedGenres.includes(genre) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedGenres.includes(genre)}
              onChange={() => toggleGenre(genre)}
              className="hidden"
            />
            {genre}
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Selected: {selectedGenres.length}/{max}
      </p>
    </div>
  );
}