export const user = {
  id: 1,
  name: 'Abdullah Ubaid',
  email: 'ubaid@delcom.org',
  photo: 'img/profile/1_1709251633.png'
}

export const ok = (data, message = 'Berhasil') => ({ status: 'success', message, data })

export const makeLinkTree = (overrides = {}) => ({
  id: 1,
  user_id: 1,
  title: 'Kursus Ku',
  type: 'public',
  description: 'Kumpulan kursus favorit',
  cover: 'http://localhost:8000/',
  created_at: '2025-03-09T01:32:33.000000Z',
  updated_at: '2025-03-09T01:32:33.000000Z',
  author: { name: 'Abdullah Ubaid', photo: '' },
  total_links: 2,
  items: [{ id: 10, link_tree_id: 1, title: 'Dasar Java', url: 'https://youtu.be/uHyfQV0kbgo' }],
  ...overrides
})

export const deferred = () => {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

export const fetchResponse = (body, { ok: isOk = true, status = 200 } = {}) => ({
  ok: isOk,
  status,
  json: () => Promise.resolve(body)
})
