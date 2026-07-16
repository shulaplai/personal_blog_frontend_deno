/**
 * Module-level reference to React Router's navigate function.
 * Used by the Axios interceptor to redirect without a full page reload.
 */

let navigateRef = null;

export function setNavigate(navigateFn) {
  navigateRef = navigateFn;
}

export function navigateTo(path) {
  if (navigateRef) {
    navigateRef(path, { replace: true });
  } else {
    // Fallback for calls outside the React tree (e.g., before app mounts)
    window.location.href = path;
  }
}
