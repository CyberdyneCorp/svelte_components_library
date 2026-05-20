<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy } from "svelte";
  import { useCesiumViewer } from "../viewerContext.js";
  import type { ContourShadedRamp } from "../types.js";

  type Material = import("cesium").Material;

  type Props = {
    visible?: boolean;
    /** Spacing in metres between adjacent contour lines. */
    spacingM?: number;
    /** Width of the contour line in pixels. */
    width?: number;
    /** Hex colour for the contour line. */
    color?: string;
    /**
     * When true, layers an `ElevationRamp` material under the contour using
     * the selected ramp. The ramp colours the terrain between
     * `minHeightM` and `maxHeightM`.
     */
    shaded?: boolean;
    shadedRamp?: ContourShadedRamp;
    minHeightM?: number;
    maxHeightM?: number;
  };

  let {
    visible = true,
    spacingM = 150,
    width = 2,
    color = "#00ff41",
    shaded = false,
    shadedRamp = "terrain",
    minHeightM = -500,
    maxHeightM = 9000,
  }: Props = $props();

  const getViewer = useCesiumViewer();
  let mountedMaterial: Material | null = null;
  let previousMaterial: Material | null | undefined = undefined;
  let rampImageCache: Partial<Record<ContourShadedRamp, string>> = {};

  // Re-build the material when the structural props change (visibility flip,
  // shaded mode swap). Cheap-looking ones (spacing/width/color/min/max) just
  // mutate uniforms in the second effect.
  $effect(() => {
    void visible;
    void shaded;
    void shadedRamp;

    let cancelled = false;
    void (async () => {
      const viewer = getViewer();
      if (!viewer) return;
      const Cesium = await import("cesium");
      if (cancelled) return;

      if (previousMaterial === undefined) {
        previousMaterial = viewer.scene.globe.material ?? null;
      }

      if (!visible) {
        viewer.scene.globe.material = previousMaterial ?? undefined;
        mountedMaterial = null;
        return;
      }

      mountedMaterial = shaded
        ? await buildContourPlusRampMaterial(Cesium)
        : buildContourMaterial(Cesium);
      viewer.scene.globe.material = mountedMaterial;
      applyUniforms(Cesium);
    })();

    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    void spacingM;
    void width;
    void color;
    void minHeightM;
    void maxHeightM;
    void (async () => {
      const Cesium = await import("cesium");
      applyUniforms(Cesium);
    })();
  });

  function applyUniforms(Cesium: typeof import("cesium")): void {
    if (!mountedMaterial) return;
    const contour = (
      mountedMaterial as Material & {
        materials?: { contourMaterial?: Material };
        uniforms: Record<string, unknown>;
      }
    ).materials?.contourMaterial ?? mountedMaterial;
    const contourUniforms = (contour as Material & {
      uniforms: Record<string, unknown>;
    }).uniforms;
    contourUniforms.spacing = spacingM;
    contourUniforms.width = width;
    contourUniforms.color = Cesium.Color.fromCssColorString(color);

    if (shaded) {
      const ramp = (
        mountedMaterial as Material & {
          materials: { elevationRampMaterial: Material };
        }
      ).materials.elevationRampMaterial;
      const rampUniforms = (ramp as Material & {
        uniforms: Record<string, unknown>;
      }).uniforms;
      rampUniforms.minimumHeight = minHeightM;
      rampUniforms.maximumHeight = maxHeightM;
    }
  }

  function buildContourMaterial(
    Cesium: typeof import("cesium"),
  ): Material {
    return Cesium.Material.fromType("ElevationContour");
  }

  async function buildContourPlusRampMaterial(
    Cesium: typeof import("cesium"),
  ): Promise<Material> {
    const rampImage = await getRampImage(shadedRamp);
    const material = new Cesium.Material({
      fabric: {
        type: "ContourPlusRamp",
        materials: {
          contourMaterial: { type: "ElevationContour" },
          elevationRampMaterial: { type: "ElevationRamp" },
        },
        components: {
          diffuse:
            "contourMaterial.alpha == 0.0 ? elevationRampMaterial.diffuse : contourMaterial.diffuse",
          alpha:
            "max(contourMaterial.alpha, elevationRampMaterial.alpha)",
        },
      },
      translucent: false,
    });
    // Seed the ramp image before the first frame.
    (
      material as Material & {
        materials: { elevationRampMaterial: Material };
      }
    ).materials.elevationRampMaterial.uniforms.image = rampImage;
    return material;
  }

  async function getRampImage(name: ContourShadedRamp): Promise<string> {
    if (rampImageCache[name]) return rampImageCache[name]!;
    const dataUri = renderRampDataUri(RAMPS[name]);
    rampImageCache[name] = dataUri;
    return dataUri;
  }

  onDestroy(() => {
    const viewer = getViewer();
    if (viewer && previousMaterial !== undefined) {
      viewer.scene.globe.material = previousMaterial ?? undefined;
    }
    mountedMaterial = null;
    previousMaterial = undefined;
    rampImageCache = {};
  });

  // Ramps as ordered colour stops. ElevationRamp wants an image lookup, so
  // we render each ramp to a 1×128 strip data-URI at first use.
  const RAMPS: Record<ContourShadedRamp, string[]> = {
    grey: ["#0a0a0f", "#454555", "#a0a0b0", "#f0f0ff"],
    viridis: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"],
    terrain: ["#1e3a5f", "#2e7d32", "#fdd835", "#8d6e63", "#fafafa"],
  };

  function renderRampDataUri(stops: string[]): string {
    const W = 1;
    const H = 128;
    const canvas =
      typeof document !== "undefined" ? document.createElement("canvas") : null;
    if (!canvas) return "";
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    const gradient = ctx.createLinearGradient(0, H, 0, 0);
    stops.forEach((c, i) => gradient.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    return canvas.toDataURL("image/png");
  }
</script>
