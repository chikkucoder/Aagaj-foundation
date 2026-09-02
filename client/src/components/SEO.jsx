import React, { useEffect } from 'react';

const SEO = ({
  title,
  description,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  twitterTitle,
  twitterDescription,
  twitterImage,
  keywords,
  schema,
  robots = 'index, follow'
}) => {
  useEffect(() => {
    const ensureWww = (url) => {
      if (typeof url !== 'string') return url;
      return url.replace(/^https:\/\/aagajfoundation\.com/gi, 'https://www.aagajfoundation.com');
    };

    const activeCanonical = ensureWww(canonicalUrl);
    const activeOgImage = ensureWww(ogImage);
    const activeTwitterImage = ensureWww(twitterImage);

    // 1. Update Title
    if (title) {
      document.title = title;
    }

    // Helper to update or create meta tag
    const updateMetaTag = (attrName, attrValue, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update or create link tag
    const updateLinkTag = (rel, href) => {
      if (!href) return;
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Update Standard Meta Tags
    if (description) {
      updateMetaTag('name', 'description', description);
    }
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }
    updateMetaTag('name', 'robots', robots);

    // 3. Update Canonical URL
    if (activeCanonical) {
      updateLinkTag('canonical', activeCanonical);
    }

    // 4. Update Open Graph Tags
    if (title) {
      updateMetaTag('property', 'og:title', ogTitle || title);
    }
    if (description) {
      updateMetaTag('property', 'og:description', ogDescription || description);
    }
    if (activeOgImage) {
      updateMetaTag('property', 'og:image', activeOgImage);
    }
    if (activeCanonical) {
      updateMetaTag('property', 'og:url', activeCanonical);
    }
    updateMetaTag('property', 'og:type', 'website');

    // 5. Update Twitter Cards
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    if (title) {
      updateMetaTag('name', 'twitter:title', twitterTitle || ogTitle || title);
    }
    if (description) {
      updateMetaTag('name', 'twitter:description', twitterDescription || ogDescription || description);
    }
    if (activeOgImage || activeTwitterImage) {
      updateMetaTag('name', 'twitter:image', activeTwitterImage || activeOgImage);
    }

    // 6. Update JSON-LD Schemas
    // Remove existing dynamic script tags for schema first to avoid duplication
    const existingSchemas = document.querySelectorAll('script[data-seo-schema]');
    existingSchemas.forEach(tag => tag.remove());

    const finalSchemas = [];

    // Fallback WebPage schema
    if (title && description && activeCanonical) {
      finalSchemas.push({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": activeCanonical
      });
    }

    if (schema) {
      const schemasToInject = Array.isArray(schema) ? schema : [schema];
      schemasToInject.forEach(s => {
        if (s) {
          // Normalize any non-WWW domain strings inside schema objects
          const jsonStr = JSON.stringify(s).replace(/https:\/\/aagajfoundation\.com/gi, 'https://www.aagajfoundation.com');
          try {
            finalSchemas.push(JSON.parse(jsonStr));
          } catch {
            finalSchemas.push(s);
          }
        }
      });
    }

    finalSchemas.forEach((schemaObj, index) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-schema', `dynamic-${index}`);
      script.text = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    });
  }, [title, description, canonicalUrl, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage, keywords, schema, robots]);

  return null;
};

export default SEO;
