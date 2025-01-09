// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

// Base Page Metadata, src/layouts/BaseLayout.astro
export const BRAND_NAME = "NovaSky";
export const SITE_TITLE = "NovaSky";
export const SITE_DESCRIPTION = "An amazing team!";

// Tags Page Metadata, src/pages/tags/index.astro
export const Tags_TITLE = "NovaSky - All Tags";
export const Tags_DESCRIPTION =
  "NovaSky - All tags and the count of articles related to each tag";

// Tags Page Metadata, src/pages/tags/[tag]/[page].astro
export function getTagMetadata(tag: string) {
  return {
    title: `All articles on '${tag}' tag in NovaSky`,
    description: `Explore articles about ${tag} for different perspectives and in-depth analysis.`,
  };
}

// Category Page Metadata, src/pages/category/[category]/[page].astro
export function getCategoryMetadata(category: string) {
  return {
    title: `All articles in '${category}' category in NovaSky`,
    description: `Browse all articles under the ${category} category in NovaSky`,
  };
}

// Header Links, src/components/Header.astro
export const HeaderLinks = [
  { href: "/category/One/1/", title: "Blog Posts" },
];

// Footer Links, src/components/Footer.astro
export const FooterLinks = [
  { href: "https://sky.cs.berkeley.edu/", title: "Sky Computing Lab @ Berkeley" },
  { href: "/tags/", title: "Tags" },
];

// Social Links, src/components/Footer.astro
export const SocialLinks = [
  {
    href: "https://x.com/NovaSkyAI",
    icon: "tabler:brand-twitter",
    label: "Twitter",
  },
  {
    href: "https://github.com/NovaSky-AI",
    icon: "tabler:brand-github",
    label: "GitHub",
  },
];

// Search Page Metadata, src/pages/search.astro
export const SEARCH_PAGE_TITLE = `${SITE_TITLE} - Site Search`;
export const SEARCH_PAGE_DESCRIPTION = `Search all content on ${SITE_TITLE}`;
