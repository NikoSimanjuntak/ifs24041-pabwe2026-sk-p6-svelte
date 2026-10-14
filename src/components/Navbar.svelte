<script>
  import LogoIcon from './LogoIcon.svelte'
  import { authUser, logoutUser } from '../features/auth/states/authStore.js'
  import { assetUrl } from '../helpers/apiHelper.js'
  import { getInitials } from '../helpers/toolsHelper.js'
  import { link } from '../lib/navigation.js'

  let { ontoggle } = $props()

  const name = $derived($authUser?.name ?? '')
  const photo = $derived(assetUrl($authUser?.photo))
</script>

<header class="sticky top-0 z-30 border-b border-slate-200 bg-white">
  <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
    <div class="flex items-center gap-3">
      <button
        type="button"
        aria-label="Buka menu"
        class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        onclick={ontoggle}
      >
        &#9776;
      </button>
      <a href="/" use:link class="flex items-center gap-2 font-semibold text-slate-900">
        <LogoIcon size={32} />
        <span>Delcom Link Tree</span>
      </a>
    </div>

    <div class="flex items-center gap-3">
      {#if photo}
        <img src={photo} alt="Foto {name}" class="h-9 w-9 rounded-full object-cover" />
      {:else}
        <span
          class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
        >
          {getInitials(name)}
        </span>
      {/if}
      <span class="hidden text-sm font-medium sm:inline">{name}</span>
      <button
        type="button"
        class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
        onclick={logoutUser}
      >
        Keluar
      </button>
    </div>
  </div>
</header>
