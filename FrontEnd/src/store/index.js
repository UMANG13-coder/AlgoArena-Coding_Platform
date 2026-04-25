import { configureStore } from '@reduxjs/toolkit'
import authReducer     from './slices/authSlice'
import profileReducer  from './slices/profileSlice'
import editorReducer   from './slices/editorSlice'
import modulesReducer  from './slices/modulesSlice'

export const store = configureStore({
  reducer: {
    auth:     authReducer,
    profile:  profileReducer,
    editor:   editorReducer,
    modules:  modulesReducer,
  },
  devTools: import.meta.env.DEV,
})

export default store
