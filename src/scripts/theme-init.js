// Applied before paint to avoid flash. Inlined by Astro <script is:inline>.
const stored = (() => {
  try { return localStorage.getItem('theme'); } catch { return null; }
})();
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (stored === 'dark' || (!stored && prefersDark)) {
  document.documentElement.classList.add('dark');
}
