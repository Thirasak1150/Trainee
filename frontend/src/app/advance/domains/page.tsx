'use client'
import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useUser } from '@/app/Usercontext';

interface Domain {
    domains_id: string;
    domain_name: string;
    enable: boolean;
}

const DomainsPage = () => {
    const {user_uuid} = useUser()
    const [domains, setDomains] = useState<Domain[]>([]);
    const [allDomains, setAllDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [newDomain, setNewDomain] = useState({ domain_name: '', enable: true });
    const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
   
    const api = axios.create({
        baseURL: 'http://localhost:8000',
    });

    const fetchDomains = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/domain/');
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
            setDomains(allDomains.filter(domain => domain.domain_name.toLowerCase().includes(value)));
        }
    }, [searchTerm, allDomains]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingDomain) {
            await handleEditDomain();
        } else {
            await handleAddDomain();
        }
    };

    const handleAddDomain = async () => {
        if (!newDomain.domain_name) {
            toast.error('Domain name is required.');
            return;
        }
        try {
            await api.post('/api/domain/', { ...newDomain, created_by: user_uuid });
            toast.success("Domain added successfully");
            fetchDomains();
            setOpenDialog(false);
            setNewDomain({ domain_name: '', enable: true });
        } catch (err) {
            const error = err as AxiosError<{ detail: string | { loc: string[]; msg: string }[] }>;
            const detail = error.response?.data?.detail;
            let errorMessage = 'Failed to add domain.';
            if (typeof detail === 'string') {
                errorMessage = detail;
            } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
                errorMessage = detail.map(d => `${d.loc.join('.')} - ${d.msg}`).join('; ');
            }
            toast.error(errorMessage);
        }
    };

    const handleEditDomain = async () => {
        if (!editingDomain) return;
        try {
            await api.put(`/api/domain/${editingDomain.domains_id}`, {
                domain_name: editingDomain.domain_name,
                enable: editingDomain.enable,
                updated_by: user_uuid,
            });
            toast.success("Domain updated successfully");
            fetchDomains();
            setOpenDialog(false);
            setEditingDomain(null);
        } catch (err) {
            const error = err as AxiosError<{ detail: string | { loc: string[]; msg: string }[] }>;
            const detail = error.response?.data?.detail;
            let errorMessage = 'Failed to update domain.';
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
            await api.delete(`/api/domain/${domainId}`);
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
                <div className="text-red-500 text-center">
                    <p className="text-xl mb-2">Error</p>
                    <p>{error}</p>
                    <Button variant="outline" className="mt-4" onClick={fetchDomains}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-2 sm:px-4 lg:px-6 max-w-full sm:max-w-7xl">
            <Card className="mb-6 shadow-md md:mx-0 mx-4">
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-center">Domain Management</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                    <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
                        <div className="flex-1 md:flex-none">
                            <Label htmlFor="search" className="sr-only">Search Domains</Label>
                            <Input
                                id="search"
                                placeholder="Search domains..."
                                className="w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Dialog open={openDialog} onOpenChange={(isOpen) => {
                            setOpenDialog(isOpen);
                            if (!isOpen) {
                                setEditingDomain(null);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="flex-shrink-0" onClick={() => setNewDomain({ domain_name: '', enable: true })}>Add Domain</Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95%] sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>{editingDomain ? "Edit Domain" : "Add New Domain"}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
                                    <div>
                                        <Label htmlFor="domain_name">Domain Name</Label>
                                        <Input
                                            id="domain_name"
                                            value={editingDomain ? editingDomain.domain_name : newDomain.domain_name}
                                            onChange={(e) => editingDomain ? setEditingDomain({ ...editingDomain, domain_name: e.target.value }) : setNewDomain({ ...newDomain, domain_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <Label htmlFor="domain_enabled">Status</Label>
                                      <Switch
                                        id="domain_enabled"
                                        checked={editingDomain ? editingDomain.enable : newDomain.enable}
                                        onCheckedChange={(checked) => editingDomain ? setEditingDomain({ ...editingDomain, enable: checked }) : setNewDomain({ ...newDomain, enable: checked })}
                                      />
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit">{editingDomain ? "Update Domain" : "Add Domain"}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-md md:mx-0 mx-4">
                <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl font-semibold">Domains List</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                    {domains.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                            No domains found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Domain Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {domains.map((domain) => (
                                        <TableRow key={domain.domains_id}>
                                            <TableCell className="font-medium">{domain.domain_name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-3 w-3 rounded-full ${domain.enable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    <span>{domain.enable ? 'Enabled' : 'Disabled'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="hover:text-yellow-400" onClick={() => {
                                                    setEditingDomain(domain);
                                                    setOpenDialog(true);
                                                }}>
                                                    <PenBox className="h-4 w-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="w-[95%] sm:max-w-sm">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the domain
                                                                <span className='font-bold'> &quot;{domain.domain_name}&quot; </span>.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteDomain(domain.domains_id)}>Continue</AlertDialogAction>
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
        </div>
    );
};

export default DomainsPage;