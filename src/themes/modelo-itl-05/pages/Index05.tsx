import React from 'react';
import { HeroSection05 } from '../components/HeroSection05';
import { NewsGrid05 } from '../components/NewsGrid05';
import { SidebarWidgets05 } from '../components/SidebarWidgets05';
import { WebStoriesCarousel } from '@/components/WebStoriesCarousel';
import { SEO } from '@/components/SEO';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export const Index05: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <>
      <SEO
        title={typeof settings.site_name === 'string' ? settings.site_name : 'ITL Brasil'}
        description={typeof settings.site_tagline === 'string' ? settings.site_tagline : 'Portal de notícias com jornalismo de qualidade'}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <HeroSection05 />

        {/* Web Stories Carousel */}
        <WebStoriesCarousel />

        {/* Main Content with Sidebar */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <NewsGrid05 />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <SidebarWidgets05 />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
