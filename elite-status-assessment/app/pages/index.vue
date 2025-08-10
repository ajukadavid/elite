<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface QuizOption { label: string; value: number }
interface QuizQuestion { id: string; text: string; options: QuizOption[] }

// Placeholder questions; will be fetched from API onMounted for non-hardcoded data
const questions = ref<QuizQuestion[]>([])
const answers = ref<Record<string, number>>({})
const step = ref(0)

const completion = computed(() => {
  if (questions.value.length === 0) return 0
  const answered = Object.keys(answers.value).length
  return Math.round((answered / questions.value.length) * 100)
})

const totalScore = computed(() => Object.values(answers.value).reduce((a, b) => a + b, 0))

const email = ref('')
const emailValid = computed(() => /.+@.+\..+/.test(email.value))
const consent = ref(false)

const canSubmit = computed(() => emailValid.value && consent.value && Object.keys(answers.value).length === questions.value.length)

const result = ref<null | { type: string; celebrity: string; description: string; details: any }>(null)

const isLoading = ref(false)
const loadError = ref<string | null>(null)

async function loadQuestions() {
  isLoading.value = true
  loadError.value = null
  try {
    const { data, error } = await useFetch<QuizQuestion[]>('/api/quiz/questions')
    if (error.value) throw error.value
    if (data.value && Array.isArray(data.value) && data.value.length > 0) {
      questions.value = data.value
    } else {
      throw new Error('No questions returned')
    }
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to load questions'
  } finally {
    isLoading.value = false
  }
}

async function next() {
  if (step.value < questions.value.length - 1) step.value++
}

async function prev() {
  if (step.value > 0) step.value--
}

async function submit() {
  if (!canSubmit.value) return
  const payload = {
    email: email.value,
    answers: answers.value,
    score: totalScore.value,
    timestamp: new Date().toISOString()
  }
  const { data } = await useFetch('/api/quiz/submit', { method: 'POST', body: payload })
  if (data.value) result.value = data.value
}

onMounted(loadQuestions)
</script>

<template>
  <div class="grid gap-6">
    <section class="card p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold tracking-wide">Elite Status Assessment</h1>
        <div class="w-48 h-2 bg-white/10 rounded">
          <div class="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded transition-all" :style="{ width: `${completion}%` }" />
        </div>
      </div>
      <p class="mt-2 text-white/70">Discover your social sophistication level through lifestyles, preferences and cultural choices.</p>
    </section>

    <section v-if="questions.length" class="card p-6 animate-fade-in-up">
      <div class="text-sm text-white/60 mb-3">Question {{ step + 1 }} of {{ questions.length }}</div>
      <h2 class="text-xl font-medium">{{ questions[step].text }}</h2>
      <div class="mt-4 grid gap-3">
        <button v-for="opt in questions[step].options" :key="opt.label" class="btn card text-left p-4 hover:border-gold-500"
                :class="{ 'border-gold-500 ring-1 ring-gold-500/30': answers[questions[step].id] === opt.value }"
                @click="answers[questions[step].id] = opt.value">
          <span class="text-base">{{ opt.label }}</span>
        </button>
      </div>

      <div class="mt-6 flex items-center justify-between">
        <button class="btn px-3 py-2 border border-white/10 hover:border-white/20" :disabled="step===0" @click="prev">Back</button>
        <button v-if="step < questions.length - 1" class="btn btn-primary" @click="next">Next</button>
        <button v-else class="btn btn-primary" @click="() => step++">Continue</button>
      </div>
    </section>

    <section v-else class="card p-6">
      <div v-if="isLoading" class="animate-pulse text-white/60">Loading curated questions…</div>
      <div v-else-if="loadError" class="text-red-400">
        {{ loadError }}
        <button class="btn border border-white/10 ml-3" @click="loadQuestions">Retry</button>
      </div>
      <div v-else class="text-white/60">No questions available.</div>
    </section>

    <section v-if="step >= questions.length" class="card p-6">
      <h3 class="text-xl font-semibold">Before we show your results</h3>
      <p class="text-white/70 mt-1">Enter your email to receive your assessment and exclusive insights.</p>
      <form class="mt-4 grid gap-3" @submit.prevent="submit">
        <input type="email" v-model="email" required placeholder="your@email.com"
               class="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold-500" />
        <label class="flex items-start gap-2 text-sm text-white/70">
          <input type="checkbox" v-model="consent" class="mt-1" />
          I agree to receive the results and occasional updates. Stored securely in your browser only.
        </label>
        <button class="btn btn-primary mt-2" type="submit" :disabled="!canSubmit">Reveal my status</button>
      </form>
    </section>

    <section v-if="result" class="card p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-sm uppercase tracking-widest text-gold-400">Your Result</div>
          <h3 class="text-2xl font-semibold mt-1">{{ result.type }}</h3>
          <p class="mt-2 text-white/80" v-html="result.description" />
          <div class="mt-4 text-white/70">
            <div class="text-white">Celebrity match: <span class="text-gold-400 font-medium">{{ result.celebrity }}</span></div>
          </div>
          <div class="mt-6 flex gap-3">
            <a :href="`https://twitter.com/intent/tweet?text=I scored as ${encodeURIComponent(result.type)} on Elite Status Assessment`" target="_blank" class="btn border border-white/10">Share on X</a>
            <a :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}`" target="_blank" class="btn border border-white/10">Share on Facebook</a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
</style>