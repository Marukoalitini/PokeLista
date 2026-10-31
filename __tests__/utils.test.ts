import { extractIdFromUrl, getOfficialArtworkUrl } from '../src/services/api';
import {
  capitalizeName,
  formatPokemonId,
  stripHtmlAndCleanText,
} from '../src/utils/textUtils';

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
