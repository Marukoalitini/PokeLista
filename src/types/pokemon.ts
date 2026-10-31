export interface PokemonStat {
  name: string;
  baseStat: number;
}

export interface PokemonListItem {
  id: number;
  name: string;
  imageUrl: string | null;
}

export interface PokemonDetails extends PokemonListItem {
  heightInMeters: number;
  weightInKg: number;
  types: string[];
  abilities: string[];
  stats: PokemonStat[];
  description: string;
  genus: string;
}

export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface ConsumedPokemon extends PokemonListItem {
  rating: RatingValue;
  consumedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface StoredUserRecord extends User {
  passwordHash: string;
}
