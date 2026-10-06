<svelte:options runes={true} />

<script lang="ts">
  import Alert from "../feedback/Alert/Alert.svelte";
  import PageShell from "../layout/PageShell/PageShell.svelte";
  import PageHeader from "../layout/PageHeader/PageHeader.svelte";
  import Card from "../layout/Card/Card.svelte";
  import Sidebar from "../navigation/Sidebar/Sidebar.svelte";
  import Button from "../primitives/Button/Button.svelte";
  import KpiCard from "../data/KpiCard/KpiCard.svelte";
  import AllocationBreakdown from "../data/AllocationBreakdown/AllocationBreakdown.svelte";
  import DataTable from "../data/DataTable/DataTable.svelte";
  import EmptyState from "../data/EmptyState/EmptyState.svelte";
  import FilterBar from "../data/FilterBar/FilterBar.svelte";
  import TextInput from "../forms/TextInput/TextInput.svelte";
  import Select from "../forms/Select/Select.svelte";
  import type { AllocationItem } from "../data/AllocationBreakdown/types.js";

  let { transactions = false, empty = false }: { transactions?: boolean; empty?: boolean } =
    $props();
  // Preformatted fixtures only: the consuming application owns balance calculations.
  const balanceSteps = [
    {
      value: "R$ 5.680,00",
      expense: "R$ 2.320,00",
      negative: false,
      zero: false,
      movement: "Saldo inicial da demonstração",
    },
    {
      value: "R$ 2.680,00",
      expense: "R$ 5.320,00",
      negative: false,
      zero: false,
      movement: "Saída simulada: −R$ 3.000,00",
    },
    {
      value: "R$ 0,00",
      expense: "R$ 8.000,00",
      negative: false,
      zero: true,
      movement: "Saída simulada: −R$ 2.680,00",
    },
    {
      value: "−R$ 320,00",
      expense: "R$ 8.320,00",
      negative: true,
      zero: false,
      movement: "Saída simulada: −R$ 320,00",
    },
  ];
  let balanceStep = $state(0);
  let balance = $derived(balanceSteps[balanceStep]);
  let query = $state("");
  let appliedQuery = $state("");
  let message = $state("");
  const nav = [
    { id: "overview", label: "Visão geral", href: "#overview", icon: "◫" },
    { id: "transactions", label: "Transações", href: "#transactions", icon: "⇄" },
    { id: "portfolio", label: "Patrimônio", href: "#portfolio", icon: "◈" },
  ];
  const allocations: AllocationItem[] = [
    { id: "funds", label: "Fundos", percentage: 78.125, value: "R$ 187.500,00" },
    { id: "stocks", label: "Ações", percentage: 30, value: "R$ 72.000,00", tone: "info" },
    { id: "fixed", label: "Renda fixa", percentage: 14.375, value: "R$ 34.500,00", tone: "violet" },
    { id: "crypto", label: "Cripto", percentage: 2.5, value: "R$ 6.000,00", tone: "warning" },
    { id: "debt", label: "Dívidas", percentage: -25, value: "−R$ 60.000,00", tone: "negative" },
  ];
  const positions = [
    {
      id: "funds",
      name: "Fundo imobiliário A",
      category: "Fundos",
      source: "Manual",
      value: "R$ 187.500,00",
    },
    {
      id: "stocks",
      name: "Ação brasileira B",
      category: "Ações",
      source: "Manual",
      value: "R$ 72.000,00",
    },
    {
      id: "fixed",
      name: "Título de renda fixa C",
      category: "Renda fixa",
      source: "Manual",
      value: "R$ 34.500,00",
    },
  ];
  const records = [
    {
      direction: "income",
      id: "income",
      name: "Salário · exemplo",
      category: "Receitas",
      date: "06/10/2026",
      value: "+R$ 8.000,00",
    },
    {
      direction: "expense",
      id: "food",
      name: "Mercado · exemplo",
      category: "Alimentação",
      date: "05/10/2026",
      value: "−R$ 320,00",
    },
    {
      direction: "expense",
      id: "rent",
      name: "Aluguel · exemplo",
      category: "Moradia",
      date: "04/10/2026",
      value: "−R$ 2.000,00",
    },
  ];
  let rows = $derived(
    empty
      ? []
      : transactions
        ? records.filter((row) =>
            row.name.toLocaleLowerCase("pt-BR").includes(appliedQuery.toLocaleLowerCase("pt-BR")),
          )
        : positions,
  );
  let columns = $derived(
    transactions
      ? [
          { key: "name", label: "Descrição" },
          { key: "category", label: "Categoria" },
          { key: "date", label: "Data" },
          { key: "value", label: "Valor", cell: amount },
        ]
      : [
          { key: "name", label: "Ativo" },
          { key: "category", label: "Classe" },
          { key: "source", label: "Origem do preço" },
          { key: "value", label: "Valor", cell: amount },
        ],
  );
</script>

{#snippet amount(row: Record<string, unknown>)}
  <span
    class="amount"
    class:income={row.direction === "income"}
    class:expense={row.direction === "expense"}>{String(row.value)}</span
  >
{/snippet}
{#snippet primaryValue()}<span class="income">{transactions ? "R$ 8.000,00" : "R$ 240.000,00"}</span
  >{/snippet}
{#snippet assetsValue()}<span class:income={!transactions} class:expense={transactions}
    >{transactions ? balance.expense : "R$ 300.000,00"}</span
  >{/snippet}
{#snippet balanceValue()}<span
    class:income={!balance.negative && !balance.zero}
    class:expense={balance.negative}>{balance.value}</span
  >{/snippet}
<div class="finance-demo">
  <p class="demo-notice">
    Exemplo com componentes reais · dados fictícios · sem conexão com contas
  </p>
  <PageShell headerHeight="64px" sidebarWidth="228px">
    {#snippet header()}<div class="brand">CyberWealth</div>
      <span class="header-note">Meu planejamento · exemplo</span>{/snippet}
    {#snippet sidebar()}<Sidebar
        items={nav}
        activeId={transactions ? "transactions" : "portfolio"}
        ariaLabel="Navegação ilustrativa"
      />{/snippet}
    <div class="content">
      <PageHeader
        title={transactions ? "Transações" : "Patrimônio"}
        description={transactions
          ? "Consulte seus registros com filtros e valores legíveis."
          : "Uma visão clara dos seus ativos e compromissos."}
      >
        <Button onclick={() => (message = "Ação ilustrativa; nenhum registro foi criado.")}
          >{transactions ? "Nova transação" : "Cadastrar investimento"}</Button
        >
        {#if transactions}<Button
            variant="outline"
            onclick={() => (message = "Ação ilustrativa; nenhuma transferência foi feita.")}
            >Transferir</Button
          >{/if}
      </PageHeader>
      <p class="message" role="status">{message}</p>
      {#if transactions}
        <form
          onsubmit={(event) => {
            event.preventDefault();
            appliedQuery = query;
          }}
        >
          <FilterBar ariaLabel="Filtros de transações">
            <TextInput label="Buscar descrição" type="search" bind:value={query} />
            <Select label="Conta" options={[{ value: "", label: "Todas as contas" }]} />
            {#snippet actions()}
              <Button
                variant="ghost"
                onclick={() => {
                  query = "";
                  appliedQuery = "";
                }}>Limpar filtros</Button
              >
              <Button type="submit">Filtrar</Button>
            {/snippet}
          </FilterBar>
        </form>
      {/if}
      <section class="metrics" aria-label="Resumo financeiro">
        <KpiCard
          label={transactions ? "Entradas do período" : "Patrimônio líquido"}
          value={primaryValue}
          emphasis="featured"
          deltaLabel={transactions ? "Período ilustrativo" : "Ativos menos dívidas"}
        />
        <KpiCard
          label={transactions ? "Saídas do período" : "Ativos"}
          value={assetsValue}
          deltaLabel={transactions ? "Despesas registradas" : "Valor total das posições"}
        />
        <KpiCard
          label={transactions ? "Saldo do período" : "Dívidas"}
          value={transactions ? balanceValue : "R$ 60.000,00"}
          valueTone={transactions ? "default" : "negative"}
          deltaLabel={transactions ? "Entradas menos saídas" : "Compromissos a descontar"}
        />
      </section>
      {#if transactions}
        <Card padding="lg">
          <h2>Acompanhe o saldo</h2>
          <p role="status">{balance.movement} · Saldo: {balance.value}</p>
          {#if balance.negative}
            <Alert variant="error" title="Saldo no vermelho"
              >As saídas superaram as entradas. Faltam R$ 320,00 para zerar o saldo desta
              demonstração.</Alert
            >
          {:else if balance.zero}
            <Alert variant="warning" role="status" title="Saldo zerado"
              >A próxima saída deixará o saldo negativo.</Alert
            >
          {/if}
          <div class="balance-actions">
            <Button
              disabled={balanceStep === balanceSteps.length - 1}
              onclick={() => (balanceStep += 1)}>Simular saída</Button
            >
            <Button variant="outline" onclick={() => (balanceStep = 0)}
              >Reiniciar demonstração</Button
            >
          </div>
          <p class="footnote">Simulação com valores fictícios; não altera contas ou registros.</p>
        </Card>
      {/if}
      {#if !transactions && !empty}
        <div class="panels">
          <Card padding="lg"
            ><h2>Distribuição do patrimônio</h2>
            <AllocationBreakdown
              ariaLabel="Distribuição por classe"
              locale="pt-BR"
              items={allocations}
              description="Percentuais sobre patrimônio líquido. Barras mostram magnitudes relativas, com eixo zero central."
            /></Card
          >
          <Card padding="lg"
            ><h2>Como ler este resumo</h2>
            <p>
              Ativos somam 125%; dívidas, −25%. O patrimônio líquido desconta os compromissos dos
              ativos.
            </p>
            <p class="explanation">
              Valores negativos ficam à esquerda do eixo zero. O sinal e o rótulo complementam as
              cores.
            </p>
            <p>Dados fictícios para demonstrar apresentação.</p></Card
          >
        </div>
      {/if}
      <Card padding="lg">
        <h2>{transactions ? "Registros do período" : "Suas posições"}</h2>
        {#if rows.length}
          <!-- svelte-ignore a11y_no_noninteractive_tabindex (Labelled scroll region needs keyboard focus) -->
          <div
            class="table-region"
            tabindex="0"
            role="region"
            aria-label={transactions ? "Tabela de transações" : "Tabela de posições"}
          >
            <div class="table-content"><DataTable {columns} {rows} stickyHeader={false} /></div>
          </div>
        {:else}
          <EmptyState
            title="Nenhum registro por aqui"
            description="A aplicação pode oferecer uma ação contextual para começar."
            icon="folder"
          />
        {/if}
      </Card>
      <p class="footnote">
        A aplicação fornece dados, preços e regras de negócio. Esta demonstração não executa
        operações financeiras.
      </p>
    </div>
  </PageShell>
</div>

<style>
  .finance-demo {
    --gradient-surface: none;
    --texture-surface: none;
    --gradient-backdrop: none;
    --pattern-backdrop: none;
    --kpi-featured-bg: var(--color-action-brand-bg);
    color: var(--color-text-primary);
    font-family: var(--font-body);
  }
  .demo-notice {
    padding: var(--space-2) var(--space-4);
    margin: 0;
    color: var(--color-text-secondary);
    background: var(--color-bg-secondary);
    font-size: 0.75rem;
  }
  .brand {
    font-weight: var(--font-weight-semibold);
    font-size: 1.125rem;
  }
  .header-note {
    margin-left: auto;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
  }
  .content {
    max-width: 1200px;
    margin: auto;
    min-width: 0;
  }
  .message {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
  }
  .message:not(:empty) {
    margin-bottom: var(--space-4);
  }
  .metrics {
    display: grid;
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: var(--space-4);
    margin: var(--space-5) 0;
  }
  .panels {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
    gap: var(--space-5);
    margin-bottom: var(--space-5);
  }
  h2 {
    font-family: var(--font-display);
    font-size: 1.0625rem;
    margin: 0 0 var(--space-4);
  }
  p {
    line-height: 1.5;
  }
  .panels p {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
  .explanation {
    border-left: 2px solid var(--color-border-brand);
    padding-left: var(--space-3);
  }
  .table-region {
    overflow-x: auto;
    min-width: 0;
  }
  .table-region:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
  .table-content {
    min-width: 540px;
  }
  .amount {
    display: block;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .income {
    color: var(--color-state-info);
  }
  .expense {
    color: var(--color-state-error);
  }
  .balance-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }
  .footnote {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    margin-top: var(--space-4);
  }
  @media (max-width: 1000px) {
    .panels {
      grid-template-columns: 1fr;
    }
    .metrics {
      grid-template-columns: 1fr 1fr;
    }
    .metrics :global(.cy-kpi--featured) {
      grid-column: 1 / -1;
    }
  }
  @media (max-width: 600px) {
    .metrics {
      grid-template-columns: 1fr;
    }
    .header-note {
      font-size: 0.75rem;
      max-width: 45%;
      text-align: right;
    }
    .finance-demo :global(.cy-ps__main) {
      padding: var(--space-4);
    }
  }
</style>
