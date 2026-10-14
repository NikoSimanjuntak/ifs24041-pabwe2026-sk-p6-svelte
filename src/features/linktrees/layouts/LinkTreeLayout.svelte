<script>
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import Navbar from '../../../components/Navbar.svelte'
  import Sidebar from '../../../components/Sidebar.svelte'
  import { authUser } from '../../auth/states/authStore.js'
  import { fetchProfile } from '../../users/states/usersStore.js'

  let { children } = $props()
  let sidebarOpen = $state(false)

  onMount(() => {
    if (!get(authUser)) fetchProfile()
  })
</script>

<div class="min-h-screen bg-slate-50">
  <Navbar ontoggle={() => (sidebarOpen = !sidebarOpen)} />
  <div class="mx-auto flex max-w-7xl flex-col md:flex-row">
    <Sidebar open={sidebarOpen} onclose={() => (sidebarOpen = false)} />
    <main class="min-w-0 flex-1 p-4 md:p-8">
      {@render children()}
    </main>
  </div>
</div>
