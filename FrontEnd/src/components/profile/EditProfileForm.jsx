import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Loader2, Check } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { saveUserProfile, selectProfile, selectProfileSaving } from '../../store/slices/profileSlice'
import toast from 'react-hot-toast'

function SectionCard({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden mb-4">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <h3 className="text-[13px] font-bold text-black uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text', disabled = false }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-[13px]
        text-black placeholder-gray-400 outline-none
        focus:border-orange-400 focus:ring-2 focus:ring-orange-100
        disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
        transition-all"
    />
  )
}

function SaveBtn({ saving, saved, onClick, label = 'Save Changes' }) {
  return (
    <div className="flex justify-end mt-4">
      <button
        onClick={onClick}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold
          bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-all"
      >
        {saving
          ? <><Loader2 size={13} className="animate-spin" /> Saving...</>
          : saved
          ? <><Check size={13} className="text-green-400" /> Saved!</>
          : <><Save size={13} /> {label}</>
        }
      </button>
    </div>
  )
}

export default function EditProfileForm() {
  const dispatch = useAppDispatch()
  const profile  = useAppSelector(selectProfile)
  const saving   = useAppSelector(selectProfileSaving)

  const [location,  setLocation]  = useState('')
  const [education, setEducation] = useState('')
  const [gradYear,  setGradYear]  = useState('')
  const [mobile,    setMobile]    = useState('')

  const [github,   setGithub]   = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [twitter,  setTwitter]  = useState('')
  const [resume,   setResume]   = useState('')

  const [leetcode,   setLeetcode]   = useState('')
  const [codeforces, setCodeforces] = useState('')
  const [gfg,        setGfg]        = useState('')
  const [hackerrank, setHackerrank] = useState('')

  const [savedBasic,  setSavedBasic]  = useState(false)
  const [savedSocial, setSavedSocial] = useState(false)
  const [savedCoding, setSavedCoding] = useState(false)

  useEffect(() => {
    if (!profile) return
    setLocation(profile.location   || '')
    setEducation(profile.education || '')
    setGradYear(profile.gradYear   || '')
    setMobile(profile.mobile       || '')
    setGithub(profile.github       || '')
    setLinkedin(profile.linkedin   || '')
    setTwitter(profile.twitter     || '')
    setResume(profile.resume       || '')
    setLeetcode(profile.leetcode   || '')
    setCodeforces(profile.codeforces || '')
    setGfg(profile.gfg             || '')
    setHackerrank(profile.hackerrank || '')
  }, [profile])

  const currentProfile = () => ({
    location, education, gradYear, mobile,
    github, linkedin, twitter, resume,
    leetcode, codeforces, gfg, hackerrank,
  })

  const handleSave = async (setSaved) => {
    const result = await dispatch(saveUserProfile(currentProfile()))
    if (saveUserProfile.fulfilled.match(result)) {
      toast.success('Profile saved!')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      toast.error(result.payload || 'Failed to save')
    }
  }

  const GRAD_YEARS = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.3 }}
    >
      <SectionCard title="Basic Information">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Location">
            <TextInput value={location}  onChange={setLocation}  placeholder="City, Country" />
          </Field>
          <Field label="Mobile">
            <TextInput value={mobile}    onChange={setMobile}    placeholder="+91 99999 99999" type="tel" />
          </Field>
          <Field label="Education">
            <TextInput value={education} onChange={setEducation} placeholder="University / College" />
          </Field>
          <Field label="Graduation Year">
            <select
              value={gradYear}
              onChange={e => setGradYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white
                text-[13px] text-black outline-none focus:border-orange-400
                focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer"
            >
              <option value="">Select year</option>
              {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
        </div>
        <SaveBtn saving={saving} saved={savedBasic} onClick={() => handleSave(setSavedBasic)} />
      </SectionCard>

      <SectionCard title="Social Links">
        <div className="grid grid-cols-2 gap-4">
          <Field label="GitHub">
            <TextInput value={github}   onChange={setGithub}   placeholder="https://github.com/username" />
          </Field>
          <Field label="LinkedIn">
            <TextInput value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/username" />
          </Field>
          <Field label="X / Twitter">
            <TextInput value={twitter}  onChange={setTwitter}  placeholder="https://twitter.com/username" />
          </Field>
          <Field label="Resume URL">
            <TextInput value={resume}   onChange={setResume}   placeholder="https://drive.google.com/..." />
          </Field>
        </div>
        <SaveBtn saving={saving} saved={savedSocial} onClick={() => handleSave(setSavedSocial)} />
      </SectionCard>

      <SectionCard title="Coding Profiles">
        <div className="grid grid-cols-2 gap-4">
          <Field label="LeetCode">
            <TextInput value={leetcode}   onChange={setLeetcode}   placeholder="https://leetcode.com/username" />
          </Field>
          <Field label="HackerRank">
            <TextInput value={hackerrank} onChange={setHackerrank} placeholder="https://hackerrank.com/username" />
          </Field>
          <Field label="Codeforces">
            <TextInput value={codeforces} onChange={setCodeforces} placeholder="https://codeforces.com/profile/username" />
          </Field>
          <Field label="GeeksForGeeks">
            <TextInput value={gfg}        onChange={setGfg}        placeholder="https://auth.geeksforgeeks.org/user/username" />
          </Field>
        </div>
        <SaveBtn saving={saving} saved={savedCoding} onClick={() => handleSave(setSavedCoding)} />
      </SectionCard>
    </motion.div>
  )
}
