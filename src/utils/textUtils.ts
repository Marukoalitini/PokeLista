// Removes HTML tags and control characters from API text
export function stripHtmlAndCleanText(rawText: string | null | undefined): string {
  if (!rawText) {
    return '';
  }

  return rawText
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[\f\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatPokemonId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

export function capitalizeName(text: string): string {
  if (!text) {
    return '';
  }
  return text
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
