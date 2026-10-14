<script>
  import Modal from '../../../components/Modal.svelte'
  import { useInput } from '../../../hooks/useInput.js'
  import { isValidHttpUrl } from '../../../helpers/toolsHelper.js'
  import { linkTreesState, saveItem } from '../states/linkTreesStore.js'

  let { linkTreeId, item, onclose, onsaved } = $props()

  const title = useInput(item ? item.title : '')
  const url = useInput(item ? item.url : '')
  let localError = $state(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isValidHttpUrl($url)) {
      localError = 'URL harus diawali http:// atau https://'
      return
    }
    localError = null
    const saved = await saveItem(linkTreeId, { title: $title, url: $url }, item ? item.id : undefined)
    if (saved) {
      onsaved()
      onclose()
    }
  }
</script>

<Modal title={item ? 'Ubah Tautan' : 'Tambah Tautan'} {onclose}>
  <form onsubmit={handleSubmit} class="flex flex-col gap-3">
    {#if localError}
      <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{localError}</p>
    {/if}
    {#if $linkTreesState.mutationError}
      <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{$linkTreesState.mutationError}</p>
    {/if}
    <label class="flex flex-col gap-1 text-sm font-medium">
      Judul tautan
      <input type="text" required bind:value={$title} class="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
    </label>
    <label class="flex flex-col gap-1 text-sm font-medium">
      URL
      <input type="text" required bind:value={$url} class="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
    </label>
    <div class="flex justify-end gap-2">
      <button type="button" onclick={onclose} class="rounded-lg border border-slate-300 px-4 py-2 text-sm">Batal</button>
      <button type="submit" disabled={$linkTreesState.mutating} class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
        Simpan
      </button>
    </div>
  </form>
</Modal>
