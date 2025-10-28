import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SecureAuthProvider } from "./contexts/SecureAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminErrorBoundary } from "./components/AdminErrorBoundary";
import Index from "./pages/Index";
import ArticleComplete from "./pages/ArticleComplete";
import Category from "./pages/Category";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import AdminLayout from "./pages/admin/AdminLayout";
import { SecureLogin } from "./pages/admin/SecureLogin";
import Dashboard from "./pages/admin/Dashboard";
import ArticlesManager from "./pages/admin/ArticlesManager";
import ArticleEditor from "./pages/admin/ArticleEditor";
import FeedTester from "./pages/admin/FeedTester";
import BulkNewsImport from "@/pages/admin/BulkNewsImport";
import ArticlesQueueManager from "@/pages/admin/ArticlesQueueManager";
import CategoriesManager from "./pages/admin/CategoriesManager";
import AuthorsManager from "./pages/admin/AuthorsManager";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import UsersManager from "./pages/admin/UsersManager";
import SecuritySettings from "./pages/admin/SecuritySettings";
import NotificationsSettings from "./pages/admin/NotificationsSettings";
import ThemeManager from "./pages/admin/ThemeManager";

import RoleManager from "./pages/admin/RoleManager";
import PermissionsManager from "./pages/admin/PermissionsManager";
import DebugPermissions from "./pages/admin/DebugPermissions";
import ActivityLogs from "./pages/admin/ActivityLogs";
import { RadioManager } from "./pages/admin/RadioManager";
import { PodcastManager } from "./pages/admin/PodcastManager";
import TvManager from "./pages/admin/TvManager";
import StudioPro from "./pages/admin/StudioPro";
import { VPNSettings } from "./pages/admin/VPNSettings";
import SocialOverview from "./pages/admin/SocialOverview";
import SocialCreatePost from "./pages/admin/SocialCreatePost";
import SocialSchedule from "./pages/admin/SocialSchedule";
import SocialMediaLibrary from "./pages/admin/SocialMediaLibrary";
import SocialInbox from "./pages/admin/SocialInbox";
import SocialReports from "./pages/admin/SocialReports";
import SocialSettings from "./pages/admin/SocialSettings";
import CommunityDashboard from "./pages/admin/CommunityDashboard";
import CommunityGroups from "./pages/admin/CommunityGroups";
import CommunityTopics from "./pages/admin/CommunityTopics";
import CommunityChat from "./pages/admin/CommunityChat";
import { ImageManager } from "./pages/admin/ImageManager";
import { AdsManager } from "./pages/admin/AdsManager";
import BannersManager from "./pages/admin/BannersManager";
import ReporterAI from "./pages/admin/ReporterAI";

import JornalistaProTools from "./pages/admin/JornalistaProTools";
import StudioPlaceholder from "./pages/admin/StudioPlaceholder";
import AutoPostManager from "./pages/admin/AutoPostManager";
import WebStoriesManager from "./pages/admin/WebStoriesManager";
import RSSImportManager from "./pages/admin/RSSImportManager";
import AccessibilitySettings from "./pages/admin/AccessibilitySettings";
import NFSeManager from "./pages/admin/NFSeManager";
import EditionsList from "./pages/admin/editions/EditionsList";
import EditionBuilder from "./pages/admin/editions/EditionBuilder";
import EditionNewsLibrary from "./pages/admin/editions/EditionNewsLibrary";
import AdsLibraryManager from "./pages/admin/editions/AdsLibraryManager";
import EditionSettings from "./pages/admin/editions/EditionSettings";
import EditionPreview from "./pages/admin/editions/EditionPreview";
import EditionsListPublic from "./pages/EditionsListPublic";

// Training pages
import { TrainingYoutube } from "./pages/admin/training/TrainingYoutube";
import { TrainingTikTok } from "./pages/admin/training/TrainingTikTok";
import { TrainingInstagram } from "./pages/admin/training/TrainingInstagram";
import { TrainingVimeo } from "./pages/admin/training/TrainingVimeo";
import { TrainingOthers } from "./pages/admin/training/TrainingOthers";

import EditionReader from "./pages/EditionReader";
import EditionFlipbook from "./pages/EditionFlipbook";
import { useTheme } from "./contexts/ThemeContext";

const queryClient = new QueryClient();

// Wrapper component for themed pages
const ThemedPageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { currentTheme } = useTheme();
  const ThemeComponent = currentTheme.component;
  
  return <ThemeComponent>{children}</ThemeComponent>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ThemedPageWrapper><Index /></ThemedPageWrapper>} />
      <Route path="/noticia/:slug" element={<ThemedPageWrapper><ArticleComplete /></ThemedPageWrapper>} />
      <Route path="/sobre" element={<ThemedPageWrapper><About /></ThemedPageWrapper>} />
      <Route path="/contato" element={<ThemedPageWrapper><Contact /></ThemedPageWrapper>} />
      
      {/* WebStories routes */}
      {/* Editions routes (public) */}
      <Route path="/jornal" element={<ThemedPageWrapper><EditionsListPublic /></ThemedPageWrapper>} />
      <Route path="/jornal/edicao/:slug/ler" element={<EditionReader />} />
      <Route path="/jornal/edicao/:slug/flip" element={<EditionFlipbook />} />
      
      {/* Category routes */}
      <Route path="/categoria/:slug" element={<ThemedPageWrapper><Category /></ThemedPageWrapper>} />
      
      {/* Auth Route - Independent from admin */}
      <Route path="/auth" element={<SecureLogin />} />
      
      {/* Admin Login Redirect */}
      <Route path="/admin/login" element={<Navigate to="/auth" replace />} />
      
      {/* Admin Gate - handles auth and redirects */}
      <Route path="/admin" element={<Navigate to="/admin/" replace />} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin/*" element={
        <AdminErrorBoundary>
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        </AdminErrorBoundary>
      }>
        <Route index element={<Dashboard />} />
        <Route path="articles" element={<ArticlesManager />} />
        <Route path="articles/new" element={<ArticleEditor />} />
        <Route path="articles/:id/edit" element={<ArticleEditor />} />
        <Route path="feed-tester" element={<FeedTester />} />
        <Route path="bulk-import" element={<BulkNewsImport />} />
        <Route path="queue" element={<ArticlesQueueManager />} />
        <Route path="categories" element={<CategoriesManager />} />
        <Route path="authors" element={<AuthorsManager />} />
        
        <Route path="radio" element={<RadioManager />} />
        <Route path="podcast" element={<PodcastManager />} />
        <Route path="tv" element={<TvManager />} />
        <Route path="studio-pro" element={<StudioPro />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="vpn" element={<VPNSettings />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<UsersManager />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="notifications" element={<NotificationsSettings />} />
        <Route path="theme" element={<ThemeManager />} />
        
        <Route path="roles" element={<RoleManager />} />
        <Route path="permissions-manager" element={<PermissionsManager />} />
        <Route path="debug-permissions" element={<DebugPermissions />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="image-manager" element={<ImageManager />} />
        <Route path="ads" element={<AdsManager />} />
        <Route path="banners" element={<BannersManager />} />
        
        {/* Social Post Routes */}
        <Route path="social" element={<SocialOverview />} />
        <Route path="social/create" element={<SocialCreatePost />} />
        <Route path="social/schedule" element={<SocialSchedule />} />
        <Route path="social/media" element={<SocialMediaLibrary />} />
        <Route path="social/inbox" element={<SocialInbox />} />
        <Route path="social/reports" element={<SocialReports />} />
        <Route path="social/settings" element={<SocialSettings />} />
        
        {/* Community Routes */}
        <Route path="community" element={<CommunityDashboard />} />
        <Route path="community/groups" element={<CommunityGroups />} />
        <Route path="community/topics" element={<CommunityTopics />} />
        <Route path="community/chat" element={<CommunityChat />} />
        
        {/* Training Routes */}
        <Route path="training/youtube" element={<TrainingYoutube />} />
        <Route path="training/tiktok" element={<TrainingTikTok />} />
        <Route path="training/instagram" element={<TrainingInstagram />} />
        <Route path="training/vimeo" element={<TrainingVimeo />} />
        <Route path="training/others" element={<TrainingOthers />} />
        
        {/* Tools Routes */}
        <Route path="tools/jornalista-pro" element={<JornalistaProTools />} />
        <Route path="tools/jornal" element={<EditionsList />} />
        <Route path="tools/jornal/nova" element={<EditionBuilder />} />
        <Route path="tools/jornal/:id/editar" element={<EditionBuilder />} />
        <Route path="tools/jornal/biblioteca" element={<EditionNewsLibrary selectedArticles={[]} onToggleArticle={() => {}} />} />
        <Route path="tools/jornal/anuncios" element={<AdsLibraryManager />} />
        <Route path="tools/jornal/config" element={<EditionSettings />} />
        <Route path="tools/jornal/preview/:id" element={<EditionPreview />} />
        
        {/* WebStories Routes */}
        <Route path="webstories" element={<WebStoriesManager />} />
        <Route path="webstories/new" element={<WebStoriesManager />} />
        <Route path="webstories/:id/edit" element={<WebStoriesManager />} />
        
        {/* Reporter AI Route */}
        <Route path="reporter-ai" element={<ReporterAI />} />
        
        {/* RSS Import Route */}
        <Route path="import" element={<RSSImportManager />} />
        
        {/* Other Routes */}
        <Route path="studio" element={<StudioPro />} />
        <Route path="auto-post" element={<AutoPostManager />} />
        
        {/* Settings Routes */}
        <Route path="settings/accessibility" element={<AccessibilitySettings />} />
        
        {/* NFS-e Route */}
        <Route path="nfse" element={<NFSeManager />} />
      </Route>
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<ThemedPageWrapper><NotFound /></ThemedPageWrapper>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <SecureAuthProvider>
          <ThemeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ThemeProvider>
        </SecureAuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
