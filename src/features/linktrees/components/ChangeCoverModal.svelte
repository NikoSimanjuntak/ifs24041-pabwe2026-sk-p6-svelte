<script>
  import Modal from '../../../components/Modal.svelte'
  import { editCover, linkTreesState } from '../states/linkTreesStore.js'

  let { linkTreeId, onclose, onsaved } = $props()

  let file = $state(null)
  let localError = $state(null)

  function handleChange(event) {
    file = event.target.files[0] ?? null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!file) {
      localError = 'Pilih berkas gambar terlebih dahulu.'
      return
    }
    localError = null
    if (await editCover(linkTreeId, file)) {
      onsaved()
      onclose()
    }
  }
</script>

<Modal title="Ubah Sampul" {onclose}>
  <form onsubmit={handleSubmit} class="flex flex-col gap-3">
    {#if localError}
      <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{localError}</p>
    {/if}
    {#if $linkTreesState.mutationError}
      <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{$linkTreesState.mutationError}</p>
    {/if}
    <label class="flex flex-col gap-1 text-sm font-medium">
      Berkas sampul
      <input type="file" accept="image/*" onchange={handleChange} class="text-sm font-normal" />
    </label>
    <div class="flex justify-end gap-2">
      <button type="button" onclick={onclose} class="rounded-lg border border-slate-300 px-4 py-2 text-sm">Batal</button>
      <button type="submit" disabled={$linkTreesState.mutating} class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        Unggah
      </button>
    </div>
  </form>
</Modal>
