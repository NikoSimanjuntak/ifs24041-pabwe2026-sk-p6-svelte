<script>
  import { currentPath, link } from '../lib/navigation.js'

  let { open = false, onclose } = $props()

  const items = [
    { href: '/', label: 'Semua Link Tree' },
    { href: '/users', label: 'Pengguna' },
    { href: '/profile', label: 'Profil' }
  ]

  function isActive(href, path) {
    return href === '/' ? path === '/' || path.startsWith('/link-trees') : path === href
  }

  function linkClass(href, path) {
    return isActive(href, path)
      ? 'rounded-lg px-3 py-2 text-sm font-medium bg-indigo-50 text-indigo-700'
      : 'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100'
  }

  function ariaCurrent(href, path) {
    return isActive(href, path) ? 'page' : undefined
  }
</script>

<aside
  aria-label="Menu utama"
  class="{open ? 'block' : 'hidden'} w-full shrink-0 border-b border-slate-200 bg-white p-4 md:block md:min-h-[calc(100vh-4rem)] md:w-60 md:border-r md:border-b-0"
>
  <nav class="flex flex-col gap-1">
    {#each items as item (item.href)}
      <a
        href={item.href}
        use:link
        onclick={onclose}
        aria-current={ariaCurrent(item.href, $currentPath)}
        class={linkClass(item.href, $currentPath)}
      >
        {item.label}
      </a>
    {/each}
  </nav>
</aside>