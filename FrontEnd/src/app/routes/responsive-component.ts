import { Type } from '@angular/core';

type ComponentLoader = () => Promise<Type<unknown>>;

/**
 * Keeps the supplied mobile experiences isolated from the original portal views.
 * Protected portal routes are resolved in the browser after authentication, so
 * the server-safe fallback deliberately keeps the original desktop component.
 */
export function responsiveComponent(
  mobile: ComponentLoader,
  desktop: ComponentLoader,
): ComponentLoader {
  return () => isMobileViewport() ? mobile() : desktop();
}

function isMobileViewport(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(max-width: 767px)').matches;
}
