<script>
  import { onDestroy } from 'svelte'
  import { authState, registerUser, resetAuthState } from '../states/authStore.js'
  import { useInput } from '../../../hooks/useInput.js'
  import { link } from '../../../lib/navigation.js'

  const name = useInput('')
  const email = useInput('')
  const password = useInput('')
  let registered = $state(false)

  async function handleSubmit(event) {
    event.preventDefault()
    registered = await registerUser({ name: $name, email: $email, password: $password })
    if (registered) {
      name.reset()
      email.reset()
      password.reset()
    }
  }

  onDestroy(resetAuthState)
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-4">
  <h2 class="text-lg font-semibold">Daftar</h2>

  {#if registered}
    <p role="status" class="rounded-lg bg-green-50 p-3 text-sm text-green-700">
      Pendaftaran berhasil. Silakan masuk dengan akun barumu.
    </p>
  {/if}

  {#if $authState.error}
    <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{$authState.error}</p>
  {/if}

  <label class="flex flex-col gap-1 text-sm font-medium">
    Nama
    <input type="text" required bind:value={$name} class="rounded-lg border border-slate-300 px-3 py-2 font-normal" />
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium">
    Email
    <input
      type="email"
      required
      bind:value={$email}
      class="rounded-lg border border-slate-300 px-3 py-2 font-normal"
    />
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium">
    Kata sandi
    <input
      type="password"
      required
      bind:value={$password}
      class="rounded-lg border border-slate-300 px-3 py-2 font-normal"
    />
  </label>

  <button
    type="submit"
    disabled={$authState.loading}
    class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
  >
    {$authState.loading ? 'Memproses...' : 'Daftar'}
  </button>

  <p class="text-center text-sm text-slate-600">
    Sudah punya akun?
    <a href="/auth/login" use:link class="font-medium text-indigo-600 hover:underline">Masuk</a>
  </p>
</form>
