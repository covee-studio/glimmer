/** Approximate visual width, rather than treating a CJK character like a Latin
 * letter. Use the displayed (possibly translated) headline, never the source. */
export function headlineSize(text: string): string {
  const measure = Array.from(text).reduce((width, char) => width + (/\s/u.test(char) ? .25 : /[\u3400-\u9fff\u{20000}-\u{2FA1F}]/u.test(char) ? 1 : .52), 0)
  return measure > 76 ? 'clamp(24px, 2.6vw, 34px)'
    : measure > 36 ? 'clamp(27px, 2.9vw, 40px)'
    : 'clamp(30px, 3.2vw, 46px)'
}
