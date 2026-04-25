import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { userApi } from '../../api/auth'

export const loadUserProfile = createAsyncThunk(
  'profile/load',
  async (_, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user?.id
      if (!userId) return rejectWithValue('No user ID')
      const { data } = await userApi.getProfile(userId)
      const { user, profile } = data.data
      return {
        location:   profile.location   || '',
        education:  profile.education  || '',
        gradYear:   profile.grad_year  || '',
        mobile:     profile.mobile     || '',
        bio:        profile.bio        || '',
        github:     profile.github     || '',
        linkedin:   profile.linkedin   || '',
        twitter:    profile.twitter    || '',
        resume:     profile.resume_url || '',
        leetcode:   profile.leetcode   || '',
        codeforces: profile.codeforces || '',
        gfg:        profile.gfg        || '',
        hackerrank: profile.hackerrank || '',
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const saveUserProfile = createAsyncThunk(
  'profile/save',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const userId = getState().auth.user?.id
      if (!userId) return rejectWithValue('No user ID')
      const payload = {
        location:   profileData.location   || '',
        education:  profileData.education  || '',
        grad_year:  profileData.gradYear   ? Number(profileData.gradYear) : undefined,
        mobile:     profileData.mobile     || '',
        bio:        profileData.bio        || '',
        github:     profileData.github     || '',
        linkedin:   profileData.linkedin   || '',
        twitter:    profileData.twitter    || '',
        resume_url: profileData.resume     || '',
        leetcode:   profileData.leetcode   || '',
        codeforces: profileData.codeforces || '',
        gfg:        profileData.gfg        || '',
        hackerrank: profileData.hackerrank || '',
      }
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k]
      })
      await userApi.updateProfile(userId, payload)
      return profileData
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    data:    {},
    loading: false,
    saving:  false,
    error:   null,
  },
  reducers: {
    resetProfileState: (state) => {
      state.data    = {}
      state.loading = false
      state.saving  = false
      state.error   = null
    },
    patchField: (state, { payload }) => {
      state.data = { ...state.data, ...payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserProfile.pending,   (s) => { s.loading = true;  s.error = null })
      .addCase(loadUserProfile.rejected,  (s) => { s.loading = false })
      .addCase(loadUserProfile.fulfilled, (s, { payload }) => {
        s.loading = false
        s.data    = payload
      })

    builder
      .addCase(saveUserProfile.pending,   (s) => { s.saving = true;  s.error = null })
      .addCase(saveUserProfile.rejected,  (s, a) => { s.saving = false; s.error = a.payload })
      .addCase(saveUserProfile.fulfilled, (s, { payload }) => {
        s.saving = false
        s.data   = payload
      })
  },
})

export const { resetProfileState, patchField } = profileSlice.actions

export const selectProfile        = (s) => s.profile.data
export const selectProfileLoading = (s) => s.profile.loading
export const selectProfileSaving  = (s) => s.profile.saving
export const selectProfileError   = (s) => s.profile.error

export default profileSlice.reducer
