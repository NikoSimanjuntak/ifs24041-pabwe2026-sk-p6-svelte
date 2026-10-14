import { get } from 'svelte/store'
import * as linkTreeApi from '../api/linkTreeApi.js'
import {
  addLinkTree,
  editCover,
  editLinkTree,
  fetchLinkTree,
  fetchLinkTrees,
  linkTreesState,
  removeAllLinkTrees,
  removeItem,
  removeLinkTree,
  resetLinkTreesFlags,
  resetLinkTreesState,
  saveItem
} from './linkTreesStore.js'
import { ApiError } from '../../../helpers/apiHelper.js'
import { makeLinkTree, ok } from '../../../test/fixtures.js'

vi.mock('../api/linkTreeApi.js')

const payload = { title: 'J', type: 'public', description: 'D' }

describe('linkTreesStore', () => {
  beforeEach(() => resetLinkTreesState())

  it('fetchLinkTrees tanpa argumen dan dengan isMe', async () => {
    const items = [makeLinkTree()]
    linkTreeApi.getLinkTrees.mockResolvedValue(ok({ link_trees: items }))
    await expect(fetchLinkTrees()).resolves.toBe(true)
    expect(linkTreeApi.getLinkTrees).toHaveBeenLastCalledWith(false)
    expect(get(linkTreesState).items).toEqual(items)

    await fetchLinkTrees({ isMe: true })
    expect(linkTreeApi.getLinkTrees).toHaveBeenLastCalledWith(true)
  })

  it('fetchLinkTrees gagal', async () => {
    linkTreeApi.getLinkTrees.mockRejectedValue(new ApiError('Gagal memuat'))
    await expect(fetchLinkTrees()).resolves.toBe(false)
    expect(get(linkTreesState)).toMatchObject({ loading: false, error: 'Gagal memuat' })
  })

  it('fetchLinkTree berhasil dan gagal', async () => {
    const detail = makeLinkTree()
    linkTreeApi.getLinkTree.mockResolvedValueOnce(ok({ link_tree: detail }))
    await expect(fetchLinkTree(1)).resolves.toBe(true)
    expect(get(linkTreesState).detail).toEqual(detail)

    linkTreeApi.getLinkTree.mockRejectedValueOnce(new ApiError('Tidak ditemukan'))
    await expect(fetchLinkTree(99)).resolves.toBe(false)
    expect(get(linkTreesState).error).toBe('Tidak ditemukan')
  })

  it.each([
    ['isAdded', () => addLinkTree(payload), 'createLinkTree'],
    ['isChanged', () => editLinkTree(1, payload), 'updateLinkTree'],
    ['isCoverChanged', () => editCover(1, new File(['x'], 'c.png')), 'changeCover'],
    ['isDeleted', () => removeLinkTree(1), 'deleteLinkTree'],
    ['isDeletedAll', () => removeAllLinkTrees(), 'deleteAllLinkTrees'],
    ['isItemMutated', () => removeItem(1, 10), 'deleteItem']
  ])('mutasi %s berhasil dan gagal', async (flag, run, apiName) => {
    linkTreeApi[apiName].mockResolvedValueOnce(ok(null, 'Berhasil'))
    await expect(run()).resolves.toBe(true)
    expect(get(linkTreesState)).toMatchObject({ [flag]: true, message: 'Berhasil', mutating: false })

    linkTreeApi[apiName].mockRejectedValueOnce(new ApiError('Gagal mutasi'))
    await expect(run()).resolves.toBe(false)
    expect(get(linkTreesState)).toMatchObject({
      [flag]: false,
      mutationError: 'Gagal mutasi',
      message: null,
      mutating: false
    })
  })

  it('saveItem menambah tanpa itemId dan mengubah dengan itemId', async () => {
    const item = { title: 'T', url: 'https://delcom.org' }
    linkTreeApi.addItem.mockResolvedValue(ok(null))
    linkTreeApi.updateItem.mockResolvedValue(ok(null))

    await expect(saveItem(1, item)).resolves.toBe(true)
    expect(linkTreeApi.addItem).toHaveBeenCalledWith(1, item)

    await expect(saveItem(1, item, 10)).resolves.toBe(true)
    expect(linkTreeApi.updateItem).toHaveBeenCalledWith(1, 10, item)
    expect(get(linkTreesState).isItemMutated).toBe(true)
  })

  it('resetLinkTreesFlags hanya membersihkan bendera dan pesan', async () => {
    linkTreeApi.createLinkTree.mockResolvedValue(ok(null, 'Berhasil'))
    await addLinkTree(payload)
    linkTreesState.update((state) => ({ ...state, items: [makeLinkTree()], mutationError: 'x' }))
    resetLinkTreesFlags()
    const state = get(linkTreesState)
    expect(state).toMatchObject({ isAdded: false, message: null, mutationError: null })
    expect(state.items).toHaveLength(1)
    resetLinkTreesState()
    expect(get(linkTreesState).items).toEqual([])
  })
})
