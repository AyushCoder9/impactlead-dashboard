// Minimum plausible time (ms) for a human to read the form and fill it out.
// Bots that submit programmatically almost always beat this.
const MIN_FILL_TIME_MS = 1500;

export function looksLikeBot(input: {
  company?: string | null;
  renderedAt?: number | null;
}): boolean {
  if (input.company && input.company.length > 0) {
    return true; // honeypot field filled — never shown to real users
  }
  if (input.renderedAt) {
    const elapsed = Date.now() - input.renderedAt;
    if (elapsed < MIN_FILL_TIME_MS) {
      return true;
    }
  }
  return false;
}
