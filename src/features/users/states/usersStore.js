import { writable } from 'svelte/store'
import * as usersApi from '../api/usersApi.js'
import { authUser } from '../../auth/states/authStore.js'
import { describeError } from '../../../helpers/toolsHelper.js'

const initialState = () => ({
  users: [],
  profile: null,
  loading: false,
  mutating: false,
  error: null,
  message: null
})

export const usersState = writable(initialState())

const patch = (values) => usersState.update((state) => ({ ...state, ...values }))

export const resetUsersState = () => usersState.set(initialState())

export const resetUsersFeedback = () => patch({ error: null, message: null })

export async function fetchUsers() {
  patch({ loading: true, error: null })
  try {
    const response = await usersApi.getUsers()
    patch({ users: response.data.users, loading: false })
    return true
  } catch (error) {
    patch({ loading: false, error: describeError(error) })
    return false
  }
}

export async function fetchProfile() {
  patch({ loading: true, error: null })
  try {
    const response = await usersApi.getProfile()
    patch({ profile: response.data.user, loading: false })
    authUser.set(response.data.user)
    return true
  } catch (error) {
    patch({ loading: false, error: describeError(error) })
    return false
  }
}

async function mutate(call) {
  patch({ mutating: true, error: null, message: null })
  try {
    const response = await call()
    patch({ mutating: false, message: response.message })
    return response
  } catch (error) {
    patch({ mutating: false, error: describeError(error) })
    return null
  }
}

export async function saveProfile(payload) {
  const response = await mutate(() => usersApi.updateProfile(payload))
  if (!response) return false
  patch({ profile: response.data.user })
  authUser.set(response.data.user)
  return true
}

export async function savePhoto(file) {
  const response = await mutate(() => usersApi.updatePhoto(file))
  if (!response) return false
  await fetchProfile()
  return true
}

export async function savePassword(payload) {
  const response = await mutate(() => usersApi.updatePassword(payload))
  return response !== null
}
