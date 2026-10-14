<script>
  import LogoIcon from '../../../components/LogoIcon.svelte'

  let { children } = $props()
</script>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 p-4">
  <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
    <div class="mb-6 flex flex-col items-center gap-2 text-center">
      <LogoIcon size={48} />
      <h1 class="text-2xl font-bold text-slate-900">Delcom Link Tree</h1>
      <p class="text-sm text-slate-600">
        Kumpulkan semua tautan pentingmu dalam satu halaman dan bagikan dengan mudah.
      </p>
    </div>
    {@render children()}
  </div>
</div>
