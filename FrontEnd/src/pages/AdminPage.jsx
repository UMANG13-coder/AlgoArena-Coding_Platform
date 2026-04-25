import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, User, Database, LayoutGrid, ChevronDown, ChevronRight, Edit2, Plus, Trash2, X, Book, Code2 } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAppSelector } from '../hooks/redux'
import { selectUser, selectToken } from '../store/slices/authSlice'
import Topbar from '../components/dashboard/Topbar'
import { Button, Input, ConfirmDialog } from '../components/ui'
import { aiApi } from '../api/auth'

const TABS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
  { id: 'users',     label: 'Users',    icon: Users },
  { id: 'modules',   label: 'Curriculum',  icon: Database },
]

function OverviewCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-black leading-tight">{value}</div>
        <div className="text-xs font-medium text-gray-500 mt-0.5">{title}</div>
      </div>
    </div>
  )
}

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-black">{title}</h3>
          <button onClick={onClose} type="button" className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </div>
  )
}

function TestCasesManager({ initialCases = [] }) {
  const [cases, setCases] = useState(initialCases.length ? initialCases : [{ input: '', expected_output: '', isHidden: false }])

  const addCase = () => setCases([...cases, { input: '', expected_output: '', isHidden: false }])
  const removeCase = (idx) => setCases(cases.filter((_, i) => i !== idx))
  const updateCase = (idx, field, val) => {
    const newCases = [...cases]
    newCases[idx] = { ...newCases[idx], [field]: val }
    setCases(newCases)
  }

  return (
    <div className="space-y-3 mt-4 border border-gray-200 p-4 rounded-xl bg-gray-50/50">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-black">Test Cases</label>
        <Button size="sm" variant="secondary" onClick={addCase} type="button"><Plus size={14}/> Add Case</Button>
      </div>
      {cases.map((tc, idx) => (
        <div key={idx} className="flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Case #{idx + 1}</span>
            <button type="button" onClick={() => removeCase(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Input</label>
              <textarea 
                name={`tc_${idx}_input`}
                value={tc.input} onChange={e => updateCase(idx, 'input', e.target.value)}
                className="w-full p-2 text-xs border border-gray-300 rounded focus:border-orange-500 outline-none font-mono" rows={2} required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Expected Output</label>
              <textarea 
                name={`tc_${idx}_output`}
                value={tc.expected_output} onChange={e => updateCase(idx, 'expected_output', e.target.value)}
                className="w-full p-2 text-xs border border-gray-300 rounded focus:border-orange-500 outline-none font-mono" rows={2} required
              />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-1 cursor-pointer w-max">
            <input 
              type="checkbox" 
              name={`tc_${idx}_hidden`}
              checked={tc.isHidden} 
              onChange={e => updateCase(idx, 'isHidden', e.target.checked)}
              className="accent-orange-500"
            />
            <span className="text-xs font-medium text-gray-700">Hidden Test Case (Used for evaluation, not shown to user)</span>
          </label>
        </div>
      ))}
      <input type="hidden" name="testcase_count" value={cases.length} />
    </div>
  )
}

function UserManager() {
  const token = useAppSelector(selectToken)
  const [users, setUsers] = useState([])
  const [modalType, setModalType] = useState(null)
  const [editData, setEditData] = useState(null)

  const fetchUsers = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    try {
      const res = await axios.get(`${API_URL}/user?limit=100`, { headers: { Authorization: `Bearer ${token}` } })
      setUsers(res.data.data.users || [])
    } catch (err) {
      toast.error('Failed to load users')
    }
  }

  useEffect(() => {
    if (token) fetchUsers()
  }, [token])

  const openAddModal = () => { setModalType('add'); setEditData(null); }
  const openEditModal = (user) => { setModalType('edit'); setEditData(user); }
  const closeModal = () => { setModalType(null); setEditData(null); }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

    try {
      if (modalType === 'add') {
        await axios.post(`${API_URL}/user/signup`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('User created successfully')
      } else {
        const data = Object.fromEntries(formData.entries())
        if (!data.password) delete data.password
        await axios.patch(`${API_URL}/user/${editData._id || editData.id}`, data, { headers: { Authorization: `Bearer ${token}` } })
        toast.success('User updated successfully')
      }
      closeModal()
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving user')
    }
  }

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, id: null })

  const handleDelete = (id) => {
    setConfirmDialog({ isOpen: true, id })
  }

  const confirmDelete = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    try {
      await axios.delete(`${API_URL}/user/${confirmDialog.id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting user')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-black">User Management</h2>
          <p className="text-xs text-gray-500">View, add, edit, or delete users.</p>
        </div>
        <Button onClick={openAddModal} className="bg-black hover:bg-gray-800 text-white">
          <Plus size={16} /> Add User
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u._id || u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-black">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-gray-600 uppercase text-xs">{u.role || 'USER'}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => openEditModal(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(u._id || u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="text-center py-6 text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!modalType} onClose={closeModal} title={modalType === 'add' ? 'Add User' : 'Edit User'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input label="Name" name="name" defaultValue={editData?.name || ''} required />
          <Input label="Email" name="email" type="email" defaultValue={editData?.email || ''} required />
          <Input label="Password" name="password" type="password" placeholder={modalType === 'edit' ? "Leave blank to keep unchanged" : ""} required={modalType === 'add'} />

          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-gray-100 py-3 mt-4">
            <Button variant="ghost" onClick={closeModal} type="button">Cancel</Button>
            <Button variant="primary" type="submit">{modalType === 'add' ? 'Create User' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}

function CurriculumManager() {
  const token = useAppSelector(selectToken)
  const [modules, setModules] = useState([])

  const [expandedModules, setExpandedModules] = useState({})
  const [expandedLessons, setExpandedLessons] = useState({})

  const [modalType, setModalType] = useState(null)
  const [editData, setEditData] = useState(null)
  const [parentId, setParentId] = useState(null)

  const [aiPrompt, setAiPrompt] = useState('')
  const [aiDifficulty, setAiDifficulty] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiGenerated, setAiGenerated] = useState(null)
  const [aiGenKey, setAiGenKey] = useState(0)  
  const [aiError, setAiError] = useState('')

  const fetchCurriculum = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    try {
      const res = await axios.get(`${API_URL}/module`, { headers: { Authorization: `Bearer ${token}` } })
      setModules(res.data.data || [])

      if (res.data.data) {
        const mods = {}; const less = {};
        res.data.data.forEach(m => {
          mods[m._id] = true;
          m.lessons?.forEach(l => less[l._id] = true);
        })
        setExpandedModules(mods); setExpandedLessons(less);
      }
    } catch (err) {
      toast.error('Failed to load curriculum')
    }
  }

  useEffect(() => {
    if (token) fetchCurriculum()
  }, [token])

  const toggleModule = (id) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }))
  const toggleLesson = (id) => setExpandedLessons(prev => ({ ...prev, [id]: !prev[id] }))

  const openAddModal = (type, parent_id = null) => {
    setModalType(type); setEditData(null); setParentId(parent_id)

    setAiGenerated(null); setAiPrompt(''); setAiDifficulty(''); setAiError('')
  }
  const openEditModal = (type, data) => { setModalType(type); setEditData(data); }
  const closeModal = () => {
    setModalType(null); setEditData(null); setParentId(null)
    setAiGenerated(null); setAiPrompt(''); setAiDifficulty(''); setAiError('')
  }

  const handleAiGenerate = async () => {
    setAiGenerating(true)
    setAiError('')
    try {
      const payload = { description: aiPrompt.trim() }
      if (aiDifficulty) payload.difficulty = aiDifficulty
      const res = await aiApi.generateProblem(payload)
      const data = res?.data?.data
      if (data) {
        setAiGenerated(data)
        setAiGenKey(prev => prev + 1)  
        toast.success('Problem generated! Review and edit below before creating.')
      } else {
        setAiError('No data returned from AI. Try again.')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to generate problem'
      setAiError(msg)
      toast.error(msg)
    } finally {
      setAiGenerating(false)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

    try {
      let url = ''
      let payload = {}
      let method = editData ? 'PATCH' : 'POST'
      const itemId = editData ? (editData._id || editData.id) : null

      if (modalType === 'module') {
        url = `${API_URL}/module${editData ? `/${itemId}` : ''}`
        payload = {
          title: data.title,
          description: data.description,
          difficulty: data.difficulty,
          tags: data.tags ? data.tags.split(',').map(t=>t.trim()).filter(Boolean) : []
        }
      } 
      else if (modalType === 'lesson') {
        url = `${API_URL}/lesson${editData ? `/${itemId}` : ''}`
        payload = {
          title: data.title,
          content_type: data.content_type || 'markdown',
          content_md: data.content_md
        }
        if (!editData) payload.module_id = parentId
      }
      else if (modalType === 'problem') {
        url = `${API_URL}/problem${editData ? `/${itemId}` : ''}`
        const test_cases = []
        const count = parseInt(data.testcase_count || '0')
        for(let i=0; i<count; i++) {
            test_cases.push({
                input: data[`tc_${i}_input`],
                expected_output: data[`tc_${i}_output`],
                isHidden: data[`tc_${i}_hidden`] === 'on'
            })
        }
        payload = {
          title: data.title,
          difficulty: data.difficulty,
          description_md: data.description_md,
          tags: data.tags ? data.tags.split(',').map(t=>t.trim()).filter(Boolean) : [],
          supported_languages: data.supported_languages ? data.supported_languages.split(',').map(l=>l.trim()).filter(Boolean) : [],
          constraints: {
              time_limit_ms: parseInt(data.time_limit_ms) || 2000,
              memory_limit_kb: parseInt(data.memory_limit_kb) || 128000,
              details: data.constraint_details ? data.constraint_details.split('\n').map(d=>d.trim()).filter(Boolean) : []
          },
          hints: data.hints ? data.hints.split('\n').map(h=>h.trim()).filter(Boolean) : [],
          test_cases
        }
        if (!editData) payload.lesson_id = parentId
      }

      await axios({ method, url, data: payload, headers: { Authorization: `Bearer ${token}` } })
      toast.success(`${modalType} ${editData ? 'updated' : 'created'} successfully!`)
      closeModal()
      fetchCurriculum()
    } catch (err) {
      console.error("Form Submit Error:", err.response?.data)
      const details = err.response?.data?.data;
      let msg = err.response?.data?.message || 'Something went wrong';
      if (Array.isArray(details)) {
        msg = details.map(d => d.message).join(', ');
      }
      toast.error(msg)
    }
  }

  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, id: null })

  const handleDelete = (type, id) => {
    setConfirmDialog({ isOpen: true, type, id })
  }

  const confirmDelete = async () => {
    const { type, id } = confirmDialog
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    try {
      await axios.delete(`${API_URL}/${type}/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success(`${type} deleted successfully`)
      fetchCurriculum()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Backend delete not fully implemented yet.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-black">Curriculum Hierarchy</h2>
          <p className="text-xs text-gray-500">Manage modules, lessons, and problems fully featured.</p>
        </div>
        <Button onClick={() => openAddModal('module')} className="bg-black hover:bg-gray-800 text-white">
          <Plus size={16} /> Add Module
        </Button>
      </div>

      <div className="space-y-3">
        {modules.map(mod => (
          <div key={mod._id || mod.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleModule(mod._id || mod.id)}>
                <div className="p-1 hover:bg-gray-200 rounded text-gray-500">
                  {expandedModules[mod._id || mod.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
                <div>
                  <div className="font-bold text-sm text-black flex items-center gap-2">
                    <Database size={14} className="text-orange-500"/> {mod.title}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{mod.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => openAddModal('lesson', mod._id || mod.id)}>
                  <Plus size={14} /> Lesson
                </Button>
                <button onClick={() => openEditModal('module', mod)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete('module', mod._id || mod.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
              </div>
            </div>

            <AnimatePresence>
              {expandedModules[mod._id || mod.id] && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="p-4 pt-0 space-y-3 mt-3">
                    {mod.lessons?.map(lesson => (
                      <div key={lesson._id || lesson.id} className="ml-6 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleLesson(lesson._id || lesson.id)}>
                             <div className="p-1 hover:bg-gray-200 rounded text-gray-400">
                              {expandedLessons[lesson._id || lesson.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                            <div className="font-semibold text-[13px] text-gray-800 flex items-center gap-2">
                              <Book size={14} className="text-blue-500"/> {lesson.title}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="ghost" className="text-xs py-1 px-2 border border-gray-200" onClick={() => openAddModal('problem', lesson._id || lesson.id)}>
                              <Plus size={12} /> Problem
                            </Button>
                            <button onClick={() => openEditModal('lesson', lesson)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={13} /></button>
                            <button onClick={() => handleDelete('lesson', lesson._id || lesson.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedLessons[lesson._id || lesson.id] && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="p-3 bg-gray-50/50 space-y-2">
                                {lesson.problems?.map(prob => (
                                  <div key={prob._id || prob.id} className="ml-8 flex items-center justify-between p-2.5 bg-white border border-gray-100 rounded-md shadow-sm hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <Code2 size={14} className="text-green-500"/>
                                      <span className="text-[13px] font-medium text-black">{prob.title}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">{prob.difficulty}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => openEditModal('problem', prob)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={12} /></button>
                                      <button onClick={() => handleDelete('problem', prob._id || prob.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={12} /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <Modal isOpen={!!modalType} onClose={closeModal} title={`${editData ? 'Edit' : 'Add'} ${modalType === 'module' ? 'Module' : modalType === 'lesson' ? 'Lesson' : 'Problem'}`}>
        <form onSubmit={handleFormSubmit} className="space-y-4">

          {}
          {modalType === 'module' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Module Title" name="title" defaultValue={editData?.title || ''} required placeholder="e.g. Data Structures" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-black">Difficulty</label>
                  <select name="difficulty" defaultValue={editData?.difficulty || 'Beginner'} className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-orange-500 outline-none text-sm bg-white">
                    <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <Input label="Tags (comma separated)" name="tags" defaultValue={editData?.tags?.join(', ') || ''} placeholder="e.g. basics, arrays" />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-black">Description</label>
                <textarea name="description" defaultValue={editData?.description || ''} rows={3} required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-orange-500 outline-none text-sm resize-none" placeholder="Module description..." />
              </div>
            </>
          )}

          {}
          {modalType === 'lesson' && (
            <>
              <div className="grid grid-cols-1 gap-4">
                <Input label="Lesson Title" name="title" defaultValue={editData?.title || ''} required placeholder="e.g. Arrays in C++" />
                <input type="hidden" name="content_type" value="markdown" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-black">Content (Markdown)</label>
                <textarea name="content_md" defaultValue={editData?.content_md || ''} rows={5} required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-orange-500 outline-none text-sm resize-none font-mono" placeholder="## Introduction..." />
              </div>
            </>
          )}

          {}
          {modalType === 'problem' && (
            <>
              {}
              {!editData && (
                <div className="mb-5 p-4 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] font-bold">AI</span>
                    </div>
                    <h4 className="text-sm font-bold text-black">Auto-Generate with AI</h4>
                    <span className="text-[10px] text-orange-600 font-semibold bg-orange-100 px-2 py-0.5 rounded-full">Beta</span>
                  </div>
                  <p className="text-xs text-gray-500">Describe the problem idea briefly and let AI generate title, description, test cases, constraints and hints for you.</p>
                  <textarea
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-lg border border-orange-200 focus:border-orange-500 outline-none text-sm resize-none"
                    placeholder="e.g. A problem where user finds the maximum subarray sum using Kadane's algorithm, with negative numbers included..."
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={aiDifficulty}
                      onChange={e => setAiDifficulty(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-orange-200 text-sm bg-white focus:border-orange-500 outline-none"
                    >
                      <option value="">Auto Difficulty</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      loading={aiGenerating}
                      disabled={!aiPrompt.trim() || aiGenerating}
                      onClick={handleAiGenerate}
                    >
                      {aiGenerating ? 'Generating...' : '✨ Generate Problem'}
                    </Button>
                  </div>
                  {aiError && <p className="text-xs text-red-500 mt-1">{aiError}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Input label="Problem Title" name="title" defaultValue={editData?.title || aiGenerated?.title || ''} key={`t-${aiGenKey}`} required placeholder="e.g. Two Sum" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-black">Difficulty</label>
                  <select name="difficulty" defaultValue={editData?.difficulty || aiGenerated?.difficulty || 'Easy'} key={`d-${aiGenKey}`} className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-orange-500 outline-none text-sm bg-white">
                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-black">Description (Markdown)</label>
                <textarea name="description_md" defaultValue={editData?.description_md || aiGenerated?.description_md || ''} key={`desc-${aiGenKey}`} rows={4} required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:border-orange-500 outline-none text-sm resize-none font-mono" placeholder="Problem statement..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Tags (comma sep)" name="tags" defaultValue={editData?.tags?.join(', ') || aiGenerated?.tags?.join(', ') || ''} key={`tags-${aiGenKey}`} placeholder="arrays, math" />
                <Input label="Supported Languages (comma sep)" name="supported_languages" defaultValue={editData?.supported_languages?.join(', ') || aiGenerated?.supported_languages?.join(', ') || 'cpp, java, python, js'} key={`lang-${aiGenKey}`} placeholder="cpp, java, python, js" />
              </div>

              {}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-black border-b pb-1">Constraints</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Time Limit (ms)" name="time_limit_ms" type="number" defaultValue={editData?.constraints?.time_limit_ms || aiGenerated?.constraints?.time_limit_ms || 2000} key={`tl-${aiGenKey}`} />
                  <Input label="Memory Limit (KB)" name="memory_limit_kb" type="number" defaultValue={editData?.constraints?.memory_limit_kb || aiGenerated?.constraints?.memory_limit_kb || 128000} key={`ml-${aiGenKey}`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600">Details (One per line)</label>
                  <textarea name="constraint_details" defaultValue={editData?.constraints?.details?.join('\n') || aiGenerated?.constraints?.details?.join('\n') || ''} key={`cd-${aiGenKey}`} rows={2}
                    className="w-full p-2 rounded-lg border border-gray-300 outline-none text-sm resize-none font-mono" placeholder="1 <= N <= 10^5" />
                </div>
              </div>

              {}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-black">Hints (One per line)</label>
                <textarea name="hints" defaultValue={editData?.hints?.join('\n') || aiGenerated?.hints?.join('\n') || ''} key={`hints-${aiGenKey}`} rows={2}
                  className="w-full p-2 rounded-lg border border-gray-300 outline-none text-sm resize-none" placeholder="Try using a hash map..." />
              </div>

              {}
              <TestCasesManager initialCases={editData?.test_cases || aiGenerated?.test_cases || []} key={`tc-${aiGenKey}`} />
            </>
          )}

          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-gray-100 py-3 mt-4">
            <Button variant="ghost" onClick={closeModal} type="button">Cancel</Button>
            <Button variant="primary" type="submit">{editData ? 'Save Changes' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: null, id: null })}
        onConfirm={confirmDelete}
        title={`Delete ${confirmDialog.type ? confirmDialog.type.charAt(0).toUpperCase() + confirmDialog.type.slice(1) : ''}`}
        message={`Are you sure you want to delete this ${confirmDialog.type}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

    </div>
  )
}

export default function AdminPage() {
  const user = useAppSelector(selectUser)
  const token = useAppSelector(selectToken)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({ users: 0, modules: 0, problems: 0 })
  const [usersList, setUsersList] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      try {
        const [uRes, mRes, pRes] = await Promise.all([
          axios.get(`${API_URL}/user?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/module`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/problem?limit=100`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const userCount = uRes.data?.data?.pagination?.totalUsers || 0;
        const usersArray = uRes.data?.data?.users || [];
        const modulesData = mRes.data?.data || [];
        const problemCount = pRes.data?.data?.total || 0;

        setStats({
          users: userCount,
          modules: modulesData.length,
          problems: problemCount
        });
        setUsersList(usersArray);
      } catch (err) {
        console.error('Failed to fetch stats:', err.response?.data || err.message);
      }
    };
    if (token && activeTab === 'dashboard') fetchStats();
  }, [token, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Topbar hideProgress={true} solvedCount={0} totalCount={0} percentage={0} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8 flex gap-8">
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-3 sticky top-24">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">Admin Menu</h3>
            <div className="flex flex-col gap-1">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-black'}`}>
                  <tab.icon size={18} className={activeTab === tab.id ? 'text-orange-500' : 'text-gray-400'} />
                  {tab.label}
                  {activeTab === tab.id && <motion.div layoutId="activeTabIndicator" className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full" initial={false} transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-black tracking-tight">Admin Dashboard</h1>
            <p className="text-sm font-medium text-gray-500">Manage your platform content and users.</p>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <OverviewCard title="Total Users" value={stats.users} icon={Users} color="#6366f1" />
                  <OverviewCard title="Curriculum Modules" value={stats.modules} icon={Database} color="#f97316" />
                  <OverviewCard title="Total Problems" value={stats.problems} icon={Code2} color="#ec4899" />
                </div>

                {}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                  <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                    <User size={20} className="text-orange-500"/> User Progress
                  </h3>
                  <div className="space-y-4">
                    {usersList.length === 0 ? (
                      <p className="text-sm text-gray-500">No users found.</p>
                    ) : (
                      usersList.map(u => {
                        const solved = u.solvedCount || 0;
                        const total = stats.problems || 1; 
                        const percentage = Math.round((solved / total) * 100);
                        return (
                          <div key={u._id || u.id} className="flex flex-col gap-1.5 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-black">{u.name} <span className="font-normal text-xs text-gray-500 ml-1">({u.email})</span></span>
                              <span className="text-xs font-bold text-gray-600">{solved} / {stats.problems} Solved</span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-orange-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <UserManager />
              </motion.div>
            )}

            {activeTab === 'modules' && (
              <motion.div key="modules" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <CurriculumManager />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}