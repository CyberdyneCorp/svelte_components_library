<svelte:options runes={true} />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  type MapMarker = {
    lat: number;
    lng: number;
    label?: string;
    color?: "green" | "cyan" | "red" | "amber";
    popup?: string;
  };

  let {
    center = [0, 0],
    zoom = 3,
    height = "500px",
    markers = [],
    tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    interactive = true,
    onmarkerclick,
    fitBounds = false,
  }: {
    center?: [number, number];
    zoom?: number;
    height?: string;
    markers?: MapMarker[];
    tileUrl?: string;
    attribution?: string;
    interactive?: boolean;
    onmarkerclick?: (marker: { lat: number; lng: number; label?: string }) => void;
    fitBounds?: boolean;
  } = $props();

  const MARKER_COLORS: Record<string, string> = {
    green: "#00ff41",
    cyan: "#00d4ff",
    red: "#ff4444",
    amber: "#ffb800",
  };

  let mapContainer: HTMLDivElement;
  let map: any = null;
  let markerLayer: any = null;
  let leafletLoaded = $state(false);
  let locating = $state(false);
  let locationMarker: any = null;

  function zoomIn() { map?.zoomIn(); }
  function zoomOut() { map?.zoomOut(); }
  function resetView() { map?.setView(center, zoom); }

  function locateMe() {
    if (!map || !navigator.geolocation) return;
    locating = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const L = (window as any).L;
        const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        map.flyTo(latlng, 14, { duration: 1.5 });

        if (locationMarker) {
          locationMarker.setLatLng(latlng);
        } else {
          const icon = L.divIcon({
            className: "cy-map-marker",
            html: `<div style="
              width: 18px; height: 18px; border-radius: 50%;
              background: #00d4ff;
              box-shadow: 0 0 12px #00d4ff, 0 0 24px #00d4ff44;
              border: 3px solid rgba(255,255,255,0.5);
              animation: cy-map-pulse 1.5s ease-in-out infinite;
            "></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });
          locationMarker = L.marker(latlng, { icon }).addTo(map);
          locationMarker.bindPopup(
            `<div style="background:#12121a;color:#f0f0ff;padding:8px 12px;border-radius:6px;font-family:'JetBrains Mono',monospace;font-size:12px;border:1px solid #00d4ff44;">
              <div style="color:#00d4ff;font-weight:600;">Your Location</div>
              <div style="color:rgba(240,240,255,0.6);font-size:11px;margin-top:2px;">${latlng[0].toFixed(4)}, ${latlng[1].toFixed(4)}</div>
            </div>`,
            { className: "cy-map-popup", closeButton: false }
          );
        }
        locating = false;
      },
      () => { locating = false; },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function loadLeafletCSS(): Promise<void> {
    return new Promise((resolve) => {
      if (document.querySelector('link[href*="leaflet"]')) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.onload = () => resolve();
      document.head.appendChild(link);
    });
  }

  function loadLeafletJS(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).L) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Leaflet"));
      document.head.appendChild(script);
    });
  }

  function createMarkerIcon(color: string): any {
    const L = (window as any).L;
    return L.divIcon({
      className: "cy-map-marker",
      html: `<div style="
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: ${color};
        box-shadow: 0 0 8px ${color}, 0 0 16px ${color}44;
        border: 2px solid rgba(255,255,255,0.3);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -10],
    });
  }

  function addMarkers() {
    const L = (window as any).L;
    if (!map || !L) return;

    if (markerLayer) {
      markerLayer.clearLayers();
    } else {
      markerLayer = L.layerGroup().addTo(map);
    }

    for (const m of markers) {
      const color = MARKER_COLORS[m.color || "green"] || MARKER_COLORS.green;
      const icon = createMarkerIcon(color);
      const leafletMarker = L.marker([m.lat, m.lng], { icon }).addTo(markerLayer);

      if (m.popup || m.label) {
        const popupContent = `
          <div style="
            background: #12121a;
            color: #f0f0ff;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-size: 12px;
            border: 1px solid ${color}44;
            box-shadow: 0 0 12px ${color}22;
          ">
            ${m.label ? `<div style="color: ${color}; font-weight: 600; margin-bottom: ${m.popup ? '4px' : '0'}">${m.label}</div>` : ""}
            ${m.popup ? `<div style="color: rgba(240,240,255,0.7);">${m.popup}</div>` : ""}
          </div>
        `;
        leafletMarker.bindPopup(popupContent, {
          className: "cy-map-popup",
          closeButton: false,
          offset: [0, -4],
        });
      }

      leafletMarker.on("click", () => {
        onmarkerclick?.({ lat: m.lat, lng: m.lng, label: m.label });
      });
    }

    if (fitBounds && markers.length > 1) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  async function initMap() {
    try {
      await Promise.all([loadLeafletCSS(), loadLeafletJS()]);
      leafletLoaded = true;
    } catch {
      return;
    }

    const L = (window as any).L;

    map = L.map(mapContainer, {
      center,
      zoom,
      zoomControl: false,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    });

    L.tileLayer(tileUrl, { attribution }).addTo(map);

    // Custom controls are rendered in Svelte template instead of Leaflet's

    addMarkers();
  }

  onMount(() => {
    initMap();
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });

  $effect(() => {
    // track markers reactively
    markers;
    if (map && leafletLoaded) {
      addMarkers();
    }
  });
</script>

<div class="cy-map" style="--map-height: {height};">
  <div class="cy-map__container" bind:this={mapContainer}></div>

  {#if leafletLoaded && interactive}
    <div class="cy-map__controls">
      <button class="cy-map__ctrl-btn" onclick={zoomIn} title="Zoom in" aria-label="Zoom in">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <button class="cy-map__ctrl-btn" onclick={zoomOut} title="Zoom out" aria-label="Zoom out">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <div class="cy-map__ctrl-sep"></div>
      <button class="cy-map__ctrl-btn" onclick={resetView} title="Reset view" aria-label="Reset view">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button
        class="cy-map__ctrl-btn"
        class:cy-map__ctrl-btn--active={locating}
        onclick={locateMe}
        title="My location"
        aria-label="My location"
        disabled={locating}
      >
        {#if locating}
          <div class="cy-map__ctrl-spinner"></div>
        {:else}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        {/if}
      </button>
    </div>
  {/if}

  {#if !leafletLoaded}
    <div class="cy-map__loading">
      <span class="cy-map__loading-text">Initializing map...</span>
    </div>
  {/if}
</div>

<style>
  .cy-map {
    position: relative;
    width: 100%;
    height: var(--map-height, 500px);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(0, 255, 65, 0.15);
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.05), inset 0 0 20px rgba(0, 0, 0, 0.3);
    background: #0a0a0f;
  }

  .cy-map__container {
    width: 100%;
    height: 100%;
  }

  .cy-map__loading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0f;
    z-index: 1000;
  }

  .cy-map__loading-text {
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 13px;
    color: rgba(0, 255, 65, 0.6);
    animation: cy-map-pulse 1.5s ease-in-out infinite;
  }

  @keyframes cy-map-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }

  /* Custom controls */
  .cy-map__controls {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 2px;
    background: rgba(18, 18, 26, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 4px;
    backdrop-filter: blur(8px);
  }

  .cy-map__ctrl-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: rgba(255, 255, 255, 0.65);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .cy-map__ctrl-btn:hover {
    background: rgba(0, 212, 255, 0.1);
    color: #00d4ff;
  }

  .cy-map__ctrl-btn:active {
    background: rgba(0, 212, 255, 0.18);
  }

  .cy-map__ctrl-btn--active {
    color: #00d4ff;
  }

  .cy-map__ctrl-btn:disabled {
    opacity: 0.4;
    cursor: wait;
  }

  .cy-map__ctrl-sep {
    height: 1px;
    margin: 2px 4px;
    background: rgba(255, 255, 255, 0.06);
  }

  .cy-map__ctrl-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-top-color: #00d4ff;
    border-radius: 50%;
    animation: cy-map-spin 0.6s linear infinite;
  }

  @keyframes cy-map-spin {
    to { transform: rotate(360deg); }
  }

  /* Override Leaflet popup styles */
  .cy-map :global(.cy-map-popup .leaflet-popup-content-wrapper) {
    background: transparent;
    box-shadow: none;
    border-radius: 6px;
    padding: 0;
  }

  .cy-map :global(.cy-map-popup .leaflet-popup-content) {
    margin: 0;
    line-height: 1.4;
  }

  .cy-map :global(.cy-map-popup .leaflet-popup-tip) {
    background: #12121a;
    border: 1px solid rgba(0, 255, 65, 0.15);
    box-shadow: none;
  }

  /* Hide default Leaflet zoom control */
  .cy-map :global(.leaflet-control-zoom) {
    display: none !important;
  }

  .cy-map :global(.leaflet-control-attribution) {
    background: rgba(10, 10, 15, 0.8) !important;
    color: rgba(255, 255, 255, 0.3) !important;
    font-size: 10px !important;
  }

  .cy-map :global(.leaflet-control-attribution a) {
    color: rgba(0, 212, 255, 0.5) !important;
  }

  .cy-map :global(.cy-map-marker) {
    background: none !important;
    border: none !important;
  }
</style>
