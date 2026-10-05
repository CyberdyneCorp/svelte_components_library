# Cobertura de frontends Cyberdyne

Avaliação em 2026-10-04, sobre `origin/main` no commit `61c0f742cfe2df24578178e6f16e5b7be298ad64`.

## Conclusão

A biblioteca tem uma base ampla, mas **ainda não há evidência suficiente para considerá-la completa para todos os frontends Cyberdyne**. Trading é o domínio mais desenvolvido. Landing pages precisam de blocos próprios; finanças, patrimônio e liquidez precisam de composições e contratos de estado que demonstrem fluxos completos.

Esta avaliação inspeciona exports, implementações representativas, testes, stories e configuração de CI. Não é uma auditoria exaustiva de cada componente, nem valida as aplicações consumidoras, seus serviços ou regras de negócio. Ausência de um bloco dedicado não impede construir a tela com primitivas; indica trabalho que hoje cada produto precisaria repetir.

O usuário confirmou Trade4Me como trading, Liquidity4Me como liquidez/DeFi e CyberWealth como patrimônio/carteira. Market4Me permanece sem fluxos definidos; não presumir que seja e-commerce, marketing ou market intelligence.

## Inventário observado

Contagem de arquivos `.svelte` alcançáveis por reexports a partir de `packages/ui/core/src/lib/index.ts`, sem duplicatas: **260 componentes públicos, 19 categorias**. Helpers, fixtures e arquivos internos não contam como componentes públicos.

| Categoria | Componentes públicos |
|---|---:|
| Primitives | 14 |
| Forms | 21 |
| Feedback | 13 |
| Navigation | 10 |
| Data | 20 |
| Layout | 9 |
| Overlay | 5 |
| Auth | 2 |
| Chat | 8 |
| Crypto | 14 |
| ML | 11 |
| Graph | 2 |
| Charts | 21 |
| Editor | 6 |
| Maps | 1 |
| Cesium | 50 |
| Retro | 37 |
| Flow | 8 |
| Trading | 8 |

Há 253 arquivos `*.test.ts` em `packages/` e 262 arquivos `*.stories.svelte` em core. Esses números medem arquivos, não cobertura comportamental, visual ou de acessibilidade. A quantidade de componentes geoespaciais/retro não compensa lacunas em fluxos financeiros ou marketing.

## Matriz por produto

**Existente** = implementação identificada; **composição** = peças existentes, fluxo ainda precisa ser demonstrado; **lacuna** = não foi identificado bloco público específico. Os itens propostos abaixo não são requisitos de negócio já aprovados.

| Produto / fluxo | Base existente | Lacuna ou composição necessária | Prioridade proposta |
|---|---|---|---|
| Landing: navegação e estrutura | NavBar, MegaMenu, Button, GridLayout, Card, temas bento/glass/calm | MarketingHeader responsivo, Section, Footer e navegação por âncoras em página completa | P1 |
| Landing: apresentação e conversão | Tipografia, tokens, imagens via snippets, VideoPlayer | HeroSection, FeatureGrid/bento, CTASection com destinos fornecidos pelo consumidor | P1 |
| Landing: confiança e planos | Avatar, StarRating, Accordion, CurrencyDisplay | LogoCloud, TestimonialGrid, PricingTable, FAQSection; textos e preços reais fornecidos pelo app | P1 |
| Sistemas financeiros: dashboard | KpiCard, BudgetBar, MoneyInput, CurrencyDisplay, LineChart, BarChart, DateRangePicker | Receita/despesa/saldo, fluxo de caixa e comparação de períodos em uma receita documentada | P1 |
| Sistemas financeiros: lançamentos | Table, DataTable, FilterBar, Pagination, Modal | TransactionTable financeira com categorias, contas, estados, filtros e paginação remota; a TransactionList atual é cripto | P1 |
| Sistemas financeiros: rotinas | Inputs, DatePicker, ScheduleConfig, FileDropzone | Composições de contas a pagar/receber, conciliação e importação com erros por linha, se exigidas pelos produtos | P2 |
| Trade4Me: terminal | TradingChart, OrderBook, RecentTrades, TickerBar, OrderTicket, PositionsTable, OpenOrdersTable, LeverageSlider | Terminal já demonstrado em story com feed simulado e interação book → ordem → posição | Existente |
| Trade4Me: operação | Tipos de mercado, aritmética decimal, validação e callbacks de intenção | Receita para conexão/reconexão, cotação desatualizada, envio pendente/rejeitado, histórico de ordens/fills e watchlist | P1 |
| Liquidity4Me: visualizar posições | LiquidityPositionCard, LiquidityRangeBar, PoolRangeHistogram, TVLSparkline, TokenPairIcon, TokenBalanceRow | Dashboard de posições com filtros por rede/pool/wallet e seleção de posição | P1 |
| Liquidity4Me: operar posições | MoneyInput, TokenSelector, GasEstimate, TransactionConfirm, WalletConnect | Composição adicionar/remover liquidez, coletar taxas e acompanhar approve/sign/confirm/error; resultados calculados pelo app | P1 |
| CyberWealth: patrimônio | KpiCard, CurrencyDisplay, TokenBalanceRow, PieChart, AreaChart, Table | PortfolioSummary, HoldingsTable, AllocationBreakdown, PerformanceSummary e metas patrimoniais | P1 |
| CyberWealth: consolidação | Formatação monetária e componentes de gráficos | Estados de ativo sem preço, câmbio/data-base, passivos, valores parciais; método de performance fornecido pelo app | P1 |
| Market4Me | Shell, busca, tabelas, filtros, gráficos; ShoppingCartPanel também existe | Definir atores, entidades e três fluxos principais antes de escolher componentes de domínio | A definir |
| Todos: conta e organização | LoginPage, WalletConnect, Drawer, CommandPalette, ThemeToggle | Receitas para organização/conta, estados de acesso e preferências; autenticação e autorização ficam no app | P2 |

## Qualidade transversal: evidências e lacunas

1. **Acessibilidade não é uma barreira global.** `.storybook/preview.ts` usa `a11y.test: "todo"`; algumas stories, incluindo trading e componentes novos, elevam para `"error"`. A existência do addon não comprova conformidade de toda a biblioteca. Expandir a exigência por fluxo, corrigindo antes as violações.
2. **DataTable precisa de evolução antes de ser a tabela financeira padrão.** `data/DataTable/DataTable.svelte` pagina o array local, usa comparações JS (`av < bv`) e não oferece comparador por coluna. Strings monetárias como `"10"` e `"2"` são ordenadas lexicalmente. Checkboxes de seleção não têm nomes acessíveis; textos de paginação/empty/sort são fixos em inglês. Row click não tem equivalente de teclado explícito. Adicionar sorting controlado/comparadores, paginação remota, labels e ações acessíveis preservando a API existente.
3. **Precisão financeira é heterogênea.** MoneyInput, CurrencyDisplay e `trading/decimal.ts` oferecem uma boa base. `crypto/SwapInterface/SwapInterface.svelte` ainda usa `parseFloat` e `.toFixed(4)` para mínimo recebido, e oculta esse valor quando `slippage` é zero. `retro/ShoppingCartPanel/ShoppingCartPanel.svelte` soma preços como `number`. Não tratar esses widgets como fonte autoritativa de execução financeira; uniformizar contratos decimais quando forem usados nesses produtos.
4. **Internacionalização é parcial.** Trading tem arquivos de labels; DataTable e TransactionList contêm textos fixos. Exigir labels substituíveis, locale explícito e timezone onde pertinente. Valores ausentes devem ser distintos de zero e de valor sem cotação.
5. **SSR/hidratação precisam de evidência em aplicação consumidora.** Há IDs derivados de `Math.random()` em MoneyInput e LiquidityPositionCard. Isso é um risco a testar, não uma falha de hidratação reproduzida nesta avaliação. Criar fixture SvelteKit que importe os pacotes empacotados, renderize no servidor e hidrate sem avisos.
6. **As verificações não cobrem todos os modos de falha.** `vitest.config.ts` define `dangerouslyIgnoreUnhandledErrors: true` na raiz para contornar Cesium, podendo ocultar rejeições não tratadas de outros domínios. Isolar esse tratamento antes de ampliar os gates de produto.
7. **A evidência responsiva ainda precisa ser sistemática.** Existe story Phone do terminal. O Playwright em `tests/` cobre o smoke Cesium, não a jornada dos cinco contextos solicitados. Criar cenários de produto em 360, 768 e 1440 px; tabelas densas podem ter rolagem própria, sem overflow da página.
8. **Distribuição precisa de teste de consumo real.** O pacote core expõe um único entrypoint e reexporta Cesium, peer opcional. O check de tarball passou, mas isso não demonstra bundle pequeno, SSR ou consumo sem Cesium. Medir imports de uma landing e de um dashboard, com e sem a dependência opcional, antes de decidir subpaths ou separação de pacotes.

## Ordem de execução proposta

### P0 — Base verificável

- Corrigir os problemas de DataTable usados pelos produtos: nomes acessíveis, navegação por teclado, labels, ordenação decimal e paginação controlada.
- Separar testes de unidade e browser, isolar a tolerância a rejeições de Cesium e executar os testes de produto sem ignorar erros assíncronos.
- Introduzir uma fixture consumidora SvelteKit para SSR/hidratação, importação do tarball e orçamento de bundle medido.
- Tornar explícitos precisão, missing/unpriced/stale e callbacks de operações pendentes nos contratos usados pelos produtos.

### P1 — Landing pages reutilizáveis

Adicionar uma camada `marketing/` com seções componíveis, variações de tema e uma landing completa em Storybook. A proposta detalhada está em `openspec/changes/add-marketing-sections/`. Priorizar hero split/central, feature grid/bento, logos, depoimentos, planos, FAQ, CTA e footer. Reaproveitar navegação existente no primeiro exemplo; avaliar header especializado depois de testar o mobile.

### P1 — Receitas de produtos

Publicar no Storybook, com dados fictícios explicitamente identificados:

- Financeiro: período → KPIs/fluxo de caixa → lançamentos filtrados.
- Trade4Me: mercado → book → ticket → ordem pendente → posição/rejeição, incluindo feed stale.
- Liquidity4Me: wallet/rede → posição → taxas → confirmação/pending/error.
- CyberWealth: carteira → alocação → posições → detalhe e estado sem cotação.
- Market4Me: receita definida após confirmação do escopo funcional.

Extrair componentes novos dessas receitas somente quando encapsularem comportamento reutilizável. Não duplicar TradingChart, MoneyInput, KpiCard ou LiquidityPositionCard para trocar apenas estilo.

### P2 — Expansões orientadas a fluxos confirmados

Conciliação/importação, relatórios/exportação, notificações, administração e configurações. Criar uma especificação pequena por capacidade, evitando uma mudança única que misture todos os produtos.

## Critério de conclusão por fluxo

Um fluxo fica pronto quando há uma receita consumível que comprova:

- Props/tipos públicos, exemplos e exports documentados; ações de negócio emitidas por callbacks, sem credenciais ou chamadas de corretora/wallet embutidas.
- Dados normais, vazios, carregando, erro, permissão negada e dados desatualizados, conforme o fluxo; operações pendentes não permitem envio duplicado.
- Teclado, foco, nomes acessíveis, erro associado ao campo e axe sem violações nas stories do fluxo; revisão manual complementar.
- Layout 360/768/1440, tema claro/escuro/calm e movimento reduzido; pt-BR/en-US sem textos fixos obrigatórios.
- Valores financeiros em decimal string ou minor units; moeda/ativo explícito; zero, negativo, grande valor e ausência de preço testados.
- Render SSR e hidratação SvelteKit sem acesso prematuro a browser APIs ou divergência de IDs.
- Build, tipos, lint, testes comportamentais, interação browser e tarballs aprovados; orçamento de bundle estabelecido e medido por receita.

## Processo de desenvolvimento para o Codex

`AGENTS.md` na raiz traduz para o Codex as regras aplicáveis de `global/CLAUDE.md`: OpenSpec em mudanças maiores, teste de regressão para correções quando a tarefa e as ferramentas permitem, documentação pública junto com alterações de comportamento, manutenção como objetivo explícito, alvo de complexidade cognitiva 8–12 no frontend e comparação com `main` antes de atribuir avisos/falhas ao estado prévio. A skill `code-review` será usada em diffs de código substanciais, adaptando suas verificações ao contexto da biblioteca Svelte. As skills específicas seguem sob demanda; a coleção externa tem skills para vários domínios que não se aplicam a esta biblioteca.

## Validação desta avaliação

Ambiente: Node 22.18.0, pnpm 9.15.9 via Corepack (versão declarada pelo repositório).

| Verificação | Resultado |
|---|---|
| Instalação com lockfile congelado | Passou com pnpm 9.15.9 |
| `pnpm check` | Passou; ESLint: 285 avisos, 0 erros; Svelte Check: 30 avisos em 20 arquivos, 0 erros |
| `pnpm build` | Passou |
| `pnpm check:package` | Passou para core e foundation; exports/imports resolvidos, sem testes/stories nos tarballs |
| Testes de unidade | 253 arquivos e 4.113 testes passaram; configuração temporária equivalente ao projeto unitário, sem Storybook e sem ignorar rejeições, usando `--configLoader runner` |
| OpenSpec 1.4.0: `validate --all --strict` | 17 itens passaram, incluindo a nova proposta de marketing |
| Browser, SSR, inspeção visual e aplicações reais | Não validados nesta avaliação |

O carregamento padrão da configuração de Vitest ficou parado antes de executar casos. Para obter evidência dos testes de unidade, foi usada uma configuração temporária com o mesmo plugin Svelte, condições browser, jsdom, glob `packages/**/*.test.ts`, setup e opção CSS do projeto unitário, com `--configLoader runner`. Essa configuração foi removida após a execução. O comando de teste padrão e o projeto Storybook não foram aprovados por essa execução.

Os logs temporários desta sessão estão em `/tmp/cyberdyne-coverage-{check,build,package,unit}.log`; eles não são artefatos versionados. Nenhum resultado acima representa garantia de cobertura integral de produto.

## Validação da entrega de landing pages — 2026-10-05

| Verificação | Resultado |
|---|---|
| Suíte completa de unidade | 254 arquivos e 4.120 testes passaram com a configuração temporária descrita acima |
| Testes específicos de marketing após a revisão de acessibilidade | 7 testes passaram |
| `pnpm lint` | 0 erros; 292 avisos reportados |
| `pnpm -r svelte-check` | 0 erros; 30 avisos em 20 arquivos |
| `pnpm build` e `pnpm check:package` | Passaram; exports/imports resolvidos nos pacotes |
| OpenSpec `validate --all --strict` | 17 itens passaram |
| Storybook: axe na landing completa | 0 violações; 30 regras passaram; 1 item inconclusivo |
| Browser em 360, 768 e 1440 px | Story completa renderizada; `scrollWidth` igual à largura do viewport nos três tamanhos |
| Storybook configurado para todas as stories | Não iniciou: `Drawer.stories.svelte:32` causa erro de parse de TypeScript no bundle da configuração completa. A story de marketing foi aberta e verificada com uma configuração isolada temporária. |
| SSR/hidratação SvelteKit e custo de bundle medido | Não verificados |

A story completa usa navegação existente e conteúdo explicitamente ilustrativo. Preços, métricas, depoimentos e destinos reais continuam a cargo do produto consumidor. A prévia local usada para inspeção roda na porta 6007; a configuração isolada não faz parte do pacote da biblioteca.
