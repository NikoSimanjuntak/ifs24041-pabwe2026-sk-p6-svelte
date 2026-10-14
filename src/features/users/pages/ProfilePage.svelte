<script>
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import {
    fetchProfile,
    resetUsersFeedback,
    savePassword,
    savePhoto,
    saveProfile,
    usersState
  } from '../states/usersStore.js'
  import { useInput } from '../../../hooks/useInput.js'
  import { assetUrl } from '../../../helpers/apiHelper.js'
  import { getInitials } from '../../../helpers/toolsHelper.js'

  const name = useInput('')
  const email = useInput('')
  const currentPassword = useInput('')
  const newPassword = useInput('')
  const confirmation = useInput('')
  let photoFile = $state(null)

  const profile = $derived($usersState.profile)

  onMount(async () => {
    resetUsersFeedback()
    await fetchProfile()
    const loaded = get(usersState).profile
    if (loaded) {
      name.set(loaded.name)
      email.set(loaded.email)
    }
  })

  async function submitProfile(event) {
    event.preventDefault()
    await saveProfile({ name: $name, email: $email })
  }

  function selectPhoto(event) {
    photoFile = event.target.files[0] ?? null
  }

  async function submitPhoto(event) {
    event.preventDefault()
    if (!photoFile) return
    if (await savePhoto(photoFile)) photoFile = null
  }

  async function submitPassword(event) {
    event.preventDefault()
    const saved = await savePassword({
      password: $currentPassword,
      new_password: $newPassword,
      new_password_confirmation: $confirmation
    })
    if (saved) {
      currentPassword.reset()
      newPassword.reset()
      confirmation.reset()
    }
  }
</script>

<section class="flex max-w-2xl flex-col gap-6">
  <h1 class="text-2xl font-bold text-slate-900">Profil</h1>

  {#if $usersState.message}
    <p role="status" class="rounded-lg bg-green-50 p-3 text-sm text-green-700">{$usersState.message}</p>
  {/if}
  {#if $usersState.error}
    <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{$usersState.error}</p>
  {/if}

  {#if profile}
    <div class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
      {#if profile.photo}
        <img src={assetUrl(profile.photo)} alt="Foto profil" class="h-16 w-16 rounded-full object-cover" />
      {:else}
        <span class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
          {getInitials(profile.name)}
        </span>
      {/if}
      <div>
        <p class="font-semibold text-slate-900">{profile.name}</p>
        <p class="text-sm text-slate-600">{profile.email}</p>
      </div>
    </div>
  {/if}

  <form onsubmit={submitProfile} aria-label="Ubah profil" class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
    <h2 class="font-semibold">Ubah data profil</h2>
    <label class="flex flex-col gap-1 text-sm font-medium">
      Nama
      <input type="text" required bind:value={$name} class="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
    </label>
    <label class="flex flex-col gap-1 text-sm font-medium">
      Email
      <input type="email" required bind:value={$email} class="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
    </label>
    <button type="submit" disabled={$usersState.mutating} class="self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
      Simpan profil
    </button>
  </form>

  <form onsubmit={submitPhoto} aria-label="Ubah foto" class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
    <h2 class="font-semibold">Ubah foto profil</h2>
    <label class="flex flex-col gap-1 text-sm font-medium">
      Berkas foto
      <input type="file" accept="image/*" onchange={selectPhoto} class="text-sm font-normal" />
    </label>
    <button type="submit" disabled={!photoFile || $usersState.mutating} class="self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
      Unggah foto
    </button>
  </form>

  <form onsubmit={submitPassword} aria-label="Ubah kata sandi" class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
    <h2 class="font-semibold">Ubah kata sandi</h2>
    <label class="flex flex-col gap-1 text-sm font-medium">
      Kata sandi saat ini
      <input type="password" required bind:value={$currentPassword} class="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
    </label>
    <label class="flex flex-col gap-1 text-sm font-medium">
      Kata sandi baru
      <input type="password" required bind:value={$newPassword} class="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
    </label>
    <label class="flex flex-col gap-1 text-sm font-medium">
      Konfirmasi kata sandi baru
      <input type="password" required bind:value={$confirmation} class="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
    </label>
    <button type="submit" disabled={$usersState.mutating} class="self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
      Simpan kata sandi
    </button>
  </form>
</section>
