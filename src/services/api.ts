import axios from 'axios';
import { PokemonDetails, PokemonListItem } from '../types/pokemon';
import { capitalizeName, stripHtmlAndCleanText } from '../utils/textUtils';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://pokeapi.co/api/v2';
const GRAPHQL_SEARCH_URL = 'https://beta.pokeapi.co/graphql/v1beta';

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

interface GraphQLPokemonSearchResult {
  data?: {
    pokemon_v2_pokemon?: Array<{
      id: number;
      name: string;
    }>;
  };
  errors?: Array<{ message: string }>;
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

// Queries the PokeAPI search endpoints directly with the search term and propagates network errors
export async function searchPokemon(query: string): Promise<PokemonListItem[]> {
  const normalizedQuery = query.trim().toLowerCase().replace(/^#/, '');
  if (!normalizedQuery) {
    return [];
  }

  const numericId = Number(normalizedQuery);
  const isNumericSearch = !Number.isNaN(numericId) && numericId > 0;

  if (isNumericSearch) {
    try {
      const exactResponse = await apiClient.get(
        `/pokemon/${encodeURIComponent(String(numericId))}`
      );
      const exactData = exactResponse.data;
      return [
        {
          id: exactData.id,
          name: capitalizeName(exactData.name),
          imageUrl:
            exactData.sprites?.other?.['official-artwork']?.front_default ||
            exactData.sprites?.front_default ||
            getOfficialArtworkUrl(exactData.id),
        },
      ];
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return [];
      }
      throw err;
    }
  }

  const graphqlResponse = await axios.post<GraphQLPokemonSearchResult>(
    GRAPHQL_SEARCH_URL,
    {
      query: `
        query SearchPokemonByName($pattern: String!) {
          pokemon_v2_pokemon(
            where: { name: { _ilike: $pattern }, is_default: { _eq: true } }
            order_by: { id: asc }
          ) {
            id
            name
          }
        }
      `,
      variables: {
        pattern: `%${normalizedQuery}%`,
      },
    },
    { timeout: 10000 }
  );

  if (graphqlResponse.data?.errors?.length) {
    throw new Error(graphqlResponse.data.errors[0].message);
  }

  const matchedList = graphqlResponse.data?.data?.pokemon_v2_pokemon;
  if (!Array.isArray(matchedList)) {
    throw new Error('Invalid search response from server.');
  }

  return matchedList.map((entry) => ({
    id: entry.id,
    name: capitalizeName(entry.name),
    imageUrl: getOfficialArtworkUrl(entry.id),
  }));
}
