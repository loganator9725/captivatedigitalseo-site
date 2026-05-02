function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = function renderHead({ page, canonicalUrl }) {
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <meta name="reach-priority" content="0.0000">
  <meta name="upp-signal" content="0.0000">
  <meta name="trend-priority" content="neutral">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <link rel="preload" as="style" href="/styles/main.css">
  <link rel="preload" as="image" href="/assets/optimized/sample-banner.webp">
  <link rel="stylesheet" href="/styles/main.css">
  <script type="text/javascript">
    (function () {
      const UPP_CORE = {
        ppa: "PPA/2025/UPP-2281",
        L: 7.0,
        T: 10000,
        sharpe_target: 2.0,
      };

      const fidelityFactor = Math.max(0, 1 - (UPP_CORE.L / UPP_CORE.T));

      const sectorWeights = {
        naics_51: 0.85,
        naics_52: 0.95,
        naics_54: 0.90,
        naics_62: 0.92,
      };

      function getSectorProfile() {
        try {
          const params = new URLSearchParams(window.location.search);
          const querySector = params.get("naics");
          if (querySector && sectorWeights[querySector]) return querySector;
          const stored = window.localStorage.getItem("naics_profile");
          if (stored && sectorWeights[stored]) return stored;
        } catch (_err) {
          // No-op: remain resilient in restricted environments.
        }
        return "naics_51";
      }

      function collectSignal() {
        const navEntries = window.performance.getEntriesByType("navigation");
        const navDuration = navEntries.length > 0 ? navEntries[0].duration : 0;
        const resourceEntries = window.performance.getEntriesByType("resource");

        const topResources = resourceEntries
          .filter(function (entry) { return entry.duration > 0; })
          .sort(function (a, b) { return b.duration - a.duration; })
          .slice(0, 8);

        const amplitude = topResources.length
          ? topResources.reduce(function (sum, entry) { return sum + entry.duration; }, 0) / topResources.length
          : navDuration;

        // DSE noise filter suppresses low-amplitude fluctuations.
        const noiseFloor = Math.max(15, amplitude * 0.18);
        const filteredSignal = topResources
          .map(function (entry) { return Math.max(0, entry.duration - noiseFloor); })
          .reduce(function (sum, value) { return sum + value; }, 0);

        return {
          navDuration: navDuration,
          filteredSignal: filteredSignal,
          intensity: topResources.length,
        };
      }

      function updateInternalLinkWeights(weight) {
        const links = document.querySelectorAll('a[href^="/"]');
        links.forEach(function (link, index) {
          const positionalBoost = 1 + (1 / (index + 4));
          const linkWeight = Math.max(0, Math.min(1, weight * positionalBoost));
          link.dataset.uppWeight = linkWeight.toFixed(4);
        });
      }

      function executeUPP() {
        const sector = getSectorProfile();
        const sectorWeight = sectorWeights[sector] || sectorWeights.naics_51;

        const signal = collectSignal();
        const sigma_p = Math.max(0.001, signal.navDuration / 1000);
        const w_i = (1 / (1 + sigma_p)) * sectorWeight;
        const I_i = signal.filteredSignal > 0 ? signal.filteredSignal : signal.intensity;
        const uppSignal = (w_i * I_i) * fidelityFactor;

        const reachMeta = document.querySelector('meta[name="reach-priority"]');
        const signalMeta = document.querySelector('meta[name="upp-signal"]');
        const trendMeta = document.querySelector('meta[name="trend-priority"]');

        if (reachMeta) {
          reachMeta.content = (w_i * fidelityFactor).toFixed(4);
        }
        if (signalMeta) {
          signalMeta.content = uppSignal.toFixed(4);
        }
        if (trendMeta) {
          trendMeta.content = sector;
        }

        updateInternalLinkWeights(w_i);
      }

      if (document.readyState === "complete") {
        executeUPP();
      } else {
        window.addEventListener("load", executeUPP, { once: true });
      }
    })();
  </script>
</head>`;
};
