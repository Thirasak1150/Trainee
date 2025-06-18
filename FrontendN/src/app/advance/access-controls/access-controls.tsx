import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, PenBox } from "lucide-react";
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
import { motion } from 'framer-motion';

interface Role {
    roles_id: string;
    name: string;
    description: string;
}

const AccessControlsPage = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '' });
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [searchTerm, setSearchTerm] = useState("");


    const api = axios.create({
        baseURL: 'http://192.168.1.126:8000',
    });

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/roles/');
            if (Array.isArray(response.data)) {
                setAllRoles(response.data);
                setRoles(response.data);
            } else {
                setAllRoles([]);
                setRoles([]);
            }
            setError(null);
        } catch (err) {
            const error = err as AxiosError<{ detail: string }>;
            const errorMessage = error.response?.data?.detail || 'An unexpected error occurred.';
            setError(errorMessage);
            setAllRoles([]);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        if (searchTerm === "") {
          setRoles(allRoles);
        } else {
          const value = searchTerm.toLowerCase();
          setRoles(
            allRoles.filter(
              role =>
                role.name.toLowerCase().includes(value) ||
                (role.description && role.description.toLowerCase().includes(value))
            )
          );
        }
    }, [searchTerm, allRoles]);


    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRole) {
            await handleEditRole();
        } else {
            await handleAddRole();
        }
    };

    const handleAddRole = async () => {
        if (!newRole.name) {
            toast.error('Role name is required.');
            return;
        }
        try {
            await api.post('/api/roles/', newRole);
            toast.success("Role added successfully");
            fetchRoles();
            setOpenDialog(false);
            setNewRole({ name: '', description: '' });
        } catch (err) {
            const error = err as AxiosError<{ detail: string }>;
            const errorMessage = error.response?.data?.detail || 'Failed to add role.';
            toast.error(errorMessage);
        }
    };

    const handleEditRole = async () => {
        if (!editingRole) return;
        try {
            await api.put(`/api/roles/${editingRole.roles_id}`, {
                name: editingRole.name,
                description: editingRole.description,
            });
            toast.success("Role updated successfully");
            fetchRoles();
            setOpenDialog(false);
            setEditingRole(null);
        } catch (err) {
            const error = err as AxiosError<{ detail: string }>;
            const errorMessage = error.response?.data?.detail || 'Failed to update role.';
            toast.error(errorMessage);
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        try {
            await api.delete(`/api/roles/${roleId}`);
            toast.success("Role deleted successfully");
            fetchRoles();
        } catch (err) {
            const error = err as AxiosError<{ detail: string }>;
            const errorMessage = error.response?.data?.detail || 'Failed to delete role.';
            toast.error(errorMessage);
        }
    };

    if (loading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl text-gray-600">Loading roles...</div>
          </div>
        );
    }

    if (error) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-red-500 text-center">
              <p className="text-xl mb-2">Error</p>
              <p>{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fetchRoles()}
              >
                Retry
              </Button>
            </div>
          </div>
        );
    }


    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto py-6 px-2 sm:px-4 lg:px-6 max-w-full sm:max-w-7xl">
             <Card className="mb-6 shadow-md md:mx-0 mx-4">
                 <CardHeader className="px-4 sm:px-6">
                     <CardTitle className="text-xl sm:text-2xl font-bold text-center">Access Control Management</CardTitle>
                 </CardHeader>
                 <CardContent className="px-4 sm:px-6">
                     <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
                         <div className="flex-1 md:flex-none">
                             <Label htmlFor="search" className="sr-only">Search Roles</Label>
                             <Input
                                 id="search"
                                 placeholder="Search roles..."
                                 className="w-full"
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                             />
                         </div>
                         <Dialog open={openDialog} onOpenChange={(isOpen) => {
                                setOpenDialog(isOpen);
                                if (!isOpen) {
                                    setEditingRole(null);
                                }
                            }}>
                             <DialogTrigger asChild>
                                 <Button size="sm" className="flex-shrink-0" onClick={() => setNewRole({ name: '', description: '' })}>Add Role</Button>
                             </DialogTrigger>
                             <DialogContent className="w-[95%] sm:max-w-md">
                                 <DialogHeader>
                                     <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
                                 </DialogHeader>
                                 <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
                                     <div>
                                         <Label htmlFor="role_name">Role Name</Label>
                                         <Input
                                             id="role_name"
                                             value={editingRole ? editingRole.name : newRole.name}
                                             onChange={(e) => editingRole ? setEditingRole({ ...editingRole, name: e.target.value }) : setNewRole({ ...newRole, name: e.target.value })}
                                             required
                                         />
                                     </div>
                                     <div className="">
                                         <Label className="mb-3" htmlFor="role_description">Description</Label>
                                         <Input
                                             id="role_description"
                                             value={editingRole ? editingRole.description : newRole.description}
                                             onChange={(e) => editingRole ? setEditingRole({ ...editingRole, description: e.target.value }) : setNewRole({ ...newRole, description: e.target.value })}
                                         />
                                     </div>
                                      <DialogFooter>
                                         <DialogClose asChild>
                                            <Button type="button" variant="outline">Cancel</Button>
                                         </DialogClose>
                                         <Button type="submit">{editingRole ? "Update Role" : "Add Role"}</Button>
                                     </DialogFooter>
                                 </form>
                             </DialogContent>
                         </Dialog>
                     </div>
                 </CardContent>
             </Card>

             <Card className="shadow-md md:mx-0 mx-4">
                 <CardHeader className="px-4 sm:px-6">
                     <CardTitle className="text-lg sm:text-xl font-semibold">Roles List</CardTitle>
                 </CardHeader>
                 <CardContent className="px-4 sm:px-6">
                     {roles.length === 0 ? (
                         <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                             No roles found.
                         </div>
                     ) : (
                         <div className="overflow-x-auto">
                             <Table>
                                 <TableHeader>
                                     <TableRow>
                                         <TableHead>Name</TableHead>
                                         <TableHead>Description</TableHead>
                                         <TableHead className="text-right">Actions</TableHead>
                                     </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                     {roles.map((role) => (
                                         <TableRow key={role.roles_id}>
                                             <TableCell className="font-medium">{role.name}</TableCell>
                                             <TableCell>{role.description || '-'}</TableCell>
                                             <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                <Button variant="default" size="icon" className=" hover:text-yellow-400" onClick={() => {
                                                    setEditingRole(role);
                                                    setOpenDialog(true);
                                                }}>
                                                    <PenBox className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                  <AlertDialogTrigger asChild>
                                                     <Button variant="destructive" size="icon" className="text-red-500 hover:text-red-700">
                                                          <Trash2 className="h-4 w-4" />
                                                      </Button>
                                                  </AlertDialogTrigger>
                                                  <AlertDialogContent className="w-[95%] sm:max-w-sm">
                                                    <AlertDialogHeader>
                                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                      <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the role
                                                         <span className='font-bold'> &quot;{role.name}&quot; </span>.
                                                      </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                      <AlertDialogAction onClick={() => handleDeleteRole(role.roles_id)}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                  </AlertDialogContent>
                                                </AlertDialog>
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
         </div>
      </motion.div>
    );
};

export default AccessControlsPage;