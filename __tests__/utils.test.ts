import { extractIdFromUrl, getOfficialArtworkUrl } from '../src/services/api';
import {
  capitalizeName,
  formatPokemonId,
  stripHtmlAndCleanText,
} from '../src/utils/textUtils';
import { COLORS, getTypeColor } from '../src/utils/theme';

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const lum1 = getRelativeLuminance(foregroundHex);
  const lum2 = getRelativeLuminance(backgroundHex);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('Text and API utility functions', () => {
  it('removes HTML tags and control characters cleanly', () => {
    const rawHtml =
      '<p>Quando vários destes <b>POKéMON</b> se reúnem,\fsua eletricidade\npode causar tempestades.</p>';
    expect(stripHtmlAndCleanText(rawHtml)).toBe(
      'Quando vários destes POKéMON se reúnem, sua eletricidade pode causar tempestades.'
    );
  });

  it('formats Pokemon ID with 3 digits', () => {
    expect(formatPokemonId(1)).toBe('#001');
    expect(formatPokemonId(25)).toBe('#025');
    expect(formatPokemonId(150)).toBe('#150');
  });

  it('capitalizes hyphenated names', () => {
    expect(capitalizeName('mr-mime')).toBe('Mr Mime');
    expect(capitalizeName('pikachu')).toBe('Pikachu');
  });

  it('extracts numeric ID from PokeAPI resource URL', () => {
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/1/')).toBe(1);
  });

  it('returns official artwork URL for valid IDs', () => {
    expect(getOfficialArtworkUrl(25)).toContain('/official-artwork/25.png');
    expect(getOfficialArtworkUrl(0)).toBeNull();
  });
});

describe('Accessibility WCAG 2.1 contrast validation', () => {
  it('ensures primary, secondary, and muted text meet WCAG AA contrast (>= 4.5:1) against surfaces', () => {
    expect(getContrastRatio(COLORS.textPrimary, COLORS.surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(COLORS.textPrimary, COLORS.background)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(COLORS.textSecondary, COLORS.surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(COLORS.textSecondary, COLORS.background)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(COLORS.textMuted, COLORS.surface)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(COLORS.white, COLORS.primary)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(COLORS.error, COLORS.errorBackground)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(COLORS.success, COLORS.successBackground)).toBeGreaterThanOrEqual(4.5);
  });

  it('ensures Pokemon type badges maintain readable contrast (>= 4.5:1)', () => {
    const types = ['fire', 'water', 'grass', 'electric', 'psychic', 'dragon', 'fairy'];
    types.forEach((type) => {
      const palette = getTypeColor(type);
      expect(getContrastRatio(palette.text, palette.bg)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
