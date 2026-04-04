import { Label } from "@/components/ui/label";

const REGIONS = [
  'East Africa',
  'West Africa',
  'Southern Africa',
  'North Africa',
  'Central Africa',
  'Pan-African',
];

const COUNTRIES = [
  'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Ethiopia', 'Somalia',
  'Nigeria', 'Ghana', 'Senegal', 'Mali', 'Ivory Coast', 'Burkina Faso',
  'South Africa', 'Zimbabwe', 'Botswana', 'Namibia', 'Zambia', 'Mozambique',
  'Egypt', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan',
  'Cameroon', 'Chad', 'Congo', 'DRC', 'Gabon', 'CAR',
];

interface RegionalSelectorProps {
  selectedRegions: string[];
  setSelectedRegions: (regions: string[]) => void;
  country: string;
  setCountry: (country: string) => void;
}

export default function RegionalSelector({ 
  selectedRegions, 
  setSelectedRegions, 
  country, 
  setCountry 
}: RegionalSelectorProps) {
  const toggleRegion = (region: string) => {
    if (selectedRegions.includes(region)) {
      setSelectedRegions(selectedRegions.filter(r => r !== region));
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Regions *</Label>
        <p className="text-xs text-muted-foreground mb-2">Select 1-2 regions</p>
        <div className="grid grid-cols-2 gap-2">
          {REGIONS.map(region => (
            <label key={region} className="flex items-center gap-2 cursor-pointer p-2 rounded border hover:bg-accent">
              <input
                type="checkbox"
                checked={selectedRegions.includes(region)}
                onChange={() => toggleRegion(region)}
              />
              <span className="text-sm">{region}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label>Country (Optional)</Label>
        <select 
          value={country} 
          onChange={(e) => setCountry(e.target.value)}
          className="w-full px-3 py-2 bg-input border rounded-md"
        >
          <option value="">-- Select Country --</option>
          {COUNTRIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}