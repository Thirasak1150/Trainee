import { CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { KeyRound, Lock, Mail, User, UserCircle } from 'lucide-react'
import React from 'react'
import { profileData } from '../types/Profile.type'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const FormaccountSetting = ({formData, handleInputChange, handleSubmit, isDirty}: 
    {formData: profileData, handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void, handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void, isDirty: boolean}) => {
  return (
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
  )
}

export default FormaccountSetting