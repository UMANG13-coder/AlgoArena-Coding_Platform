import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { moduleApi } from '../../api/auth'

export const fetchModules = createAsyncThunk(
  'modules/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await moduleApi.getAll()
      return data.data || []
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const modulesSlice = createSlice({
  name: 'modules',
  initialState: {
    items:   [],
    loading: false,
    error:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending,   (s)             => { s.loading = true;  s.error = null })
      .addCase(fetchModules.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })
      .addCase(fetchModules.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload })
  },
})

export const selectModules        = (s) => s.modules.items
export const selectModulesLoading = (s) => s.modules.loading

export const selectAllProblemsFromModules = (s) => {
  const problems = []
  for (const mod of s.modules.items) {
    for (const lesson of (mod.lessons || [])) {
      for (const problem of (lesson.problems || [])) {
        problems.push(problem)
      }
    }
  }
  return problems
}

export const selectSolvedProblemIds = (s) => {
  const ids = []
  for (const mod of s.modules.items) {
    for (const lesson of (mod.lessons || [])) {
      for (const problem of (lesson.problems || [])) {
        if (problem.isSolved) {
          ids.push(problem._id || problem.id)
        }
      }
    }
  }
  return ids
}

export const selectSolvedCount = (s) => {
  let count = 0
  for (const mod of s.modules.items) {
    for (const lesson of (mod.lessons || [])) {
      for (const problem of (lesson.problems || [])) {
        if (problem.isSolved) count++
      }
    }
  }
  return count
}

export const selectTotalCount = (s) => {
  let total = 0
  for (const mod of s.modules.items) {
    for (const lesson of (mod.lessons || [])) {
      total += (lesson.problems || []).length
    }
  }
  return total
}

export const selectPercentage = (s) => {
  const total = selectTotalCount(s)
  const solved = selectSolvedCount(s)
  return total === 0 ? 0 : Math.round((solved / total) * 100)
}

export const selectSolvedByDifficulty = (s) => {
  let easy = 0, medium = 0, hard = 0
  for (const mod of s.modules.items) {
    for (const lesson of (mod.lessons || [])) {
      for (const problem of (lesson.problems || [])) {
        if (problem.isSolved) {
          if (problem.difficulty === 'Easy') easy++
          else if (problem.difficulty === 'Medium') medium++
          else if (problem.difficulty === 'Hard') hard++
        }
      }
    }
  }
  return { easy, medium, hard }
}

export default modulesSlice.reducer
