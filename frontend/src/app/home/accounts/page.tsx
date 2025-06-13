'use client'
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import axios from 'axios'
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PenBox, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Account {
  users_id: string;
  username: string;
  email: string | null;
  roles: string;
  user_enabled: string;
  roles_id: string;
}

interface Role {
  roles_id: string;
  name: string;
  description: string | null;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  user_enabled: boolean;
  roles_id: string;
}

const AccountsPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    user_enabled: true,
    roles_id: ''
  })
  const [addFormData, setAddFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    user_enabled: true,
    roles_id: ''
  })
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null)

  useEffect(() => {
    fetchAccounts()
    fetchRoles()
  }, [])

  const fetchAccounts = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/api/users')
      console.log("data", data)
      if (data.error) {
        console.error('Error fetching accounts:', data.error)
        return
      }
      setAccounts(data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/api/roles')
      setRoles(data)
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Error fetching roles')
    }
  }

  const handleEdit = (account: Account) => {
    setEditingAccount(account)
    setFormData({
      username: account.username,
      email: account.email || '',
      password: '',
      user_enabled: String(account.user_enabled).toLowerCase() === 'true',
      roles_id: account.roles_id || ''
    })
    setOpenEditDialog(true)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingAccount) return

    try {
      const updateData = {
        ...formData,
        roles_id: formData.roles_id !== editingAccount.roles_id ? formData.roles_id : undefined,
        user_enabled: formData.user_enabled
      }
      console.log("updateData", updateData)
      const { data } = await axios.put(
        `http://localhost:8000/api/users/${editingAccount.users_id}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (data) {
        setOpenEditDialog(false)
        toast.success('Account updated successfully')
        fetchAccounts() // Refresh the list
      }
    } catch (error) {
      toast.error('Error updating account')
      console.error('Error updating account:', error)
    }
  }

  const handleAddInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setAddFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      console.log("addFormData", addFormData)
      const { data } = await axios.post(
        'http://localhost:8000/api/users',
        addFormData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (data) {
        setOpenDialog(false)
        toast.success('Account created successfully')
        fetchAccounts() // Refresh the list
        // Reset form
        setAddFormData({
          username: '',
          email: '',
          password: '',
          user_enabled: true,
          roles_id: ''
        })
      }
    } catch (error) {
      console.error('Error creating account:', error)
      toast.error('Error creating account')
    }
  }

  const handleDelete = async () => {
    if (!deletingAccount) return

    try {
      const { data } = await axios.delete(`http://localhost:8000/api/users/${deletingAccount.users_id}`)
      
      if (data) {
        toast.success('Account deleted successfully')
        fetchAccounts() // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Error deleting account')
    } finally {
      setDeletingAccount(null)
    }
  }

  const filteredAccounts = accounts.filter(account => 
    account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.email && account.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 lg:px-6 max-w-full sm:max-w-7xl">
      <Card className="mb-6 shadow-md md:mx-0 mx-4">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Account Management</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
            <div className="flex-1 md:flex-none">
              <Label htmlFor="search" className="sr-only">Search Accounts</Label>
              <Input 
                id="search"
                placeholder="Search accounts..."
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-shrink-0">Add Account</Button>
              </DialogTrigger>
              <DialogContent className={`w-[95%] sm:w-[500px]`}>
                <DialogHeader className="border-b pb-3">
                  <DialogTitle className="text-xl font-bold">Add New Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubmit} className="space-y-5 pt-5">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="username" className="font-semibold">Username</Label>
                        <Input 
                          id="username" 
                          name="username"
                          className="mt-1"
                          value={addFormData.username}
                          onChange={handleAddInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="font-semibold">Email</Label>
                        <Input 
                          id="email" 
                          name="email"
                          className="mt-1"
                          value={addFormData.email}
                          onChange={handleAddInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="role" className="font-semibold">Role</Label>
                      <Select
                        value={addFormData.roles_id}
                        onValueChange={(value) => setAddFormData(prev => ({ ...prev, roles_id: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.roles_id} value={role.roles_id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg border">
                      <Label htmlFor="enabled" className="font-semibold">Enabled</Label>
                      <Switch 
                        id="enabled"
                        name="user_enabled"
                        checked={addFormData.user_enabled}
                        onCheckedChange={(checked) => setAddFormData(prev => ({ ...prev, user_enabled: checked }))}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="font-semibold">Password</Label>
                      <Input 
                        id="password" 
                        name="password"
                        type="password"
                        className="mt-2"
                        value={addFormData.password}
                        onChange={handleAddInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button type="button" variant="outline" size="sm" onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700">Add</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md md:mx-0 mx-4 backdrop-blur-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl font-semibold">Accounts List</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              Loading...
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              No accounts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="hidden sm:table-header-group">
                  <TableRow>
                    <TableHead className="w-[150px] sm:w-[200px]">Username</TableHead>
                    <TableHead className="w-[200px] sm:w-[250px]">Email</TableHead>
                    <TableHead className="w-[100px] sm:w-[150px]">Role</TableHead>
                    <TableHead className="w-[100px] sm:w-[150px]">Status</TableHead>
                    <TableHead className="w-[80px] sm:w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.users_id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted flex flex-col sm:table-row py-3 sm:py-0">
                      <TableCell className="font-medium sm:table-cell flex items-center gap-2">
                        <span className="sm:hidden font-bold">Username:</span>
                        {account.username}
                      </TableCell>
                      <TableCell className="font-medium sm:table-cell flex items-center gap-2">
                        <span className="sm:hidden font-bold">Email:</span>
                        {account.email || '-'}
                      </TableCell>
                      <TableCell className="font-medium sm:table-cell flex items-center gap-2">
                        <span className="sm:hidden font-bold">Role:</span>
                        {account.roles}
                      </TableCell>
                      <TableCell 
                      className="sm:table-cell flex items-center gap-2">
                        <span className="sm:hidden font-bold">Status:</span>
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${String(account.user_enabled).toLowerCase() === 'true' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>{String(account.user_enabled).toLowerCase() === 'true' ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className=" hover:text-yellow-400"  onClick={() => handleEdit(account)}>
                            <PenBox className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeletingAccount(account)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-[95%] sm:max-w-sm">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the account
                                        <span className='font-bold'> &quot;{account.username}&quot; </span>.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeletingAccount(null)}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className={`w-[95%] sm:w-[500px]`}>
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-xl font-bold">Edit Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 pt-5">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="username" className="font-semibold">Username</Label>
                  <Input 
                    id="username" 
                    name="username"
                    className="mt-1"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="font-semibold">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    className="mt-1"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="role" className="font-semibold">Role</Label>
                <Select
                  value={formData.roles_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, roles_id: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.roles_id} value={role.roles_id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg border">
                <Label htmlFor="enabled" className="font-semibold">Enabled</Label>
                <Switch 
                  id="enabled"
                  name="user_enabled"
                  checked={formData.user_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, user_enabled: checked }))}
                  className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                />
              </div>
              <div>
                <Label htmlFor="password" className="font-semibold">New Password (leave blank to keep current)</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password"
                  className="mt-2"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AccountsPage