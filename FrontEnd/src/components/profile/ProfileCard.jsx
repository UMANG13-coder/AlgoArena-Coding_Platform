import { ExternalLink, MapPin, GraduationCap, Github, Linkedin, Twitter, FileText, Camera, X, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { selectUser, updateAvatar }     from '../../store/slices/authSlice'
import { selectProfile }  from '../../store/slices/profileSlice'
import { selectSolvedCount, selectPercentage, selectTotalCount } from '../../store/slices/modulesSlice'
import toast from 'react-hot-toast'

export default function ProfileCard({ onEditClick }) {
  const user         = useAppSelector(selectUser)
  const profile      = useAppSelector(selectProfile)
  const solvedCount  = useAppSelector(selectSolvedCount)
  const percentage   = useAppSelector(selectPercentage)
  const totalCount   = useAppSelector(selectTotalCount)

  const displayName = user?.name || user?.email?.split('@')[0] || 'User'
  const initial     = displayName[0]?.toUpperCase()

  const socialLinks = [
    { icon: Github,   label: 'GitHub',   url: profile.github   },
    { icon: Linkedin, label: 'LinkedIn', url: profile.linkedin },
    { icon: Twitter,  label: 'Twitter',  url: profile.twitter  },
    { icon: FileText, label: 'Resume',   url: profile.resume   },
  ].filter(s => s.url)

  const codingLinks = [
    { label: 'LeetCode',      url: profile.leetcode   },
    { label: 'HackerRank',    url: profile.hackerrank },
    { label: 'Codeforces',    url: profile.codeforces },
    { label: 'GeeksForGeeks', url: profile.gfg        },
  ].filter(c => c.url)

  const dispatch = useAppDispatch()
  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleImageClick = () => {
    setIsModalOpen(true)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleUploadConfirm = async () => {
    if (!selectedFile) return

    try {
      setIsUploading(true)
      const loadingToast = toast.loading('Uploading image...')

      const resultAction = await dispatch(updateAvatar({ userId: user.id, file: selectedFile }))

      if (updateAvatar.fulfilled.match(resultAction)) {
        toast.success('Profile picture updated!', { id: loadingToast })
        setIsModalOpen(false)
        setSelectedFile(null)
        setPreviewUrl(null)
      } else {
        toast.error(resultAction.payload || 'Failed to upload image', { id: loadingToast })
      }
    } catch (err) {
      toast.error('An error occurred during upload')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      <div className="flex flex-col items-center text-center gap-2 pb-4 border-b border-gray-100">
        <div className="relative group cursor-pointer" onClick={handleImageClick}>
          {user?.profile_pic ? (
            <img
              src={user.profile_pic}
              alt={displayName}
              className={`w-16 h-16 rounded-full object-cover border-2 border-gray-100 transition-opacity ${isUploading ? 'opacity-50' : 'group-hover:opacity-80'}`}
            />
          ) : (
            <div className={`w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200
              flex items-center justify-center text-2xl font-bold text-orange-500 transition-opacity ${isUploading ? 'opacity-50' : 'group-hover:opacity-80'}`}>
              {initial}
            </div>
          )}

          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-gray-200 shadow-sm text-gray-500 hover:text-orange-500 transition-colors z-10">
            <Camera size={14} />
          </div>

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/10">
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-black text-[15px]">Update Profile Picture</h3>
                  <button onClick={handleCloseModal} className="text-gray-400 hover:text-black transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5">
                  {!previewUrl ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-orange-200 transition-colors"
                    >
                      <UploadCloud size={32} className="text-gray-400 mb-3" />
                      <p className="text-[13px] font-medium text-black">Click to select image</p>
                      <p className="text-[11px] text-gray-400 mt-1">JPEG, PNG, WebP (Max 10MB)</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-sm"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 text-[12px] font-medium text-orange-500 hover:text-orange-600 transition-colors"
                      >
                        Change Image
                      </button>
                    </div>
                  )}

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" 
                    className="hidden" 
                  />
                </div>

                <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
                  <button 
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUploadConfirm}
                    disabled={!selectedFile || isUploading}
                    className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isUploading ? (
                      <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
                    ) : 'Save Picture'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <div>
          <p className="font-bold text-[15px] text-black">{displayName}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">{user?.email}</p>
        </div>

        <div className="flex gap-4 mt-1">
          <div className="text-center">
            <div className="text-[15px] font-bold text-black">{solvedCount}</div>
            <div className="text-[10px] text-gray-400">Solved</div>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <div className="text-[15px] font-bold text-black">{totalCount}</div>
            <div className="text-[10px] text-gray-400">Total</div>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <div className="text-[15px] font-bold text-orange-500">{percentage}%</div>
            <div className="text-[10px] text-gray-400">Done</div>
          </div>
        </div>

        <button
          onClick={onEditClick}
          className="mt-2 px-4 py-1.5 rounded-lg border border-gray-200 text-[12px]
            font-semibold text-gray-600 hover:bg-gray-50 hover:text-black transition-all"
        >
          Edit Profile
        </button>
      </div>

      {(profile.location || profile.education) && (
        <div className="space-y-2 pb-4 border-b border-gray-100">
          {profile.location && (
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
              <MapPin size={13} className="text-gray-400 flex-shrink-0" />
              {profile.location}
            </div>
          )}
          {profile.education && (
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
              <GraduationCap size={13} className="text-gray-400 flex-shrink-0" />
              {profile.education}{profile.gradYear ? ` · ${profile.gradYear}` : ''}
            </div>
          )}
        </div>
      )}

      {socialLinks.length > 0 && (
        <div className="space-y-2 pb-4 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Social</p>
          {socialLinks.map(s => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[12px] text-gray-600 hover:text-orange-500 transition-colors"
            >
              <s.icon size={13} />
              <span>{s.label}</span>
              <ExternalLink size={10} className="ml-auto text-gray-300" />
            </a>
          ))}
        </div>
      )}

      {codingLinks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Coding</p>
          {codingLinks.map(c => (
            <a
              key={c.label}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between text-[12px] text-gray-600
                hover:text-orange-500 transition-colors"
            >
              <span>{c.label}</span>
              <ExternalLink size={10} className="text-gray-300" />
            </a>
          ))}
        </div>
      )}

      {socialLinks.length === 0 && codingLinks.length === 0 && !profile.location && (
        <button
          onClick={onEditClick}
          className="w-full text-center text-[12px] text-orange-500 hover:text-orange-600 transition-colors"
        >
          + Add your links and info
        </button>
      )}
    </div>
  )
}
