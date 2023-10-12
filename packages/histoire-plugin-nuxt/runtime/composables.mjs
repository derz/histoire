export const useNuxtApp = () => ({
  $t: (key) => key,
  runWithContext: (fn) => fn(),
})
