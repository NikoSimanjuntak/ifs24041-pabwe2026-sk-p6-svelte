<script>
  let { title, onclose, children } = $props()

  function handleKeydown(event) {
    if (event.key === 'Escape') onclose()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="presentation">
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    class="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
  >
    <div class="mb-4 flex items-center justify-between">
      <h2 id="modal-title" class="text-lg font-semibold text-slate-900">{title}</h2>
      <button
        type="button"
        aria-label="Tutup"
        class="rounded-lg px-2 py-1 text-xl leading-none text-slate-500 hover:bg-slate-100"
        onclick={onclose}
      >
        &times;
      </button>
    </div>
    {@render children()}
  </div>
</div>
