import { aggregateNigerianCelebrities } from '@/app/server/utils/celeb'

export default defineEventHandler(async () => {
  const list = await aggregateNigerianCelebrities(28)
  return list
})