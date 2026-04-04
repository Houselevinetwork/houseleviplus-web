import { Label } from "@/components/ui/label";

interface FlagsSelectorProps {
  featured: boolean;
  setFeatured: (v: boolean) => void;
  isOriginal: boolean;
  setIsOriginal: (v: boolean) => void;
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
  voiceOfWomen?: boolean;
  setVoiceOfWomen?: (v: boolean) => void;
  isDiaspora?: boolean;
  setIsDiaspora?: (v: boolean) => void;
  hasWonAwards?: boolean;
  setHasWonAwards?: (v: boolean) => void;
  isFestivalSelection?: boolean;
  setIsFestivalSelection?: (v: boolean) => void;
}

export default function FlagsSelector(props: FlagsSelectorProps) {
  return (
    <div className="space-y-2 p-4 border rounded">
      <Label>Content Flags</Label>
      
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={props.featured} onChange={(e) => props.setFeatured(e.target.checked)} />
          <span className="text-sm">Featured (Hero Carousel)</span>
        </label>
        
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={props.isOriginal} onChange={(e) => props.setIsOriginal(e.target.checked)} />
          <span className="text-sm">Reel Afrika Original</span>
        </label>
        
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={props.isPremium} onChange={(e) => props.setIsPremium(e.target.checked)} />
          <span className="text-sm">Premium Content</span>
        </label>

        {props.setVoiceOfWomen && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={props.voiceOfWomen} onChange={(e) => props.setVoiceOfWomen!(e.target.checked)} />
            <span className="text-sm">Voice of Women</span>
          </label>
        )}

        {props.setIsDiaspora && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={props.isDiaspora} onChange={(e) => props.setIsDiaspora!(e.target.checked)} />
            <span className="text-sm">Diaspora Story</span>
          </label>
        )}

        {props.setHasWonAwards && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={props.hasWonAwards} onChange={(e) => props.setHasWonAwards!(e.target.checked)} />
            <span className="text-sm">Has Won Awards</span>
          </label>
        )}

        {props.setIsFestivalSelection && (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={props.isFestivalSelection} onChange={(e) => props.setIsFestivalSelection!(e.target.checked)} />
            <span className="text-sm">Festival Selection</span>
          </label>
        )}
      </div>
    </div>
  );
}