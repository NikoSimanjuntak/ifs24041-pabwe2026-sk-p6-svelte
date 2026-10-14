<script>
  import { onMount } from 'svelte'
  import AuthLayout from './features/auth/layouts/AuthLayout.svelte'
  import LinkTreeLayout from './features/linktrees/layouts/LinkTreeLayout.svelte'
  import NotFoundPage from './pages/NotFoundPage.svelte'
  import { isAuthenticated } from './features/auth/states/authStore.js'
  import { currentPath, initRouter, navigate } from './lib/navigation.js'
  import { resolveRoute } from './router.js'

  const resolved = $derived(resolveRoute($currentPath, $isAuthenticated))

  onMount(initRouter)

  $effect(() => {
    if (resolved.redirect) navigate(resolved.redirect, true)
  })
</script>

{#if !resolved.redirect}
  {#if !resolved.route}
    <NotFoundPage />
  {:else if resolved.route.layout === 'auth'}
    {@const Page = resolved.route.page}
    <AuthLayout>
      <Page params={resolved.params} />
    </AuthLayout>
  {:else}
    {@const Page = resolved.route.page}
    <LinkTreeLayout>
      <Page params={resolved.params} />
    </LinkTreeLayout>
  {/if}
{/if}
