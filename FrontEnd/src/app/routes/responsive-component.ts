import { Type } from '@angular/core';

type ComponentLoader = () => Promise<Type<unknown>>;
type ResponsiveComponentLoader = ComponentLoader & { readonly responsive: true };

/**
 * Keeps the supplied mobile experiences isolated from the original portal views.
 * Protected portal routes are resolved in the browser after authentication, so
 * the server-safe fallback deliberately keeps the original desktop component.
 */
export function responsiveComponent(
  mobile: ComponentLoader,
  desktop: ComponentLoader,
): ResponsiveComponentLoader {
  const loader = (() => isMobileViewport() ? mobile() : desktop()) as ResponsiveComponentLoader;
  Object.defineProperty(loader, 'responsive', { value: true });
  return loader;
}

export function isResponsiveComponentLoader(value: unknown): boolean {
  return typeof value === 'function'
    && (value as Partial<ResponsiveComponentLoader>).responsive === true;
}

function isMobileViewport(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(max-width: 767px)').matches;
}
