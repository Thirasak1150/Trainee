import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, PenBox, PlusCircle, UserCheck } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { motion } from 'framer-motion';
import "./style.css";
import type { RootState } from '@/Store/store';
import { useSelector } from 'react-redux';

interface User {
    username: string;
}

interface Domain {
    domains_id: string;
    domain_name: string;
    enable: boolean;
    manager_id?: string | null;
    manager?: User | null;
    creator?: User | null;
}

const DomainsPage = () => {
    const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
    const { user_uuid } = useSelector((state: RootState) => state.user);

    const [domains, setDomains] = useState<Domain[]>([]);
    const [allDomains, setAllDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    
    const [newDomain, setNewDomain] = useState({ domain_name: '', enable: true });
    const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
    
    const [managerUsername, setManagerUsername] = useState('');
    const [managerId, setManagerId] = useState<string | null>(null);
    const [managerStatus, setManagerStatus] = useState({ message: '', type: '' });

    const [searchTerm, setSearchTerm] = useState("");

    const fetchDomains = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/domain/`);
            console.log("Domains:", response.data);
            if (Array.isArray(response.data)) {
                setAllDomains(response.data);
                setDomains(response.data);
            } else {
                setAllDomains([]);
                setDomains([]);
            }
            setError(null);
        } catch (err) {
            const error = err as AxiosError<{ detail: string | { loc: string[]; msg: string }[] }>;
            const detail = error.response?.data?.detail;
            let errorMessage = 'An unexpected error occurred.';
            if (typeof detail === 'string') {
                errorMessage = detail;
            } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
                errorMessage = detail.map(d => `${d.loc.join('.')} - ${d.msg}`).join('; ');
            } else if (error.message) {
                errorMessage = error.message;
            }
            setError(errorMessage);
            setAllDomains([]);
            setDomains([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    useEffect(() => {
        if (searchTerm === "") {
            setDomains(allDomains);
        } else {
            const value = searchTerm.toLowerCase();
            setDomains(allDomains.filter(domain => {
                const domainName = domain.domain_name.toLowerCase();
                const managerName = domain.manager?.username?.toLowerCase() || '';
                const creatorName = domain.creator?.username?.toLowerCase() || '';
                return domainName.includes(value) || managerName.includes(value) || creatorName.includes(value);
            }));
        }
    }, [searchTerm, allDomains]);

    const handleDialogClose = () => {
        setOpenDialog(false);
        setEditingDomain(null);
        setNewDomain({ domain_name: '', enable: true });
        setManagerUsername('');
        setManagerId(null);
        setManagerStatus({ message: '', type: '' });
    };

    const handleOpenAddDialog = () => {
        setEditingDomain(null);
        setNewDomain({ domain_name: '', enable: true });
        setManagerUsername('');
        setManagerId(null);
        setManagerStatus({ message: '', type: '' });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (domain: Domain) => {
        setEditingDomain(domain);
        setNewDomain({ domain_name: domain.domain_name, enable: domain.enable });
        setManagerUsername(domain.manager?.username || '');
        setManagerId(domain.manager_id || null);
        setManagerStatus({ message: '', type: '' });
        setOpenDialog(true);
    };

    const handleCheckUser = async () => {
        if (!managerUsername.trim()) {
            setManagerStatus({ message: 'Please enter a username.', type: 'error' });
            return;
        }
        try {
            const response = await axios.get(`${API_URL}/api/users/check/${managerUsername}`);
            if (response.data) {
                setManagerId(response.data.users_id);
                setManagerStatus({ message: `User "${response.data.username}" found.`, type: 'success' });
                toast.success('Manager found and linked.');
            }
        } catch (error) {
            setManagerId(null);
            setManagerStatus({ message: 'User not found.', type: 'error' });
            toast.error('Manager username not found.');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomain.domain_name) {
            toast.error('Domain name is required.');
            return;
        }

        const domainPayload = {
            domain_name: newDomain.domain_name,
            enable: newDomain.enable,
            manager_id: managerId,
        };

        try {
            if (editingDomain) {
                await axios.put(`${API_URL}/api/domain/${editingDomain.domains_id}`, { ...domainPayload, updated_by: user_uuid });
                toast.success("Domain updated successfully");
            } else {
                await axios.post(`${API_URL}/api/domain/`, { ...domainPayload, created_by: user_uuid });
                toast.success("Domain added successfully");
            }
            fetchDomains();
            handleDialogClose();
        } catch (err) {
            const error = err as AxiosError<{ detail: string | { loc: string[]; msg: string }[] }>;
            const detail = error.response?.data?.detail;
            let errorMessage = editingDomain ? 'Failed to update domain.' : 'Failed to add domain.';
            if (typeof detail === 'string') {
                errorMessage = detail;
            } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
                errorMessage = detail.map(d => `${d.loc.join('.')} - ${d.msg}`).join('; ');
            }
            toast.error(errorMessage);
        }
    };

    const handleDeleteDomain = async (domainId: string) => {
        try {
            await axios.delete(`${API_URL}/api/domain/${domainId}`);
            toast.success("Domain deleted successfully");
            fetchDomains();
        } catch (err) {
            const error = err as AxiosError<{ detail: string | { loc: string[]; msg: string }[] }>;
            const detail = error.response?.data?.detail;
            let errorMessage = 'Failed to delete domain.';
            if (typeof detail === 'string') {
                errorMessage = detail;
            } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
                errorMessage = detail.map(d => `${d.loc.join('.')} - ${d.msg}`).join('; ');
            }
            toast.error(errorMessage);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading domains...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="p-4 text-white min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                <Card className="">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Domains Management</CardTitle>
                        <Dialog open={openDialog} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
                            <DialogTrigger asChild>
                                <Button onClick={handleOpenAddDialog}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Domain
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] " onEscapeKeyDown={handleDialogClose}>
                                <form onSubmit={handleSave}>
                                    <DialogHeader>
                                        <DialogTitle>{editingDomain ? 'Edit Domain' : 'Add New Domain'}</DialogTitle>
                                        <DialogDescription>
                                            {editingDomain ? 'Make changes to your domain here.' : 'Create a new domain for your system.'}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                value={newDomain.domain_name}
                                                onChange={(e) => setNewDomain({ ...newDomain, domain_name: e.target.value })}
                                                className="bg-gray-700 border-gray-600"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 pt-2">
                                            <Switch
                                                id="enable"
                                                checked={newDomain.enable}
                                                onCheckedChange={(checked) => setNewDomain({ ...newDomain, enable: checked })}
                                            />
                                            <Label htmlFor="enable" className="text-sm text-muted-foreground">
                                                {newDomain.enable ? 'Enabled' : 'Disabled'}
                                            </Label>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="manager">Manager</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="manager"
                                                    value={managerUsername}
                                                    onChange={(e) => setManagerUsername(e.target.value)}
                                                    className="bg-gray-700 border-gray-600 flex-grow"
                                                    placeholder="Enter username"
                                                />
                                                <Button type="button" onClick={handleCheckUser} className="bg-indigo-600 hover:bg-indigo-700 text-xs p-2 h-auto shrink-0">
                                                    <UserCheck className="h-4 w-4 mr-1"/>
                                                    Check
                                                </Button>
                                            </div>
                                            {managerStatus.message && (
                                                <p className={`text-xs mt-1 ${managerStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {managerStatus.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={handleDialogClose}>Cancel</Button>
                                        <Button type="submit">Save changes</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-start mb-4">
                            <Input
                                placeholder="Search by domain, manager, or creator..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm bg-gray-700 border-gray-600"
                            />
                        </div>
                        {domains.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="hidden sm:table-header-group">
                                        <TableRow>
                                            <TableHead>Domain Name</TableHead>
                                            <TableHead>Manager</TableHead>
                                            <TableHead>Creator</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {domains.map((domain) => (
                                            <TableRow key={domain.domains_id} className="border-b transition-colors hover:bg-gray-800/50 data-[state=selected]:bg-gray-800 flex flex-col sm:table-row py-3 sm:py-0">
                                                <TableCell className="font-medium sm:table-cell flex items-center gap-2">
                                                    <span className="sm:hidden font-bold">Domain:</span>
                                                    {domain.domain_name}
                                                </TableCell>
                                                <TableCell className="sm:table-cell flex items-center gap-2">
                                                    <span className="sm:hidden font-bold">Manager:</span>
                                                    {domain.manager?.username || '-'}
                                                </TableCell>
                                                <TableCell className="sm:table-cell flex items-center gap-2">
                                                    <span className="sm:hidden font-bold">Creator:</span>
                                                    {domain.creator?.username || '-'}
                                                </TableCell>
                                                <TableCell className="sm:table-cell flex items-center gap-2">
                                                    <span className="sm:hidden font-bold">Status:</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-3 w-3 rounded-full ${domain.enable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        <span>{domain.enable ? 'Enabled' : 'Disabled'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="sm:table-cell text-right">
                                                    <div className="flex gap-2 justify-end mt-2 sm:mt-0">
                                                        <Button variant="default" size="icon" className="hover:text-yellow-400" onClick={() => handleOpenEditDialog(domain)}>
                                                            <PenBox className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="destructive" size="icon">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone. This will permanently delete the domain <span className='font-bold'>{`"${domain.domain_name}"`}</span>.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteDomain(domain.domains_id)}>Continue</AlertDialogAction>
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
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                No domains found.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default DomainsPage;