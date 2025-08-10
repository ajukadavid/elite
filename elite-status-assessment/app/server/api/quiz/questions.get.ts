import Parser from 'rss-parser'
import fetch from 'cross-fetch'

interface QuizOption { label: string; value: number }
interface QuizQuestion { id: string; text: string; options: QuizOption[] }

function asQuestion(id: string, text: string, options: string[]): QuizQuestion {
  return {
    id,
    text,
    options: options.map((label, idx) => ({ label, value: idx + 1 }))
  }
}

export default defineEventHandler(async () => {
  // Pull recent Nigerian lifestyle/celebrity trends to influence question wording order subtly
  const parser = new Parser()

  const feeds = await Promise.allSettled([
    parser.parseURL('https://news.google.com/rss/search?q=Nigerian%20celebrity%20lifestyle&hl=en-NG&gl=NG&ceid=NG:en'),
    parser.parseURL('https://news.google.com/rss/search?q=Nigerian%20luxury%20brands&hl=en-NG&gl=NG&ceid=NG:en')
  ])

  const headlines: string[] = []
  for (const f of feeds) {
    if (f.status === 'fulfilled') {
      for (const item of f.value.items.slice(0, 6)) {
        if (item.title) headlines.push(item.title)
      }
    }
  }

  // Construct 16 questions with subtle Nigerian context; order influenced by external headlines
  const base: QuizQuestion[] = [
    asQuestion('luxury-brand', 'Which luxury brand do you gravitate toward for special occasions?', [
      'I do not focus on brands',
      'Zara / Mango',
      'Michael Kors / Coach',
      'Louis Vuitton / Dior / Gucci'
    ]),
    asQuestion('dining', 'Your dining habit on a typical weekend in Lagos or Abuja:', [
      'Cook at home or eat local spots',
      'Casual chain restaurants',
      'Upscale lounges occasionally',
      'Fine dining reservations and chef pop-ups'
    ]),
    asQuestion('travel', 'Your travel pattern over the last 12 months:', [
      'No travel', 'Domestic trips', 'One international trip', 'Multiple international trips in premium cabins'
    ]),
    asQuestion('social-media', 'How do you use Instagram/X for lifestyle content?', [
      'Rarely post', 'Follow a few creators', 'Active with curated feed', 'Create/engage with luxury and culture communities'
    ]),
    asQuestion('arts-culture', 'Cultural activities you prioritize:', [
      'TV or YouTube at home', 'Occasional cinema or concerts', 'Art exhibitions and theatre once in a while', 'VIP art shows, gallery openings, film festivals'
    ]),
    asQuestion('fashion-spend', 'Monthly fashion and grooming spend range:', [
      'Under ₦30k', '₦30k–₦100k', '₦100k–₦300k', '₦300k+'
    ]),
    asQuestion('real-estate', 'Aspirational home preference:', [
      'Practical apartment', 'Gated community starter home', 'High-rise serviced apartment', 'Waterfront penthouse or Ikoyi old-money mansion aesthetic'
    ]),
    asQuestion('events', 'Your social calendar typically includes:', [
      'Family and small gatherings', 'Occasional club nights', 'Branded launch events', 'Exclusive invite-only galas and premieres'
    ]),
    asQuestion('fitness-wellness', 'Wellness routine you keep:', [
      'Walks/home workouts', 'Regular gym', 'Personal trainer or boutique classes', 'Private clubs with spa and recovery'
    ]),
    asQuestion('tech-gadgets', 'Your device ecosystem:', [
      'Whatever works', 'Mid-range Android', 'Latest iPhone or flagship Android', 'Multiple devices incl. luxury accessories (Apple Watch Ultra, AirPods Max)'
    ]),
    asQuestion('transport', 'Primary transport style:', [
      'Public/ride-hailing', 'Used compact car', 'New compact SUV or sedan', 'Chauffeur-driven or luxury SUV'
    ]),
    asQuestion('dining-knowledge', 'Chef and restaurant awareness (NG/Global):', [
      'Not into it', 'A few popular names', 'Track top Lagos spots and a few Michelin chefs', 'Deep knowledge of Michelin lists and Chef’s Table names'
    ]),
    asQuestion('finance', 'Approach to saving and investing:', [
      'Basic savings', 'Mutual funds/treasury bills', 'Stock/crypto allocation', 'Private equity/venture and real estate syndicates'
    ]),
    asQuestion('philanthropy', 'Giving and impact activities:', [
      'Ad-hoc donations', 'Regular small support', 'Structured causes yearly', 'Foundation work and patron circles'
    ]),
    asQuestion('network', 'Professional/social network:', [
      'Tight circle', 'Local industry groups', 'Regional ecosystems', 'International networks and clubs'
    ]),
    asQuestion('taste', 'Interior and lifestyle taste profile:', [
      'Functional', 'Trendy essentials', 'Curated contemporary', 'Timeless, bespoke, collector-grade pieces'
    ])
  ]

  // Shuffle influenced by headlines length to avoid fixed order
  const seed = headlines.join('').length || Date.now()
  const rng = mulberry32(seed)
  const questions = [...base].sort(() => rng() - 0.5)

  return questions
})

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}