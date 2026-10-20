<script>
  import { onMount } from 'svelte'
  import LogoIcon from '../../../components/LogoIcon.svelte'
  import AddModal from '../components/AddModal.svelte'
  import { authUser } from '../../auth/states/authStore.js'
  import {
    fetchLinkTrees,
    linkTreesState,
    removeAllLinkTrees,
    removeLinkTree,
    resetLinkTreesFlags
  } from '../states/linkTreesStore.js'
  import { hasCover, typeLabel } from '../../../helpers/toolsHelper.js'
  import { link } from '../../../lib/navigation.js'

  let search = $state('')
  let onlyMine = $state(false)
  let showAdd = $state(false)

  const load = () => fetchLinkTrees({ isMe: onlyMine })

  const coverAlt = (item) => `Sampul ${item.title}`
  const detailHref = (item) => `/link-trees/${item.id}`
  const byline = (item) => `oleh ${item.author.name} · ${item.total_links} tautan`
  const deleteLabel = (item) => `Hapus ${item.title}`

  onMount(() => {
    resetLinkTreesFlags()
    load()
  })

  const keyword = $derived(search.trim().toLowerCase())

  const filtered = $derived(
    $linkTreesState.items.filter((item) =>
      [item.title, item.description, item.author.name].join(' ').toLowerCase().includes(keyword)
    )
  )

  const stats = $derived.by(() => {
    const items = $linkTreesState.items
    return [
      { label: 'Total Link Tree', value: items.length },
      { label: 'Publik', value: items.filter((item) => item.type === 'public').length },
      { label: 'Tidak Terdaftar', value: items.filter((item) => item.type === 'unlisted').length },
      { label: 'Privat', value: items.filter((item) => item.type === 'private').length },
      { label: 'Total Tautan', value: items.reduce((sum, item) => sum + item.total_links, 0) }
    ]
  })

  function openAdd() {
    resetLinkTreesFlags()
    showAdd = true
  }

  async function handleDelete(item) {
    if (!confirm(`Hapus link tree "${item.title}"?`)) return
    if (await removeLinkTree(item.id)) await load()
  }

  async function handleDeleteAll() {
    if (!confirm('Hapus semua link tree milik Anda? Tindakan ini tidak dapat dibatalkan.')) return
    if (await removeAllLinkTrees()) await load()
  }
</script>

<section class="flex flex-col gap-6">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-2xl font-bold text-slate-900">Semua Link Tree</h1>
    <div class="flex gap-2">
      <button
        type="button"
        onclick={handleDeleteAll}
        disabled={$linkTreesState.mutating}
        class="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        Hapus Semua
      </button>
      <button
        type="button"
        onclick={openAdd}
        class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Tambah Link Tree
      </button>
    </div>
  </div>

  <dl class="grid grid-cols-2 gap-3 lg:grid-cols-5">
    {#each stats as stat (stat.label)}
      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <dt class="text-xs text-slate-500">{stat.label}</dt>
        <dd class="text-2xl font-bold text-slate-900">{stat.value}</dd>
      </div>
    {/each}
  </dl>

  <div class="flex flex-wrap items-center gap-4">
    <input
      type="search"
      placeholder="Cari link tree..."
      aria-label="Cari link tree"
      bind:value={search}
      class="min-w-60 flex-1 rounded-lg border border-slate-300 px-3 py-2"
    />
    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" bind:checked={onlyMine} onchange={load} />
      Milik saya
    </label>
  </div>

  {#if $linkTreesState.mutationError && !showAdd}
    <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{$linkTreesState.mutationError}</p>
  {/if}
  {#if $linkTreesState.message}
    <p role="status" class="rounded-lg bg-green-50 p-3 text-sm text-green-700">{$linkTreesState.message}</p>
  {/if}

  {#if $linkTreesState.loading}
    <p class="text-slate-600">Memuat link tree...</p>
  {:else if $linkTreesState.error}
    <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{$linkTreesState.error}</p>
  {:else if filtered.length === 0}
    <p class="text-slate-600">Tidak ada link tree yang ditemukan.</p>
  {:else}
    <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each filtered as item (item.id)}
        <li class="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {#if hasCover(item.cover)}
            <img src={item.cover} alt={coverAlt(item)} class="h-32 w-full object-cover" />
          {:else}
            <div class="flex h-32 w-full items-center justify-center bg-indigo-50">
              <LogoIcon size={40} />
            </div>
          {/if}
          <div class="flex flex-col gap-2 p-4">
            <div class="flex items-start justify-between gap-2">
              <a href={detailHref(item)} use:link class="font-semibold text-slate-900 hover:text-indigo-600">
                {item.title}
              </a>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{typeLabel(item.type)}</span>
            </div>
            <p class="line-clamp-2 text-sm text-slate-600">{item.description}</p>
            <p class="text-xs text-slate-500">{byline(item)}</p>
            {#if $authUser && item.user_id === $authUser.id}
              <button
                type="button"
                onclick={() => handleDelete(item)}
                aria-label={deleteLabel(item)}
                class="self-start text-sm text-red-600 hover:underline"
              >
                Hapus
              </button>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

{#if showAdd}
  <AddModal onclose={() => (showAdd = false)} onsaved={load} />
{/if}