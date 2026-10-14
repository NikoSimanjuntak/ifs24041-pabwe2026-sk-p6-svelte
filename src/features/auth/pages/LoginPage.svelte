<script>
  import { onDestroy } from 'svelte'
  import { authState, loginUser, resetAuthState } from '../states/authStore.js'
  import { useInput } from '../../../hooks/useInput.js'
  import { link } from '../../../lib/navigation.js'

  const email = useInput('')
  const password = useInput('')

  async function handleSubmit(event) {
    event.preventDefault()
    await loginUser({ email: $email, password: $password })
  }

  onDestroy(resetAuthState)
</script>

<form onsubmit={handleSubmit} class="flex flex-col gap-4">
  <h2 class="text-lg font-semibold">Masuk</h2>

  {#if $authState.error}
    <p role="alert" class="rounded-lg bg-red-50 p-3 text-sm text-red-700">{$authState.error}</p>
  {/if}

  <label class="flex flex-col gap-1 text-sm font-medium">
    Email
    <input
      id="login-email-input"
      type="email"
      required
      bind:value={$email}
      class="rounded-lg border border-slate-300 px-3 py-2 font-normal"
    />
  </label>

  <label class="flex flex-col gap-1 text-sm font-medium">
    Kata sandi
    <input
      id="login-password-input"
      type="password"
      required
      bind:value={$password}
      class="rounded-lg border border-slate-300 px-3 py-2 font-normal"
    />
  </label>

  <button
    id="login-submit-button"
    type="submit"
    disabled={$authState.loading}
    class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
  >
    {$authState.loading ? 'Memproses...' : 'Masuk'}
  </button>

  <p class="text-center text-sm text-slate-600">
    Belum punya akun?
    <a href="/auth/register" use:link class="font-medium text-indigo-600 hover:underline">Daftar</a>
  </p>
</form>