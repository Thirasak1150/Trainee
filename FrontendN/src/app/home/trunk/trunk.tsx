'use client'

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const TrunkPage = () => {
  const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
  const domainId = useSelector((state: any) => state.user.domains_id);
  const [trunks, setTrunks] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
    const [selectedTrunk, setSelectedTrunk] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [trunkToDelete, setTrunkToDelete] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    transport: 'UDP',
    host: '',
    port: 5060,
    username: '',
    password: '',
    auth_username: '',
    register_trunk: false,
    trunk_type: 'Register',
    is_active: true,
    description: '',
  });

  const fetchTrunks = async () => {
    if (!domainId) return;
    try {
      const res = await axios.get(`${API_URL}/api/trunk/domain/${domainId}`);
      setTrunks(res.data);
    } catch (error) {
      console.error('Failed to fetch trunks', error);
      setTrunks([]); // Reset to empty array on error
    }
  };

  useEffect(() => {
    fetchTrunks();
  }, [domainId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSelectChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddDialog = () => {
    setIsEditMode(false);
    setSelectedTrunk(null);
    setFormData({
      name: '',
      transport: 'UDP',
      host: '',
      port: 5060,
      username: '',
      password: '',
      auth_username: '',
      register_trunk: false,
      trunk_type: 'Register',
      is_active: true,
      description: '',
    });
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (trunk: any) => {
    setIsEditMode(true);
    setSelectedTrunk(trunk);
    setFormData({
        ...trunk,
        port: trunk.port || 5060,
    });
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (trunk: any) => {
    setTrunkToDelete(trunk);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!trunkToDelete) return;
    try {
      await axios.delete(`${API_URL}/api/trunk/${trunkToDelete.trunk_id}`);
      toast.success(`Trunk "${trunkToDelete.name}" deleted successfully`);
      fetchTrunks();
    } catch (error) {
      console.error('Failed to delete trunk', error);
      toast.error('Failed to delete trunk');
    } finally {
      setIsDeleteDialogOpen(false);
      setTrunkToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = {
        ...formData,
        domain_id: domainId,
        port: Number(formData.port)
    }

    try {
      if (isEditMode && selectedTrunk) {
        await axios.put(`${API_URL}/api/trunk/${selectedTrunk.trunk_id}`, dataToSend);
        toast.success('Trunk updated successfully');
      } else {
        await axios.post(`${API_URL}/api/trunk/`, dataToSend);
        toast.success('Trunk created successfully');
      }
      fetchTrunks();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save trunk', error);
      toast.error('Failed to save trunk');
    }
  };



  return (
    <motion.div initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }} className="container mx-auto p-4 space-y-6">
        <div className="container mx-auto py-6 px-2 sm:px-4 lg:px-6 max-w-full sm:max-w-6xl">
        <Card>
            <CardHeader className="flex flex-row items-center  justify-between">
                <CardTitle>Trunk Management</CardTitle>
                <Button onClick={openAddDialog} className="flex items-center gap-2">
                    <PlusCircle size={20} />
                    Add Trunk
                </Button>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="hidden sm:table-header-group">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Host</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {trunks.map((trunk) => (
                                <TableRow key={trunk.trunk_id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted flex flex-col sm:table-row py-3 sm:py-0">
                                    <TableCell className="font-medium sm:table-cell flex items-center gap-2">
                                        <span className="sm:hidden font-bold">Name:</span>
                                        {trunk.name}
                                    </TableCell>
                                    <TableCell className="sm:table-cell flex items-center gap-2">
                                        <span className="sm:hidden font-bold">Type:</span>
                                        {trunk.trunk_type}
                                    </TableCell>
                                    <TableCell className="sm:table-cell flex items-center gap-2">
                                        <span className="sm:hidden font-bold">Host:</span>
                                        {trunk.host}
                                    </TableCell>
                                    <TableCell className="sm:table-cell flex items-center gap-2">
                                        <span className="sm:hidden font-bold">Status:</span>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2.5 w-2.5 rounded-full ${trunk.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span>{trunk.is_active ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right sm:table-cell">
                                        <div className="flex gap-2 justify-end mt-2 sm:mt-0">
                                            <Button variant="default" size="icon" className="hover:text-yellow-400" onClick={() => openEditDialog(trunk)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="destructive" size="icon" className="text-red-500 hover:text-red-700" onClick={() => openDeleteDialog(trunk)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Trunk' : 'Add New Trunk'}</DialogTitle>
                        <DialogDescription>Fill in the details for your trunk.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" placeholder="Trunk Name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="host">Hostname/IP</Label>
                            <Input id="host" name="host" placeholder="Hostname/IP" value={formData.host} onChange={handleInputChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="port">Port</Label>
                            <Input id="port" name="port" type="number" placeholder="Port" value={formData.port} onChange={handleInputChange} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="trunk_type">Trunk Type</Label>
                            <Select name="trunk_type" value={formData.trunk_type} onValueChange={(value) => handleSelectChange('trunk_type', value)}>
                                <SelectTrigger><SelectValue placeholder="Select Trunk Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Register">Register</SelectItem>
                                    <SelectItem value="PEER">PEER</SelectItem>
                                    <SelectItem value="ACCOUNT">ACCOUNT</SelectItem>
                                    <SelectItem value="WEBRTC">WEBRTC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="transport">Transport</Label>
                            <Select name="transport" value={formData.transport} onValueChange={(value) => handleSelectChange('transport', value)}>
                                <SelectTrigger><SelectValue placeholder="Select Transport" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UDP">UDP</SelectItem>
                                    <SelectItem value="TCP">TCP</SelectItem>
                                    <SelectItem value="TLS">TLS</SelectItem>
                                    <SelectItem value="WS">WS</SelectItem>
                                    <SelectItem value="WSS">WSS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="is_active">Status</Label>
                            <Select name="is_active" value={String(formData.is_active)} onValueChange={(value) => handleSelectChange('is_active', value === 'true')}>
                                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input className="mt-1" id="username" name="username" placeholder="Username" value={formData.username || ''} onChange={handleInputChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative mt-1">
                                <Input 
                                    id="password" 
                                    name="password" 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder="Password" 
                                    value={formData.password || ''} 
                                    onChange={handleInputChange} 
                                />
                                <div className='absolute inset-y-0 -right-2.5 flex items-center pr-3 '>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className=" "
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                   
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                
                                </div>
                            
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="auth_username">Auth Username</Label>
                            <Input id="auth_username" name="auth_username" placeholder="Auth Username" value={formData.auth_username || ''} onChange={handleInputChange} />
                        </div>
                        <div className="flex items-center space-x-3 pt-6">
                            <Switch
                                id="register_trunk"
                                checked={formData.register_trunk}
                                onCheckedChange={(value) => handleSelectChange('register_trunk', value)}
                            />
                            <Label htmlFor="register_trunk">Requires Registration</Label>
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" placeholder="Description" value={formData.description || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">{isEditMode ? 'Save Changes' : 'Create'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the trunk
                        <strong> {trunkToDelete?.name}</strong>.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </div>
    </motion.div>
  );
};

export default TrunkPage;