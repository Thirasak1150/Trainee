"use client"
import { useUser } from '@/app/Usercontext'
import React, { useEffect, useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import './style.css'
import { profileData } from '@/features/account-setting/types/Profile.type'

import LoadingaccountSetting from '@/features/account-setting/components/loadingaccount-setting'
import FormaccountSetting from '@/features/account-setting/components/FormaccountSetting'
import { updateUserProfile } from '@/features/account-setting/services/UpdateUserProfile'
import { fetchUserProfile } from '@/features/account-setting/services/fetchUserProfile'

const AccountSetting = () => {
  const { user_uuid } = useUser()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<profileData>({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirm_password: ''
  })
  const [initialData, setInitialData] = useState<profileData>({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirm_password: ''
  })
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (user_uuid) {
      const fetchData = async () => {
        const data: profileData = await fetchUserProfile(user_uuid)
        setInitialData(data)
        setFormData(data)
        setLoading(false)
      }
      fetchData()
    }
  }, [user_uuid])

  useEffect(() => {
    if (initialData.username) {
      const fieldsDirty =
        formData.full_name !== initialData.full_name ||
        formData.email !== initialData.email

      const passwordDirty = formData.password !== '' && formData.password === formData.confirm_password

      setIsDirty(fieldsDirty || passwordDirty)
    }
  }, [formData, initialData])



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateUserProfile(user_uuid || '', formData,setFormData,setInitialData)
    
  }

  if (loading) {
    return (
      <LoadingaccountSetting/>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-start px-6 lg:px-0 h-full pt-10 overflow-hidden"
    >
      <Card className="w-full lg:max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle  className="text-2xl font-bold text-foreground">Account Settings</CardTitle>
          <CardDescription>Update your profile information.</CardDescription>
        </CardHeader>
   <FormaccountSetting formData={formData} handleInputChange={handleInputChange} handleSubmit={handleSubmit} isDirty={isDirty} />
      </Card>
    </motion.div>
  )
}

export default AccountSetting