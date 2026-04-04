// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Movies from "./pages/Movies";
import ReelFilms from "./pages/ReelFilms";
import MiniSeries from "./pages/MiniSeries";
import TVShows from "./pages/TVShows";
import Podcasts from "./pages/Podcasts";
import Music from "./pages/Music";
import StagePlays from "./pages/StagePlays";
import SeriesManagement from "./pages/SeriesManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Dashboard Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute requireAdmin>
                    <Index />
                  </ProtectedRoute>
                }
              />

              {/* Content Type Pages */}
              <Route
                path="/movies"
                element={
                  <ProtectedRoute requireAdmin>
                    <Movies />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reelfilms"
                element={
                  <ProtectedRoute requireAdmin>
                    <ReelFilms />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/miniseries"
                element={
                  <ProtectedRoute requireAdmin>
                    <MiniSeries />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tvshows"
                element={
                  <ProtectedRoute requireAdmin>
                    <TVShows />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/podcasts"
                element={
                  <ProtectedRoute requireAdmin>
                    <Podcasts />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/music"
                element={
                  <ProtectedRoute requireAdmin>
                    <Music />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/stageplays"
                element={
                  <ProtectedRoute requireAdmin>
                    <StagePlays />
                  </ProtectedRoute>
                }
              />

              {/* Series Management */}
              <Route
                path="/series"
                element={
                  <ProtectedRoute requireAdmin>
                    <SeriesManagement />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;