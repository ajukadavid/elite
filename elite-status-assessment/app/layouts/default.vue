<template>
  <div>
    <header class="sticky top-0 z-50 border-b border-white/10 bg-ebony/80 backdrop-blur">
      <div class="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-md bg-gradient-to-br from-gold-400 to-gold-600" />
          <span class="text-lg font-semibold tracking-wide">Elite Status Assessment</span>
        </NuxtLink>
        <nav class="flex items-center gap-3">
          <NuxtLink to="/" class="hover:text-gold-500">Quiz</NuxtLink>
          <NuxtLink to="/about" class="hover:text-gold-500">About</NuxtLink>
          <NuxtLink to="/admin" class="hover:text-gold-500">Admin</NuxtLink>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-8">
      <slot />
    </main>
    <footer class="border-t border-white/10 py-8">
      <div class="mx-auto max-w-5xl px-4 text-sm text-white/60">
        © {{ new Date().getFullYear() }} Elite Status Assessment. For entertainment only.
      </div>
    </footer>
  </div>
</template>

<style>
:root { color-scheme: dark; }
</style>