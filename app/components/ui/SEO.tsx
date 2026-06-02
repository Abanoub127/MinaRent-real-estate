import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useApp } from '../../contexts/AppContext';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = '/logo.png',
  type = 'website'
}) => {
  const { language } = useApp();
  
  const siteName = 'Mina Rent';
  const defaultTitle = language === 'en' ? 'Mina Rent | Premium Real Estate' : 'مينا رينت | عقارات فاخرة';
  const defaultDescription = language === 'en' 
    ? 'Discover curated properties that match your lifestyle. From modern apartments to luxury villas.' 
    : 'عقارات وفيلات وشاليهات للإيجار. اكتشف عقارات منتقاة بعناية تناسب أسلوب حياتك.';
  
  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const pageDescription = description || defaultDescription;

  // Make sure image is an absolute URL for social sharing
  const absoluteImageUrl = image.startsWith('http') 
    ? image 
    : `${window.location.origin}${image.startsWith('/') ? image : `/${image}`}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={window.location.href} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      
      {/* Language Alternates */}
      <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} />
    </Helmet>
  );
};
