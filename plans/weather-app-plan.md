# Plano Técnico: Weather App

Este plano deriva de `specs/weather-app-spec.md`. A especificação é a fonte de verdade; itens nela marcados como pendentes continuam sujeitos à aprovação e não são tratados aqui como requisitos fechados.

## Architecture

Aplicação web client-side, sem backend próprio, autenticação ou banco de dados. A arquitetura separa apresentação, coordenação de estado, acesso externo e transformações puras:

- **Interface React:** busca e seleção de localidade, clima atual, alternância da previsão horária/diária, seletor de unidade e estados de carregamento, vazio e erro.
- **Hook de aplicação (`useWeather`):** coordena busca, seleção, consulta meteorológica, retry e estado visível da tela.
- **Serviço meteorológico (`weatherService`):** encapsula geocoding, forecast, timeout e normalização das respostas da Open-Meteo para tipos internos.
- **Lógica pura (`lib/`):** conversão e formatação de temperaturas, datas, horários, idade do dado observado e códigos de condição.
- **Tipos de domínio (`types/`):** contratos normalizados independentes do formato JSON externo.

O navegador chama diretamente as APIs públicas da Open-Meteo. Não há segredo de API para proteger nem persistência de histórico/preferências no servidor da aplicação. Logs e retenção pelo provedor externo continuam pendentes de validação.

## Tech Stack

| Área | Decisão | Motivo |
|---|---|---|
| Linguagem | TypeScript em modo strict | Tipar contratos de domínio e respostas normalizadas. |
| Interface | React 19 | Stack já adotada pelo repositório. |
| Build e desenvolvimento | Vite | Ferramentas e scripts já configurados. |
| Estilos | Tailwind CSS | Stack e convenções existentes. |
| Testes unitários/componentes | Vitest, Testing Library e `user-event` | Dependências já instaladas; cobrem lógica e fluxos de UI. |
| Testes E2E | Playwright | Dependência e configuração já existentes. |
| Lint/format | Biome | Ferramenta já configurada no repositório. |
| Dados | Open-Meteo Geocoding e Forecast APIs | Decisão do discovery; sem API key. |

Não adicionar biblioteca de estado global, backend ou cache persistente na primeira versão. Usar `fetch`, estado local React e utilitários já presentes; reavaliar somente se os requisitos aprovados exigirem outra capacidade.

## Project Structure

Manter a estrutura atual e distribuir responsabilidades sem criar camadas adicionais:

| Caminho | Responsabilidade |
|---|---|
| `src/App.tsx` | Compor a tela e conectar componentes ao hook principal. |
| `src/components/SearchBar.tsx` | Capturar e submeter texto de busca; expor estado e mensagens acessíveis. |
| `src/components/CurrentWeather.tsx` | Exibir localidade, condições atuais, horário observado e aviso de dado desatualizado/idade desconhecida. |
| `src/components/ForecastList.tsx` | Alternar visualização horária/diária e apresentar os cinco dias locais. |
| `src/components/ForecastCard.tsx` | Apresentar um item diário da previsão. |
| `src/components/UnitToggle.tsx` | Selecionar Celsius ou Fahrenheit. |
| `src/components/states/` | Estados de carregamento, vazio e erro, incluindo nova tentativa. |
| `src/hooks/useWeather.ts` | Orquestrar busca, seleção, carregamento, retry e estado da tela. |
| `src/services/weatherService.ts` | Cliente Open-Meteo, timeout, parsing e normalização de dados. |
| `src/lib/temperature.ts` | Conversão e arredondamento de temperatura. |
| `src/lib/format.ts` | Formatação pt-BR de datas, horários e valores. |
| `src/lib/weatherCodes.ts` | Converter códigos meteorológicos para rótulos pt-BR. |
| `src/types/weather.ts` | Tipos normalizados compartilhados. |
| `tests/unit/` | Testes de lógica, serviço e componentes. |
| `tests/e2e/` | Testes dos fluxos principais no navegador. |

Os caminhos refletem os diretórios existentes; o detalhamento de componentes pode ser ajustado na decomposição de tarefas, sem alterar os contratos abaixo.

## Data Model

Os tipos externos da Open-Meteo não devem atravessar a fronteira do service. Normalizar coordenadas, horários e unidades no serviço antes de atualizar o estado da aplicação.

```ts
type TemperatureUnit = "celsius" | "fahrenheit";
type ForecastView = "hourly" | "daily";

interface City {
  id?: number;
  name: string;
  adminRegion?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface WeatherCondition {
  code: number;
  descriptionPtBr: string;
}

interface CurrentWeather {
  temperatureCelsius: number | null;
  condition: WeatherCondition | null;
  observedAt: string | null;
  freshness: "current" | "stale" | "unknown";
}

interface HourlyForecast {
  time: string;
  temperatureCelsius: number | null;
  condition: WeatherCondition | null;
}

interface DailyForecast {
  localDate: string;
  minimumCelsius: number | null;
  maximumCelsius: number | null;
  condition: WeatherCondition | null;
}

interface WeatherSnapshot {
  city: City;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  timezone: string;
}
```

Contrato do serviço, em nível conceitual:

```ts
searchCities(query: string, context?: LocationContext): Promise<City[]>;
getWeather(city: City, signal?: AbortSignal): Promise<WeatherSnapshot>;
```

`LocationContext` representa apenas filtros de localização confirmados para a busca; países, regiões e estratégia de desambiguação ainda dependem de uma decisão da spec. A unidade é mantida na camada de apresentação: os dados normalizados permanecem em Celsius e a conversão ocorre ao renderizar. A previsão diária deve conter cinco datas locais; a cobertura horária pode ser parcial e não deve ser preenchida artificialmente.

Os estados de operação da tela são `idle`, `loading`, `success`, `empty` e `error`; busca e consulta meteorológica são discriminadas pela propriedade `operation`, não por novos estados públicos.

## Data Flow

1. O usuário envia uma busca. A interface remove espaços externos; se o valor ficar vazio, mostra validação local e não chama a API.
2. `useWeather` chama `searchCities`. O service faz URL encoding, envia a busca ao Geocoding API, aplica timeout e normaliza os resultados.
3. Lista vazia vira estado `empty`. Resultados ambíguos ou sem contexto suficiente pedem estado/região/país; nenhuma cidade é inferida ou selecionada automaticamente.
4. Ao selecionar uma cidade, a UI envia as coordenadas ao service. Um único pedido ao Forecast API solicita clima atual, horários e resumo diário para os cinco dias locais.
5. O service valida a resposta e normaliza `current`, `hourly`, `daily` e `timezone`. Campos ausentes permanecem `null`; resposta malformada vira `invalidResponse`.
6. `useWeather` apresenta o snapshot. Dados observados com mais de 168 horas recebem estado `stale`; sem timestamp, recebem `unknown`.
7. O seletor horário/diário altera somente a projeção apresentada. O seletor Celsius/Fahrenheit converte valores em memória, sem nova chamada à API.
8. Se uma nova busca/seleção ocorrer enquanto uma solicitação anterior está pendente, cancelar a anterior quando possível ou ignorar sua resposta tardia, para não substituir o resultado da seleção mais recente.

## External APIs

### Geocoding

- **URL:** `https://geocoding-api.open-meteo.com/v1/search`
- **Método:** `GET`.
- **Parâmetros:** `name` (obrigatório, nome pesquisado), `count=10` (limite de resultados), `language=pt` (idioma de nomes, código ISO 639-1) e `format=json`. `countryCode` pode filtrar por país depois de a cobertura geográfica ser definida; estado/região não é um parâmetro de filtro equivalente garantido pelo endpoint.
- **Exemplo de URL:** `https://geocoding-api.open-meteo.com/v1/search?name=Buenos%20Aires&count=10&language=pt&format=json`
- **Exemplo resumido de resposta:**

```json
{
  "results": [
    {
      "id": 3435910,
      "name": "Buenos Aires",
      "latitude": -34.61,
      "longitude": -58.38,
      "country": "Argentina",
      "country_code": "AR",
      "admin1": "Buenos Aires",
      "timezone": "America/Argentina/Buenos_Aires"
    }
  ],
  "generationtime_ms": 0.2
}
```

- **Mapeamento:** `results[].id` -> `City.id`; `name` -> `City.name`; `admin1` -> `City.adminRegion`; `country` -> `City.country`; `latitude`/`longitude` -> coordenadas de `City`; `timezone` -> `City.timezone`. Não persistir o objeto bruto.
- `results` ausente ou vazio numa resposta HTTP bem-sucedida significa nenhuma correspondência e mapeia para `City[]` vazio. Erro de rede/HTTP é outro estado, não “cidade inexistente”.
- Codificar `name` como parâmetro URL, preservando acentos, hífens e apóstrofos. Usar `countryCode` como filtro somente quando o usuário fornecer contexto e o suporte correspondente estiver definido.

### Forecast

- **URL:** `https://api.open-meteo.com/v1/forecast`
- **Método:** `GET`.
- **Parâmetros:** `latitude` e `longitude` da cidade selecionada; `timezone=auto`; `forecast_days=5`; `temperature_unit=celsius`; `current=temperature_2m,weather_code`; `hourly=temperature_2m,weather_code`; `daily=weather_code,temperature_2m_min,temperature_2m_max`.
- **Exemplo de URL:** `https://api.open-meteo.com/v1/forecast?latitude=-34.61&longitude=-58.38&timezone=auto&forecast_days=5&temperature_unit=celsius&current=temperature_2m%2Cweather_code&hourly=temperature_2m%2Cweather_code&daily=weather_code%2Ctemperature_2m_min%2Ctemperature_2m_max`
- **Exemplo resumido de resposta:**

```json
{
  "latitude": -34.6,
  "longitude": -58.38,
  "timezone": "America/Argentina/Buenos_Aires",
  "utc_offset_seconds": -10800,
  "current_units": { "temperature_2m": "°C", "weather_code": "wmo code" },
  "current": {
    "time": "2026-11-05T12:00",
    "temperature_2m": 18.4,
    "weather_code": 3
  },
  "hourly_units": { "temperature_2m": "°C", "weather_code": "wmo code" },
  "hourly": {
    "time": ["2026-11-05T12:00", "2026-11-05T13:00"],
    "temperature_2m": [18.4, 19.1],
    "weather_code": [3, 2]
  },
  "daily_units": {
    "temperature_2m_min": "°C",
    "temperature_2m_max": "°C",
    "weather_code": "wmo code"
  },
  "daily": {
    "time": ["2026-11-05", "2026-11-06"],
    "temperature_2m_min": [12.1, 13.0],
    "temperature_2m_max": [21.0, 22.2],
    "weather_code": [3, 1]
  }
}
```

- **Mapeamento para `WeatherSnapshot`:** resposta `timezone` -> `WeatherSnapshot.timezone`; resultado selecionado do geocoding -> `WeatherSnapshot.city`.
- **Mapeamento para `CurrentWeather`:** `current.temperature_2m` -> `temperatureCelsius`; `current.weather_code` -> `condition.code`; `current.time` -> `observedAt`; `freshness` é calculado pela aplicação comparando o timestamp com UTC e o limite de 168 horas da spec. `weather_code` é convertido para `descriptionPtBr` por uma tabela local de códigos WMO.
- **Mapeamento para `HourlyForecast[]`:** `hourly.time`, `hourly.temperature_2m` e `hourly.weather_code` são arrays paralelos; combinar valores pelo mesmo índice em `{ time, temperatureCelsius, condition }`. Datas/horários usam `timezone` retornado.
- **Mapeamento para `DailyForecast[]`:** combinar por índice `daily.time`, `daily.temperature_2m_min`, `daily.temperature_2m_max` e `daily.weather_code` em `{ localDate, minimumCelsius, maximumCelsius, condition }`. A resposta deve cobrir cinco datas locais.
- Validar que arrays paralelos tenham comprimentos compatíveis. Valor nulo, ausente ou inconsistente vira `null` no campo correspondente; nunca converter ausência em zero ou fabricar registros. Resposta malformada vira `invalidResponse`.
- `temperature_unit=celsius` mantém o modelo normalizado em Celsius. A troca para Fahrenheit é feita na apresentação; validar os valores com `current_units`, `hourly_units` e `daily_units`.
- `weather_code` é um código WMO, não uma descrição textual; mapear códigos conhecidos para pt-BR e tratar códigos desconhecidos com descrição indisponível, preservando o código numérico.
- Não depender de chave de API. Confirmar limites, cobertura, condições de uso e semântica/disponibilidade dos timestamps do provedor antes do aceite operacional.

## State Management

O estado da aplicação vive em `useWeather`, sem store global. Os componentes recebem estado/ações por props; o campo de texto pode manter apenas seu rascunho local até o submit. `useWeather` coordena query submetida, resultados de cidade, seleção atual, snapshot meteorológico e operação em curso.

```ts
type Operation = "geocoding" | "forecast";

type WeatherErrorKind = "network" | "api" | "timeout" | "invalidResponse";

interface WeatherError {
  kind: WeatherErrorKind;
  messagePtBr: string;
  httpStatus?: number;
  retryAfterSeconds?: number;
}

type WeatherState =
  | { status: "idle" }
  | { status: "loading"; operation: Operation; query?: string; city?: City }
  | {
      status: "success";
      result:
        | { kind: "cities"; query: string; cities: City[] }
        | { kind: "weather"; data: WeatherSnapshot };
    }
  | { status: "empty"; operation: "geocoding"; query: string; needsContext: boolean }
  | { status: "error"; operation: Operation; error: WeatherError };

interface WeatherViewState {
  unit: TemperatureUnit;
  forecastView: ForecastView;
}
```

- `idle`: nenhuma busca/consulta iniciada; `loading`: geocoding ou forecast pendente; `success`: lista de cidades ou snapshot carregado; `empty`: geocoding bem-sucedido sem correspondências; `error`: falha de transporte, API ou parsing. Uma resposta parcial válida continua em `success`, com campos ausentes como `null`.
- `WeatherViewState` vive no mesmo hook, mas separado do resultado do serviço. Valores do domínio são sempre mantidos em Celsius. A seleção de unidade apenas atualiza `unit`; durante a renderização, uma função pura recebe `temperatureCelsius` e `unit` e deriva o valor exibido. Essa ação não altera o snapshot e não chama `weatherService`, portanto não cria nova requisição.
- Unidade inicial `celsius`; visualização inicial `hourly`, conforme a spec. Enquanto persistência local não for decidida, preferências e cidade duram apenas na sessão e não são gravadas em `localStorage` ou no servidor.
- Não manter histórico de buscas nem enviar preferências ao servidor da aplicação. A cidade necessária à consulta é enviada à Open-Meteo; retenção pelo provedor permanece fora da garantia do app.
- Cancelar pedidos obsoletos com `AbortController` quando possível; respostas tardias devem ser ignoradas. Cancelamento não é erro apresentado ao usuário.

## Error Handling

Todas as falhas são convertidas pelo service em `WeatherError`, mantendo detalhes técnicos (URL, payload e stack) fora da mensagem visível. O hook escolhe entre `error` e `empty`; a UI mostra mensagens pt-BR e preserva query/cidade selecionada quando aplicável.

| Categoria | Exemplos e tratamento | Estado/UX e retry |
|---|---|---|
| **Rede** | Falha de `fetch`, offline ou conexão interrompida. | `error/network`; informar indisponibilidade, manter a busca ou cidade e não apresentar snapshot antigo como atual. AC-08.2 prevê no máximo um retry automático. |
| **API** | HTTP 5xx, HTTP 429 e demais 4xx são classificados pelo status. | 5xx: `error/api`, retry conforme AC-08.2. 429: `error/api`, respeitar `Retry-After`; sem cabeçalho, permitir retry manual “mais tarde”, sem intervalo definido. Outros 4xx, exceto 408/429: não repetir automaticamente; informar erro em pt-BR e permitir corrigir a busca. |
| **Timeout** | Geocoding excede 5 s ou forecast excede 10 s, contados do envio até resposta completa; cancelar a tentativa. | `error/timeout`; mensagem de tempo excedido e no máximo um retry automático após 1 s, conforme AC-08.3. HTTP 408 não tem comportamento explicitamente coberto pelos ACs e deve ser resolvido antes de fechar os testes. |
| **Resposta parcial** | HTTP/resposta válida, mas faltam valores ou séries têm tamanhos diferentes. | Permanece `success`; mapear ausentes para `null`, marcar como indisponíveis e exibir somente valores disponíveis. Não preencher com zero, não estimar e não repetir automaticamente por parcialidade. |
| **Resposta inválida** | JSON inválido, estrutura inesperada ou timezone/campos estruturais impossíveis de mapear. | `error/invalidResponse`; mensagem genérica de falha em pt-BR, detalhe técnico apenas em diagnóstico interno; retry manual pode ser oferecido, sem retry automático definido. |
| **Geocoding sem resultados** | HTTP 200 com `results` vazio. | `empty`, não `error`; pedir estado/região/país se faltar contexto, não chamar forecast e manter a busca editável. |
| **Dados antigos** | Timestamp de observação excede 168 h ou está ausente. | Resultado continua `success`, com `freshness=stale` ou `unknown`; mostrar aviso/data quando disponível, nunca rotular como atual sem ressalva. |

**Política pendente:** AC-08.2 determina `Retry-After` quando fornecido e 1 s caso contrário; Edge Cases/Assumptions fixam 1 s para 5xx. Aplicar a regra de AC-08.2 como referência provisória, mas reconciliar essa divergência e definir um intervalo para 429 sem `Retry-After` antes de considerar os testes de retry definitivos.

Todas as mensagens visíveis são pt-BR. Erros de rede, provider e parsing devem ser diferenciados internamente para telemetria sem enviar histórico ou preferências; escopo de logs e retenção externa requer aprovação (Open Questions, item 8 da revisão).

## Testing Strategy

- **Vitest — funções puras (`lib/`):** conversão Celsius/Fahrenheit, incluindo `20 °C = 68 °F`; valores `null`; arredondamento; formatação pt-BR; conversão de códigos WMO, inclusive código desconhecido; normalização de geocoding/forecast; associação dos arrays por índice e arrays com tamanhos divergentes; cálculo de freshness nos limites exatos de 168 horas e timestamp ausente.
- **Vitest — services (`services/`):** mockar `fetch` e verificar método, URL, parâmetros e normalização. Cobrir geocoding com resultados, vazio e múltiplas cidades; forecast completo e parcial; JSON inválido; falha de rede; HTTP 4xx, 408, 429 com e sem `Retry-After`, 5xx; timeout por endpoint com fake timers; retry, cancelamento e descarte de resposta obsoleta. Não chamar a Open-Meteo real nesses testes.
- **Vitest + Testing Library — componentes/hooks:** para busca, resultados, clima atual, previsão e `useWeather`, verificar os estados explícitos `idle`, `loading`, `success`, `empty` e `error`; acessibilidade básica por roles/names; input vazio sem request; resultado ambíguo sem seleção automática; retry; resposta parcial; avisos de freshness; alternância hourly/daily e Celsius/Fahrenheit. Mockar o service para controlar cada transição.
- **Playwright — fluxo E2E principal:** interceptar os endpoints com fixtures; preencher busca, selecionar uma cidade, consultar clima atual, navegar entre previsão horária/diária e alternar a unidade; validar datas locais, rótulos e que alternar unidade não dispara novo request.
- **Playwright — cenários de falha:** geocoding vazio solicita contexto; rede/timeout/429/5xx mostram a mensagem correta e permitem a ação prevista; resposta parcial mostra campos indisponíveis; input vazio não chama endpoint. Cada teste confirma o número e o momento das requisições conforme a política aprovada.
- **Playwright — mobile:** executar o fluxo principal em viewport de referência `390 × 844` como smoke-test de layout e interação, além do desktop. Pode-se incluir `320 px` como teste exploratório baseado na proposta de NFR-01; nem o viewport nem a compatibilidade são matriz oficial até aprovação do item 9 e NFR-01.
- **Acessibilidade:** validar nomes acessíveis, foco/teclado e estados anunciados com testes automatizados; auditoria manual e meta WCAG dependem da aprovação de NFR-02.
- **Rastreabilidade e integração:** associar cada teste de aceite ao AC correspondente e usar a tabela `Rastreabilidade` para cobertura US/AC/NFR. Um teste opcional de contrato contra a API real pode rodar separadamente e não bloquear a suíte, evitando flakiness por disponibilidade, rate limit ou mudança de dados externos.

## Risks & Trade-offs

- **Estado local React vs. store global:** `useWeather` e estado local reduzem dependências e tornam o fluxo fácil de testar. Redux/Zustand seriam alternativas se houver várias telas ou muitos consumidores independentes, mas aumentam configuração e superfície de estado sem necessidade atual.
- **Conversão no cliente vs. nova consulta por unidade:** manter Celsius no snapshot e derivar Fahrenheit na renderização evita latência e chamadas extras. Pedir ambas as unidades à API ou consultar novamente simplificaria algumas conversões no front, mas duplica dados ou cria requests desnecessários e risco de divergência.
- **API direta do browser vs. backend/proxy:** chamadas diretas são simples e não exigem chave secreta para este provedor; proxy permitiria controle central de cache, rate limit e logs, mas adiciona infraestrutura e pode assumir responsabilidades de retenção ainda não aprovadas. Reavaliar se limites ou política de privacidade exigirem.
- **Fixtures mockadas vs. E2E dependente da API real:** fixtures deixam cenários repetíveis e cobrem erros raros; um teste real pode encontrar incompatibilidade de contrato, mas é flakey e sujeito a limites. Manter teste real opcional, separado e não bloqueante.
- **Timeout/retry fixos vs. backoff configurável:** limites simples de 5 s/10 s e um retry são fáceis de especificar e testar. Backoff exponencial com jitter é alternativa para serviços de alto volume, mas aumenta complexidade e diverge dos critérios atuais. Resolver a inconsistência entre AC-08.2 e Assumptions/Edge Cases antes de congelar os testes.
- **Exibir dados parciais vs. rejeitar a resposta inteira:** mostrar campos disponíveis preserva utilidade; descartar tudo evita uma visão inconsistente. A spec escolhe exibição parcial com `null` explícito; campos obrigatórios e política para previsão sem nenhum registro ainda precisam de definição.
- **Horário do provedor (`timezone=auto`) vs. fuso do dispositivo:** o fuso da cidade atende previsões locais para viagem; fuso do dispositivo seria mais simples, mas pode rotular datas/horários da cidade incorretamente. Usar fuso retornado e manter formato regional como pendência.
- **Metas de produção e viewport:** NFR-01 a NFR-04 e matriz oficial de dispositivos ainda não foram aprovados. O viewport mobile indicado na estratégia é apenas smoke-test, não compromisso de compatibilidade.
- **Público e privacidade de terceiros:** personas continuam hipóteses; a API direta envia a localização pesquisada ao provedor, cujos logs/retenção não são controlados pelo app (item 8 pendente). Validar público e privacidade antes de declarar cobertura de produção.