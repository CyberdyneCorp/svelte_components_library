<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import WeatherCard from "./WeatherCard.svelte";

  const { Story } = defineMeta({
    title: "Data Display/WeatherCard",
    component: WeatherCard,
    tags: ["autodocs"],
    parameters: {
      docs: {
        description: {
          component:
            "Current-conditions card: temperature, feels-like, condition, wind speed/direction with a rotating arrow, humidity, cloud cover, and pressure. Controlled — pass a `data` object; supports loading and error states.",
        },
      },
    },
  });

  const sample = {
    temperatureC: 18.4,
    apparentTemperatureC: 17,
    condition: "Partly cloudy",
    windKmh: 23,
    windDirectionDeg: 210,
    windGustKmh: 41,
    humidityPct: 64,
    cloudCoverPct: 40,
    pressureHpa: 1013,
    isDay: true,
  };
</script>

<Story name="CurrentConditions">
  {#snippet template()}
    <WeatherCard data={sample} location={{ lat: 37.7749, lng: -122.4194 }} />
  {/snippet}
</Story>

<Story name="Loading">
  {#snippet template()}
    <WeatherCard loading />
  {/snippet}
</Story>

<Story name="Error">
  {#snippet template()}
    <WeatherCard error="Weather service unavailable" />
  {/snippet}
</Story>
