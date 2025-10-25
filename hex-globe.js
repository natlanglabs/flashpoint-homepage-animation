(() => {
  const DATASET_URL =
    "https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";

  const computeFeatureCentroid = (geometry) => {
    if (!geometry || !Array.isArray(geometry.coordinates)) return [0, 0];
    let sumLng = 0;
    let sumLat = 0;
    let count = 0;

    const accumulate = (coords) => {
      coords.forEach((pt) => {
        if (Array.isArray(pt[0])) {
          accumulate(pt);
        } else if (Array.isArray(pt) && pt.length >= 2) {
          sumLng += pt[0];
          sumLat += pt[1];
          count += 1;
        }
      });
    };

    accumulate(geometry.coordinates);
    return count ? [sumLng / count, sumLat / count] : [0, 0];
  };

  const hexToRgb = (hex) => {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const mixColors = (a, b, t) => {
    return {
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t,
    };
  };

  const rgbToCss = ({ r, g, b }) =>
    `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

  const initGlobe = () => {
    const container = document.getElementById("globeOverlay");
    if (!container || typeof Globe !== "function") return;

    const globe = Globe({ animateIn: false })(container)
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("#a5d3ff")
      .atmosphereAltitude(0.22)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.24)
      .hexPolygonUseDots(false)
      .hexPolygonAltitude(() => 0.01)
      .hexPolygonColor(() => "#5b7cff");

    const globeMaterial = globe.globeMaterial();
    globeMaterial.transparent = true;
    globeMaterial.opacity = 0.82;
    globeMaterial.color.set("#d9e8ff");
    globeMaterial.emissive.set("#a7c8ff");
    globeMaterial.emissiveIntensity = 0.12;

    const shaderCanvas = document.getElementById("shaderCanvas");
    if (shaderCanvas && typeof THREE !== "undefined") {
      const oceanCanvas = document.createElement("canvas");
      const oceanCtx = oceanCanvas.getContext("2d");
      const syncOceanCanvas = () => {
        oceanCanvas.width = shaderCanvas.width;
        oceanCanvas.height = shaderCanvas.height;
      };
      syncOceanCanvas();

      const oceanTexture = new THREE.CanvasTexture(oceanCanvas);
      oceanTexture.encoding = THREE.sRGBEncoding;
      oceanTexture.anisotropy = 4;
      globeMaterial.map = oceanTexture;
      globeMaterial.color.set("#ffffff"); // let the gradient drive the coloration
      globeMaterial.needsUpdate = true;

      const refreshTexture = () => {
        if (!document.body.contains(shaderCanvas)) return;
        // mirror the animated shader output onto the globe texture
        oceanCtx.drawImage(shaderCanvas, 0, 0, oceanCanvas.width, oceanCanvas.height);
        oceanTexture.needsUpdate = true;
        requestAnimationFrame(refreshTexture);
      };
      refreshTexture();

      window.addEventListener("resize", syncOceanCanvas);
    }

    const EARTH_TILT_RAD = (23.5 * Math.PI) / 180;
    globe.scene().rotation.z = -EARTH_TILT_RAD;

    const controls = globe.controls();
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.08;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const dim = Math.min(width, height);
      globe.width(dim);
      globe.height(dim);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    fetch(DATASET_URL)
      .then((res) => res.json())
      .then((countries) => {
        globe
          .hexPolygonsData(countries.features)
          .hexPolygonLabel(({ properties }) => {
            const { ADMIN, ISO_A2, POP_EST } = properties;
            const formattedPop =
              typeof POP_EST === "number"
                ? POP_EST.toLocaleString()
                : POP_EST;
            return `<b>${ADMIN} (${ISO_A2})</b><br/>Population: <i>${formattedPop}</i>`;
          });

        countries.features.forEach((feature) => {
          feature.__waveSeed = Math.random() * Math.PI * 2;
          feature.__center = computeFeatureCentroid(feature.geometry);
        });

        const azure = hexToRgb("#5b7cff");
        const aqua = hexToRgb("#7cf4ff");
        const ember = hexToRgb("#ff4f00");
        const animateHexColors = () => {
          const time = performance.now() * 0.00035;
          globe.hexPolygonColor((feature) => {
            const [lng, lat] = feature.__center || [0, 0];
            const phase = feature.__waveSeed || 0;
            const wave =
              0.5 +
              0.5 *
                Math.sin(
                  time * 3.5 + lng * 0.25 + lat * 0.35 + phase * 1.5
                );
            const shimmer =
              0.5 +
              0.5 *
                Math.sin(
                  time * 2.2 + lng * 0.4 - lat * 0.18 + phase * 0.8
                );
            const coolBlend = mixColors(azure, aqua, wave);
            const hotBlend = mixColors(coolBlend, ember, shimmer);
            const boost = 0.65 + wave * 0.35;
            const boosted = {
              r: Math.min(255, hotBlend.r * boost),
              g: Math.min(255, hotBlend.g * boost),
              b: Math.min(255, hotBlend.b * boost),
            };
            return rgbToCss(boosted);
          });
          requestAnimationFrame(animateHexColors);
        };
        animateHexColors();
      })
      .catch((err) => {
        console.error("Failed to load hex globe dataset", err);
      });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobe);
  } else {
    initGlobe();
  }
})();
