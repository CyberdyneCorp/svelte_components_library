<svelte:options runes={true} />

<script lang="ts">
  import NavBar from "../navigation/NavBar/NavBar.svelte";
  import PageShell from "../layout/PageShell/PageShell.svelte";
  import PageHeader from "../layout/PageHeader/PageHeader.svelte";
  import Card from "../layout/Card/Card.svelte";
  import Sidebar from "../navigation/Sidebar/Sidebar.svelte";
  import type { SidebarGroup, SidebarItem } from "../navigation/Sidebar/Sidebar.svelte";
  import Breadcrumb from "../navigation/Breadcrumb/Breadcrumb.svelte";
  import type { BreadcrumbItem } from "../navigation/Breadcrumb/types.js";
  import Button from "../primitives/Button/Button.svelte";
  import IconButton from "../primitives/IconButton/IconButton.svelte";
  import Icon from "../primitives/Icon/Icon.svelte";
  import SplitButton from "../primitives/SplitButton/SplitButton.svelte";
  import StatusBadge from "../data/StatusBadge/StatusBadge.svelte";
  import KeyValueStrip from "../data/KeyValueStrip/KeyValueStrip.svelte";
  import type { KeyValueStripItem } from "../data/KeyValueStrip/types.js";
  import Alert from "../feedback/Alert/Alert.svelte";
  import KpiCard from "../data/KpiCard/KpiCard.svelte";
  import Sparkline from "../charts/Sparkline/Sparkline.svelte";
  import ProgressRing from "../feedback/ProgressRing/ProgressRing.svelte";
  import PromoBanner from "../feedback/PromoBanner/PromoBanner.svelte";
  import PriceTag from "../data/PriceTag/PriceTag.svelte";
  import DescriptionList from "../data/DescriptionList/DescriptionList.svelte";
  import type { DescriptionListItem } from "../data/DescriptionList/types.js";
  import EmptyState from "../data/EmptyState/EmptyState.svelte";
  import PasswordInput from "../forms/PasswordInput/PasswordInput.svelte";
  import SettingsRow from "../data/SettingsRow/SettingsRow.svelte";
  import Switch from "../forms/Switch/Switch.svelte";
  import SearchInput from "../forms/SearchInput/SearchInput.svelte";
  import Select from "../forms/Select/Select.svelte";
  import DataTable from "../data/DataTable/DataTable.svelte";
  import Dropdown from "../feedback/Dropdown/Dropdown.svelte";
  import Accordion from "../feedback/Accordion/Accordion.svelte";

  type Screen = "overview" | "empty" | "settings" | "domains";

  let { screen = "overview" }: { screen?: Screen } = $props();

  // Synthetic fixtures only: hostnames under example.cloud, IPs from the
  // documentation range 203.0.113.0/24, invented prices. No product logic.
  const host = "srv-example.cloud";
  let message = $state("");

  const navItems = [
    { label: "Servidores", href: "/servers", active: true },
    { label: "Domínios", href: "/domains" },
    { label: "Faturamento", href: "/billing" },
  ];

  const railItems: SidebarItem[] = [
    {
      id: "servers",
      label: "Servidores",
      icon: "S",
      children: [
        { id: "vps", label: "VPS", href: "/servers/vps" },
        { id: "dedicated", label: "Dedicados", href: "/servers/dedicated" },
      ],
    },
    { id: "domains", label: "Domínios", icon: "D", href: "/domains" },
    { id: "email", label: "E-mail", icon: "E", href: "/email" },
    { id: "billing", label: "Faturamento", icon: "F", href: "/billing" },
  ];

  const serverGroups: SidebarGroup[] = [
    {
      id: "server",
      label: "Servidor",
      items: [
        { id: "overview", label: "Visão geral", icon: "V", href: "/servers/vps/1" },
        { id: "gpu", label: "GPU", icon: "G", href: "/servers/vps/1/gpu", badge: "Beta" },
        { id: "docker", label: "Docker", icon: "C", href: "/servers/vps/1/docker" },
        { id: "settings", label: "Configurações", icon: "⚙", href: "/servers/vps/1/settings" },
      ],
    },
    {
      id: "apps",
      label: "Aplicativos",
      collapsible: true,
      items: [
        { id: "firewall", label: "Firewall", icon: "F", href: "/servers/vps/1/firewall" },
        { id: "backups", label: "Backups", icon: "B", href: "/servers/vps/1/backups" },
        {
          id: "docs",
          label: "Documentação",
          icon: "?",
          href: "https://example.com/docs",
          external: true,
        },
      ],
    },
  ];

  const activeNav: Record<Screen, string> = {
    overview: "overview",
    empty: "docker",
    settings: "settings",
    domains: "overview",
  };

  const screenTitles: Record<Screen, string> = {
    overview: host,
    empty: "Docker",
    settings: "Configurações",
    domains: "Domínios",
  };

  let crumbs = $derived.by((): BreadcrumbItem[] => {
    const home: BreadcrumbItem = { label: "Início", href: "/", icon: "home", iconOnly: true };
    if (screen === "domains") return [home, { label: "Domínios" }];
    const server: BreadcrumbItem[] = [home, { label: "Servidores", href: "/servers" }];
    if (screen === "overview") return [...server, { label: host }];
    return [...server, { label: host, href: "/servers/vps/1" }, { label: screenTitles[screen] }];
  });

  const sshFacts: KeyValueStripItem[] = [
    { id: "user", label: "Nome de usuário SSH", value: "root", copy: true },
    { id: "ipv4", label: "IPv4", value: "203.0.113.10", copy: true },
    {
      id: "reset",
      label: "Esqueceu a senha root?",
      value: "Redefinir",
      href: "/servers/vps/1/settings",
      linkLabel: "Redefinir senha",
    },
  ];

  const cpuSeries = [22, 31, 28, 45, 39, 52, 48, 61, 57, 64];
  const memorySeries = [48, 50, 53, 51, 58, 62, 60, 66, 71, 78];

  const details: DescriptionListItem[] = [
    { id: "location", label: "Localização do servidor", value: "Brazil - São Paulo" },
    { id: "os", label: "SO", value: "Ubuntu 25.04" },
    { id: "hostname", label: "Nome do host", value: host },
    { id: "renewal", label: "Renovação", hint: "Renovação automática ativa" },
  ];

  const faq = [
    {
      id: "ssh",
      title: "Como acesso o servidor via SSH?",
      content:
        "Use o nome de usuário e o IPv4 exibidos na visão geral com a chave cadastrada em Chaves SSH.",
    },
    {
      id: "reset",
      title: "Como redefino a senha root?",
      content:
        "Em Configurações, gere ou digite uma nova senha e salve. A aplicação aplica a mudança no servidor.",
    },
  ];

  // Demo-only generator: cycles through fixed synthetic strings. A real
  // application supplies a cryptographically secure generator.
  const samplePasswords = ["Srv-Exemplo-2026!a", "Srv-Exemplo-2026!b", "Srv-Exemplo-2026!c"];
  let generated = 0;
  let rootPassword = $state("");
  function demoGenerate(): string {
    generated += 1;
    return samplePasswords[generated % samplePasswords.length];
  }

  let firewallOn = $state(true);

  type DomainRow = {
    id: string;
    domain: string;
    expires: string;
    status: "active" | "pending" | "error";
    statusLabel: string;
  };
  const domains: DomainRow[] = [
    {
      id: "d1",
      domain: "exemplo.com.br",
      expires: "12/03/2027",
      status: "active",
      statusLabel: "Ativo",
    },
    {
      id: "d2",
      domain: host,
      expires: "01/11/2026",
      status: "pending",
      statusLabel: "Renovação pendente",
    },
    {
      id: "d3",
      domain: "loja-exemplo.app",
      expires: "20/09/2026",
      status: "error",
      statusLabel: "Expirado",
    },
  ];
  const statusOptions = [
    { value: "", label: "Todos os status" },
    { value: "active", label: "Ativo" },
    { value: "pending", label: "Renovação pendente" },
    { value: "error", label: "Expirado" },
  ];
  const domainActions = [
    { label: "Renovar", value: "renew" },
    { label: "Gerenciar DNS", value: "dns" },
    { label: "Transferir", value: "transfer" },
    { label: "Excluir", value: "delete", variant: "danger" as const },
  ];
  let search = $state("");
  let statusFilter = $state("");
  let selectedDomains = $state<string[]>([]);
  let autoRenew = $state<Record<string, boolean>>({ d1: true, d2: false, d3: false });
  let filteredDomains = $derived(
    domains.filter(
      (row) =>
        row.domain.includes(search.trim().toLowerCase()) &&
        (statusFilter === "" || row.status === statusFilter),
    ),
  );
  const domainColumns = [
    { key: "domain", label: "Domínio", sortable: true },
    { key: "expires", label: "Expira em" },
    { key: "statusLabel", label: "Status", cell: statusCell },
    { key: "autoRenew", label: "Renovação automática", cell: renewCell },
    { key: "actions", label: "Ações", cell: actionsCell },
  ];

  function note(text: string) {
    message = `${text} (ação ilustrativa; nada foi alterado)`;
  }
</script>

{#snippet statusCell(row: Record<string, unknown>)}
  <StatusBadge status={row.status as DomainRow["status"]} label={String(row.statusLabel)} />
{/snippet}
{#snippet renewCell(row: Record<string, unknown>)}
  <span class="switch-cell">
    <Switch bind:checked={autoRenew[String(row.id)]} label="Renovação automática de {row.domain}" />
  </span>
{/snippet}
{#snippet actionsCell(row: Record<string, unknown>)}
  <Dropdown
    items={domainActions}
    align="right"
    onselect={(value) => note(`${value}: ${row.domain}`)}
  >
    {#snippet trigger()}
      <span class="kebab"
        ><Icon name="more-vertical" size={18} /><span class="sr-only">Ações para {row.domain}</span
        ></span
      >
    {/snippet}
  </Dropdown>
{/snippet}
{#snippet editAction(item: DescriptionListItem)}
  <IconButton
    icon="edit"
    size="sm"
    label="Editar {item.label}"
    onclick={() => note(`Editar ${item.label}`)}
  />
{/snippet}
{#snippet detailValue(item: DescriptionListItem)}
  {#if item.id === "renewal"}
    <StatusBadge status="active" label="Em dia" indicator="icon" />
  {:else}
    {item.value}
  {/if}
{/snippet}

<div class="console-demo">
  <p class="demo-notice">
    Exemplo com componentes reais · dados fictícios · nenhuma ação é executada
  </p>
  <PageShell headerHeight="64px" sidebarWidth="320px">
    {#snippet header()}
      <NavBar brand={{ label: "CyberConsole", href: "/" }} items={navItems} sticky={false}>
        {#snippet actions()}
          <IconButton
            icon="bell"
            label="Notificações"
            badge={3}
            badgeLabel="3 não lidas"
            onclick={() => note("Abrir notificações")}
          />
        {/snippet}
      </NavBar>
    {/snippet}
    {#snippet sidebar()}
      <div class="sidebars">
        <Sidebar items={railItems} collapsed activeId="servers" ariaLabel="Produtos" />
        <Sidebar
          groups={serverGroups}
          activeId={activeNav[screen]}
          ariaLabel="Servidor {host}"
          externalLabel="abre em nova aba"
          onnavigate={(href) => note(`Navegar para ${href}`)}
        />
      </div>
    {/snippet}

    <div class="content">
      <Breadcrumb items={crumbs} />
      <PageHeader
        title={screenTitles[screen]}
        description={screen === "domains"
          ? "Domínios registrados nesta conta."
          : `VPS · Brazil - São Paulo · 203.0.113.10`}
      >
        {#if screen === "overview"}
          <StatusBadge status="active" label="Em execução" />
          <SplitButton
            label="Reiniciar"
            menuLabel="Mais ações"
            items={[
              { label: "Desligar", value: "stop" },
              { label: "Iniciar", value: "start" },
            ]}
            onclick={() => note("Reiniciar servidor")}
            onselect={(value) => note(`Ação ${value}`)}
          />
          <Button variant="outline" onclick={() => note("Abrir console")}>Acessar console</Button>
        {:else if screen === "domains"}
          <Button onclick={() => note("Registrar domínio")}>Registrar domínio</Button>
        {/if}
      </PageHeader>
      <p class="message" role="status">{message}</p>

      {#if screen === "overview"}
        <KeyValueStrip items={sshFacts} ariaLabel="Acesso SSH" copyLabel="Copiar" />
        <div class="inline-alert">
          <Alert variant="error" inline title="Falha no último backup">
            O backup das 03:00 não foi concluído. <a href="/servers/vps/1/backups">Ver detalhes</a>
          </Alert>
        </div>
        <section class="metrics" aria-label="Recursos do servidor">
          <KpiCard
            label="CPU"
            value="64%"
            delta="+7%"
            deltaLabel="vs ontem"
            trend="up"
            sentiment="negative"
          >
            {#snippet sparkline()}
              <Sparkline
                data={cpuSeries}
                width={220}
                height={32}
                title="Uso de CPU nos últimos 10 dias"
              />
            {/snippet}
          </KpiCard>
          <KpiCard
            label="Memória"
            value="6,2 GB / 8 GB"
            delta="+12%"
            deltaLabel="vs ontem"
            trend="up"
            sentiment="negative"
          >
            {#snippet sparkline()}
              <Sparkline
                data={memorySeries}
                width={220}
                height={32}
                color="var(--color-state-warning)"
                title="Uso de memória nos últimos 10 dias"
              />
            {/snippet}
          </KpiCard>
          <KpiCard label="Uso do disco" value="152 GB / 400 GB" deltaLabel="38% em uso">
            {#snippet visual()}
              <ProgressRing value={38} size={56} strokeWidth={5} />
            {/snippet}
          </KpiCard>
        </section>
        <section class="quick-links" aria-label="Atalhos">
          <KpiCard
            label="Backups"
            value="Último: hoje, 03:00"
            deltaLabel="Abrir backups"
            href="/servers/vps/1/backups"
          />
          <KpiCard
            label="Firewall"
            value="12 regras"
            deltaLabel="Gerenciar regras"
            href="/servers/vps/1/firewall"
          />
          <KpiCard
            label="Snapshots"
            value="3 de 5"
            deltaLabel="Ver snapshots"
            href="/servers/vps/1/snapshots"
          />
        </section>
        <PromoBanner
          title="Faça upgrade para backups diários"
          description="Mantenha cópias automáticas dos últimos 7 dias com restauração em um clique."
          dismissible
          dismissLabel="Fechar"
          ondismiss={() => note("Oferta fechada")}
        >
          {#snippet icon()}<Icon name="shield" size={28} />{/snippet}
          {#snippet price()}
            <PriceTag
              amount="19.99"
              originalAmount="39.99"
              currency="BRL"
              locale="pt-BR"
              period="/mês"
              savings="Economize 50%"
              originalLabel="Preço original"
            />
          {/snippet}
          {#snippet actions()}
            <Button onclick={() => note("Fazer upgrade")}>Fazer Upgrade</Button>
          {/snippet}
        </PromoBanner>
        <Card padding="lg">
          <h2>Detalhes do servidor</h2>
          <DescriptionList items={details} columns={2} value={detailValue} action={editAction} />
        </Card>
      {:else if screen === "empty"}
        <Card padding="lg">
          <h2>Contêineres</h2>
          <EmptyState
            title="Nenhum contêiner ainda"
            description="Crie o primeiro contêiner Docker deste servidor ou importe um docker-compose."
            icon="terminal"
          >
            <Button onclick={() => note("Criar contêiner")}>Criar contêiner</Button>
          </EmptyState>
        </Card>
      {:else if screen === "settings"}
        <Card padding="lg">
          <h2>Senha root</h2>
          <form
            class="password-form"
            onsubmit={(event) => {
              event.preventDefault();
              note("Salvar senha");
            }}
          >
            <PasswordInput
              bind:value={rootPassword}
              label="Nova senha root"
              name="rootPassword"
              autocomplete="new-password"
              showLabel="Mostrar senha"
              hideLabel="Ocultar senha"
              generateLabel="Gerar"
              ongenerate={demoGenerate}
            />
            <Button type="submit" disabled={rootPassword.length === 0}>Salvar</Button>
          </form>
        </Card>
        <Card padding="lg">
          <h2>Rede e segurança</h2>
          <ul class="settings-list">
            <SettingsRow
              as="li"
              title="Resolvedores DNS"
              description="Use os padrões ou adicione o seu."
              badge="Personalizado"
              badgeVariant="info"
              data-setting="dns"
            >
              {#snippet icon()}<Icon name="globe" size={18} />{/snippet}
              {#snippet actions()}
                <Button variant="ghost" size="sm" onclick={() => note("Editar DNS")}>Editar</Button>
                <Button variant="secondary" size="sm" onclick={() => note("Adicionar resolvedor")}
                  >Adicionar</Button
                >
              {/snippet}
            </SettingsRow>
            <SettingsRow
              as="li"
              title="Firewall"
              description="Bloqueia todo o tráfego de entrada, exceto as portas liberadas."
              data-setting="firewall"
            >
              {#snippet icon()}<Icon name="shield" size={18} />{/snippet}
              {#snippet actions()}<Switch
                  bind:checked={firewallOn}
                  label="Firewall ativo"
                />{/snippet}
            </SettingsRow>
            <SettingsRow
              as="li"
              title="Chaves SSH"
              description="2 chaves cadastradas."
              data-setting="ssh"
            >
              {#snippet icon()}<Icon name="key" size={18} />{/snippet}
              {#snippet actions()}
                <Button variant="outline" size="sm" onclick={() => note("Gerenciar chaves SSH")}
                  >Gerenciar</Button
                >
              {/snippet}
            </SettingsRow>
            <SettingsRow
              as="li"
              title="Backups automáticos"
              badge="Recomendado"
              badgeVariant="success"
              data-setting="backups"
            >
              {#snippet icon()}<Icon name="cloud" size={18} />{/snippet}
              Cópias diárias com retenção de <strong>7 dias</strong>.
              {#snippet actions()}
                <Button size="sm" onclick={() => note("Ativar backups")}>Ativar</Button>
              {/snippet}
            </SettingsRow>
          </ul>
        </Card>
        <Card padding="lg">
          <h2>Perguntas frequentes</h2>
          <Accordion items={faq} defaultOpen={["ssh"]} />
        </Card>
      {:else}
        <div class="toolbar">
          <SearchInput bind:value={search} placeholder="Buscar domínio" debounce={0} />
          <Select label="Status" options={statusOptions} bind:value={statusFilter} />
        </div>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex (Labelled scroll region needs keyboard focus) -->
        <div class="table-region" tabindex="0" role="region" aria-label="Tabela de domínios">
          <div class="table-content">
            <DataTable
              columns={domainColumns}
              rows={filteredDomains}
              selectable
              selectAllLabel="Selecionar todos os domínios"
              selectRowLabel={(row) => `Selecionar ${row.domain}`}
              bind:selectedRows={selectedDomains}
              stickyHeader={false}
            />
          </div>
        </div>
        <p class="footnote">
          {selectedDomains.length} selecionado(s). Filtros e seleção são locais a esta prévia.
        </p>
      {/if}
      <p class="footnote">
        A aplicação fornece dados, autenticação e regras de negócio. Esta demonstração não executa
        operações.
      </p>
    </div>
  </PageShell>
</div>

<style>
  .console-demo {
    --gradient-surface: none;
    --texture-surface: none;
    --gradient-backdrop: none;
    --pattern-backdrop: none;
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
  .console-demo :global(.cy-ps__header) {
    padding: 0;
  }
  .console-demo :global(.cy-navbar) {
    width: 100%;
    background: transparent;
    border-bottom: none;
  }
  /* The rail flyout opens beside the aside; PageShell clips it otherwise. */
  .console-demo :global(.cy-ps__sidebar) {
    overflow: visible;
  }
  .sidebars {
    display: flex;
    align-items: stretch;
    min-height: 100%;
  }
  .sidebars :global(.cy-sidebar:last-child) {
    border-right: none;
  }
  .content {
    max-width: 1200px;
    margin: auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }
  .content > :global(.cy-breadcrumb),
  .content > :global(.cy-page-header) {
    margin-bottom: calc(-1 * var(--space-3));
  }
  .message {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.8125rem;
  }
  .message:empty {
    display: none;
  }
  .inline-alert a {
    color: inherit;
    font-weight: var(--font-weight-semibold);
  }
  .metrics,
  .quick-links {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-4);
  }
  .metrics :global(.cy-sparkline) {
    max-width: 100%;
    height: auto;
  }
  h2 {
    font-family: var(--font-display);
    font-size: 1.0625rem;
    margin: 0 0 var(--space-4);
  }
  .password-form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--space-3);
  }
  .password-form :global(.cy-password) {
    flex: 1 1 280px;
  }
  .settings-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--space-3);
  }
  .toolbar :global(.cy-search) {
    flex: 1 1 240px;
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
    min-width: 720px;
  }
  .switch-cell :global(.cy-switch__label),
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .kebab {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
  }
  .footnote {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    margin: 0;
  }
  @media (max-width: 900px) {
    .metrics,
    .quick-links {
      grid-template-columns: 1fr 1fr;
    }
  }
  @media (max-width: 600px) {
    .metrics,
    .quick-links {
      grid-template-columns: 1fr;
    }
    .console-demo :global(.cy-ps__main) {
      padding: var(--space-4);
    }
  }
</style>
