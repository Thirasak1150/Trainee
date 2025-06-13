"use client"
import { useUser } from '@/app/Usercontext'
import React, { useEffect, useState } from 'react'
import { toast } from "sonner"
import { User, Mail, UserCircle, Lock, KeyRound } from 'lucide-react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Separator } from '@/components/ui/separator'
import './style.css'
const AccountSetting = () => {
  const { user_uuid } = useUser()
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirm_password: ''
  })
  const [initialData, setInitialData] = useState({
    username: '',
    email: '',
    full_name: '',
  })
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (user_uuid) {
      fetchUserProfile()
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

  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get(`http://localhost:8000/api/users/${user_uuid}`)
      const profileData = {
        username: data.username,
        email: data.email || '',
        full_name: data.full_name || '',
      }
      setFormData({
        ...profileData,
        password: '',
        confirm_password: ''
      })
      setInitialData(profileData)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (formData.password && formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    try {
       // Create an object with only the fields we want to update
       const updatePayload: {
        username: string;
        email: string;
        full_name: string;
        password?: string;
      } = {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name,
      };

      if (formData.password) {
        updatePayload.password = formData.password;
      }

      const { data } = await axios.put(
        `http://localhost:8000/api/users/${user_uuid}`,
        updatePayload
      )

      if (data) {
        toast.success('Profile updated successfully')
        const newInitialData = {
          username: formData.username,
          email: formData.email,
          full_name: formData.full_name,
        }
        setInitialData(newInitialData)
        setFormData(prev => ({
          ...prev,
          password: '',
          confirm_password: ''
        }))
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full overflow-hidden">
        <div className="w-full max-w-2xl p-4">
          <Card>
            <CardHeader>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3 animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-2/3 animate-pulse mt-2"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4 animate-pulse"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-full animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4 animate-pulse"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-full animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4 animate-pulse"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-full animate-pulse"></div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md w-32 animate-pulse"></div>
            </CardFooter>
          </Card>
        </div>
      </div>
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
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-semibold flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                  Full Name
                </label>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Username
                </label>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Your username"
                  required
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your email address"
                required
              />
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  New Password
                </label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div className="space-y-2">
                <label className="font-semibold flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  Confirm New Password
                </label>
                <Input
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" size="lg" className="ml-auto" disabled={!isDirty}>Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}

export default AccountSetting