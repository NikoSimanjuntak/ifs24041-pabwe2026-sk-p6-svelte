import { matchPattern, matchRoute, resolveRoute, routes } from './router.js'

describe('router', () => {
  it('memiliki semua rute yang dibutuhkan', () => {
    expect(routes.map((route) => route.pattern)).toEqual([
      '/auth/login',
      '/auth/register',
      '/',
      '/link-trees/:linkTreeId',
      '/users',
      '/profile'
    ])
  })

  it('matchPattern mengenali literal, parameter, dan ketidakcocokan', () => {
    expect(matchPattern('/', '/')).toEqual({})
    expect(matchPattern('/users', '/users')).toEqual({})
    expect(matchPattern('/link-trees/:linkTreeId', '/link-trees/12')).toEqual({ linkTreeId: '12' })
    expect(matchPattern('/users', '/profile')).toBeNull()
    expect(matchPattern('/users', '/users/1')).toBeNull()
  })

  it('matchRoute menemukan rute atau null', () => {
    expect(matchRoute('/link-trees/3').params).toEqual({ linkTreeId: '3' })
    expect(matchRoute('/')?.route.pattern).toBe('/')
    expect(matchRoute('/tidak-ada')).toBeNull()
  })

  it('resolveRoute menerapkan penjagaan autentikasi', () => {
    expect(resolveRoute('/tidak-ada', true)).toEqual({ route: null, params: {}, redirect: null })
    expect(resolveRoute('/auth/login', true).redirect).toBe('/')
    expect(resolveRoute('/auth/login', false).redirect).toBeNull()
    expect(resolveRoute('/', false).redirect).toBe('/auth/login')
    expect(resolveRoute('/', true).redirect).toBeNull()
  })
})
