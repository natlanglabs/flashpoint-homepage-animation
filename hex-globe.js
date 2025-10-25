(() => {
  const DATASET_URL =
    "https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson";

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
      .hexPolygonUseDots(true)
      .hexPolygonColor(() => "#5b7cff");

    const globeMaterial = globe.globeMaterial();
    globeMaterial.transparent = true;
    globeMaterial.opacity = 0;

    const controls = globe.controls();
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;

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
