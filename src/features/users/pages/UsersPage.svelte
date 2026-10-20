<script>
  import { onMount } from 'svelte'
  import { fetchUsers, resetUsersFeedback, usersState } from '../states/usersStore.js'
  import { assetUrl } from '../../../helpers/apiHelper.js'
  import { getInitials } from '../../../helpers/toolsHelper.js'

  const photoAlt = (user) => `Foto ${user.name}`

  onMount(() => {
    resetUsersFeedback()
    fetchUsers()
  })
</script>

<section class="flex flex-col gap-4">
  <h1 class="text-2xl font-bold text-slate-900">Pengguna</h1>

  {#if $usersState.loading}
    <p class="text-slate-600">Memuat pengguna...</p>
  {:else if $usersState.error}
    <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{$usersState.error}</p>
  {:else if $usersState.users.length === 0}
    <p class="text-slate-600">Belum ada pengguna terdaftar.</p>
  {:else}
    <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each $usersState.users as user (user.id)}
        <li class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          {#if user.photo}
            <img src={assetUrl(user.photo)} alt={photoAlt(user)} class="h-12 w-12 rounded-full object-cover" />
          {:else}
            <span class="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
              {getInitials(user.name)}
            </span>
          {/if}
          <div class="min-w-0">
            <p class="truncate font-medium text-slate-900">{user.name}</p>
            <p class="truncate text-sm text-slate-600">{user.email}</p>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>