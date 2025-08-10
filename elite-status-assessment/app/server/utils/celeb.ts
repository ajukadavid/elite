import Parser from 'rss-parser'

export interface AggregatedCelebrity {
  name: string
  wikipediaTitle: string
  summary?: string
  newsCount: number
  sources: string[]
  tier: 'elite' | 'aspiring' | 'casual' | 'minimalist'
}

export async function aggregateNigerianCelebrities(limit = 24): Promise<AggregatedCelebrity[]> {
  const candidates = await fetchFromWikidata(limit)
  const enriched = await Promise.all(candidates.map(enrichWithWikipediaAndNews))
  // Tier by news volume heuristic
  for (const c of enriched) {
    c.tier = c.newsCount >= 6 ? 'elite' : c.newsCount >= 3 ? 'aspiring' : c.newsCount >= 1 ? 'casual' : 'minimalist'
  }
  // Keep a balanced list
  const grouped: Record<string, AggregatedCelebrity[]> = { elite: [], aspiring: [], casual: [], minimalist: [] }
  for (const c of enriched) grouped[c.tier].push(c)
  return [...grouped.elite, ...grouped.aspiring, ...grouped.casual, ...grouped.minimalist]
}

async function fetchFromWikidata(limit: number) {
  const endpoint = 'https://query.wikidata.org/sparql'
  const query = `
SELECT ?person ?personLabel ?enTitle WHERE {
  ?person wdt:P31 wd:Q5 .
  ?person wdt:P27 wd:Q1033 .
  ?sitelink schema:about ?person ; schema:isPartOf <https://en.wikipedia.org/> ; schema:name ?enTitle .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT ${limit}`
  const res = await fetch(`${endpoint}?query=${encodeURIComponent(query)}`, { headers: { Accept: 'application/sparql-results+json' } })
  const json = await res.json()
  const rows = (json.results?.bindings || []) as any[]
  const dedup = new Map<string, { name: string; wikipediaTitle: string }>()
  for (const r of rows) {
    const name = r.personLabel?.value
    const wikipediaTitle = r.enTitle?.value
    if (name && wikipediaTitle && !dedup.has(name)) dedup.set(name, { name, wikipediaTitle })
  }
  return Array.from(dedup.values())
}

async function enrichWithWikipediaAndNews(entry: { name: string; wikipediaTitle: string }): Promise<AggregatedCelebrity> {
  const parser = new Parser()
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(entry.wikipediaTitle)}`
  let summary: string | undefined
  let pageUrl: string | undefined
  try {
    const sres = await fetch(summaryUrl)
    const sjson = await sres.json()
    summary = sjson.extract
    pageUrl = sjson.content_urls?.desktop?.page
  } catch {}

  let newsCount = 0
  const sources: string[] = []
  try {
    const feed = await parser.parseURL(`https://news.google.com/rss/search?q=${encodeURIComponent(entry.name + ' Nigeria lifestyle')}&hl=en-NG&gl=NG&ceid=NG:en`)
    newsCount = feed.items.length
    if (feed.items[0]?.link) sources.push(feed.items[0].link)
  } catch {}

  if (pageUrl) sources.push(pageUrl)

  return { name: entry.name, wikipediaTitle: entry.wikipediaTitle, summary, newsCount, sources, tier: 'minimalist' }
}