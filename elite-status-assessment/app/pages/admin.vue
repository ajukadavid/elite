<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Submission {
  email: string
  answers: Record<string, number>
  score: number
  type?: string
  celebrity?: string
  timestamp: string
}

const submissions = ref<Submission[]>([])

function load() {
  try {
    const raw = localStorage.getItem('esa_submissions')
    submissions.value = raw ? JSON.parse(raw) : []
  } catch (e) {
    submissions.value = []
  }
}

function exportCsv() {
  const rows = [
    ['email', 'score', 'type', 'celebrity', 'timestamp', 'answers'],
    ...submissions.value.map(s => [s.email, String(s.score), s.type || '', s.celebrity || '', s.timestamp, JSON.stringify(s.answers)])
  ]
  const csv = rows.map(r => r.map(v => '"' + String(v).replaceAll('"', '""') + '"').join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'elite-status-assessment.csv'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(load)
</script>

<template>
  <section class="card p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Admin Dashboard</h1>
      <button class="btn btn-primary" @click="exportCsv">Export CSV</button>
    </div>
    <p class="text-white/60 mt-1">Data is stored in the user's browser localStorage.</p>

    <div class="mt-6 overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="text-white/70">
          <tr>
            <th class="text-left p-2">Email</th>
            <th class="text-left p-2">Score</th>
            <th class="text-left p-2">Type</th>
            <th class="text-left p-2">Celebrity</th>
            <th class="text-left p-2">Timestamp</th>
            <th class="text-left p-2">Answers</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in submissions" :key="i" class="border-t border-white/10">
            <td class="p-2">{{ s.email }}</td>
            <td class="p-2">{{ s.score }}</td>
            <td class="p-2">{{ s.type }}</td>
            <td class="p-2">{{ s.celebrity }}</td>
            <td class="p-2">{{ new Date(s.timestamp).toLocaleString() }}</td>
            <td class="p-2 max-w-[420px] whitespace-pre-wrap">{{ s.answers }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>