import { writable } from 'svelte/store'
import * as linkTreeApi from '../api/linkTreeApi.js'
import { describeError } from '../../../helpers/toolsHelper.js'

const initialState = () => ({
  items: [],
  detail: null,
  loading: false,
  mutating: false,
  error: null,
  mutationError: null,
  message: null,
  isAdded: false,
  isChanged: false,
  isCoverChanged: false,
  isDeleted: false,
  isDeletedAll: false,
  isItemMutated: false
})

export const linkTreesState = writable(initialState())

const patch = (values) => linkTreesState.update((state) => ({ ...state, ...values }))

export const resetLinkTreesState = () => linkTreesState.set(initialState())

export const resetLinkTreesFlags = () =>
  patch({
    mutationError: null,
    message: null,
    isAdded: false,
    isChanged: false,
    isCoverChanged: false,
    isDeleted: false,
    isDeletedAll: false,
    isItemMutated: false
  })

export async function fetchLinkTrees({ isMe = false } = {}) {
  patch({ loading: true, error: null })
  try {
    const response = await linkTreeApi.getLinkTrees(isMe)
    patch({ items: response.data.link_trees, loading: false })
    return true
  } catch (error) {
    patch({ loading: false, error: describeError(error) })
    return false
  }
}

export async function fetchLinkTree(id) {
  patch({ loading: true, error: null })
  try {
    const response = await linkTreeApi.getLinkTree(id)
    patch({ detail: response.data.link_tree, loading: false })
    return true
  } catch (error) {
    patch({ loading: false, error: describeError(error) })
    return false
  }
}

async function mutate(flag, call) {
  patch({ mutating: true, mutationError: null, message: null, [flag]: false })
  try {
    const response = await call()
    patch({ mutating: false, message: response.message, [flag]: true })
    return true
  } catch (error) {
    patch({ mutating: false, mutationError: describeError(error) })
    return false
  }
}

export const addLinkTree = (payload) => mutate('isAdded', () => linkTreeApi.createLinkTree(payload))

export const editLinkTree = (id, payload) => mutate('isChanged', () => linkTreeApi.updateLinkTree(id, payload))

export const editCover = (id, file) => mutate('isCoverChanged', () => linkTreeApi.changeCover(id, file))

export const removeLinkTree = (id) => mutate('isDeleted', () => linkTreeApi.deleteLinkTree(id))

export const removeAllLinkTrees = () => mutate('isDeletedAll', () => linkTreeApi.deleteAllLinkTrees())

export const saveItem = (linkTreeId, payload, itemId) =>
  mutate('isItemMutated', () =>
    itemId === undefined
      ? linkTreeApi.addItem(linkTreeId, payload)
      : linkTreeApi.updateItem(linkTreeId, itemId, payload)
  )

export const removeItem = (linkTreeId, itemId) =>
  mutate('isItemMutated', () => linkTreeApi.deleteItem(linkTreeId, itemId))
