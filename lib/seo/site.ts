export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://getmaki.app";
export const SITE_NAME = "Maki";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

/** Serialize JSON-LD safely (escapes `<` so payloads can't break out of the script tag). */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
