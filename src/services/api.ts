import axios from 'axios';
import { PokemonDetails, PokemonListItem } from '../types/pokemon';
import { capitalizeName, stripHtmlAndCleanText } from '../utils/textUtils';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://pokeapi.co/api/v2';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
});

interface PokeApiNamedResource {
  name: string;
  url: string;
}

interface PokeApiListResponse {
  count: number;
  next: string | null;
  results: PokeApiNamedResource[];
}

// Extracts Pokemon ID from resource URL
export function extractIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  const lastSegment = parts[parts.length - 1];
  const parsed = Number(lastSegment);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getOfficialArtworkUrl(id: number): string | null {
  if (!id || id <= 0) {
    return null;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function mapResourceToListItem(resource: PokeApiNamedResource): PokemonListItem {
  const id = extractIdFromUrl(resource.url);
  return {
    id,
    name: capitalizeName(resource.name),
    imageUrl: getOfficialArtworkUrl(id),
  };
}

// Fetches paginated list of Pokemon for the catalog
export async function fetchPokemonPage(
  offset: number,
  limit = 20
): Promise<{ items: PokemonListItem[]; hasMore: boolean }> {
  const response = await apiClient.get<PokeApiListResponse>('/pokemon', {
    params: { offset, limit },
  });

  const items = response.data.results.map(mapResourceToListItem);
  const hasMore = Boolean(response.data.next);

  return { items, hasMore };
}

// Fetches full details and species description for a single Pokemon
export async function fetchPokemonDetails(id: number): Promise<PokemonDetails> {
  const [pokemonRes, speciesRes] = await Promise.all([
    apiClient.get(`/pokemon/${id}`),
    apiClient.get(`/pokemon-species/${id}`).catch(() => null),
  ]);

  const data = pokemonRes.data;
  const speciesData = speciesRes?.data;

  const officialArtwork =
    data.sprites?.other?.['official-artwork']?.front_default ||
    data.sprites?.front_default ||
    getOfficialArtworkUrl(data.id);

  let rawDescription = '';
  let rawGenus = '';

  if (speciesData?.flavor_text_entries) {
    const ptEntry = speciesData.flavor_text_entries.find(
      (entry: { language: { name: string }; flavor_text: string }) =>
        entry.language?.name === 'pt-BR' || entry.language?.name === 'pt'
    );
    const enEntry = speciesData.flavor_text_entries.find(
      (entry: { language: { name: string }; flavor_text: string }) =>
        entry.language?.name === 'en'
    );
    rawDescription = ptEntry?.flavor_text || enEntry?.flavor_text || '';
  }

  if (speciesData?.genera) {
    const ptGenus = speciesData.genera.find(
      (entry: { language: { name: string }; genus: string }) =>
        entry.language?.name === 'pt-BR' || entry.language?.name === 'pt'
    );
    const enGenus = speciesData.genera.find(
      (entry: { language: { name: string }; genus: string }) =>
        entry.language?.name === 'en'
    );
    rawGenus = ptGenus?.genus || enGenus?.genus || '';
  }

  return {
    id: data.id,
    name: capitalizeName(data.name),
    imageUrl: officialArtwork || null,
    heightInMeters: (data.height || 0) / 10,
    weightInKg: (data.weight || 0) / 10,
    types: (data.types || []).map((t: { type: { name: string } }) =>
      capitalizeName(t.type.name)
    ),
    abilities: (data.abilities || []).map((a: { ability: { name: string } }) =>
      capitalizeName(a.ability.name)
    ),
    stats: (data.stats || []).map((s: { base_stat: number; stat: { name: string } }) => ({
      name: capitalizeName(s.stat.name),
      baseStat: s.base_stat,
    })),
    description:
      stripHtmlAndCleanText(rawDescription) ||
      'Descrição detalhada não disponível para este Pokémon.',
    genus: stripHtmlAndCleanText(rawGenus) || 'Pokémon',
  };
}

let cachedSearchIndex: PokemonListItem[] | null = null;

// Searches Pokemon by name or ID and returns a list of matches
export async function searchPokemon(query: string): Promise<PokemonListItem[]> {
  const normalizedQuery = query.trim().toLowerCase().replace(/^#/, '');
  if (!normalizedQuery) {
    return [];
  }

  if (!cachedSearchIndex) {
    const response = await apiClient.get<PokeApiListResponse>('/pokemon', {
      params: { limit: 1025, offset: 0 },
    });
    cachedSearchIndex = response.data.results.map(mapResourceToListItem);
  }

  const matches = cachedSearchIndex.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(normalizedQuery);
    const idMatch =
      String(item.id) === normalizedQuery ||
      String(item.id).padStart(3, '0') === normalizedQuery;
    return nameMatch || idMatch;
  });

  return matches.slice(0, 40);
}
