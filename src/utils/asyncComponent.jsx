import React, { lazy, Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

const componentCache = new WeakMap();

const defaultFallback = (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 2,
      height: "100vh",
    }}
  >
    <CircularProgress color="inherit" />
  </Box>
);

function asyncComponent(
  importFunc,
  {
    fallback = defaultFallback,
    errorFallback = <div>Error loading component</div>,
    displayName = "AsyncComponent",
    retryCount = 3,
  } = {}
) {
  if (componentCache.has(importFunc)) {
    return componentCache.get(importFunc);
  }

  const LazyComponent = lazy(async () => {
    let attempts = 0;

    while (attempts < retryCount) {
      try {
        return await importFunc();
      } catch (error) {
        attempts++;
        console.error(`${displayName} load attempt ${attempts} failed`, error);

        // Retry only if it's a chunk error
        if (error.name === "ChunkLoadError" && attempts < retryCount) {
          await new Promise((res) => setTimeout(res, 2 ** attempts * 500));
          continue;
        }

        return { default: () => errorFallback };
      }
    }

    return { default: () => errorFallback };
  });

  const WrappedComponent = (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );

  WrappedComponent.displayName = `Async(${displayName})`;

  // Helper methods
  WrappedComponent.preload = () => importFunc().catch(() => {});
  WrappedComponent.isLoaded = () => componentCache.has(importFunc);

  componentCache.set(importFunc, WrappedComponent);
  return WrappedComponent;
}

// Factory for consistent options
asyncComponent.createFactory =
  (defaultOptions = {}) =>
  (importFunc, options = {}) =>
    asyncComponent(importFunc, { ...defaultOptions, ...options });

// Preload all components
asyncComponent.preloadAll = (components) =>
  Promise.allSettled(
    components.map((c) =>
      typeof c.preload === "function" ? c.preload() : Promise.resolve()
    )
  );

export default asyncComponent;
