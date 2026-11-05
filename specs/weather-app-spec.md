# Especificação de Produto: Weather App

## Overview

O Weather App permitirá que usuários encontrem uma cidade e consultem seu clima atual e uma previsão de cinco dias. A experiência deverá funcionar em dispositivos móveis, apresentar a interface em português do Brasil (pt-BR) e permitir visualizar temperaturas em Celsius ou Fahrenheit.

Decisões confirmadas no discovery:

- Fonte meteorológica: Open-Meteo, sem API key.
- Período da previsão: hoje mais os quatro dias seguintes.
- Unidade inicial: Celsius; Fahrenheit também estará disponível.
- Não haverá autenticação nem persistência de dados no servidor.
- Idioma inicial da interface: pt-BR.

O público-alvo ainda não foi validado. As personas no discovery são hipóteses para orientar a descoberta, não segmentos confirmados.

## Functional Requirements

- **FR-01 — Buscar cidades:** permitir que o usuário pesquise cidades pelo nome.
- **FR-02 — Selecionar e distinguir cidades:** permitir selecionar uma cidade correspondente. Se os resultados não contiverem informação suficiente para determinar a localidade desejada, solicitar contexto adicional (como estado, região ou país) e não escolher uma cidade automaticamente.
- **FR-03 — Consultar clima atual:** apresentar as condições atuais para a cidade selecionada, incluindo temperatura, descrição da condição e, quando fornecido, o horário da observação. Dados com mais de sete dias devem ser identificados como desatualizados.
- **FR-04 — Consultar previsão de cinco dias:** apresentar dados para hoje e os quatro dias seguintes no fuso local da cidade. A visualização inicial será horária; o usuário poderá alternar para uma visualização diária com condição meteorológica e temperaturas mínima e máxima.
- **FR-05 — Alternar unidade de temperatura:** permitir alternar entre Celsius e Fahrenheit, usando Celsius como padrão inicial.
- **FR-06 — Aplicar unidade consistentemente:** apresentar todas as temperaturas do clima atual e da previsão na unidade selecionada, com a unidade claramente identificada.
- **FR-07 — Acesso sem conta e sem histórico no servidor do app:** permitir consultas sem autenticação e não manter histórico de buscas nem preferências em armazenamento controlado pela aplicação. A cidade pesquisada é enviada ao Open-Meteo para geocoding/consulta; retenção e logs do provedor não estão cobertos por essa garantia.
- **FR-08 — Comunicar estados e tratar falhas:** apresentar estados de carregamento, resultado vazio e mensagens de erro em pt-BR; aplicar mensagens e política de nova tentativa de acordo com o tipo de falha.
- **FR-09 — Apresentar a interface em pt-BR:** exibir textos da interface em português do Brasil. Formatos regionais de data e hora precisam ser confirmados.

## User Stories

- **US-01 (FR-01, FR-02):** Como Marina, pessoa que se desloca diariamente, quero buscar minha cidade e selecionar o resultado correto para consultar as condições da localidade onde estou.
- **US-02 (FR-03):** Como Marina, pessoa que se desloca diariamente, quero ver o clima atual da minha cidade para decidir como me preparar para sair.
- **US-03 (FR-04):** Como Rafael, planejador de atividades ao ar livre, quero consultar a previsão horária e alternar para a visão diária de hoje e dos quatro dias seguintes para escolher uma data adequada para minha atividade.
- **US-04 (FR-01, FR-02):** Como Camila, viajante entre regiões, quero distinguir cidades com nomes iguais e selecionar a localidade desejada para consultar o clima do destino correto.
- **US-05 (FR-05, FR-06):** Como Camila, viajante entre regiões, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.
- **US-06 (FR-07, FR-09):** Como Rafael, planejador de atividades ao ar livre, quero consultar o app em pt-BR sem criar uma conta para obter a previsão sem etapas desnecessárias.
- **US-07 (FR-08):** Como Marina, pessoa que se desloca diariamente, quero receber uma mensagem clara quando a busca ou consulta falhar para saber que posso tentar novamente.

As histórias refletem necessidades hipotéticas derivadas das personas do discovery e devem ser validadas com usuários.

## Acceptance Criteria

- **AC-01.1 (FR-01) — Busca com resultado:**
	- **Given** que o usuário está na tela de busca e informa o nome de uma cidade existente;
	- **When** envia a consulta;
	- **Then** o sistema apresenta uma lista de correspondências retornadas pela fonte de dados.
- **AC-01.2 (FR-01) — Espaços e resultado vazio:**
	- **Given** que o usuário informa um nome de cidade com espaços no início ou no fim;
	- **When** envia a consulta;
	- **Then** a busca é feita pelo nome sem os espaços externos e apresenta correspondências ou uma mensagem de nenhum resultado.
- **AC-01.3 (FR-01) — Caracteres especiais:**
	- **Given** que o usuário informa um nome de cidade com caracteres válidos, como acentos, hífen ou apóstrofo;
	- **When** envia a consulta;
	- **Then** os caracteres são preservados como parte do nome pesquisado e não são interpretados como marcação ou comando.
- **AC-01.4 (FR-01, FR-08) — Cidade inexistente ou sem correspondência no geocoding:**
	- **Given** que o geocoding responde com sucesso, mas não retorna correspondências para a consulta;
	- **When** a resposta é apresentada;
	- **Then** o app informa que não encontrou uma localidade, mantém o texto pesquisado disponível para edição e não solicita dados meteorológicos. Se não foi informado estado, região ou país, solicita contexto adicional; caso contrário, permite corrigir ou reformular a busca. O resultado vazio não é tratado como erro do serviço nem como prova de que a cidade não existe.
- **AC-01.5 (FR-01, FR-08) — Input vazio:**
	- **Given** que o campo de busca está vazio ou contém somente espaços;
	- **When** o usuário envia o formulário;
	- **Then** o app informa que o nome da cidade é obrigatório e nenhuma requisição de geocoding é enviada.
- **AC-02.1 (FR-02) — Seleção de cidade ambígua:**
	- **Given** que os resultados contêm cidades homônimas ou não identificam de forma suficiente uma localidade única;
	- **When** os resultados são exibidos;
	- **Then** cada opção exibe os dados geográficos disponíveis; nenhuma opção é selecionada automaticamente; se faltar estado, região ou país para identificar a localidade, o app solicita esse contexto antes de consultar o clima.
- **AC-02.2 (FR-02) — Consultar cidade selecionada:**
	- **Given** que há mais de uma cidade correspondente;
	- **When** o usuário seleciona uma opção;
	- **Then** as consultas meteorológicas subsequentes usam a localização selecionada.
- **AC-03 (FR-03) — Clima atual:**
	- **Given** que uma cidade foi selecionada e a fonte retorna dados atuais válidos;
	- **When** a consulta termina;
	- **Then** a tela identifica a cidade e apresenta a temperatura e a condição meteorológica atuais.
- **AC-03.1 (FR-03) — Resposta atual parcial:**
	- **Given** que a resposta do clima atual não contém um ou mais campos;
	- **When** os dados são exibidos;
	- **Then** os campos válidos são apresentados e os ausentes são identificados como indisponíveis; temperatura ou condição ausente não é substituída por um valor inventado ou zero.
- **AC-03.2 (FR-03) — Horário da observação:**
	- **Given** que a fonte retorna um horário de observação para o clima atual;
	- **When** o clima é exibido;
	- **Then** o horário da observação é apresentado no horário local da cidade. Se a fonte não retornar esse dado, o app não inventa um horário.
- **AC-03.3 (FR-03) — Dados desatualizados:**
	- **Given** que a idade do dado, calculada em UTC a partir do timestamp da observação, é superior a 168 horas;
	- **When** os dados meteorológicos são exibidos;
	- **Then** são marcados visivelmente como desatualizados, com a data/hora da observação quando disponível, e não são apresentados sem ressalva como clima atual.
- **AC-03.4 (FR-03) — Horário de observação ausente:**
	- **Given** que a fonte retorna dados de clima atual sem horário de observação;
	- **When** o clima é exibido;
	- **Then** o app informa que o horário está indisponível e que não foi possível confirmar a atualidade dos dados.
- **AC-04.1 (FR-04) — Datas da previsão:**
	- **Given** que uma cidade selecionada tem dados de previsão para o período solicitado;
	- **When** a previsão é exibida;
	- **Then** são apresentados exatamente cinco dias consecutivos, começando pela data local atual da cidade e incluindo os quatro dias seguintes, em ordem cronológica.
- **AC-04.2 (FR-04) — Visualização horária padrão:**
	- **Given** que existem dados horários para o período da previsão;
	- **When** a previsão é aberta;
	- **Then** a visualização horária está selecionada por padrão e cada registro disponível apresenta horário local, temperatura e condição, em ordem cronológica e agrupado na data local correspondente.
- **AC-04.3 (FR-04) — Resposta de previsão parcial:**
	- **Given** que a resposta de previsão não contém todos os campos para um ou mais horários ou dias;
	- **When** a previsão é exibida;
	- **Then** as cinco datas permanecem na ordem prevista, os campos disponíveis são exibidos e os ausentes são identificados como indisponíveis, sem estimar ou inventar valores.
- **AC-04.4 (FR-04) — Alternância para visualização diária:**
	- **Given** que a previsão horária está visível e existem dados diários;
	- **When** o usuário seleciona a visualização diária;
	- **Then** são apresentados cinco resumos, um por data local, contendo condição meteorológica e temperaturas mínima e máxima.
- **AC-05.1 (FR-05) — Unidade inicial:**
	- **Given** que o usuário inicia uma consulta sem ter selecionado outra unidade;
	- **When** temperaturas são exibidas;
	- **Then** os valores são apresentados em Celsius e identificados como Celsius.
- **AC-05.2 (FR-05) — Alternância de unidade:**
	- **Given** que as temperaturas estão visíveis;
	- **When** o usuário seleciona Fahrenheit e depois Celsius;
	- **Then** a unidade exibida muda para a opção escolhida em cada ação.
- **AC-05.3 (FR-05, FR-06) — Conversão verificável:**
	- **Given** que a temperatura de origem é 20 °C;
	- **When** o usuário seleciona Fahrenheit;
	- **Then** o valor correspondente é exibido como 68 °F.
- **AC-06 (FR-06) — Consistência da unidade:**
	- **Given** que clima atual e previsão estão visíveis;
	- **When** o usuário altera a unidade;
	- **Then** todas as temperaturas visíveis passam à unidade selecionada e nenhuma fica sem indicação da unidade.
- **AC-07.1 (FR-07) — Uso sem autenticação:**
	- **Given** que um usuário abre o app em uma sessão nova;
	- **When** busca uma cidade e solicita seus dados meteorológicos;
	- **Then** consegue concluir essas ações sem criar conta ou autenticar-se.
- **AC-07.2 (FR-07) — Sem gravação de preferências no servidor:**
	- **Given** que o usuário realiza buscas e altera a unidade;
	- **When** as requisições de rede são inspecionadas;
	- **Then** o app não envia histórico de buscas nem preferências para serem persistidos em um servidor.
- **AC-08.1 (FR-08) — Estado de carregamento:**
	- **Given** que uma busca ou consulta meteorológica foi enviada e ainda não foi concluída;
	- **When** a resposta está pendente;
	- **Then** a interface apresenta um indicador de carregamento.
- **AC-08.2 (FR-08) — Erro e nova tentativa:**
	- **Given** que ocorre uma falha transitória de rede ou o provedor retorna um erro HTTP 5xx;
	- **When** a falha é detectada;
	- **Then** a interface mantém a cidade/consulta, informa que o serviço está temporariamente indisponível e faz no máximo uma nova tentativa automática: após `Retry-After`, se fornecido, ou após um segundo, caso contrário. Se a tentativa falhar, oferece nova tentativa manual e não apresenta dados antigos como atuais.
- **AC-08.3 (FR-08) — Timeout:**
	- **Given** que uma busca ou consulta permanece pendente;
	- **When** o limite de cinco segundos para geocoding ou dez segundos para previsão, contado do envio da requisição até o recebimento e decodificação completa da resposta, é atingido;
	- **Then** a tentativa é cancelada, a interface informa que a consulta excedeu o tempo esperado e faz no máximo uma nova tentativa automática após um segundo; após nova falha, oferece nova tentativa manual.
- **AC-08.4 (FR-08) — Limite de requisições:**
	- **Given** que o provedor retorna HTTP 429;
- **When** a resposta inclui `Retry-After` em segundos ou como data HTTP;
- **Then** o app não repete a requisição automaticamente, informa o prazo de espera e mantém a nova tentativa desabilitada até esse prazo.
- **AC-08.4.1 (FR-08) — Limite sem prazo informado:**
	- **Given** que o provedor retorna HTTP 429 sem o cabeçalho `Retry-After`;
	- **When** a resposta é recebida;
	- **Then** o app não repete a requisição automaticamente, informa que o serviço está limitando consultas e permite nova tentativa manual mais tarde.
- **AC-08.5 (FR-08) — Erro HTTP não transitório:**
	- **Given** que o provedor retorna um erro HTTP 4xx diferente de 408 ou 429;
	- **When** a resposta é recebida;
	- **Then** o app não repete a requisição automaticamente, apresenta mensagem de solicitação não aceita em pt-BR, mantém a busca editável e não oferece retry automático.

- **AC-09 (FR-09) — Idioma da interface:**
	- **Given** que qualquer tela ou estado do app é exibido;
	- **When** o usuário lê controles, rótulos ou mensagens;
	- **Then** os textos da interface estão em português do Brasil (pt-BR).
	- **Observação:** o formato exato de datas e horas depende da decisão ainda aberta sobre convenções regionais.

## Rastreabilidade

Cada linha liga a história aos critérios que a verificam e aos NFRs relevantes. NFR-01 a NFR-04 são propostas pendentes de aprovação; seu vínculo não significa que as metas já foram aprovadas.

| User Story | Acceptance Criteria | Non-Functional Requirements relevantes |
|---|---|---|
| **US-01 — Buscar e selecionar a cidade** | AC-01.1, AC-01.2, AC-01.3, AC-01.4, AC-01.5, AC-02.1, AC-02.2 | NFR-01, NFR-02, NFR-03, NFR-05 |
| **US-02 — Consultar clima atual** | AC-03, AC-03.1, AC-03.2, AC-03.3, AC-03.4, AC-06 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05 |
| **US-03 — Consultar previsão horária ou diária** | AC-04.1, AC-04.2, AC-04.3, AC-04.4, AC-06 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05 |
| **US-04 — Distinguir cidades homônimas** | AC-01.1, AC-01.3, AC-01.4, AC-02.1, AC-02.2 | NFR-01, NFR-02, NFR-03, NFR-05 |
| **US-05 — Alternar Celsius e Fahrenheit** | AC-05.1, AC-05.2, AC-05.3, AC-06 | NFR-01, NFR-02, NFR-05 |
| **US-06 — Usar o app em pt-BR sem conta** | AC-07.1, AC-07.2, AC-09 | NFR-02, NFR-06 |
| **US-07 — Receber orientação quando uma consulta falha** | AC-01.4, AC-01.5, AC-08.1, AC-08.2, AC-08.3, AC-08.4, AC-08.4.1, AC-08.5 | NFR-01, NFR-02, NFR-03, NFR-04, NFR-05 |

## Non-Functional Requirements

- **NFR-01 — Responsividade [PENDENTE DE APROVAÇÃO]:** proposta de validação: busca, seleção e previsão sem rolagem horizontal ou perda de conteúdo essencial a partir de 320 px. Dispositivos, larguras e matriz de navegadores ainda precisam de aprovação.
- **NFR-02 — Acessibilidade [PENDENTE DE APROVAÇÃO]:** proposta: controles operáveis por teclado, nomes acessíveis e conformidade WCAG 2.2 nível AA. O nível e o método de auditoria ainda precisam de aprovação.
- **NFR-03 — Desempenho [PENDENTE DE APROVAÇÃO]:** proposta: percentil 95 de até três segundos, medidos da confirmação da busca/consulta até a apresentação do primeiro resultado utilizável, quando o provedor responde em até um segundo. Geocoding e previsão devem ser medidos separadamente. Dispositivos, redes, carga e janela/amostra ainda precisam de aprovação.
- **NFR-04 — Disponibilidade [PENDENTE DE APROVAÇÃO]:** proposta: 99,5% mensal para a interface. O período de medição e o limite de responsabilidade entre o app e o Open-Meteo ainda precisam de aprovação; a disponibilidade do provedor não é garantida por esta meta.
- **NFR-05 — Legibilidade e consistência:** cada temperatura exibida deve incluir `°C` ou `°F`; a previsão horária deve identificar o horário local e a diária deve identificar a data local. Os textos e valores não podem ser cortados nos dispositivos/tamanhos de tela que vierem a ser aprovados.
- **NFR-06 — Privacidade:** o app não exige autenticação nem envia histórico de buscas ou preferências para armazenamento no servidor da aplicação. Consultas enviam ao Open-Meteo os dados da cidade necessários para obter resultados; armazenamento, logs e retenção pelo provedor permanecem em aberto.

As metas, dispositivos, redes, janela de medição e limite de responsabilidade do provedor acima estão pendentes de aprovação. Não são critérios fechados de aceite até que stakeholders os aprovem. A garantia de não persistência refere-se ao servidor controlado pelo app; não implica ausência de logs ou retenção pelo Open-Meteo.

## Edge Cases

- Input vazio ou composto somente por espaços: após remover espaços externos, não enviar requisição de geocoding; informar que o nome da cidade é obrigatório e manter o campo disponível para edição.
- Cidade inexistente, fora da cobertura ou sem contexto suficiente: quando o geocoding retornar vazio, informar que não há correspondências, manter a busca editável e não consultar a previsão; solicitar estado, região ou país se esses dados não foram informados, ou permitir reformular a consulta quando já foram. Não afirmar que a cidade não existe apenas pela ausência de resultados.
- Geocoding sem resultados: tratar resposta HTTP bem-sucedida com lista vazia como ausência de correspondência (um único estado vazio definido em AC-01.4), não como erro do serviço.
- Caracteres especiais no nome da cidade: preservar caracteres válidos de nomes, como acentos, hífens e apóstrofos, na pesquisa; tratá-los como texto literal, sem interpretá-los como marcação ou comando. Se não houver correspondência, apresentar o estado sem resultados.
- Várias cidades com o mesmo nome: solicitar seleção explícita entre resultados diferenciados por localização.
- Falha de rede ou HTTP 5xx: fazer no máximo uma nova tentativa automática após um segundo; após falha, mostrar erro em pt-BR e oferecer nova tentativa manual, preservando a cidade selecionada.
- Limite de requisições HTTP 429: não fazer retry antes do instante definido em `Retry-After`; sem esse cabeçalho, não fazer retry automático e informar que o usuário pode tentar novamente mais tarde.
- Outro erro HTTP 4xx: não repetir automaticamente; apresentar mensagem em pt-BR apropriada ao erro e manter a busca/cidade selecionada para correção ou nova tentativa manual.
- Timeout: aplicar cinco segundos por tentativa de geocoding e dez segundos por tentativa de previsão, desde o envio até o recebimento e decodificação completa da resposta; fazer no máximo um retry automático após um segundo.
- Dados meteorológicos com mais de sete dias: marcar visivelmente como desatualizados e exibir o horário da observação quando fornecido; não apresentá-los sem ressalva como clima atual. Se não houver horário da observação, informar que a atualidade não pôde ser confirmada.
- Resposta parcial ou campos meteorológicos ausentes: apresentar os campos válidos e identificar os ausentes como indisponíveis. Se faltar temperatura ou condição atual, indicar que o clima atual não pode ser apresentado por completo; não preencher campos com zero nem estimar valores.
- Previsão parcial: manter as cinco datas em ordem; apresentar os campos disponíveis para cada dia e identificar os ausentes como indisponíveis, sem inventar valores ou remover silenciosamente a data.
- Virada de data no fuso da cidade: determinar as cinco datas com base na data local da localidade consultada, não apenas no relógio do dispositivo.
- Alternância de unidade com previsão carregada: atualizar todos os valores de temperatura sem alterar cidade ou datas.
- Arredondamento entre Celsius e Fahrenheit: manter uma regra consistente de arredondamento e identificar a unidade exibida.
- Fechamento ou recarregamento da página: não depender de uma conta ou de dados de usuário armazenados no servidor; a restauração local de cidade e unidade permanece por decidir.

## Assumptions

- Open-Meteo será o provedor de geocodificação e dados meteorológicos, conforme a decisão do discovery; cobertura, limites e condições de uso ainda serão verificados.
- A expressão “hoje mais os quatro dias seguintes” refere-se a datas do calendário local da cidade consultada.
- A previsão horária será a visualização inicial; a visão diária será selecionável pelo usuário.
- Celsius é a unidade padrão; Celsius e Fahrenheit são as unidades de temperatura necessárias no escopo inicial.
- Dados meteorológicos com idade superior a sete dias serão considerados desatualizados. A idade é calculada a partir do horário da observação ou, quando aplicável, do timestamp de atualização fornecido pela fonte.
- A política inicial de timeout/retry será de cinco segundos por tentativa de geocoding, dez segundos por tentativa de previsão, um retry para falha transitória/timeout/5xx após um segundo, e respeito a `Retry-After` para HTTP 429 sem retry antecipado.
- Quando o geocoding não permitir identificar a localidade desejada, o app solicitará estado, região ou país, sem selecionar uma localidade por suposição.
- A aplicação não terá autenticação nem persistência de servidor. Persistência local de cidade ou preferências não está decidida.
- A interface será pt-BR; formatos de data e hora precisam de definição complementar.
- As três personas (deslocamento diário, planejamento ao ar livre e viagem entre regiões) são hipóteses não validadas.
- Metas de desempenho, disponibilidade, acessibilidade e suporte a dispositivos desta especificação são propostas pendentes de aprovação, não compromissos aprovados.

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Indisponibilidade, lentidão ou limites de requisição do Open-Meteo. | Média | Alto: usuários podem não conseguir consultar o clima. | Validar limites e disponibilidade; tratar timeout e falhas; permitir nova tentativa e monitorar erros. |
| Dados desatualizados ou cobertura insuficiente. | Média | Alto: informações podem estar incorretas ou indisponíveis para cidades procuradas. | Validar cobertura para o público-alvo; definir atualização máxima aceitável e comunicar quando os dados não estiverem disponíveis ou atuais. |
| Seleção de cidade incorreta por resultados ambíguos. | Alta | Alto: o usuário recebe informações de outra localidade. | Apresentar região/país quando disponíveis e exigir seleção explícita em casos ambíguos. |
| Conteúdo da previsão inadequado às necessidades. | Média | Médio: previsão pode não ajudar a planejar atividades. | Validar os campos da visão horária e diária com usuários; a alternância horária/diária já está definida. |
| Conversão ou identificação de unidades inconsistente. | Média | Alto: usuário pode interpretar incorretamente as temperaturas. | Testar Celsius e Fahrenheit em todos os componentes e identificar a unidade junto aos valores. |
| Experiência móvel, acessibilidade ou desempenho aquém da necessidade. | Média | Alto: usuários podem não concluir consultas ou compreender os resultados. | Aprovar metas, testar em dispositivos/redes representativos e realizar avaliação de acessibilidade. |
| Personas e métricas baseadas em hipóteses não representarem o público real. | Média | Médio/alto: prioridades e indicadores podem otimizar para usuários errados. | Fazer pesquisa com usuários e revisar personas e métricas antes de priorizar funcionalidades. |

## Out of Scope

- Criação de contas, autenticação e perfis de usuário.
- Persistência no servidor de histórico de buscas, cidades favoritas ou preferências.
- Alertas meteorológicos, notificações push e avisos severos.
- Mapas meteorológicos, dados históricos, qualidade do ar e recomendações personalizadas.
- Geolocalização automática do dispositivo; qualquer inclusão exige decisão específica sobre consentimento e privacidade.
- Idiomas além de pt-BR para a versão inicial.

## Open Questions

- Quem é o público prioritário e quais situações de uso devem orientar as prioridades? As personas atuais precisam ser validadas?
- **Pendente (item 9 da revisão):** o produto será um site responsivo, um aplicativo nativo ou ambos? Quais dispositivos, sistemas, navegadores, versões e tamanhos de tela serão oficialmente suportados?
- Quais países e localidades devem ser cobertos? A busca aceitará somente cidades ou também regiões, países, CEPs ou localização do dispositivo?
- Como ordenar e desambiguar resultados de cidades homônimas, e qual contexto geográfico será exibido?
- Quais são as condições de uso, limites, cobertura e cadência de atualização relevantes do Open-Meteo para o produto?
- Quais campos adicionais devem compor o clima atual e as visualizações horária e diária, além de temperatura, condição e mínimas/máximas diárias?
- Qual regra de fuso horário e quais formatos de data e hora serão usados para as localidades consultadas?
- Quando a fonte não fornecer timestamp da observação ou atualização, qual sinal adicional deve ser usado para avaliar a idade dos dados?
- A cidade e a unidade escolhidas devem persistir localmente entre visitas, apesar de não haver persistência no servidor?
- Quais metas de desempenho e disponibilidade e qual nível de acessibilidade serão aprovados? As metas propostas nesta spec são aceitáveis?
- **Pendente (item 8 da revisão):** a proibição de persistência abrange logs operacionais, telemetria e retenção feita pelo provedor externo? Como será verificada essa ausência de armazenamento?
- Quais dispositivos, redes, janela de medição e regra de atribuição de indisponibilidade ao Open-Meteo serão aprovados para os NFRs?
- Quais métricas de produto e critérios de sucesso serão usados para avaliar a primeira versão?