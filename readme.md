# PokéLista

Catálogo interativo de Pokémon desenvolvido em **React Native com Expo**, consumindo a
[PokéAPI](https://pokeapi.co/). O usuário cria uma conta, percorre a Pokédex com rolagem
infinita, busca por nome ou número, consulta a ficha de cada Pokémon, marca os favoritos e
registra os capturados com uma nota de 1 a 5 estrelas. Tudo continua salvo depois que o
aplicativo é fechado.

Projeto somativo da disciplina de Desenvolvimento Mobile Híbrido, PUCPR, Bacharelado em
Sistemas de Informação, 6º período.

---

## Funcionalidades

- Cadastro e login locais, com a senha protegida por hash SHA-256 e nunca gravada em texto puro
- Sessão persistente entre reinícios do aplicativo, com botão de logout
- Catálogo em grade de duas colunas, com rolagem infinita e atualização por gesto
- Busca por nome, parte do nome ou número da Pokédex, com lista de resultados
- Tela de detalhes com arte oficial, tipos, habilidades, atributos base e descrição da espécie
- Favoritos compartilhados entre as telas por Context API
- Capturados com avaliação de 1 a 5 estrelas e data do registro
- Coleções separadas por conta, de modo que duas pessoas no mesmo aparelho não veem a lista uma da outra
- Indicadores de carregamento, mensagens de erro amigáveis e botão de tentar novamente
- Rótulos e estados de acessibilidade, áreas de toque de 44 pontos e suporte à fonte ampliada do sistema

---

## Requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- Aplicativo **Expo Go** no celular, ou um emulador Android ou um simulador iOS

Não é necessário instalar o Expo CLI globalmente. O comando `npx expo` baixa o que for preciso.

---

## Como rodar

```bash
git clone https://github.com/Marukoalitini/PokeLista.git
cd PokeLista
npm install
npx expo start
```

Com o servidor no ar:

| Onde rodar | O que fazer |
| --- | --- |
| Celular | Ler o QR Code do terminal com o aplicativo Expo Go |
| Android | Pressionar `a` no terminal |
| iOS | Pressionar `i` no terminal |
| Navegador | Pressionar `w` no terminal |

No celular, o computador e o aparelho precisam estar na mesma rede Wi-Fi. Se a conexão não for
estabelecida, rode `npx expo start --tunnel`.

---

## Variáveis de ambiente

O projeto roda sem nenhuma configuração, porque a PokéAPI é pública e não exige chave de
acesso. A base da API pode ser trocada por variável de ambiente, caso necessário:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_API_BASE_URL=https://pokeapi.co/api/v2
```

O arquivo `.env` está no `.gitignore` e não é versionado. O `.env.example` contém apenas a URL
pública, sem nenhum segredo.

---

## Outros comandos

```bash
npm test            # testes com Jest
npm run typecheck   # verificação de tipos do TypeScript
npm run android     # abre direto no Android
npm run ios         # abre direto no iOS
npm run web         # abre no navegador
```

A suíte de testes cobre as funções de texto e de API e valida a razão de contraste das cores do
tema segundo a WCAG AA, com o mínimo de 4,5:1 entre texto e fundo, inclusive nos badges de tipo
de Pokémon.

---

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Framework | React Native 0.76.9 com Expo SDK 52 |
| Linguagem | TypeScript |
| Navegação | React Navigation 7, com Native Stack e Bottom Tabs |
| Requisições | Axios |
| Estado global | Context API com hooks customizados |
| Persistência | AsyncStorage para as coleções e Expo SecureStore para credenciais e sessão |
| Hash de senha | Expo Crypto, SHA-256 |
| Ícones | @expo/vector-icons |

---

## Estrutura do projeto

```
src/
├── components/    componentes reutilizáveis (ItemCard, StarRating, EmptyState, ErrorState)
├── contexts/      estado global (AuthContext, FavoritesContext, ConsumedContext)
├── hooks/         hooks customizados (useFetch, com os estados de dados, carregamento e erro)
├── navigation/    navegação condicional por sessão e navegador de abas
├── screens/       telas (Login, Catalog, Details, Search, Favorites, Captured)
├── services/      acesso à API (api.ts) e ao armazenamento local (storage.ts)
├── types/         tipos do domínio, das rotas e das variáveis de ambiente
└── utils/         tema, tratamento de texto, mensagens de erro e hash de senha
__tests__/         testes com Jest, incluindo a validação de contraste
```

---

## Como a API é consumida

| Finalidade | Endpoint |
| --- | --- |
| Listagem paginada | `GET /pokemon?offset=&limit=` |
| Detalhe do Pokémon | `GET /pokemon/{id}` |
| Dados da espécie | `GET /pokemon-species/{id}` |
| Busca por número | `GET /pokemon/{id}` |
| Busca por nome | `POST https://beta.pokeapi.co/graphql/v1beta` |
| Arte oficial | URL montada a partir do ID, no repositório de sprites da PokéAPI |

O catálogo carrega vinte Pokémon por página. O deslocamento só avança depois de uma resposta
bem-sucedida, e o campo `next` da resposta indica se ainda existe outra página. A ficha de
detalhes combina as consultas do Pokémon e da espécie em paralelo.

---

## Integrantes

- Edmund Soares de Sousa
- Marco Alija Ramos Agostini
- Pedro Henrique Silva Guligurski
- Richard Mickaell Santos Nascimento

---

## Créditos

Dados fornecidos pela [PokéAPI](https://pokeapi.co/). Projeto acadêmico sem fins comerciais.
Pokémon é marca registrada de Nintendo, Game Freak e Creatures.