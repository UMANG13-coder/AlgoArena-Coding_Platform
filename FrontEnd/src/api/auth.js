import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aa_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authApi = {
  login:        (data) => api.post('/user/login', data),
  signup:       (data) => api.post('/user/signup', data),
  getGoogleUrl: ()     => api.get('/user/generateUrl'),
}

export const userApi = {
  getById:       (id)       => api.get(`/user/${id}`),
  getProfile:    (id)       => api.get(`/user/profile/${id}`),
  updateProfile: (id, data) => api.patch(`/user/profile/${id}`, data),
  updateUser:    (id, data) => api.patch(`/user/${id}`, data),
}

export const problemApi = {
  getAll:  (page = 1, limit = 100) => api.get(`/problem?page=${page}&limit=${limit}`),
  getById: (id)                     => api.get(`/problem/${id}`),
}

export const moduleApi = {
  getAll:  (page = 1, limit = 100) => api.get(`/module?page=${page}&limit=${limit}`),
  getById: (id)                     => api.get(`/module/${id}`),
}

export const aiApi = {
  chat:            (prompt)        => api.post('/ai/chat',    { prompt }),
  analyzeCode:     (submissionId)  => api.post('/ai/analyze', { submission_id: submissionId }),
  generateProblem: (data)          => api.post('/ai/generate-problem', data),
}

export const submissionApi = {
  getAll:  (problemId) => api.get('/submission',         { params: { problemId } }),
  getById: (id)        => api.get(`/submission/${id}`),
  run:     (data)      => api.post('/submission/run',    data),   
  submit:  (data)      => api.post('/submission/submit', data),   
  delete:  (id)        => api.delete(`/submission/${id}`),
}

export default api