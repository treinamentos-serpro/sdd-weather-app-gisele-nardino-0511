# Resumo Executivo

- O produto permitirá buscar cidades, consultar o clima atual e a previsão de hoje mais os quatro dias seguintes, alternando entre Celsius e Fahrenheit.
- A interface será em pt-BR, usará dados do Open-Meteo e não exigirá autenticação nem armazenamento no servidor.
- As personas propostas representam deslocamentos diários, planejamento de atividades ao ar livre e viagens, mas ainda precisam ser validadas com usuários.
- Os principais riscos são dados indisponíveis ou desatualizados, busca ambígua e experiência inadequada em dispositivos móveis.
- Ainda é necessário definir público prioritário, cobertura e atualização dos dados, conteúdo da previsão, metas de qualidade e critérios de sucesso.

## Fluxo de Dados

```mermaid
flowchart LR
	A["Input de busca<br/>(SearchBar)"] --> B["Service de geocoding"]
	A -. "inicia busca" .-> H1["Hook de estado<br/>loading: geocoding"]
	B --> C{"Resposta do geocoding"}

	C -->|"Resultados"| D["UI: lista de cidades"]
	D --> E["Usuário seleciona cidade"]
	E -. "inicia consulta" .-> H2["Hook de estado<br/>loading: forecast"]
	E --> F["Service de forecast"]
	F --> G["Hook de estado<br/>success: WeatherData"]
	G --> I["Componentes de UI<br/>clima atual e previsão"]

	C -->|"Resposta vazia"| H3["Hook de estado<br/>empty"]
	H3 --> J["UI: sem resultado<br/>solicita contexto"]
	J --> A

	B -->|"Falha de rede, API ou timeout"| H4["Hook de estado<br/>error"]
	F -->|"Falha de rede, API ou timeout"| H4
	H4 --> K["UI: mensagem e retry"]
	K -->|"Retry geocoding"| B
	K -->|"Retry forecast"| F
```
