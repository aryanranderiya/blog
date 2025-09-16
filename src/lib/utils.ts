export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const readTime = Math.ceil(words / wordsPerMinute);
  return readTime;
}

export function searchInContent(content: string, query: string): boolean {
  const normalizedContent = content.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  return normalizedContent.includes(normalizedQuery);
}

export function getAllTags(
  posts: Array<{ data: { tags?: string[] } }>
): string[] {
  const allTags = posts.flatMap((post) => post.data.tags || []);
  return [...new Set(allTags)].sort();
}
