/**
 * Contratos de domínio compartilhados do Weather App.
 *
 * Decisão de arquitetura: as temperaturas são sempre armazenadas em Celsius
 * internamente e convertidas apenas na camada de apresentação. Assim, a troca
 * de unidade (C/F) nunca dispara um novo request.
 */

export type Unit = 'celsius' | 'fahrenheit';

export type ForecastView = 'hourly' | 'daily';

export type Freshness = 'current' | 'stale' | 'unknown';

export type WeatherOperation = 'geocoding' | 'forecast';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export type WeatherErrorKind = 'network' | 'api' | 'timeout' | 'invalidResponse';

/** Erro normalizado para a camada de estado/UI. */
export interface WeatherError {
  kind: WeatherErrorKind;
  messagePtBr: string;
  httpStatus?: number;
  retryAfterSeconds?: number;
}

/** Localidade normalizada a partir do resultado de geocoding. */
export interface City {
  id?: number;
  name: string;
  country?: string;
  /** Campo admin1 da API, mantido por compatibilidade com os consumidores atuais. */
  admin1?: string;
  /** Nome normalizado da região administrativa, quando disponível. */
  adminRegion?: string;
  latitude: number;
  longitude: number;
  /** Fuso informado pelo geocoding, quando disponível. */
  timezone?: string;
}

/** Condição meteorológica derivada do código WMO. */
export interface WeatherCondition {
  code: number;
  descriptionPtBr: string;
}

/** Clima atual normalizado. Temperaturas são armazenadas em °C. */
export interface CurrentWeather {
  /** Temperatura a 2 m, em Celsius; null quando ausente na resposta. */
  temperature: number | null;
  /** Código WMO da condição atual. */
  weatherCode: number | null;
  /** Umidade relativa percentual. */
  humidity: number | null;
  /** Velocidade do vento em km/h. */
  windSpeed: number | null;
  /** Pressão de superfície em hPa. */
  pressure: number | null;
  /** Precipitação em mm. */
  precipitation: number | null;
  /** Timestamp local fornecido pela API. */
  time: string | null;
  /** Horário da observação, quando a fonte o fornece com essa semântica. */
  observedAt?: string | null;
  /** Freshness calculado pela aplicação quando o timestamp puder ser validado. */
  freshness?: Freshness;
  /** Descrição localizada, se já normalizada pelo service. */
  condition?: WeatherCondition | null;
}

/** Um dia da previsão diária. Temperaturas são armazenadas em °C. */
export interface ForecastDay {
  /** Data local no formato YYYY-MM-DD. */
  date: string;
  /** Temperatura mínima em Celsius, ou null se indisponível. */
  min: number | null;
  /** Temperatura máxima em Celsius, ou null se indisponível. */
  max: number | null;
  /** Código WMO da condição diária. */
  weatherCode: number | null;
  /** Probabilidade máxima de precipitação em percentual. */
  precipitationProbability: number | null;
  /** Descrição localizada, se já normalizada pelo service. */
  condition?: WeatherCondition | null;
}

/** Um registro horário de previsão no fuso da localidade. */
export interface HourlyForecast {
  /** Timestamp local do registro. */
  time: string;
  /** Temperatura prevista em Celsius, ou null se indisponível. */
  temperature: number | null;
  /** Código WMO da condição horária. */
  weatherCode: number | null;
}

/** Dados meteorológicos da cidade; forecast contém os resumos diários. */
export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  /** Série horária, quando solicitada pelo service. */
  hourlyForecast?: HourlyForecast[];
  /** Fuso IANA retornado pelo forecast, quando disponível. */
  timezone?: string | null;
}

/** Estado discriminado da operação da aplicação. */
export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading'; operation: WeatherOperation; query?: string; city?: City }
  | {
      status: 'success';
      result:
        | { kind: 'cities'; query: string; cities: City[] }
        | { kind: 'weather'; data: WeatherData };
    }
  | { status: 'empty'; operation: 'geocoding'; query: string; needsContext: boolean }
  | { status: 'error'; operation: WeatherOperation; error: WeatherError };
