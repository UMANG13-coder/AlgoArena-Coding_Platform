import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const saveSession = (token, user) => {
  localStorage.setItem('aa_token', token)
  localStorage.setItem('aa_user',  JSON.stringify(user))
}
const clearSession = () => {
  localStorage.removeItem('aa_token')
  localStorage.removeItem('aa_user')
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/user/login`, { email, password })
      const { token, email: userEmail, profile_pic, name, id, role } = data.data
      const user = { email: userEmail, profile_pic, name, id, role }
      saveSession(token, user)
      return { user, token }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/user/signup`, { name, email, password })
      const { token, email: userEmail, profile_pic, name: userName, id, role } = data.data
      const user = { email: userEmail, profile_pic, name: userName, id, role }
      saveSession(token, user)
      return { user, token }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/user/generateUrl`)
      window.location.href = data.data.auth_url
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const token   = localStorage.getItem('aa_token')
      const rawUser = localStorage.getItem('aa_user')
      if (!token || !rawUser) return rejectWithValue('No session')
      return { token, user: JSON.parse(rawUser) }
    } catch (err) {
      clearSession()
      return rejectWithValue(err.message)
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  clearSession()
})

export const updateAvatar = createAsyncThunk(
  'auth/updateAvatar',
  async ({ userId, file }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await axios.post(`${API_URL}/user/profile/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      const newAvatarUrl = data.data.avatar_url;

      const user = { ...state.auth.user, profile_pic: newAvatarUrl };
      saveSession(token, user);

      return newAvatarUrl;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:             null,
    token:            null,
    loading:          false,
    error:            null,
    sessionRestored:  false,
  },
  reducers: {
    clearError(state)            { state.error = null },
    setGoogleSession(state, { payload }) {
      state.user            = {
        email:       payload.email,
        profile_pic: payload.profile_pic,
        name:        payload.name || '',
        id:          payload.id   || '',
        role:        payload.role || 'user',
      }
      state.token           = payload.token
      state.loading         = false
      state.error           = null
      state.sessionRestored = true
      saveSession(payload.token, state.user)
    },
  },
  extraReducers: (builder) => {
    const pending  = (s)             => { s.loading = true;  s.error = null }
    const rejected = (s, a)          => { s.loading = false; s.error = a.payload }
    const session  = (s, { payload }) => {
      s.loading         = false
      s.sessionRestored = true
      s.user            = payload.user
      s.token           = payload.token
    }

    builder.addCase(loginUser.pending,        pending)
    builder.addCase(loginUser.fulfilled,      session)
    builder.addCase(loginUser.rejected,       rejected)

    builder.addCase(signupUser.pending,       pending)
    builder.addCase(signupUser.fulfilled,     session)
    builder.addCase(signupUser.rejected,      rejected)

    builder.addCase(loginWithGoogle.pending,  pending)
    builder.addCase(loginWithGoogle.rejected, rejected)

    builder.addCase(restoreSession.pending,  (s) => { s.loading = true })
    builder.addCase(restoreSession.rejected, (s) => { s.loading = false; s.sessionRestored = true })
    builder.addCase(restoreSession.fulfilled, (s, { payload }) => {
      s.loading         = false
      s.sessionRestored = true
      s.user            = payload.user
      s.token           = payload.token
    })

    builder.addCase(logoutUser.fulfilled, (s) => {
      s.user = null; s.token = null; s.loading = false; s.error = null; s.sessionRestored = true
    })

    builder.addCase(updateAvatar.fulfilled, (s, { payload }) => {
      if (s.user) {
        s.user.profile_pic = payload;
      }
    })
  },
})

export const { clearError, setGoogleSession } = authSlice.actions
export default authSlice.reducer

export const selectUser             = (s) => s.auth.user
export const selectToken            = (s) => s.auth.token
export const selectAuthLoading      = (s) => s.auth.loading
export const selectAuthError        = (s) => s.auth.error
export const selectSessionRestored  = (s) => s.auth.sessionRestored
