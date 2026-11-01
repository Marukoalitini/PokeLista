import axios from 'axios';

// Converts technical network or HTTP errors into friendly user-facing messages
export function getErrorMessage(
  error: unknown,
  fallback = 'Não foi possível comunicar com o servidor. Verifique sua conexão e tente novamente.'
): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'O servidor demorou muito para responder. Tente novamente em instantes.';
    }
    if (!error.response) {
      return 'Sem conexão com a internet ou servidor indisponível. Verifique sua rede e tente novamente.';
    }
    const status = error.response.status;
    if (status === 404) {
      return 'As informações solicitadas não foram encontradas na API.';
    }
    if (status >= 500) {
      return 'O servidor da PokéAPI está temporariamente instável. Tente novamente em alguns segundos.';
    }
  }

  return fallback;
}
