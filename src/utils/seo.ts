export const updatePageTitle = (title: string) => {
  document.title = `${title} | OnlyThais`;
};

export const updateMetaDescription = (description: string) => {
  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }
};

export const updateOgTags = (title: string, description: string, image?: string) => {
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');

  if (ogTitle) ogTitle.setAttribute('content', title);
  if (ogDescription) ogDescription.setAttribute('content', description);
  if (ogImage && image) ogImage.setAttribute('content', image);
};
