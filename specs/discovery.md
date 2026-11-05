# Discovery: Aplicação de Previsão do Tempo

## Contexto

A empresa precisa de uma aplicação para que usuários consultem informações meteorológicas de cidades. O produto deve apresentar o clima atual, oferecer uma previsão para os próximos cinco dias, permitir alternância entre Celsius e Fahrenheit e funcionar em dispositivos móveis.

O briefing descreve as capacidades essenciais. As decisões registradas neste documento definem a fonte dos dados, o recorte da previsão, a unidade padrão, a ausência de autenticação e persistência no servidor e o idioma da interface. Público-alvo, plataformas suportadas, cobertura e atualização dos dados, entre outros detalhes, ainda precisam ser esclarecidos antes de consolidar a especificação do produto.

## Personas (hipóteses)

As personas abaixo são hipóteses iniciais para orientar a descoberta, não segmentos confirmados. Validar com usuários antes de usá-las como base definitiva para priorização.

| Persona | Objetivo principal | Contexto de uso | Métrica de sucesso percebida |
|---|---|---|---|
| **Marina, pessoa que se desloca diariamente** | Saber se precisa adaptar roupa ou trajeto ao clima. | Principalmente mobile, antes de sair de casa ou durante o deslocamento. | Encontra a cidade e entende o clima atual em até 30 segundos, sem consultar outra fonte. |
| **Rafael, planejador de atividades ao ar livre** | Comparar a previsão dos próximos dias para escolher quando realizar uma atividade. | Pesquisa inicial no desktop e consulta rápida no mobile perto da data. | Identifica os cinco dias e consegue escolher um dia adequado sem confusão sobre datas ou condições. |
| **Camila, viajante entre regiões** | Consultar o clima de diferentes cidades e interpretar temperaturas na unidade que prefere. | Mobile durante a viagem e desktop no planejamento do roteiro. | Encontra a localidade correta e vê as temperaturas atuais e previstas consistentemente em Celsius ou Fahrenheit. |

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** o usuário deve poder informar o nome de uma cidade e localizar uma opção correspondente para consulta.
- **RF-02 — Consultar clima atual:** após selecionar uma cidade, o usuário deve poder visualizar as condições meteorológicas atuais dessa localidade.
- **RF-03 — Consultar previsão de cinco dias:** para a cidade selecionada, o usuário deve poder visualizar a previsão dos cinco dias seguintes.
- **RF-04 — Alternar unidade de temperatura:** o usuário deve poder alternar a exibição da temperatura entre Celsius e Fahrenheit.
- **RF-05 — Aplicar unidade selecionada:** a unidade escolhida pelo usuário deve ser aplicada às temperaturas do clima atual e da previsão.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** a interface deve se adaptar a telas de dispositivos móveis e permitir a utilização das funcionalidades principais nesses dispositivos.
- **RNF-02 — Legibilidade:** informações meteorológicas e temperaturas devem ser apresentadas de forma compreensível nas unidades selecionadas.
- **RNF-03 — Suporte a dispositivos móveis:** as funcionalidades principais de busca e consulta devem estar disponíveis em dispositivos móveis.

O briefing não estabelece metas mensuráveis de desempenho, disponibilidade, acessibilidade, compatibilidade entre navegadores ou atualização dos dados. Esses atributos precisam de definição para que possam ser especificados e validados.

## Riscos

| Tipo | Risco | Probabilidade | Impacto | Estratégia de mitigação |
|---|---|---|---|---|
| Técnico | Indisponibilidade, lentidão ou limite de requisições do Open-Meteo. | Média | Alto: usuários podem não conseguir consultar o clima. | Validar limites e disponibilidade; definir timeout, tratamento de erro, monitoramento e comportamento degradado. |
| Técnico | Dados desatualizados ou cobertura insuficiente para localidades procuradas. | Média | Alto: informações podem estar incorretas ou indisponíveis. | Validar cobertura para regiões prioritárias; definir idade máxima dos dados e comunicar quando não forem atuais. |
| Produto | Busca ambígua retorna ou conduz à seleção da cidade errada. | Alta | Alto: a consulta perde utilidade e confiança. | Exibir região e país para desambiguar; testar nomes repetidos, buscas parciais e sem resultados. |
| Produto | Granularidade ou conteúdo da previsão não corresponde à expectativa dos usuários. | Média | Médio: a previsão pode não apoiar a decisão pretendida. | Validar com usuários se a visão deve ser diária ou horária e quais campos são essenciais; transformar a decisão em critérios de aceite. |
| Técnico | Conversão ou aplicação inconsistente entre Celsius e Fahrenheit. | Média | Alto: pode induzir interpretações erradas da temperatura. | Centralizar conversão e formatação; indicar a unidade e testar clima atual e previsão nas duas escalas. |
| Produto | Conteúdo não atende às necessidades do público prioritário. | Média | Alto: o app pode cumprir requisitos sem resolver o problema do usuário. | Validar as personas e situações de uso com usuários; priorizar informações com base nessa pesquisa. |
| Técnico | Experiência móvel inadequada em telas pequenas ou redes lentas. | Média | Médio/alto: busca e leitura dos dados ficam difíceis. | Definir dispositivos e larguras de referência; testar fluxos principais em telas pequenas e conexões lentas. |
| Técnico | Desempenho, disponibilidade e acessibilidade sem critérios verificáveis. | Alta | Médio/alto: problemas podem passar despercebidos até depois do lançamento. | Definir metas mensuráveis e incluir medições de desempenho, disponibilidade e acessibilidade na validação. |
| Técnico | Geolocalização sem consentimento ou tratamento transparente, caso venha a ser incluída. | Baixa/média | Alto: pode reduzir confiança e criar riscos de privacidade. | Confirmar se geolocalização faz parte do escopo; se sim, pedir permissão contextual, oferecer busca manual e documentar o tratamento dos dados. |
| Produto | Ausência de métricas para avaliar o sucesso do produto. | Alta | Médio: fica difícil priorizar melhorias ou avaliar o lançamento. | Definir indicadores antes do lançamento, como sucesso na busca, tempo para concluir consulta e satisfação dos usuários. |

## Perguntas em Aberto

- **Público e necessidade:** quem são os usuários prioritários e em quais situações consultarão o app? **Impacto:** sem isso, prioridades de conteúdo, fluxo de busca e critérios de sucesso podem não atender ao público real.
- **Plataforma e distribuição:** “usar em dispositivos móveis” significa um site responsivo, um app nativo ou ambos? Quais sistemas, navegadores, versões e tamanhos de tela devem ser suportados? **Impacto:** a decisão altera escopo, experiência, compatibilidade e esforço de entrega; sem ela, não há matriz de validação clara.
- **Busca e escopo geográfico:** a busca aceita somente nomes de cidades ou também regiões, países, CEPs e localização do dispositivo? Quais países e idiomas devem ser cobertos? **Impacto:** sem limites definidos, não é possível escolher nem testar adequadamente a busca e a cobertura geográfica.
- **Desambiguação e seleção:** como diferenciar cidades homônimas (por exemplo, por estado ou país), ordenar correspondências e tratar buscas sem resultado? **Impacto:** usuários podem consultar o clima da localidade errada ou ficar sem um caminho para prosseguir.
- **Geolocalização e privacidade:** o app deve solicitar localização do dispositivo ou usar apenas busca manual? Se usar localização, quando solicitar permissão e como tratar recusa e dados de localização? **Impacto:** a resposta afeta permissões, confiança, privacidade e comportamento em navegadores e dispositivos.
- **Fonte e cobertura dos dados:** **resolvido parcialmente:** a fonte será Open-Meteo, sem API key. Para quais regiões há cobertura adequada, com que frequência os dados são atualizados e quais condições de uso se aplicam? **Impacto:** lacunas de cobertura, atualização, qualidade ou limites de uso ainda podem comprometer a experiência planejada.
- **Atualidade e precisão:** com que frequência os dados devem ser atualizados e qual idade máxima é aceitável para exibi-los como atuais? **Impacto:** sem limites, “clima atual” pode representar dados antigos sem que usuário ou equipe saibam quando a informação deixou de ser confiável.
- **Conteúdo do clima atual:** quais campos são necessários (por exemplo, temperatura, sensação térmica, condição, umidade, vento e horário da observação)? **Impacto:** a equipe pode entregar um painel que tecnicamente mostra o clima, mas não responde à necessidade dos usuários.
- **Definição da previsão de cinco dias:** **resolvido parcialmente:** o período é hoje mais os quatro dias seguintes. A previsão será diária ou horária, e quais valores e condições deve incluir? **Impacto:** sem definir granularidade e conteúdo, os critérios de aceite continuam ambíguos.
- **Unidades e formatos:** **resolvido parcialmente:** Celsius é a unidade padrão e o idioma da interface será pt-BR. Quais unidades usar para vento e precipitação, e quais formatos regionais de data e hora adotar? **Impacto:** formatos ou unidades inconsistentes podem confundir usuários e exigir retrabalho.
- **Persistência e autenticação:** **resolvido parcialmente:** não haverá autenticação nem persistência de servidor. A cidade e a unidade escolhidas devem ser mantidas localmente entre visitas? **Impacto:** sem essa definição, o comportamento após fechar ou recarregar a aplicação pode não corresponder às expectativas de conveniência e privacidade.
- **Estados e falhas:** o que mostrar durante carregamento, sem resultados, sem conexão, timeout, limite de requisições ou indisponibilidade do provedor? Pode-se mostrar dados anteriores, e como identificá-los? **Impacto:** sem regras, falhas podem parecer defeitos ou apresentar informação desatualizada como se fosse atual.
- **Desempenho:** quais tempos máximos são aceitáveis para busca e carregamento do clima em redes e dispositivos representativos? **Impacto:** sem metas e condições de medição, não é possível verificar se o app responde rápido o bastante para uso real.
- **Disponibilidade e degradação:** qual disponibilidade é esperada e quais funcionalidades devem continuar acessíveis quando o provedor meteorológico estiver indisponível? **Impacto:** não se pode definir monitoramento, contingência ou expectativas de serviço.
- **Acessibilidade:** quais padrões e necessidades devem ser atendidos, incluindo navegação por teclado, leitores de tela, contraste e ampliação? **Impacto:** usuários podem ficar impedidos de completar tarefas, e a conformidade não poderá ser validada.
- **Critérios de sucesso e aceite:** quais resultados demonstram que o produto atende ao objetivo (por exemplo, sucesso ao encontrar uma cidade, tempo de consulta ou satisfação)? **Impacto:** sem métricas ou critérios de aceite, não há base objetiva para priorizar, avaliar o lançamento ou decidir se a solução funcionou.

## Decisões

- **Fonte de dados — Open-Meteo, sem API key.** **Justificativa:** usar uma fonte definida sem exigir uma chave de API para a consulta. **Resolve:** a escolha inicial do provedor. **Ainda requer validação:** cobertura geográfica, atualização, limites e condições de uso.
- **Período da previsão — hoje mais os quatro dias seguintes.** **Justificativa:** definir explicitamente quais cinco dias compõem a previsão. **Resolve:** a dúvida sobre incluir o dia atual ou apresentar os cinco dias posteriores. **Ainda requer definição:** granularidade (diária ou horária) e campos exibidos.
- **Unidade padrão — Celsius.** **Justificativa:** estabelecer uma unidade inicial previsível para a primeira consulta. **Resolve:** qual unidade exibir por padrão; a alternância para Fahrenheit continua prevista. **Ainda requer definição:** persistência local da escolha e unidades de outras grandezas.
- **Acesso e armazenamento — sem autenticação e sem persistência de servidor.** **Justificativa:** manter o escopo inicial sem contas ou armazenamento associado a usuários no servidor. **Resolve:** se será necessário login e armazenamento de dados no servidor. **Ainda requer definição:** se preferências ou cidade serão mantidas localmente no dispositivo.
- **Idioma da interface — português do Brasil (pt-BR).** **Justificativa:** definir o idioma inicial da experiência. **Resolve:** qual idioma usar na interface. **Ainda requer definição:** formatos regionais de data e hora e eventual suporte a outros idiomas.

## Suposições

- A busca e a seleção de uma cidade são pré-requisitos para consultar o clima correspondente.
- O escopo inicial é a consulta meteorológica; alertas, mapas, contas de usuário e notificações não foram solicitados e não são considerados requisitos neste discovery.
- Celsius é a unidade padrão; Celsius e Fahrenheit são as unidades de temperatura necessárias no escopo inicial.
- “Previsão de 5 dias” significa hoje mais os quatro dias seguintes; a granularidade permanece em aberto.
- A aplicação usará Open-Meteo como fonte meteorológica, sem API key.
- A aplicação não terá autenticação nem persistência de servidor.
- O idioma inicial da interface será pt-BR.
- “Usar em dispositivos móveis” indica que as funcionalidades principais devem ser utilizáveis em uma interface adequada a telas móveis; a forma de distribuição ainda precisa ser confirmada.
