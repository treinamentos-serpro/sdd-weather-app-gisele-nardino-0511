# Histórico de Criação do Weather App

**Consolidação:** 2026-11-05  
**Finalidade:** preservar a sequência de discovery, especificação, plano, backlog e decisões para facilitar a replicação do conhecimento adquirido.

> Este documento é um registro cronológico resumido da conversa, não uma transcrição literal. Cada item separa o que foi pedido do que foi respondido ou executado. Sugestões feitas apenas no chat estão identificadas como tal; alterações documentais são vinculadas aos arquivos correspondentes.

## Histórico

### 1. Discovery inicial

- **Pedido:** atuar como Business Analyst e transformar o briefing do Weather App em discovery com Contexto, Requisitos Funcionais, Requisitos Não-Funcionais, Riscos, Perguntas em Aberto e Suposições.
- **Resposta/execução:** foi criado o discovery inicial a partir das capacidades de busca por cidade, clima atual, previsão de cinco dias, Celsius/Fahrenheit e uso móvel.
- **Artefato:** `specs/discovery.md`.

### 2. Revisão da classificação dos requisitos

- **Pedido:** classificar cada requisito como funcional ou não-funcional, identificar erros e sugerir NFRs faltantes.
- **Resposta:** apontou-se RF-05 (suporte móvel) como não-funcional e RNF-03 (consistência da unidade) como funcional; foram sugeridos NFRs para performance, acessibilidade, responsividade, disponibilidade, compatibilidade e atualização dos dados.
- **Pedido seguinte:** reclassificar os itens identificados.
- **Execução:** RF-05 foi substituído por “aplicar unidade selecionada”; suporte a dispositivos móveis foi movido para RNF-03.
- **Artefato atualizado:** `specs/discovery.md`.

### 3. Ambiguidades, riscos e personas

- **Pedido:** listar ambiguidades e lacunas do briefing, formular uma pergunta e o impacto de cada decisão não tomada.
- **Execução:** a seção de perguntas abertas foi expandida, cobrindo público, plataforma, busca, geolocalização, provedor, conteúdo, previsão, unidades, persistência, falhas, NFRs e métricas.
- **Pedido:** apresentar riscos com probabilidade, impacto e mitigação.
- **Resposta inicial:** tabela fornecida no chat.
- **Pedido:** propor personas com objetivo, contexto de uso e métrica de sucesso.
- **Resposta inicial:** três hipóteses fornecidas no chat: Marina (deslocamento diário), Rafael (atividades ao ar livre) e Camila (viagens).
- **Pergunta de acompanhamento:** confirmar se riscos e personas constavam no discovery.
- **Execução:** foi adicionada uma tabela de riscos e as três personas, explicitamente rotuladas como hipóteses ainda não validadas.
- **Artefato atualizado:** `specs/discovery.md`.

### 4. Decisões iniciais de produto

- **Pedido:** registrar decisões sobre Open-Meteo sem API key, período hoje + quatro dias, Celsius padrão, ausência de autenticação/persistência no servidor e idioma pt-BR.
- **Execução:** foi criada a seção “Decisões” no discovery; perguntas relacionadas foram marcadas como resolvidas parcialmente quando ainda restavam detalhes.
- **Pendências preservadas:** cobertura e condições de uso do provedor, conteúdo e granularidade do forecast, persistência local e formatos regionais.
- **Artefato atualizado:** `specs/discovery.md`.

### 5. Resumo executivo

- **Pedido:** produzir resumo executivo de cinco linhas para stakeholders não técnicos.
- **Resposta inicial:** resumo apresentado no chat.
- **Pedido seguinte:** verificar se estava salvo e criar um Markdown se necessário.
- **Execução:** foi criado `specs/resumo-executivo.md` com as cinco linhas.

### 6. Especificação de produto

- **Pedido:** usar o discovery para gerar uma especificação completa com Overview, Functional Requirements, User Stories, Acceptance Criteria, Non-Functional Requirements, Edge Cases, Assumptions, Risks, Out of Scope e Open Questions, sem código.
- **Execução:** foi criado `specs/weather-app-spec.md`, com requisitos funcionais mapeados a critérios de aceite e decisões/hipóteses separadas das perguntas em aberto.
- **Verificação:** todos os dez títulos solicitados foram conferidos.
- **Pedido:** reescrever User Stories no formato “Como…, quero… para…”, usando personas e conectando cada história a um requisito funcional.
- **Execução:** a seção passou a ter sete histórias com referências explícitas a FRs.

### 7. Edge cases

- **Pedido:** identificar comportamentos para cidade inexistente, input vazio, caracteres especiais, falha de API, timeout, geocoding sem resultados e resposta parcial.
- **Resposta inicial:** comparação entre o que a spec já cobria e o que faltava, sem alteração imediata.
- **Pedido seguinte:** adicionar os casos faltantes.
- **Execução:** foram acrescentados comportamentos e critérios Given/When/Then para input vazio, caracteres válidos, resultados de geocoding vazios, falhas, timeout e payload parcial.
- **Decisões registradas na spec:** dados parciais não recebem valores inventados; geocoding vazio é estado vazio, não erro; 5 s para geocoding e 10 s para forecast foram documentados como limites iniciais, com retry sujeito às regras descritas.
- **Artefato atualizado:** `specs/weather-app-spec.md`.

### 8. Revisão da especificação e refinamentos

- **Pedido:** revisar a spec por requisitos faltantes, ambiguidades, inconsistências e critérios fracos, com correções sugeridas.
- **Resposta:** foram apontados, entre outros, granularidade do forecast, significado do timestamp, desambiguação, metas NFR pendentes, retries e persistência.
- **Pedido:** aplicar decisões sobre forecast horário com alternância diária, freshness de uma semana, pedido de contexto, metas pendentes, timeouts e política de retry; manter itens 8 e 9 em aberto.
- **Execução documentada:** a spec e o plano receberam refinamentos para previsão horária/diária, freshness de 168 h, contexto de geocoding, timeouts separados e política por classe de erro. Os NFRs continuaram identificados como pendentes.
- **Nota de revisão:** durante os patches, houve divergências entre versões lidas/aplicadas. A revisão final confirmou que ainda havia contradição na política de retry e pergunta duplicada/antiga na spec. Não tratar como totalmente resolvido sem nova verificação dos arquivos atuais.
- **Artefatos envolvidos:** `specs/weather-app-spec.md` e `plans/weather-app-plan.md`.

### 9. Rastreabilidade

- **Pedido:** ligar cada User Story aos Acceptance Criteria e aos NFRs relevantes.
- **Execução:** foi adicionada uma matriz de rastreabilidade em `specs/weather-app-spec.md`, com sete histórias. NFR-01 a NFR-04 ficaram sinalizados como pendentes de aprovação.

### 10. Plano técnico

- **Pedido:** gerar `plans/weather-app-plan.md` com Architecture, Tech Stack, Project Structure, Data Model, Data Flow, External APIs, State Management, Error Handling, Testing Strategy e Risks & Trade-offs, sem código final.
- **Execução:** o plano foi criado usando React, TypeScript, Vite, Tailwind, Vitest, Testing Library, Playwright, Biome e Open-Meteo conforme a stack do repositório.
- **Conteúdo subsequente:** endpoints e respostas resumidas de geocoding/forecast foram documentados com mapeamento aos tipos; estado foi definido em `useWeather` com `idle/loading/success/empty/error`; conversão de unidade foi descrita como derivada na renderização.
- **Pedido:** detalhar Testing Strategy e trade-offs.
- **Execução:** o plano foi ampliado com cobertura Vitest para funções, services e UI; Playwright para E2E/mobile; alternativas de store, backend/proxy, fixtures e retry.
- **Pendências técnicas registradas:** semântica de timestamps, comportamento de HTTP 408, fallback de 429 sem `Retry-After`, formatos locais e retenção do provedor.
- **Artefato atualizado:** `plans/weather-app-plan.md`.

### 11. Diagramas e contratos conceituais

- **Pedido:** gerar diagrama Mermaid do fluxo de dados com caminhos vazio e erro.
- **Resposta inicial:** diagrama fornecido no chat, sem ser salvo.
- **Pedido seguinte:** incluir o diagrama no resumo executivo.
- **Execução:** diagrama foi adicionado à seção “Fluxo de Dados” de `specs/resumo-executivo.md`.
- **Pedido:** propor interfaces TypeScript para City, CurrentWeather, ForecastDay, WeatherData e Unit.
- **Resposta:** interfaces com mapeamento conceitual da Open-Meteo foram apresentadas no chat; o plano contém contratos de domínio relacionados em “Data Model”.
- **Pedido:** propor arquitetura em camadas e estrutura de `src/`.
- **Resposta:** proposta apresentada no chat e alinhada depois à estrutura descrita em `plans/weather-app-plan.md`.

### 12. Backlog

- **Pedido:** usar o plano para criar `tasks/weather-app-tasks.md` com tarefas T-NN, descrição, critérios de aceite, dependências, arquivos e tipo.
- **Execução:** backlog inicial criado com entregas, dependências e gates de decisão.
- **Pedido seguinte:** identificar tarefas grandes/multiarquivo e quebrá-las em subtarefas menores.
- **Execução:** backlog foi reorganizado em 29 tarefas sequenciais, separando lógica pura, services, hook, componentes, testes por fatia e E2E; gates de retry, freshness, geocoding, NFRs/dispositivos e formatos locais foram preservados.
- **Artefato atualizado:** `tasks/weather-app-tasks.md`.

### 13. Registro contínuo

- **Pedido:** manter um documento na raiz com o histórico da criação e atualizar com novas interações.
- **Execução:** este arquivo foi criado como resumo cronológico de pedidos, respostas, ações e artefatos.
- **Procedimento daqui em diante:** ao fim de cada nova interação que altere decisões, documentos ou entregáveis do projeto, acrescentar uma entrada cronológica com pedido, resposta/execução, arquivos afetados e pendências. Se a interação for apenas uma resposta conceitual, registrar que não houve alteração de arquivos. Não afirmar uma atualização do histórico antes de gravá-la.

### 14. Revisão adicional da granularidade do backlog

- **Pedido:** identificar tarefas grandes demais (mais de um ou dois arquivos relevantes ou mistura de UI, dados e testes), quebrá-las em subtarefas menores e manter o formato T-NN.
- **Revisão:** a versão atual já tinha 29 tarefas separando lógica pura, services, hook, componentes e testes; não foi necessário criar novas subtarefas.
- **Execução:** foram acrescentadas dependências explícitas entre tarefas que alteram o mesmo arquivo de service ou E2E: forecast depois de geocoding e smoke-test mobile depois dos fluxos E2E.
- **Artefatos atualizados:** `tasks/weather-app-tasks.md`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Pendências:** continuam valendo os gates G-01 a G-05.

### 15. Critérios e rastreabilidade das tarefas

- **Pedido:** garantir critérios de aceite objetivos e verificáveis por tarefa, rastreáveis à spec quando possível.
- **Execução:** foram explicitados critérios verificáveis para cinco datas locais em T-10, o estado de loading acessível em T-22 e o viewport mobile em T-29. Foi adicionada uma matriz que liga todas as tarefas a FRs, ACs e NFRs relevantes, mantendo NFRs pendentes identificados como propostas.
- **Artefatos atualizados:** `tasks/weather-app-tasks.md`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Pendências:** continuam valendo os gates G-01 a G-05; a rastreabilidade não aprova automaticamente esses requisitos pendentes.

### 16. Reordenação do backlog por fase de implementação

- **Pedido:** ordenar tarefas na sequência tipos → funções puras → services → hook → componentes → integração → testes → hardening, com dependências explícitas.
- **Execução:** o backlog foi reorganizado em oito entregas, renumerado para 30 tarefas T-NN e atualizado com dependências entre fases e tarefas que compartilham arquivos.
- **Rastreabilidade:** a matriz T → FR/AC/NFR foi preservada e renumerada; NFRs pendentes continuam identificados como propostas.
- **Artefatos atualizados:** `tasks/weather-app-tasks.md`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Pendências:** continuam valendo G-01 a G-05.

### 17. Confirmação de cobertura de testes dedicados

- **Pedido:** garantir tarefas próprias para testes de conversão, services com `fetch` mockado, componentes nos estados loading/erro/vazio e E2E principal com viewport mobile.
- **Execução:** verificado que T-16 cobre conversão, T-19/T-20 cobrem geocoding/forecast com mock, T-26 cobre estados da UI e T-28/T-30 cobrem E2E em `390 × 844` e hardening exploratório em 320 px.
- **Artefatos atualizados:** `tasks/weather-app-tasks.md`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Pendências:** 320 px e matriz de dispositivos permanecem exploratórios até G-04/NFR-01 serem aprovados.

### 18. Rastreabilidade de requisitos funcionais para tarefas

- **Pedido:** criar uma tabela relacionando cada FR da spec às tarefas que o implementam e apontar requisitos sem cobertura.
- **Execução:** verificada a cobertura de FR-01 a FR-09 na matriz de rastreabilidade; nenhum requisito funcional ficou sem tarefa associada. FR-07 foi tornado explícito em T-15 (acesso sem login) e T-27 (verificação de AC-07.1/AC-07.2).
- **Artefatos atualizados:** `tasks/weather-app-tasks.md`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Pendências:** NFR-01 a NFR-04 seguem propostas pendentes; Gates G-01 a G-05 permanecem.

### 19. Priorização e fatias verticais do backlog

- **Pedido:** classificar todas as tarefas por prioridade P0/P1/P2 e tamanho P/M/G; sugerir sequência de entrega em fatias verticais para mostrar valor cedo.
- **Execução:** foram adicionadas prioridades e tamanhos para T-01 a T-30, mais uma sequência de cinco entregas desde a fundação até hardening. A primeira demo mostra busca e clima atual; o incremento seguinte completa forecast e unidade.
- **Artefatos atualizados:** `tasks/weather-app-tasks.md`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Pendências:** viewport de 320 px continua exploratório até G-04/NFR-01 ser aprovado.

### 20. Prompt de implementação para T-01

- **Pedido:** gerar um prompt autocontido para o Coding Agent implementar T-01, com contexto, critérios de aceite e arquivos.
- **Resposta inicial:** prompt preparado no chat; depois foi solicitado executar T-01 e criar um mock `WeatherData`.
- **Execução:** `src/types/weather.ts` atualizado com `Unit`, `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `HourlyForecast`, freshness e estados/erros discriminados. Criado `src/mocks/weatherData.ts` com São Paulo e cinco dias. Campos ausentes do service preservam `null`; componentes atuais foram ajustados para sinalizá-los, e o teste de precipitação foi atualizado para não esperar zero inventado.
- **Validação:** `pnpm lint`, `pnpm build` e `pnpm test` passaram; 7 arquivos de teste e 21 testes aprovados.
- **Artefatos atualizados:** `src/types/weather.ts`, `src/mocks/weatherData.ts`, `src/services/weatherService.ts`, `src/components/CurrentWeather.tsx`, `src/components/ForecastCard.tsx`, `tests/unit/weatherService.test.ts` e este histórico.
- **Arquivos de referência:** `tasks/weather-app-tasks.md`, `src/types/weather.ts`, `plans/weather-app-plan.md`.
- **Pendências:** o mock é fixture para desenvolvimento; não está ligado à aplicação em runtime. A política de freshness ainda depende de confirmar a semântica do timestamp da Open-Meteo (G-02).

### 21. Implementação do SearchBar

- **Pedido:** implementar `src/components/SearchBar.tsx` com label acessível, `role="search"`, submit não vazio com trim, `onSearch`, `disabled` e estilo glassmorphism.
- **Execução:** o form recebeu nome acessível, o input usa `type="search"` e respeita `disabled`; o botão fica desabilitado para vazio/whitespace; o container ganhou foco visível. Testes cobrem landmark/label, trim, vazio e disabled.
- **Artefatos atualizados:** `src/components/SearchBar.tsx`, `tests/unit/SearchBar.test.tsx`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Validação:** `pnpm lint`, `pnpm build` e `pnpm test` passaram; 7 arquivos de teste e 24 testes aprovados.
- **Pendências:** nenhuma para esta tarefa.

### 22. Implementação do UnitToggle

- **Pedido:** implementar dois botões Celsius/Fahrenheit com `aria-pressed`, grupo nomeado, teclado e props `unit`/`onChange`.
- **Execução:** mantido o controle React existente; adicionados foco visível e testes de landmark, estado pressionado, navegação por Tab e ativação por Espaço.
- **Artefatos atualizados:** `src/components/UnitToggle.tsx`, `tests/unit/UnitToggle.test.tsx`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Validação:** `pnpm lint`, `pnpm build` e `pnpm test` passaram; 7 arquivos de teste e 25 testes aprovados.
- **Pendências:** nenhuma para esta tarefa.

### 23. Implementação de CurrentWeather

- **Pedido:** implementar hero do clima atual com temperatura grande, ícone/condição WMO, métricas e unidade atual.
- **Execução:** foram preservados os campos e a estrutura existentes; adicionados rótulos `°C`/`°F`, timestamp com rótulo cauteloso, avisos para freshness `stale`/`unknown` e placeholders para métricas ausentes. Criados testes dedicados para dados completos, desatualizados e parciais.
- **Artefatos atualizados:** `src/components/CurrentWeather.tsx`, `tests/unit/CurrentWeather.test.tsx`, `tests/unit/UnitToggle.test.tsx`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Validação:** `pnpm lint`, `pnpm build` e `pnpm test` passaram; 8 arquivos de teste e 28 testes aprovados.
- **Pendências:** confirmar a semântica do timestamp da Open-Meteo antes de exibi-lo como horário de observação (G-02).

### 24. Confirmação do registro contínuo

- **Pedido:** confirmar se as interações continuam sendo registradas no histórico.
- **Resposta/execução:** confirmado; a entrada mais recente registrada antes desta conversa é T-09/`CurrentWeather`. O procedimento de registrar novas interações permanece ativo.
- **Artefato atualizado:** `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Pendências:** nenhuma.

### 25. Implementação das visualizações de forecast

- **Pedido:** implementar `ForecastList` e `ForecastCard` com grid responsivo, rótulo do dia, ícone, condição, máxima/mínima na unidade ativa e probabilidade de chuva.
- **Execução:** mantido o grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`; cards agora identificam Máx./Mín., incluem unidade, condição visível e probabilidade de chuva, e representam campos ausentes sem inventar valores. Criado teste para cinco dias, Fahrenheit e resposta parcial.
- **Artefatos atualizados:** `src/components/ForecastCard.tsx`, `tests/unit/ForecastList.test.tsx`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Validação:** `pnpm lint`, `pnpm build` e `pnpm test` passaram; 9 arquivos de teste e 30 testes aprovados.
- **Pendências:** formatos locais/fuso ainda dependem de G-05.

### 26. Cobertura dos componentes de estado

- **Pedido:** implementar/verificar os estados de loading, erro e vazio, incluindo anúncio acessível, retry e conteúdo orientativo.
- **Execução:** mantidos `LoadingState` e `ErrorState` existentes; título do `EmptyState` passou a ser heading semântico. Adicionado teste unitário para `role="status"`, alerta e callback de retry, além do título e dica do estado vazio.
- **Artefatos atualizados:** `src/components/states/EmptyState.tsx`, `tests/unit/states.test.tsx`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Validação:** teste focal aprovado; `pnpm lint`, `pnpm build` e `pnpm test` passaram; 10 arquivos de teste e 33 testes aprovados.
- **Pendências:** nenhuma para esta fatia.

### 27. Validação da composição da tela principal

- **Pedido:** compor a tela com marca, busca, unidade e estados idle/loading/empty/error/success, usando `WeatherData` mockado e convertendo temperaturas durante a renderização.
- **Execução:** a composição existente em `App` já utiliza `useWeather` para os estados, mantém `unit` como estado local e delega conversão aos componentes de apresentação. Os testes de `App` agora cobrem busca em andamento, resultado vazio, erro sem expor detalhe técnico, sucesso com `weatherDataMock` e conversão de clima atual/previsão sem nova consulta ao serviço.
- **Artefatos atualizados:** `tests/unit/App.test.tsx`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Validação:** teste focal aprovado; `pnpm lint`, `pnpm build` e `pnpm test` passaram; 10 arquivos de teste e 37 testes aprovados.
- **Pendências:** nenhuma para T-15.

### 28. Revisão de acessibilidade e responsividade

- **Pedido:** revisar componentes quanto a roles, labels, foco, contraste e adaptação de 320 px a desktop; listar e aplicar as melhorias prioritárias.
- **Execução:** o header agora reorganiza os controles em telas estreitas; busca e cards evitam encolhimento/overflow; botões receberam nomes acessíveis mais claros, alvos mínimos e foco visível; textos auxiliares ganharam contraste; métricas usam `dt`/`dd`; o nome da marca passou a heading principal. O E2E mobile foi ajustado para viewport de 320 px e ausência de overflow horizontal.
- **Artefatos atualizados:** `src/App.tsx`, `src/components/SearchBar.tsx`, `src/components/UnitToggle.tsx`, `src/components/CurrentWeather.tsx`, `src/components/ForecastCard.tsx`, `src/components/states/EmptyState.tsx`, `src/components/states/ErrorState.tsx`, `tests/unit/UnitToggle.test.tsx`, `tests/unit/App.test.tsx`, `tests/e2e/weather.spec.ts`, `HISTORICO-CRIACAO-WEATHER-APP.md`.
- **Validação:** `pnpm lint`, `pnpm build` e `pnpm test` passaram; 10 arquivos de teste e 37 testes aprovados. E2E não executou porque os navegadores Chromium/WebKit do Playwright não estão instalados no ambiente.
- **Pendências:** confirmar visualmente o cenário em 320 px quando houver browsers Playwright disponíveis.

## Estado Consolidado dos Artefatos

| Artefato | Finalidade | Estado conhecido |
|---|---|---|
| `specs/discovery.md` | Discovery de negócio | Contém contexto, requisitos, hipóteses de persona, tabela de riscos, decisões e perguntas abertas. |
| `specs/weather-app-spec.md` | Especificação de produto | Contém requisitos, histórias, ACs, matriz de rastreabilidade, NFRs, edge cases, riscos e perguntas. Algumas políticas de retry ainda precisam de reconciliação. |
| `specs/resumo-executivo.md` | Síntese para stakeholders | Contém resumo de cinco linhas e diagrama Mermaid do fluxo. |
| `plans/weather-app-plan.md` | Arquitetura e contratos técnicos | Contém stack, estrutura, tipos conceituais, APIs, fluxo, estado, erros, testes e trade-offs. |
| `tasks/weather-app-tasks.md` | Backlog de implementação/testes | 30 tarefas T-NN em oito entregas ordenadas, com dependências, matriz T→FR/AC/NFR, prioridade/tamanho e sequência de fatias verticais. |
| `src/mocks/weatherData.ts` | Fixture de UI | Mock tipado de São Paulo com clima atual e cinco dias de previsão. |
| `tests/unit/CurrentWeather.test.tsx` | Testes de UI | Cobertura de clima atual completo, freshness desatualizado e campos ausentes. |
| `tests/unit/ForecastList.test.tsx` | Testes de UI | Cobertura de cinco cards, unidade Fahrenheit e campos ausentes na previsão. |
| `tests/unit/states.test.tsx` | Testes de UI | Cobertura de loading acessível, mensagem/retry de erro e título/dica do estado vazio. |
| `tests/unit/App.test.tsx` | Testes de integração da UI | Cobertura dos estados da tela principal, fluxo com `weatherDataMock` e conversão de unidade sem nova consulta. |
| `tests/e2e/weather.spec.ts` | Testes E2E | Fluxo da aplicação, estado vazio e fluxo mobile em 320 px sem overflow horizontal. |

## Pendências Conhecidas para Replicação

- Reconciliar a política de retry de AC-08.2 com Assumptions/Edge Cases, definir fallback para HTTP 429 sem `Retry-After` e esclarecer HTTP 408.
- Confirmar se `current.time` da Open-Meteo representa a observação ou o timestamp do dado/modelo antes de aplicar freshness de 168 horas.
- Definir o escopo geográfico e como contexto de estado/região/país refina a busca do geocoding.
- Aprovar formatos locais de data/hora e o fallback quando timezone não estiver disponível.
- Aprovar plataformas/dispositivos e NFRs de acessibilidade, performance e disponibilidade.
- Definir se cidade/unidade persistem localmente; esclarecer retenção/logs da Open-Meteo.
- Validar personas e métricas de sucesso com usuários.

## Modelo para Novas Entradas

Acrescente novas entradas ao final do histórico, mantendo a ordem cronológica:

```markdown
### N. Título curto da interação

- **Pedido:** resumo fiel do que foi solicitado.
- **Resposta/execução:** o que foi explicado, decidido ou alterado; indicar se houve edição de arquivo.
- **Artefatos afetados:** caminhos relativos ou “nenhum”.
- **Pendências:** decisões restantes ou “nenhuma”.
```
***