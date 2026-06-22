import { useEffect } from "react";

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { setNavigate } from "./router";

import { useUserStore } from "./lib/store";
import { MainLayout } from "./components/layout/main-layout";

function NavigateSetter() {
  const nav = useNavigate();
  useEffect(() => { setNavigate(nav); }, [nav]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

import WelcomePage from "./pages/welcome-page";
import PlaylistPage from "./pages/playlist-page";
import ArtistPage from "./pages/artist-page";
import UserPage from "./pages/user-page";
import SettingsPage from "./pages/settings-page";
import ExplorePage from "./pages/explore-page";
import LibraryPage from "./pages/library-page";
import LikedSongsPage from "./pages/liked-page";
import LikedArtistsPage from "./pages/liked-artists-page";
import UploadAlbumPage from "./pages/upload-album-page";
import ArtistDashboardPage from "./pages/artist-dashboard-page";
import CreatePlaylistPage from "./pages/create-playlist-page";
import UserAccountSettingsPage from "./pages/user-profile-settings-page";
import RecentPage from "./pages/recent-page";
import LoginPage from "./pages/login-page";
import SignupPage from "./pages/signup-page";
import AuthLayout from "./pages/auth-layout-page";
import AlbumPage from "./pages/album-page";

export default function App() {
  const { isAuthenticated, loadLibrary } = useUserStore();

  useEffect(() => {
    if (isAuthenticated) loadLibrary();
  }, [isAuthenticated]);
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <BrowserRouter>
        <NavigateSetter />
        <Routes>

        <Route element={<AuthLayout />}>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<MainLayout />}>

          <Route path="/" element={<WelcomePage />} />

          <Route path="/playlist/create" element={<CreatePlaylistPage />} />
          <Route path="/playlist/:id" element={<PlaylistPage />} />

          <Route path="/artist/:id" element={<ArtistPage />} />

          <Route path="/album/:id" element={<AlbumPage />} />

          <Route path="/profile" element={<UserPage />} />

          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/settings/account" element={<ProtectedRoute><UserAccountSettingsPage /></ProtectedRoute>} />

          <Route path="/explore" element={<ExplorePage />} />

          <Route path="/library" element={<LibraryPage />} />

          <Route path="/liked" element={<LikedSongsPage />} />
          <Route path="/liked-artists" element={<LikedArtistsPage />} />

          <Route path="/user/:userId" element={<UserPage />} />

          <Route path="/artist/dashboard" element={<ArtistDashboardPage />} />
          <Route path="/artist/upload" element={<UploadAlbumPage />} />

          <Route path="/recent" element={<RecentPage />} />

        </Route>
      </Routes>
      <Toaster position="bottom-right" theme="dark" />
      </BrowserRouter>
    </ThemeProvider>
  );
}