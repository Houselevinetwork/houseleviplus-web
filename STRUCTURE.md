# HOUSE LEVI+ NETFLIX-STYLE STRUCTURE

##  CLEAN FOLDER STRUCTURE

```
houselevi+/
 apps/                              # All applications
    web/                          # Main streaming app
       app/
          (auth)/              # Auth routes
             login/
          (main)/              # Main app routes
             browse/
             watch/
             my-list/
          layout.tsx
       public/
       next.config.js
       package.json
   
    shop/                         # E-commerce app
    tickets/                      # Ticketing app
    travel/                       # Travel app
    [3 more apps]

 packages/                         # Shared packages
    LAYER-1-DESIGN/              # Design system
       ui/                      # UI components
          src/
             styles/
                globals.css
             components/
                Button/
                Input/
                ThemeToggle/
             index.ts
          package.json
       brand/                   # Brand assets
   
    LAYER-2-FEATURES/            # Feature modules
       video-player/
       payment/
       search/
   
    LAYER-3-SERVICES/            # Services
       auth/                    # Authentication
       api-client/              # API client
       analytics/               # Analytics
   
    LAYER-4-UTILS/               # Utilities
        hooks/
        helpers/
        types/

 api/                              # Backend (NestJS)

 pnpm-workspace.yaml               # Workspace config
 package.json                      # Root config
 .gitignore
```

##  WHAT'S DIFFERENT FROM BEFORE

###  BEFORE (Messy):
- UI package not recognized
- No workspace setup
- Imports breaking
- Duplicated dependencies

###  AFTER (Clean):
- Proper monorepo setup
- Workspace dependencies
- Imports working
- Shared packages

##  HOW TO USE

### Start Development:
```bash
# Root directory
pnpm dev              # Starts web app
pnpm dev:api          # Starts backend

# Individual apps
cd apps/web
pnpm dev
```

### Import Packages:
```tsx
// In any app
import { Button } from '@houselevi/ui';
import { useAuth } from '@houselevi/auth';
import '@houselevi/ui/styles/globals.css';
```

### Add New Package:
```bash
# Create in packages/LAYER-X/package-name/
# Add package.json with name: @houselevi/package-name
# Run: pnpm install
```

##  WORKSPACE DEPENDENCIES

All packages use \workspace:*\ for local dependencies:
```json
{
  "dependencies": {
    "@houselevi/ui": "workspace:*"
  }
}
```

##  NETFLIX-STYLE PRINCIPLES

1. **Modularity**: Each package is independent
2. **Scalability**: Easy to add new apps/packages
3. **Reusability**: Shared code in packages
4. **Clean**: No duplicates, no mess
5. **Fast**: pnpm workspaces = fast installs

