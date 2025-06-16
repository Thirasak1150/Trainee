import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { PenBox, Trash2 } from "lucide-react"
import { motion } from 'framer-motion';

import { fetchAccounts, fetchRoles } from '@/features/Accounts/service/fetchAccounts'
import { editAccount } from '@/features/Accounts/service/EditAcoounts'
import { deleteAccount } from '@/features/Accounts/service/DeleteAcoounts'
import { addAcount } from '@/features/Accounts/service/AddAcoounts'
import AddAccountDialog from '@/features/Accounts/components/AddAccountDialog'
import EditAccountDialog from '@/features/Accounts/components/EditAccountDialog'
import DeleteAccountDialog from '@/features/Accounts/components/DeleteAccountDialog'
import type { Account, Role } from '@/features/Accounts/types/Formdata'

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
    console.log("useEffect run", new Date().toISOString());
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log("fetchDataAccounts")
      const dataRoles = await fetchRoles()
      console.log("dataRoles", dataRoles)
      const dataAccounts = await fetchAccounts()
      console.log("dataAccounts", dataAccounts)
      setAccounts(Array.isArray(dataAccounts) ? dataAccounts : [])
      setLoading(false)

      setRoles(Array.isArray(dataRoles) ? dataRoles : [])
    } catch (error) {
      toast.error('Error fetching accounts')
    }
    setLoading(false)
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
    editAccount(editingAccount, formData, setOpenEditDialog, fetchData)
  }

  const handleAddSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    addAcount(addFormData, setOpenDialog, fetchData, setAddFormData)
  }

  const handleDelete = async () => {
    deleteAccount(deletingAccount!, fetchData, setDeletingAccount)
  }

  const filteredAccounts = accounts.filter(account =>
    account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.email && account.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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
              <AddAccountDialog
                open={openDialog}
                setOpen={setOpenDialog}
                formData={addFormData}
                setFormData={setAddFormData}
                roles={roles}
                onSubmit={handleAddSubmit}
              />
             
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
                          <div className="flex gap-2 justify-end">
                            <Button variant="default" size="icon" className="hover:text-yellow-400" onClick={() => handleEdit(account)}>
                              <PenBox className="h-4 w-4" />
                            </Button>
                            <DeleteAccountDialog
                              open={!!deletingAccount}
                              setOpen={setDeletingAccount}
                              account={deletingAccount}
                              onDelete={handleDelete}
                            />
                            <Button variant="destructive" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeletingAccount(account)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <EditAccountDialog
          open={openEditDialog}
          setOpen={setOpenEditDialog}
          formData={formData}
          setFormData={setFormData}
          roles={roles}
          onSubmit={handleSubmit}
        />
      </div>
    </motion.div>
  )
}

export default AccountsPage