<svelte:options runes={true} />

<script lang="ts">
  type WeatherData = {
    temperatureC?: number | null;
    apparentTemperatureC?: number | null;
    /** Human-readable condition, e.g. "Partly cloudy". */
    condition?: string | null;
    windKmh?: number | null;
    windDirectionDeg?: number | null;
    windGustKmh?: number | null;
    humidityPct?: number | null;
    cloudCoverPct?: number | null;
    pressureHpa?: number | null;
    isDay?: boolean | null;
  };

  type Props = {
    /** Current-conditions payload. Pass `null` while there is no data. */
    data?: WeatherData | null;
    /** Optional point shown under the title. */
    location?: { lat: number; lng: number } | null;
    title?: string;
    loading?: boolean;
    error?: string | null;
    /** Attribution shown bottom-right. */
    source?: string;
    /** Render a close button in the header. */
    dismissible?: boolean;
    onclose?: () => void;
    width?: string;
  };

  let {
    data = null,
    location = null,
    title = "Weather",
    loading = false,
    error = null,
    source = "Open-Meteo",
    dismissible = true,
    onclose,
    width = "320px",
  }: Props = $props();

  function fmtNum(n: number | null | undefined, digits = 0, suffix = ""): string {
    return n == null ? "—" : `${n.toFixed(digits)}${suffix}`;
  }

  function cardinal(deg: number | null | undefined): string {
    if (deg == null) return "—";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(((deg % 360) + 360) / 45) % 8];
  }
</script>

<div class="cy-weather" style="--cy-weather-width: {width};">
  <div class="cy-weather__header">
    <div>
      <span class="cy-weather__label">{title}</span>
      {#if location}
        <div class="cy-weather__coords cy-weather__muted">
          {location.lat.toFixed(3)}°, {location.lng.toFixed(3)}°
        </div>
      {/if}
    </div>
    {#if dismissible}
      <button class="cy-weather__close" type="button" aria-label="Close" onclick={() => onclose?.()}>
        ×
      </button>
    {/if}
  </div>

  {#if loading}
    <div class="cy-weather__muted cy-weather__small">Fetching current conditions…</div>
  {:else if error}
    <div class="cy-weather__small cy-weather__error">{error}</div>
  {:else if data}
    <div class="cy-weather__primary">
      <div class="cy-weather__temp">{fmtNum(data.temperatureC, 1, "°C")}</div>
      <div class="cy-weather__feels cy-weather__muted cy-weather__small">
        feels {fmtNum(data.apparentTemperatureC, 0, "°")}{data.condition
          ? ` · ${data.condition}`
          : ""}
      </div>
    </div>

    <div class="cy-weather__grid">
      <div class="cy-weather__cell">
        <span class="cy-weather__label">Wind</span>
        <span class="cy-weather__value">
          {fmtNum(data.windKmh, 0, " km/h")}
          {#if data.windDirectionDeg != null}
            <span
              class="cy-weather__arrow"
              style="transform: rotate({data.windDirectionDeg}deg);"
              title="From {data.windDirectionDeg.toFixed(0)}°"
            >↑</span>
            {cardinal(data.windDirectionDeg)}
          {/if}
        </span>
        <span class="cy-weather__muted cy-weather__small">
          gusts {fmtNum(data.windGustKmh, 0, " km/h")}
        </span>
      </div>
      <div class="cy-weather__cell">
        <span class="cy-weather__label">Humidity</span>
        <span class="cy-weather__value">{fmtNum(data.humidityPct, 0, "%")}</span>
        <span class="cy-weather__muted cy-weather__small">
          cloud {fmtNum(data.cloudCoverPct, 0, "%")}
        </span>
      </div>
      <div class="cy-weather__cell">
        <span class="cy-weather__label">Pressure</span>
        <span class="cy-weather__value">{fmtNum(data.pressureHpa, 0, " hPa")}</span>
        {#if data.isDay != null}
          <span class="cy-weather__muted cy-weather__small">
            {data.isDay ? "☀ day" : "☾ night"}
          </span>
        {/if}
      </div>
    </div>

    {#if source}
      <div class="cy-weather__muted cy-weather__small cy-weather__source">Source: {source}</div>
    {/if}
  {:else}
    <div class="cy-weather__muted cy-weather__small">No data.</div>
  {/if}
</div>

<style>
  .cy-weather {
    width: var(--cy-weather-width, 320px);
    background: var(--color-surface-raised, var(--color-surface-default));
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg, 12px);
    padding: var(--space-4, 1rem);
    box-shadow: var(--shadow-md);
  }
  .cy-weather__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-2, 0.5rem);
    margin-bottom: var(--space-2, 0.5rem);
  }
  .cy-weather__label {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-tertiary);
  }
  .cy-weather__coords {
    font-family: var(--font-mono, monospace);
    font-size: 0.6875rem;
    margin-top: 2px;
  }
  .cy-weather__close {
    background: transparent;
    border: 1px solid var(--color-border-default);
    color: var(--color-text-secondary);
    border-radius: var(--radius-md, 8px);
    width: 24px;
    height: 24px;
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
  }
  .cy-weather__close:hover {
    color: var(--color-text-primary);
    border-color: var(--color-action-brand-default);
  }
  .cy-weather__muted {
    color: var(--color-text-tertiary);
  }
  .cy-weather__small {
    font-size: 0.75rem;
  }
  .cy-weather__error {
    color: var(--color-state-error);
  }
  .cy-weather__primary {
    margin: 6px 0 var(--space-3, 0.75rem) 0;
  }
  .cy-weather__temp {
    font-family: var(--font-display, var(--font-mono, monospace));
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-action-brand-default);
    line-height: 1;
  }
  .cy-weather__feels {
    margin-top: 4px;
  }
  .cy-weather__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2, 0.5rem);
  }
  .cy-weather__cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 8px;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md, 8px);
  }
  .cy-weather__value {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    color: var(--color-text-primary);
  }
  .cy-weather__arrow {
    display: inline-block;
    font-size: 0.875rem;
    color: var(--color-action-brand-default);
    margin: 0 4px;
  }
  .cy-weather__source {
    text-align: right;
    margin-top: var(--space-2, 0.5rem);
  }
</style>
