<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MapView from "./MapView.svelte";

  const { Story } = defineMeta({
    title: "Maps/MapView",
    component: MapView,
    tags: ["autodocs"],
  });

  const validatorMarkers = [
    { lat: 37.4316, lng: -78.6569, label: "cy-node-01", color: "green", popup: "US-East / Virginia — Active" },
    { lat: 53.3498, lng: -6.2603, label: "cy-node-02", color: "green", popup: "EU-West / Ireland — Active" },
    { lat: 35.6762, lng: 139.6503, label: "cy-node-03", color: "amber", popup: "AP-Tokyo — Warning: High Latency" },
    { lat: 44.0582, lng: -121.3153, label: "cy-node-04", color: "green", popup: "US-West / Oregon — Active" },
    { lat: 50.1109, lng: 8.6821, label: "cy-node-05", color: "red", popup: "EU-Central / Frankfurt — Offline" },
    { lat: -23.5505, lng: -46.6333, label: "cy-node-06", color: "amber", popup: "SA-East / São Paulo — Warning: Sync Delay" },
  ];

  const singleMarker = [
    { lat: -23.55, lng: -46.63, label: "Cyberdyne HQ", color: "green", popup: "Cyberdyne Systems — São Paulo Operations Center" },
  ];

  const blockchainMarkers = [
    { lat: 37.7749, lng: -122.4194, label: "ETH Node #1", color: "cyan", popup: "San Francisco — 12,450 peers" },
    { lat: 40.7128, lng: -74.006, label: "ETH Node #2", color: "cyan", popup: "New York — 9,800 peers" },
    { lat: 51.5074, lng: -0.1278, label: "ETH Node #3", color: "cyan", popup: "London — 11,200 peers" },
    { lat: 1.3521, lng: 103.8198, label: "ETH Node #4", color: "cyan", popup: "Singapore — 7,600 peers" },
    { lat: 25.2048, lng: 55.2708, label: "ETH Node #5", color: "cyan", popup: "Dubai — 5,300 peers" },
    { lat: 22.3193, lng: 114.1694, label: "ETH Node #6", color: "cyan", popup: "Hong Kong — 8,100 peers" },
    { lat: 47.3769, lng: 8.5417, label: "ETH Node #7", color: "cyan", popup: "Zurich — 6,400 peers" },
  ];
</script>

<Story name="ValidatorNodes" args={{
  markers: validatorMarkers,
  center: [20, 0],
  zoom: 2,
  height: "600px",
  fitBounds: true,
}} />

<Story name="SingleLocation" args={{
  markers: singleMarker,
  center: [-23.55, -46.63],
  zoom: 12,
  height: "500px",
}} />

<Story name="BlockchainNodes" args={{
  markers: blockchainMarkers,
  center: [30, 20],
  zoom: 2,
  height: "600px",
  fitBounds: true,
}} />
