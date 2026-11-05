# Backlog de Tarefas: Weather App

Derivado de `plans/weather-app-plan.md`; os critérios referenciam os requisitos de `specs/weather-app-spec.md`. A ordem segue tipos → funções puras → services → hook → componentes → integração → testes → hardening. NFRs pendentes não são gates de aceite.

## Gates de Decisão

- **G-01 — Retry:** reconciliar AC-08.2 com Assumptions/Edge Cases sobre `Retry-After` para 5xx; definir fallback para HTTP 429 sem cabeçalho e comportamento de HTTP 408.
- **G-02 — Freshness:** confirmar o significado de `current.time` antes de tratá-lo como horário de observação e usá-lo no cálculo de 168 horas.
- **G-03 — Geocoding:** definir países/localidades cobertos e como estado/região/país informado refina a busca.
- **G-04 — NFRs/dispositivos:** aprovar matriz oficial de dispositivos/navegadores e metas de acessibilidade, desempenho e disponibilidade. Até lá, mobile é smoke-test, não compatibilidade oficial.
- **G-05 — Formatos locais:** definir convenções pt-BR para data/hora e o fallback quando o fuso da cidade estiver ausente.

## Entrega 1: Tipos

### T-01 — Definir tipos normalizados do domínio

- **Descrição:** declarar contratos compartilhados, sem expor o JSON bruto da Open-Meteo.
- **Critérios de aceite:**
  - Tipos representam cidade, clima atual, previsões horária/diária, unidade, freshness, estados e erros.
  - Campos que podem faltar são anuláveis; ausência nunca é representada por zero.
  - Estado da UI distingue `idle`, `loading`, `success`, `empty` e `error`.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.

## Entrega 2: Funções Puras

### T-02 — Implementar conversão de temperatura

- **Descrição:** criar conversões puras Celsius/Fahrenheit e arredondamento consistente.
- **Critérios de aceite:**
  - `20 °C` converte para `68 °F`; conversão inversa retorna `20 °C` após arredondamento definido.
  - `null` permanece indisponível.
  - A função não altera o dado original nem acessa rede/estado global.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Tipo:** Data.

### T-03 — Implementar formatação de datas e freshness

- **Descrição:** formatar datas/horários locais e classificar a idade dos dados com timestamps injetáveis.
- **Critérios de aceite:**
  - Idade maior que 168 horas resulta em `stale`; timestamp ausente resulta em `unknown`.
  - O instante de referência e o fuso são entradas explícitas da função, sem dependência do relógio/fuso da máquina.
  - Formatos seguem G-05; a semântica do timestamp segue G-02.
- **Dependências:** T-01; G-02 e G-05 para fechar os contratos.
- **Arquivos prováveis:** `src/lib/format.ts`.
- **Tipo:** Data.

### T-04 — Implementar descrições de códigos WMO

- **Descrição:** mapear códigos conhecidos para rótulos pt-BR preservando o código original.
- **Critérios de aceite:**
  - Códigos suportados retornam descrições pt-BR estáveis.
  - Código desconhecido permanece preservado e não recebe descrição inventada.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`.
- **Tipo:** Data.

## Entrega 3: Services

### T-05 — Implementar cliente de geocoding

- **Descrição:** consultar o endpoint de busca e normalizar resultados para `City`.
- **Critérios de aceite:**
  - URL contém `name`, `count`, `language` e `format` conforme o plano.
  - Acentos, hífens e apóstrofos são preservados na query string.
  - HTTP 200 sem resultados retorna lista vazia; falha de transporte/HTTP retorna erro categorizado.
  - Refino de contexto respeita G-03; nenhuma localidade é selecionada automaticamente.
- **Dependências:** T-01; G-03 para busca geográfica.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.

### T-06 — Implementar cliente e normalização do forecast

- **Descrição:** consultar clima atual, séries horárias e resumos diários; associar arrays por índice e produzir `WeatherSnapshot`.
- **Critérios de aceite:**
  - Request inclui coordenadas, `timezone=auto`, cinco dias, Celsius e os campos `current`, `hourly` e `daily` do plano.
  - Dados são mapeados para tipos internos; campos ausentes permanecem `null`.
  - Para resposta válida, `daily` contém exatamente cinco datas locais; posições sem dados mantêm campos `null`, conforme AC-04.1 e AC-04.3.
  - Arrays incompatíveis/resposta malformada não geram valores ou registros inventados; falha estrutural retorna `invalidResponse`.
  - Timestamp é mapeado conforme G-02.
- **Dependências:** T-01, T-03, T-04, T-05; G-02.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data.

## Entrega 4: Hook e Estado

### T-07 — Implementar hook `useWeather`

- **Descrição:** coordenar busca, seleção, consulta, estados explícitos e descarte de operações obsoletas.
- **Critérios de aceite:**
  - Transições usam somente `idle`, `loading`, `success`, `empty` e `error`, com a operação identificada.
  - Geocoding vazio termina em `empty`; resposta parcial válida termina em `success`.
  - Resposta tardia de operação obsoleta não sobrescreve a cidade atual.
  - Unidade inicial é Celsius; alterar unidade/visualização não chama services.
  - Retry segue G-01 após aprovação.
- **Dependências:** T-05, T-06 e T-01; G-01.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** UI.

## Entrega 5: Componentes

### T-08 — Implementar componente de busca e seleção

- **Descrição:** implementar campo de busca, lista/seleção de resultados e solicitação de contexto adicional.
- **Critérios de aceite:**
  - Input vazio não submete; espaços externos são removidos e caracteres válidos preservados.
  - Resultados ambíguos não são selecionados automaticamente; seleção emite a cidade escolhida.
  - Estado vazio mantém o texto editável e solicita contexto quando necessário.
  - Controles são rotulados e operáveis por teclado.
- **Dependências:** T-01, T-07; G-03.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`.
- **Tipo:** UI.

### T-09 — Implementar componente de clima atual

- **Descrição:** exibir localidade, temperatura, condição, timestamp e freshness.
- **Critérios de aceite:**
  - Campos válidos são exibidos e ausentes indicados como indisponíveis.
  - Dados `stale`/`unknown` têm ressalva visível; timestamp só recebe o rótulo aprovado em G-02.
- **Dependências:** T-01, T-03, T-07; G-02.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Tipo:** UI.

### T-10 — Implementar lista e cartão de previsão

- **Descrição:** apresentar previsão horária por padrão e permitir alternar para resumos diários.
- **Critérios de aceite:**
  - Horários/datas aparecem em ordem local; visão diária mostra condição e mínimas/máximas disponíveis.
  - Campos ausentes são identificados; datas não são removidas silenciosamente.
  - Alternar a projeção não chama forecast novamente.
- **Dependências:** T-01, T-03, T-07.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`.
- **Tipo:** UI.

### T-11 — Implementar controle de unidade

- **Descrição:** permitir selecionar Celsius/Fahrenheit e derivar valores exibidos do snapshot Celsius.
- **Critérios de aceite:**
  - Celsius é inicial; ambas as unidades podem ser selecionadas.
  - Seleção atualiza a unidade visível sem alterar o snapshot ou chamar services.
- **Dependências:** T-02, T-07.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Tipo:** UI.

### T-12 — Implementar estado de carregamento

- **Descrição:** criar feedback acessível para operações pendentes.
- **Critérios de aceite:**
  - Enquanto o estado for `loading`, a UI exibe indicador com `role="status"` e nome acessível em pt-BR.
  - A UI não anuncia sucesso antes da resolução do request.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`.
- **Tipo:** UI.

### T-13 — Implementar estado vazio

- **Descrição:** apresentar geocoding sem resultados e orientar correção/contexto adicional.
- **Critérios de aceite:**
  - Mensagem pt-BR informa ausência de correspondência sem afirmar que a cidade não existe.
  - Busca permanece editável e nenhum forecast é solicitado.
- **Dependências:** T-08.
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`.
- **Tipo:** UI.

### T-14 — Implementar estado de erro

- **Descrição:** apresentar falhas de rede/API/timeout e ação de retry apropriada.
- **Critérios de aceite:**
  - Mensagem visível é pt-BR; detalhe técnico não é mostrado ao usuário.
  - Retry respeita a política aprovada, inclusive 429/`Retry-After`.
  - Cidade/query ficam disponíveis para nova tentativa quando aplicável.
- **Dependências:** T-07; G-01.
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`.
- **Tipo:** UI.

## Entrega 6: Integração

### T-15 — Compor a tela principal

- **Descrição:** ligar hook e componentes em `App`, sem chamadas de API na camada de apresentação.
- **Critérios de aceite:**
  - `App` compõe busca, clima atual, previsão, unidade e estados loading/empty/error.
  - Busca → seleção → forecast consulta a cidade selecionada.
  - O fluxo principal é acessível sem tela, rota protegida ou ação de autenticação.
  - Textos de interface estão em pt-BR.
- **Dependências:** T-07 a T-14.
- **Arquivos prováveis:** `src/App.tsx`.
- **Tipo:** UI.

## Entrega 7: Testes

### T-16 — Testar conversão de temperatura

- **Descrição:** cobrir conversão, valores-limite e arredondamento.
- **Critérios de aceite:**
  - Testes cobrem os dois sentidos, valores negativos, arredondamento e `null`.
  - Resultados são determinísticos e sem rede/relógio real.
- **Dependências:** T-02.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test.

### T-17 — Testar formatação e freshness

- **Descrição:** cobrir formatação local e fronteiras da regra de 168 horas.
- **Critérios de aceite:**
  - Testes cobrem antes, exatamente no limite e depois de 168 horas.
  - Timestamp ausente retorna freshness desconhecido.
- **Dependências:** T-03.
- **Arquivos prováveis:** `tests/unit/format.test.ts`.
- **Tipo:** Test.

### T-18 — Testar descrições WMO

- **Descrição:** validar códigos conhecidos e desconhecidos.
- **Critérios de aceite:**
  - Códigos suportados retornam o rótulo definido.
  - Código desconhecido preserva o número e usa fallback sem lançar erro.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`.
- **Tipo:** Test.

### T-19 — Testar cliente de geocoding

- **Descrição:** testar request e respostas com `fetch` mockado.
- **Critérios de aceite:**
  - Cobrir resultado único, ambiguidade, vazio, caracteres especiais e resposta inválida.
  - Verificar URL/parâmetros e distinguir vazio de falha de transporte.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.

### T-20 — Testar cliente de forecast

- **Descrição:** cobrir normalização e erros do forecast usando `fetch` mockado e fake timers.
- **Critérios de aceite:**
  - Cobrir resposta completa/parcial, array desalinhado, JSON inválido, rede, timeout e status HTTP.
  - Verificar timezone, associação por índice, AbortSignal e parâmetros.
  - Nenhum teste chama a API pública.
- **Dependências:** T-06, T-19; G-01/G-02 para expectations de retry/freshness.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`.
- **Tipo:** Test.

### T-21 — Testar hook e transições de estado

- **Descrição:** testar `useWeather` com services mockados, controlando respostas e ordem de conclusão.
- **Critérios de aceite:**
  - Cobrir loading→success, empty e error para geocoding e forecast.
  - Cobrir cancelamento/descarte de resposta obsoleta e retry conforme política aprovada.
  - Alterar unidade ou visualização não invoca services.
- **Dependências:** T-07, T-19 e T-20; G-01.
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`.
- **Tipo:** Test.

### T-22 — Testar busca e seleção de cidades

- **Descrição:** testar a interação do componente de busca isoladamente.
- **Critérios de aceite:**
  - Cobrir vazio, trimming, caracteres, resultados, ambiguidade, contexto e seleção.
  - Verificar teclado, labels e callbacks sem chamar API.
- **Dependências:** T-08 e T-19.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`.
- **Tipo:** Test.

### T-23 — Testar componente de clima atual

- **Descrição:** verificar sucesso, parcialidade e avisos de freshness.
- **Critérios de aceite:**
  - Cobrir snapshot completo, temperatura/condição ausentes, `stale` e `unknown`.
  - Nenhum campo ausente aparece como zero ou dado atual sem ressalva.
- **Dependências:** T-09 e T-17.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`.
- **Tipo:** Test.

### T-24 — Testar lista e cartão de previsão

- **Descrição:** validar ordenação, alternância e resposta parcial.
- **Critérios de aceite:**
  - Testar cinco datas locais, ordem horária e resumo diário.
  - Campos ausentes são sinalizados; alternar modo não gera request.
- **Dependências:** T-10, T-16 e T-17.
- **Arquivos prováveis:** `tests/unit/ForecastList.test.tsx`.
- **Tipo:** Test.

### T-25 — Testar controle e conversão de unidade na UI

- **Descrição:** verificar interação do controle e valor formatado sem rede.
- **Critérios de aceite:**
  - Celsius e Fahrenheit são selecionáveis e os valores visíveis correspondem à unidade ativa.
  - O serviço não é chamado ao trocar unidade.
- **Dependências:** T-11 e T-16.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`.
- **Tipo:** Test.

### T-26 — Testar estados de loading, vazio e erro

- **Descrição:** testar os componentes de estado isoladamente.
- **Critérios de aceite:**
  - Loading é encontrado por `role="status"` e tem nome acessível pt-BR.
  - Estado vazio mantém mensagem e ação de busca; estado de erro mostra mensagem sem detalhe técnico e retry disponível conforme política aprovada.
- **Dependências:** T-12, T-13 e T-14.
- **Arquivos prováveis:** `tests/unit/states.test.tsx`.
- **Tipo:** Test.

### T-27 — Testar composição e estados da aplicação

- **Descrição:** cobrir integração do hook com a tela usando services mockados.
- **Critérios de aceite:**
  - Testar sucesso, loading, vazio, erro, retry e resposta parcial na composição.
  - Verificar AC-07.1: o fluxo principal funciona sem login ou criação de conta.
  - Verificar AC-07.2: alternar unidade não envia request; histórico/preferências não são enviados para persistência, distinguindo-os da cidade enviada à Open-Meteo.
  - Testes não dependem da API real.
- **Dependências:** T-15, T-19–T-26.
- **Arquivos prováveis:** `tests/unit/App.test.tsx`.
- **Tipo:** Test.

### T-28 — Testar fluxo E2E principal

- **Descrição:** validar busca, seleção, consulta e troca de unidade em desktop e viewport mobile com fixtures interceptadas.
- **Critérios de aceite:**
  - Fluxo completo mostra a cidade, clima atual, cinco datas e unidade coerente.
  - O mesmo fluxo passa em viewport desktop e `390 × 844`.
  - Troca Celsius/Fahrenheit não gera chamada adicional ao forecast.
  - E2E não depende da disponibilidade da Open-Meteo.
- **Dependências:** T-27.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.

### T-29 — Testar fluxos E2E vazio e falhas

- **Descrição:** validar geocoding vazio, contexto adicional, timeout/API error e retry.
- **Critérios de aceite:**
  - Geocoding vazio não chama forecast e permite editar a busca.
  - Erro/timeout apresenta estado correto e só repete conforme política aprovada.
  - Fixtures controlam status, headers e atraso sem rede real.
- **Dependências:** T-26, T-28; G-01/G-03.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.

## Entrega 8: Hardening

### T-30 — Validar viewport mobile

- **Descrição:** executar hardening visual em viewport estreito; não declarar matriz oficial antes da aprovação de G-04.
- **Critérios de aceite:**
  - Em viewport de 320 px, não há rolagem horizontal e busca, resultado selecionável, troca de unidade e modo de forecast continuam operáveis.
  - `document.documentElement.scrollWidth` não excede `document.documentElement.clientWidth`.
  - 320 px é viewport exploratório baseado na proposta de NFR-01; suporte oficial aguarda aprovação.
- **Dependências:** T-28, T-29; G-04 para critérios oficiais de compatibilidade.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Tipo:** Test.

## Pendências Transversais

- Após G-01 a G-05, atualizar as assertions das tarefas afetadas antes da implementação/testes definitivos.
- AC-07.2 deve verificar ausência de envio de histórico/preferências para persistência, distinguindo esses dados da cidade/coordenadas necessárias à Open-Meteo.
- A spec/plano ainda não definem cooldown para HTTP 429 sem `Retry-After`, significado de HTTP 408, formato regional de data/hora ou retenção/logs da Open-Meteo. Essas decisões podem bloquear critérios finais de teste, mas não justificam adicionar backend ou infraestrutura antes da aprovação.

## Rastreabilidade

NFR-01 a NFR-04 estão pendentes de aprovação; seu vínculo abaixo não representa aceite de metas.

| Tarefa | Requisitos funcionais / Acceptance Criteria | NFRs relevantes |
|---|---|---|
| T-01 | FR-01–FR-08; contratos que suportam AC-01 a AC-08 | — |
| T-02 | FR-05, FR-06; AC-05.1–AC-05.3, AC-06 | NFR-05 |
| T-03 | FR-03, FR-04, FR-09; AC-03.2–AC-03.4, AC-04.1, AC-09 | NFR-05 |
| T-04 | FR-03, FR-04; AC-03, AC-04.2–AC-04.4 | NFR-05 |
| T-05 | FR-01, FR-02; AC-01.1–AC-01.4, AC-02.1–AC-02.2 | NFR-03 (pendente), NFR-06 |
| T-06 | FR-03, FR-04; AC-03–AC-03.4, AC-04.1–AC-04.4 | NFR-03, NFR-04 (pendentes), NFR-05 |
| T-07 | FR-01–FR-08; AC-01–AC-08 | NFR-03, NFR-04 (pendentes) |
| T-08 | FR-01, FR-02; AC-01.1–AC-01.5, AC-02.1–AC-02.2 | NFR-01, NFR-02 (pendentes) |
| T-09 | FR-03, FR-06; AC-03–AC-03.4, AC-06 | NFR-01, NFR-02 (pendentes), NFR-05 |
| T-10 | FR-04, FR-06; AC-04.1–AC-04.4, AC-06 | NFR-01, NFR-02 (pendentes), NFR-05 |
| T-11 | FR-05, FR-06; AC-05.1–AC-05.3, AC-06 | NFR-01, NFR-02 (pendentes), NFR-05 |
| T-12 | FR-08; AC-08.1 | NFR-02 (pendente) |
| T-13 | FR-01, FR-08; AC-01.4, AC-01.5 | NFR-02 (pendente) |
| T-14 | FR-08; AC-08.2–AC-08.5 | NFR-02, NFR-04 (pendentes) |
| T-15 | FR-01–FR-09; integração dos AC-01 a AC-09 | NFR-01, NFR-02 (pendentes), NFR-05 |
| T-16 | FR-05, FR-06; AC-05.1–AC-05.3, AC-06 | NFR-05 |
| T-17 | FR-03, FR-04, FR-09; AC-03.2–AC-03.4, AC-04.1, AC-09 | NFR-05 |
| T-18 | FR-03, FR-04; AC-03, AC-04.2–AC-04.4 | NFR-05 |
| T-19 | FR-01, FR-02; AC-01.1–AC-01.4, AC-02.1–AC-02.2 | NFR-03 (pendente), NFR-06 |
| T-20 | FR-03, FR-04, FR-08; AC-03.1, AC-04.3, AC-08.2–AC-08.5 | NFR-03, NFR-04 (pendentes) |
| T-21 | FR-01–FR-08; AC-01–AC-08 | NFR-03, NFR-04 (pendentes) |
| T-22 | FR-01, FR-02; AC-01.1–AC-01.5, AC-02.1–AC-02.2 | NFR-02 (pendente) |
| T-23 | FR-03, FR-06; AC-03–AC-03.4, AC-06 | NFR-02 (pendente), NFR-05 |
| T-24 | FR-04, FR-06; AC-04.1–AC-04.4, AC-06 | NFR-02 (pendente), NFR-05 |
| T-25 | FR-05, FR-06; AC-05.1–AC-05.3, AC-06 | NFR-02 (pendente), NFR-05 |
| T-26 | FR-08; AC-08.1 | NFR-02 (pendente) |
| T-27 | FR-01, FR-07, FR-08, FR-09; AC-01.4–AC-01.5, AC-07.1–AC-07.2, AC-08.1–AC-09 | NFR-02 (pendente), NFR-06 |
| T-28 | US-01–US-06; AC-01.1, AC-02.2, AC-03, AC-04.1–AC-04.4, AC-05.1–AC-06, AC-07.1, AC-09 | NFR-01, NFR-03, NFR-05 (pendentes/aplicáveis) |
| T-29 | US-07; AC-01.4–AC-01.5, AC-08.1–AC-08.5 | NFR-02–NFR-04 (pendentes) |
| T-30 | FR-01–FR-06; NFR-01 (proposta pendente) | NFR-01 (pendente) |

## Prioridade e Tamanho

- **P0:** necessário para entregar e verificar os requisitos funcionais do MVP.
- **P1:** amplia confiança de release para falhas e comportamento em navegadores reais.
- **P2:** hardening adicional cuja aceitação depende de NFR/matriz ainda pendente.
- **S:** tarefa localizada, normalmente um arquivo e poucas condições de teste.
- **M:** lógica ou comportamento moderado, ou até dois arquivos relacionados.
- **G:** fluxo transversal/E2E com várias etapas, fixtures e verificações de ponta a ponta.

| Tarefa | Prioridade | Tamanho |
|---|---:|:---:|
| T-01 | P0 | S |
| T-02 | P0 | S |
| T-03 | P0 | M |
| T-04 | P0 | S |
| T-05 | P0 | M |
| T-06 | P0 | M |
| T-07 | P0 | M |
| T-08 | P0 | M |
| T-09 | P0 | M |
| T-10 | P0 | M |
| T-11 | P0 | S |
| T-12 | P0 | S |
| T-13 | P0 | S |
| T-14 | P0 | S |
| T-15 | P0 | M |
| T-16 | P0 | S |
| T-17 | P0 | M |
| T-18 | P0 | S |
| T-19 | P0 | M |
| T-20 | P0 | M |
| T-21 | P0 | M |
| T-22 | P0 | S |
| T-23 | P0 | S |
| T-24 | P0 | S |
| T-25 | P0 | S |
| T-26 | P0 | M |
| T-27 | P0 | M |
| T-28 | P0 | G |
| T-29 | P1 | M |
| T-30 | P2 | M |

Não há tarefas P2 de implementação funcional no backlog atual; T-30 é P2 por validar um viewport estreito ainda não aprovado. O fluxo mobile de `390 × 844` continua coberto no smoke/E2E principal.

## Sequência de Entrega em Fatias Verticais

1. **Fundação técnica (T-01–T-07):** contratos, funções puras, geocoding/forecast e hook. Não é uma entrega visível; manter curta e sem infraestrutura nova.
2. **Primeira demo — buscar cidade e ver clima atual (T-05–T-09, T-12–T-15, incrementalmente):** integrar busca, seleção, clima atual e estados loading/vazio/erro assim que esses componentes estiverem prontos. T-15 pode começar nessa forma reduzida, mas só é concluída quando todos os componentes previstos forem integrados.
3. **MVP visível completo — forecast e unidades (T-10–T-11 e conclusão de T-15):** acrescentar previsão horária/diária e alternância de unidade ao fluxo já demonstrável. Esta fatia fecha a jornada principal sem esperar pela suíte E2E completa.
4. **Verificação por fatia (T-16–T-27):** executar testes unitários, service, hook e componentes assim que cada módulo estiver implementado; concluir os testes de composição após T-15.
5. **Validação de jornadas e hardening (T-28–T-30):** validar fluxo E2E principal, erros/retry e por último viewport estreito. T-29 é P1; T-30 permanece P2 até aprovação de G-04/NFR-01.

Essa ordem antecipa uma tela demonstrável de busca/clima atual antes de forecast/toggle e mantém o MVP completo como próximo incremento, sem simular respostas nem alterar os contratos de API.