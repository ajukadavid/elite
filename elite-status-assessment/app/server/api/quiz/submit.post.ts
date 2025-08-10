import { aggregateNigerianCelebrities } from '@/app/server/utils/celeb'

interface BodyPayload {
  email: string
  answers: Record<string, number>
  score: number
  timestamp: string
}

type Tier = 'elite' | 'aspiring' | 'casual' | 'minimalist'

export default defineEventHandler(async (event) => {
  const body = await readBody<BodyPayload>(event)

  const score = body.score
  const tier: Tier = score >= 55 ? 'elite' : score >= 40 ? 'aspiring' : score >= 26 ? 'casual' : 'minimalist'

  const profiles = await aggregateNigerianCelebrities(28)
  const match = profiles.find(p => p.tier === tier) || profiles[0]

  const description = buildResultDescription(tier, match.name, match.summary)

  return {
    type: formatTier(tier),
    celebrity: match.name,
    description,
    details: { sources: match.sources, wikipediaSummary: match.summary }
  }
})

function formatTier(t: Tier) {
  if (t === 'elite') return 'Social Elite'
  if (t === 'aspiring') return 'Aspiring Sophisticate'
  if (t === 'casual') return 'Casual Consumer'
  return 'Practical Minimalist'
}

function buildResultDescription(tier: Tier, name: string, summary?: string) {
  const lines: string[] = []
  if (tier === 'elite') {
    lines.push(`<strong>Commanding presence.</strong> You operate at the apex of taste, convenience and exclusivity, much like ${name}. Private lounges, fine dining tasting menus, and investment-minded decisions define your playbook.`)
    lines.push(`Expect symphonies of craftsmanship in fashion and a calendar of invite-only launches. Recommendations: explore Nigerian luxury houses (e.g., Orange Culture, Lisa Folawiyo), reserve chef’s tables, and consider art patron circles.`)
  } else if (tier === 'aspiring') {
    lines.push(`<strong>Curated and upwardly mobile.</strong> Your tastes are dialed-in and evolving, reflecting ${name}'s blend of mainstream reach with premium sensibilities.`)
    lines.push(`Lean into quality staples, experiential travel and networked communities. Recommendations: boutique fitness, mid-to-high tier accessories, and Lagos art nights.`)
  } else if (tier === 'casual') {
    lines.push(`<strong>Balanced pragmatism.</strong> Like ${name}, you appreciate comfort with occasional splurges.`)
    lines.push(`Recommendations: dependable tech, high-value local designers, and planned experiences over impulse buys.`)
  } else {
    lines.push(`<strong>Intentional minimalism.</strong> Your priorities are clarity and function, echoing ${name}'s low-key approach.`)
    lines.push(`Recommendations: capsule wardrobe, durable essentials, and community-driven leisure.`)
  }
  if (summary) lines.push(`<span class='text-white/70 text-sm block mt-3'>About ${name}: ${escapeHtml(summary)}</span>`)
  return lines.join('<br/>')
}

function escapeHtml(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}