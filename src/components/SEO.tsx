import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

export const SEO = ({
  title = "Instituto Tribuna Livre - Portal de Análises Geopolíticas e Notícias Internacionais",
  description = "Portal especializado em análises geopolíticas, economia internacional, sociedade e tecnologia. Acompanhe as principais notícias e tendências que moldam o mundo atual.",
  keywords = ["geopolítica", "notícias internacionais", "economia global", "análises políticas", "Instituto Tribuna Livre", "relações internacionais"],
  image = "/og-image.jpg",
  url = "https://itlbrasil.com.br",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  section
}: SEOProps) => {
  const fullTitle = title.includes("Instituto Tribuna Livre") ? title : `${title} | Instituto Tribuna Livre`;
  const canonicalUrl = `${url}${window.location.pathname}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Instituto Tribuna Livre" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific meta tags */}
      {type === "article" && (
        <>
          <meta property="article:author" content={author} />
          <meta property="article:section" content={section} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}

      {/* Structured Data for Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Instituto Tribuna Livre",
          "description": description,
          "url": "https://itlbrasil.com.br",
          "logo": {
            "@type": "ImageObject",
            "url": "https://itlbrasil.com.br/Logo_ITL.png"
          },
          "sameAs": [
            "https://twitter.com/itlbrasil",
            "https://www.linkedin.com/company/itlbrasil",
            "https://www.youtube.com/@itlbrasil"
          ]
        })}
      </script>

      {/* Structured Data for Website */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Instituto Tribuna Livre",
          "url": "https://itlbrasil.com.br",
          "description": description,
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://itlbrasil.com.br/buscar?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        })}
      </script>

      {/* VLibras Script */}
      <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
      <script>
        {`
          window.addEventListener('load', function() {
            if (window.VLibras && window.VLibras.Widget) {
              new window.VLibras.Widget('https://vlibras.gov.br/app');
            }
          });
        `}
      </script>
    </Helmet>
  );
};