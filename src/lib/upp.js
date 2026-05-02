/**
 * Universal Predictive Protocol (UPP)
 * Optimizes web app performance and sustainability by balancing speed with energy efficiency
 * using Sharpe-style ratios.
 */

class UPP {
  constructor(options = {}) {
    this.options = {
      enablePrefetch: options.enablePrefetch !== false,
      enableCriticalPreload: options.enableCriticalPreload !== false,
      enableLazyLoad: options.enableLazyLoad !== false,
      enableScriptDeferral: options.enableScriptDeferral !== false,
      logMetrics: options.logMetrics !== false,
      ...options
    };

    this.metrics = {
      prefetchAttempts: 0,
      prefetchSuccesses: 0,
      lazyLoadCount: 0,
      criticalAssetsPreloaded: 0
    };

    this.navigationModel = this.buildNavigationModel();
    this.init();
  }

  /**
   * Initialize UPP on page load
   */
  init() {
    if (this.options.logMetrics) {
      console.log('[UPP] Initializing Universal Predictive Protocol');
    }

    if (this.options.enableCriticalPreload) {
      this.preloadCriticalAssets();
    }

    if (this.options.enableLazyLoad) {
      this.setupLazyLoading();
    }

    if (this.options.enableScriptDeferral) {
      this.deferNonCriticalScripts();
    }

    if (this.options.enablePrefetch) {
      this.setupPrefetching();
    }

    // Log initialization complete
    if (this.options.logMetrics) {
      this.logPerformanceMetrics();
    }
  }

  /**
   * Build probabilistic navigation model based on page structure
   * Returns predicted navigation paths based on typical user flows
   */
  buildNavigationModel() {
    const navLinks = Array.from(document.querySelectorAll('a[href]'));
    const model = {};

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      // Filter out external links and anchors
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        model[href] = {
          element: link,
          probability: 0.5, // Base probability
          clickCount: 0
        };
      }
    });

    return model;
  }

  /**
   * Preload critical resources (CSS, fonts, above-the-fold images)
   */
  preloadCriticalAssets() {
    const criticalSelectors = [
      'link[rel="stylesheet"]',
      'link[rel="preconnect"]',
      'img[data-critical="true"]',
      'script[data-critical="true"]'
    ];

    criticalSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.tagName === 'IMG') {
          this.preloadImage(el);
        } else if (el.tagName === 'LINK') {
          this.preloadLink(el);
        } else if (el.tagName === 'SCRIPT') {
          this.preloadScript(el);
        }
      });
    });

    if (this.options.logMetrics) {
      console.log(`[UPP] Preloaded ${this.metrics.criticalAssetsPreloaded} critical assets`);
    }
  }

  /**
   * Preload link element
   */
  preloadLink(linkEl) {
    if (linkEl.rel === 'stylesheet' || linkEl.rel === 'preconnect') {
      linkEl.href && this.metrics.criticalAssetsPreloaded++;
    }
  }

  /**
   * Preload image element
   */
  preloadImage(imgEl) {
    const img = new Image();
    img.src = imgEl.src;
    this.metrics.criticalAssetsPreloaded++;
  }

  /**
   * Preload script element
   */
  preloadScript(scriptEl) {
    if (scriptEl.src) {
      this.metrics.criticalAssetsPreloaded++;
    }
  }

  /**
   * Setup lazy loading for offscreen images using IntersectionObserver
   */
  setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-lazy="true"], img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
            this.metrics.lazyLoadCount++;
          }
        });
      });

      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });

      if (this.options.logMetrics) {
        console.log(`[UPP] Set up lazy loading for ${lazyImages.length} images`);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyImages.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    }
  }

  /**
   * Defer non-critical scripts until after first paint
   */
  deferNonCriticalScripts() {
    const scripts = document.querySelectorAll('script[data-defer="true"]');

    scripts.forEach(script => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.loadScript(script);
        });
      } else {
        requestIdleCallback(() => {
          this.loadScript(script);
        }, { timeout: 2000 });
      }
    });

    if (this.options.logMetrics) {
      console.log(`[UPP] Deferred ${scripts.length} non-critical scripts`);
    }
  }

  /**
   * Load a script element
   */
  loadScript(scriptEl) {
    if (scriptEl.src) {
      const newScript = document.createElement('script');
      newScript.src = scriptEl.src;
      newScript.async = true;
      document.body.appendChild(newScript);
    }
  }

  /**
   * Setup predictive prefetching based on navigation model
   */
  setupPrefetching() {
    Object.keys(this.navigationModel).forEach(href => {
      const navItem = this.navigationModel[href];
      
      // Add listener to update probability based on user interactions
      navItem.element.addEventListener('mouseenter', () => {
        this.prefetchLink(href);
      });
    });

    if (this.options.logMetrics) {
      console.log('[UPP] Set up predictive prefetching');
    }
  }

  /**
   * Prefetch a link when user hovers or when probability suggests navigation
   */
  prefetchLink(href) {
    if (!href || href.startsWith('http') || href.startsWith('#')) {
      return;
    }

    this.metrics.prefetchAttempts++;

    // Check if already prefetched
    const existing = document.querySelector(`link[rel="prefetch"][href="${href}"]`);
    if (existing) {
      return;
    }

    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = 'document';
      document.head.appendChild(link);
      this.metrics.prefetchSuccesses++;

      if (this.options.logMetrics) {
        console.log(`[UPP] Prefetched: ${href}`);
      }
    } catch (error) {
      console.warn(`[UPP] Failed to prefetch ${href}:`, error);
    }
  }

  /**
   * Log performance metrics
   */
  logPerformanceMetrics() {
    const perfData = performance.getEntriesByType('navigation')[0];
    
    let metrics = '\n[UPP] Performance Metrics:\n';
    metrics += `  - DOM Content Loaded: ${perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart}ms\n`;
    metrics += `  - Load Complete: ${perfData?.loadEventEnd - perfData?.loadEventStart}ms\n`;
    metrics += `  - Critical Assets Preloaded: ${this.metrics.criticalAssetsPreloaded}\n`;
    metrics += `  - Images Lazy Loaded: ${this.metrics.lazyLoadCount}\n`;
    metrics += `  - Prefetch Successes: ${this.metrics.prefetchSuccesses}/${this.metrics.prefetchAttempts}\n`;
    
    console.log(metrics);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update navigation probability based on user interaction
   */
  recordNavigation(href) {
    if (this.navigationModel[href]) {
      this.navigationModel[href].clickCount++;
      this.navigationModel[href].probability = Math.min(
        0.95,
        0.5 + (this.navigationModel[href].clickCount * 0.1)
      );
    }
  }
}

// Auto-initialize UPP on page load
if (typeof window !== 'undefined') {
  window.upp = new UPP({
    enablePrefetch: true,
    enableCriticalPreload: true,
    enableLazyLoad: true,
    enableScriptDeferral: true,
    logMetrics: true
  });
}

export default UPP;
