<script>
  import Modal from '../../../components/Modal.svelte'
  import { useInput } from '../../../hooks/useInput.js'
  import { addLinkTree, linkTreesState } from '../states/linkTreesStore.js'

  let { onclose, onsaved } = $props()

  const title = useInput('')
  const type = useInput('public')
  const description = useInput('')

  async function handleSubmit(event) {
    event.preventDefault()
    const saved = await addLinkTree({ title: $title, type: $type, description: $description })
    if (saved) {
      onsaved()
      onclose()
    }
  }
</script>

<Modal title="Tambah Link Tree" {onclose}>
  <form onsubmit={handleSubmit} class="flex flex-col gap-3">
    {#if $linkTreesState.mutationError}
      <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{$linkTreesState.mutationError}</p>
    {/if}
    <label class="flex flex-col gap-1 text-sm font-medium">
      Judul
      <input type="text" required bind:value={$title} class="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
    </label>
    <label class="flex flex-col gap-1 text-sm font-medium">
      Tipe
      <select bind:value={$type} class="rounded-lg border border-slate-300 px-3 py-2 font-normal">
        <option value="public">Publik</option>
        <option value="unlisted">Tidak Terdaftar</option>
        <option value="private">Privat</option>
      </select>
    </label>
    <label class="flex flex-col gap-1 text-sm font-medium">
      Deskripsi
      <textarea rows="3" required bind:value={$description} class="rounded-lg border border-slate-300 px-3 py-2 font-normal"></textarea>
    </label>
    <div class="flex justify-end gap-2">
      <button type="button" onclick={onclose} class="rounded-lg border border-slate-300 px-4 py-2 text-sm">Batal</button>
      <button type="submit" disabled={$linkTreesState.mutating} class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        Simpan
      </button>
    </div>
  </form>
</Modal>