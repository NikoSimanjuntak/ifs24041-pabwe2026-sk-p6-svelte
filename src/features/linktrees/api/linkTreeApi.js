import { request } from '../../../helpers/apiHelper.js'

export const createLinkTree = ({ title, type, description }) =>
  request('/link-trees', { method: 'POST', body: { title, type, description } })

export function changeCover(id, file) {
  const form = new FormData()
  form.append('cover', file)
  return request(`/link-trees/${id}/cover`, { method: 'POST', form })
}

export const updateLinkTree = (id, { title, type, description }) =>
  request(`/link-trees/${id}`, { method: 'PUT', body: { title, type, description } })

export const getLinkTrees = (isMe = false) => request('/link-trees', isMe ? { query: { is_me: 1 } } : {})

export const getLinkTree = (id) => request(`/link-trees/${id}`)

export const deleteLinkTree = (id) => request(`/link-trees/${id}`, { method: 'DELETE' })

export const deleteAllLinkTrees = () => request('/link-trees', { method: 'DELETE' })

export const addItem = (linkTreeId, { title, url }) =>
  request(`/link-trees/${linkTreeId}/items`, { method: 'POST', body: { title, url } })

export const updateItem = (linkTreeId, itemId, { title, url }) =>
  request(`/link-trees/${linkTreeId}/items/${itemId}`, { method: 'PUT', body: { title, url } })

export const deleteItem = (linkTreeId, itemId) =>
  request(`/link-trees/${linkTreeId}/items/${itemId}`, { method: 'DELETE' })
