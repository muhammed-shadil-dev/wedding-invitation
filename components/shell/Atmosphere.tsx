/**
 * Grain and vignette. Two fixed, pointer-transparent layers that sit
 * above everything and never repaint. They are what stops the page
 * looking like flat CSS and start it looking like film.
 */
export function Atmosphere() {
  return (
    <>
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
    </>
  );
}
