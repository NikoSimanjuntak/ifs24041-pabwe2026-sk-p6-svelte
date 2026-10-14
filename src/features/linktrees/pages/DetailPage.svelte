<script>
  import { onMount } from 'svelte'
  import LogoIcon from '../../../components/LogoIcon.svelte'
  import ChangeCoverModal from '../components/ChangeCoverModal.svelte'
  import ChangeModal from '../components/ChangeModal.svelte'
  import ItemModal from '../components/ItemModal.svelte'
  import { authUser } from '../../auth/states/authStore.js'
  import {
    fetchLinkTree,
    linkTreesState,
    removeItem,
    removeLinkTree,
    resetLinkTreesFlags,
    resetLinkTreesState
  } from '../states/linkTreesStore.js'
  import { formatDate, hasCover, typeLabel } from '../../../helpers/toolsHelper.js'
  import { link, navigate } from '../../../lib/navigation.js'

  let { params } = $props()

  let modal = $state(null)
  let editingItem = $state(null)

  const detail = $derived($linkTreesState.detail)
  const isOwner = $derived($authUser !== null && detail !== null && detail.user_id === $authUser.id)

  const load = () => fetchLinkTree(params.linkTreeId)

  onMount(() => {
    resetLinkTreesState()
    load()
  })

  function openModal(name) {
    resetLinkTreesFlags()
    modal = name
  }

  function openAddItem() {
    editingItem = null
    openModal('item')
  }

  function openEditItem(item) {
    editingItem = item
    openModal('item')
  }

  async function handleDelete() {
    if (!confirm(`Hapus link tree "${detail.title}"?`)) return
    if (await removeLinkTree(detail.id)) navigate('/')
  }

  async function handleDeleteItem(item) {
    if (!confirm(`Hapus tautan "${item.title}"?`)) return
    if (await removeItem(detail.id, item.id)) await load()
  }
</script>

<section class="flex flex-col gap-6">
  <a href="/" use:link class="text-sm text-indigo-600 hover:underline">&larr; Kembali ke semua link tree</a>

  {#if $linkTreesState.error}
    <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{$linkTreesState.error}</p>
  {/if}
  {#if $linkTreesState.mutationError && modal === null}
    <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{$linkTreesState.mutationError}</p>
  {/if}
  {#if $linkTreesState.message}
    <p role="status" class="rounded-lg bg-green-50 p-3 text-sm text-green-700">{$linkTreesState.message}</p>
  {/if}

  {#if detail}
    <article class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {#if hasCover(detail.cover)}
        <img src={detail.cover} alt="Sampul {detail.title}" class="h-48 w-full object-cover" />
      {:else}
        <div class="flex h-48 w-full items-center justify-center bg-indigo-50">
          <LogoIcon size={56} />
        </div>
      {/if}
      <div class="flex flex-col gap-3 p-6">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-2xl font-bold text-slate-900">{detail.title}</h1>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{typeLabel(detail.type)}</span>
        </div>
        <p class="text-slate-700">{detail.description}</p>
        <p class="text-sm text-slate-500">
          oleh {detail.author.name} &middot; dibuat {formatDate(detail.created_at)}
        </p>

        {#if isOwner}
          <div class="flex flex-wrap gap-2">
            <button type="button" onclick={() => openModal('change')} class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
              Ubah Data
            </button>
            <button type="button" onclick={() => openModal('cover')} class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
              Ubah Sampul
            </button>
            <button type="button" onclick={handleDelete} class="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700">
              Hapus Link Tree
            </button>
          </div>
        {/if}
      </div>
    </article>

    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Daftar Tautan</h2>
        {#if isOwner}
          <button type="button" onclick={openAddItem} class="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white">
            Tambah Tautan
          </button>
        {/if}
      </div>

      {#if detail.items.length === 0}
        <p class="text-slate-600">Belum ada tautan.</p>
      {:else}
        <ul class="flex flex-col gap-2">
          {#each detail.items as item (item.id)}
            <li class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div class="min-w-0">
                <p class="font-medium text-slate-900">{item.title}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" class="block truncate text-sm text-indigo-600 hover:underline">
                  {item.url}
                </a>
              </div>
              {#if isOwner}
                <div class="flex shrink-0 gap-2 text-sm">
                  <button type="button" onclick={() => openEditItem(item)} aria-label="Ubah {item.title}" class="text-slate-700 hover:underline">
                    Ubah
                  </button>
                  <button type="button" onclick={() => handleDeleteItem(item)} aria-label="Hapus {item.title}" class="text-red-600 hover:underline">
                    Hapus
                  </button>
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {:else if $linkTreesState.loading}
    <p class="text-slate-600">Memuat detail link tree...</p>
  {/if}
</section>

{#if modal === 'change'}
  <ChangeModal linkTree={detail} onclose={() => (modal = null)} onsaved={load} />
{:else if modal === 'cover'}
  <ChangeCoverModal linkTreeId={detail.id} onclose={() => (modal = null)} onsaved={load} />
{:else if modal === 'item'}
  <ItemModal linkTreeId={detail.id} item={editingItem} onclose={() => (modal = null)} onsaved={load} />
{/if}
