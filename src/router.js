import LoginPage from './features/auth/pages/LoginPage.svelte'
import RegisterPage from './features/auth/pages/RegisterPage.svelte'
import HomePage from './features/linktrees/pages/HomePage.svelte'
import DetailPage from './features/linktrees/pages/DetailPage.svelte'
import UsersPage from './features/users/pages/UsersPage.svelte'
import ProfilePage from './features/users/pages/ProfilePage.svelte'

export const routes = [
  { pattern: '/auth/login', page: LoginPage, layout: 'auth', guest: true },
  { pattern: '/auth/register', page: RegisterPage, layout: 'auth', guest: true },
  { pattern: '/', page: HomePage, layout: 'app' },
  { pattern: '/link-trees/:linkTreeId', page: DetailPage, layout: 'app' },
  { pattern: '/users', page: UsersPage, layout: 'app' },
  { pattern: '/profile', page: ProfilePage, layout: 'app' }
]

export function matchPattern(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null

  const params = {}
  for (let index = 0; index < patternParts.length; index += 1) {
    const expected = patternParts[index]
    if (expected.startsWith(':')) {
      params[expected.slice(1)] = pathParts[index]
    } else if (expected !== pathParts[index]) {
      return null
    }
  }
  return params
}

export function matchRoute(path) {
  for (const route of routes) {
    const params = matchPattern(route.pattern, path)
    if (params) return { route, params }
  }
  return null
}

export function resolveRoute(path, authenticated) {
  const match = matchRoute(path)
  if (!match) return { route: null, params: {}, redirect: null }

  const { route, params } = match
  if (route.guest && authenticated) return { route, params, redirect: '/' }
  if (!route.guest && !authenticated) return { route, params, redirect: '/auth/login' }
  return { route, params, redirect: null }
}
