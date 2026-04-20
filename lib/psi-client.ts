const PSI_BASE = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export interface PSIResponse {
  mobile: object;
  desktop: object;
}

async function fetchPSI(url: string, strategy: "mobile" | "desktop"): Promise<object> {
  const params = new URLSearchParams({ url, strategy, category: "performance" });
  if (process.env.GOOGLE_PSI_API_KEY) {
    params.set("key", process.env.GOOGLE_PSI_API_KEY);
  }

  // PSI's Lighthouse sandbox occasionally crashes (500) on the first try — retry a couple times.
  let lastError = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${PSI_BASE}?${params}`, { next: { revalidate: 0 } });
    if (res.ok) return res.json();

    const text = await res.text();
    lastError = `${res.status} ${text.slice(0, 200)}`;
    // Only retry on 5xx (server-side Lighthouse flakiness). 4xx means bad input, don't retry.
    if (res.status < 500) break;
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  throw new Error(`PSI API error (${strategy}): ${lastError}`);
}

export async function fetchBothStrategies(url: string): Promise<PSIResponse> {
  const [mobile, desktop] = await Promise.all([
    fetchPSI(url, "mobile"),
    fetchPSI(url, "desktop"),
  ]);
  return { mobile, desktop };
}
