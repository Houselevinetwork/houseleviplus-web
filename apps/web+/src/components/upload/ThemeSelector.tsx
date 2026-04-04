import { Label } from "@/components/ui/label";

const THEMES = ['urban', 'rural', 'heritage', 'youth', 'street'];

interface ThemeSelectorProps {
  selectedThemes: string[];
  setSelectedThemes: (themes: string[]) => void;
}

export default function ThemeSelector({ selectedThemes, setSelectedThemes }: ThemeSelectorProps) {
  const toggleTheme = (theme: string) => {
    if (selectedThemes.includes(theme)) {
      setSelectedThemes(selectedThemes.filter(t => t !== theme));
    } else {
      setSelectedThemes([...selectedThemes, theme]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Themes (Optional)</Label>
      <div className="flex flex-wrap gap-2">
        {THEMES.map(theme => (
          <label 
            key={theme}
            className={`cursor-pointer px-3 py-1 rounded-full text-sm border ${
              selectedThemes.includes(theme) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedThemes.includes(theme)}
              onChange={() => toggleTheme(theme)}
              className="hidden"
            />
            {theme}
          </label>
        ))}
      </div>
    </div>
  );
}