"use client";

import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Trash2, Edit, PlusCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';

// Define types for our data
interface Domain {
    domains_id: string;
    domain_name: string;
    enable: boolean;
}

interface Extension {
    extension_id: string;
    extension_number: string;
    domain_id: string;
    is_active: boolean;
    description: string | null;
}

interface ExtensionError {
    detail: string;
}

const ExtensionsPage = () => {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<string>('');
    const [extensions, setExtensions] = useState<Extension[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currentExtension, setCurrentExtension] = useState<Extension | null>(null);
    const [newExtensionData, setNewExtensionData] = useState({
        extension_number: '',
        domain_id: '',
        voicemail_enabled: false,
        is_active: true,
        call_forwarding: null,
        description: '',
        user_id: null,
        start_range: '100',
        end_range: '',
    });
    const [domainSearchTerm, setDomainSearchTerm] = useState('');
    const filteredDomains = domains.filter(domain => 
        domain.enable && domain.domain_name.toLowerCase().includes(domainSearchTerm.toLowerCase())
    );

    // Fetch all domains
    const fetchDomains = async () => {
        try {
            const response = await axios.get('http://192.168.1.126:8000/api/domain/');
            console.log("Domains:", response.data);
            setDomains(response.data);
        } catch (error) {
            toast.error('Failed to fetch domains.');
            console.error(error);
        }
    };

    // Fetch extensions for the selected domain
    const fetchExtensions = async (domainId: string) => {
        if (!domainId) return;
        setLoading(true);
        try {
            const response = await axios.get(`http://192.168.1.126:8000/api/extensions/domain/${domainId}`);
            console.log("Extensions:", response.data);  
            setExtensions(response.data);
        } catch (error) {
            toast.error('Failed to fetch extensions for the selected domain.');
            console.error(error);
            setExtensions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    useEffect(() => {
        if (selectedDomain) {
            fetchExtensions(selectedDomain);
        }
    }, [selectedDomain]);

    const handleAddExtension = async () => {
        if (!newExtensionData.domain_id || (!newExtensionData.extension_number && !newExtensionData.end_range)) {
            toast.warning('Please fill all required fields.');
            return;
        }

        try {
            if (newExtensionData.end_range) {
                const start = parseInt(newExtensionData.start_range);
                const end = parseInt(newExtensionData.end_range);
                
                console.log('Creating extensions from', start, 'to', end);
                
                if (isNaN(start) || isNaN(end)) {
                    toast.error('Please enter valid numbers for the range');
                    return;
                }
                
                if (start >= end) {
                    toast.error('End range must be greater than start range');
                    return;
                }

                if (end - start > 100) {
                    toast.error('Maximum range is 100 extensions at a time');
                    return;
                }

                const existingNumbers = extensions.map(ext => ext.extension_number);
                const conflictingNumbers = [];
                for (let i = start; i <= end; i++) {
                    if (existingNumbers.includes(i.toString())) {
                        conflictingNumbers.push(i);
                    }
                }

                if (conflictingNumbers.length > 0) {
                    toast.error(`Extension numbers already exist: ${conflictingNumbers.join(', ')}`);
                    return;
                }

                const loadingToast = toast.loading(`Creating ${end - start + 1} extensions...`);

                let successCount = 0;
                const failedNumbers = [];

                for (let i = start; i <= end; i++) {
                    try {
                        const extensionData = {
                            extension_number: i.toString(),
                            domain_id: newExtensionData.domain_id,
                            voicemail_enabled: newExtensionData.voicemail_enabled,
                            is_active: newExtensionData.is_active,
                            call_forwarding: newExtensionData.call_forwarding,
                            description: newExtensionData.description ? `${newExtensionData.description} ${i}` : `Extension ${i}`,
                            user_id: newExtensionData.user_id
                        };
                        console.log('Creating extension:', extensionData);
                        
                        await axios.post('http://192.168.1.126:8000/api/extensions', extensionData);
                        successCount++;
                        console.log(`Successfully created extension ${i}`);
                    } catch (error) {
                        console.error(`Failed to create extension ${i}:`, error);
                        failedNumbers.push(i);
                    }
                }

                toast.dismiss(loadingToast);

                if (failedNumbers.length > 0) {
                    toast.error(`Failed to create extensions: ${failedNumbers.join(', ')}`);
                }
                
                if (successCount > 0) {
                    toast.success(`Successfully created ${successCount} extensions`);
                }

                console.log('Creation complete:', {
                    total: end - start + 1,
                    successes: successCount,
                    failures: failedNumbers.length
                });
            } else {
                if (extensions.some(ext => ext.extension_number === newExtensionData.extension_number)) {
                    toast.error(`Extension number ${newExtensionData.extension_number} already exists`);
                    return;
                }

                const loadingToast = toast.loading('Creating extension...');

                try {
                    const response = await axios.post('http://192.168.1.126:8000/api/extensions', {
                        extension_number: newExtensionData.extension_number,
                        domain_id: newExtensionData.domain_id,
                        voicemail_enabled: newExtensionData.voicemail_enabled,
                        is_active: newExtensionData.is_active,
                        call_forwarding: newExtensionData.call_forwarding,
                        description: newExtensionData.description,
                        user_id: newExtensionData.user_id
                    });
                    console.log('Single extension created:', response.data);
                    toast.dismiss(loadingToast);
                    toast.success('Extension added successfully!');
                } catch (error) {
                    toast.dismiss(loadingToast);
                    throw error;
                }
            }

            setAddDialogOpen(false);
            // Reset form
            setNewExtensionData({
                extension_number: '',
                domain_id: '',
                voicemail_enabled: false,
                is_active: true,
                call_forwarding: null,
                description: '',
                user_id: null,
                start_range: '100',
                end_range: '',
            });
           
            fetchExtensions(newExtensionData.domain_id);
            if (selectedDomain !== newExtensionData.domain_id) {
                setSelectedDomain(newExtensionData.domain_id);
            }
        } catch (error) {
            console.error('Error in handleAddExtension:', error);
            const axiosError = error as AxiosError<ExtensionError>;
            if (axiosError.response?.status === 409) {
                toast.error(`Extension number ${newExtensionData.extension_number} already exists in this domain. Please use a different number.`);
            } else {
                toast.error(axiosError.response?.data?.detail || 'Failed to add extension.');
            }
        }
    };

    const handleUpdateExtension = async () => {
        if (!currentExtension) return;
        console.log("currentExtension", currentExtension);
        try {
            await axios.put(`http://192.168.1.126:8000/api/extensions/${currentExtension.extension_id}`, {
                extension_number: currentExtension.extension_number,
                description: currentExtension.description,
                is_active: currentExtension.is_active,
            });
            toast.success('Extension updated successfully!');
            setEditDialogOpen(false);
            fetchExtensions(selectedDomain);
        } catch (error) {
            const axiosError = error as AxiosError<ExtensionError>;
            toast.error(axiosError.response?.data?.detail || 'Failed to update extension.');
        }
    };

    const handleDeleteExtension = async () => {
        if (!currentExtension) return;
        try {
            await axios.delete(`http://192.168.1.126:8000/api/extensions/${currentExtension.extension_id}`);
            toast.success('Extension deleted successfully!');
            setDeleteDialogOpen(false);
            fetchExtensions(selectedDomain);
        } catch (error) {
            const axiosError = error as AxiosError<ExtensionError>;
            toast.error(axiosError.response?.data?.detail || 'Failed to delete extension.');
        }
    };

    const openEditDialog = (extension: Extension) => {
        setCurrentExtension(extension);
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (extension: Extension) => {
        setCurrentExtension(extension);
        setDeleteDialogOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="    container mx-auto py-6 px-2 sm:px-4 lg:px-6 max-w-full sm:max-w-7xl">
                <Card className='bg-background/80 backdrop-blur-sm border-border/40 shadow-lg'>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Extension Management</CardTitle>
                            {selectedDomain && (
                                <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                                    setAddDialogOpen(open);
                                    if (open) {
                                        // Set the selected domain when opening the dialog
                                        setNewExtensionData({ ...newExtensionData, domain_id: selectedDomain });
                                    }
                                }}>
                                    <DialogTrigger asChild>
                                        <Button><PlusCircle className='mr-2 h-4 w-4' /> Add Extension</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl">Add New Extension</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-6 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="domain">Domain</Label>
                                                <div className="px-3 py-2 bg-muted rounded-md text-muted-foreground">
                                                    {domains.find(d => d.domains_id === selectedDomain)?.domain_name}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <Label>Extension Range</Label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="start-range" className="text-sm text-muted-foreground">Start</Label>
                                                        <Input 
                                                            id="start-range"
                                                            placeholder="e.g. 100"
                                                            value={newExtensionData.start_range}
                                                            onChange={(e) => setNewExtensionData({ 
                                                                ...newExtensionData, 
                                                                start_range: e.target.value,
                                                                extension_number: '' 
                                                            })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="end-range" className="text-sm text-muted-foreground">End</Label>
                                                        <Input 
                                                            id="end-range"
                                                            placeholder="e.g. 108"
                                                            value={newExtensionData.end_range}
                                                            onChange={(e) => setNewExtensionData({ 
                                                                ...newExtensionData, 
                                                                end_range: e.target.value,
                                                                extension_number: '' 
                                                            })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="single-extension">Single Extension</Label>
                                                <Input 
                                                    id="single-extension"
                                                    placeholder="Enter single extension number"
                                                    value={newExtensionData.extension_number} 
                                                    onChange={(e) => setNewExtensionData({ 
                                                        ...newExtensionData, 
                                                        extension_number: e.target.value,
                                                        start_range: '',
                                                        end_range: ''
                                                    })} 
                                                />
                                                {extensions.length > 0 && (
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        Current extensions: {extensions.map(ext => ext.extension_number).join(', ')}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Input 
                                                    id="description"
                                                    placeholder="Enter description"
                                                    value={newExtensionData.description} 
                                                    onChange={(e) => setNewExtensionData({ 
                                                        ...newExtensionData, 
                                                        description: e.target.value 
                                                    })} 
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleAddExtension} className="w-full">
                                                Save Extension{newExtensionData.end_range ? 's' : ''}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Domain Selection Table */}
                        <Card className="mb-6">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">Select Domain</CardTitle>
                                    <div className="w-64">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search domains..."
                                                value={domainSearchTerm}
                                                onChange={(e) => setDomainSearchTerm(e.target.value)}
                                                className="pl-8"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Domain Name</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDomains.map(domain => (
                                            <TableRow key={domain.domains_id}>
                                                <TableCell className="font-medium">{domain.domain_name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-3 w-3 rounded-full ${domain.enable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        <span>{domain.enable ? 'Enabled' : 'Disabled'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button 
                                                        variant={selectedDomain === domain.domains_id ? "default" : "outline"}
                                                        onClick={() => setSelectedDomain(domain.domains_id)}
                                                    >
                                                        {selectedDomain === domain.domains_id ? 'Selected' : 'Select'}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Extensions Table */}
                        {loading ? (
                            <p>Loading extensions...</p>
                        ) : selectedDomain && extensions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Extension</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {extensions.map(ext => (
                                        <TableRow key={ext.extension_id}>
                                            <TableCell>{ext.extension_number}</TableCell>
                                            <TableCell>{ext.description || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-3 w-3 rounded-full ${ext.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    <span>{ext.is_active ? 'Active' : 'Inactive'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button variant="default" size="icon" className="hover:text-yellow-400" onClick={() => openEditDialog(ext)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="icon" className="text-red-500 hover:text-red-700" onClick={() => openDeleteDialog(ext)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : selectedDomain ? (
                            <p>No extensions found for this domain.</p>
                        ) : (
                            <p>Please select a domain to see the extensions.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Extension</DialogTitle>
                        </DialogHeader>
                        {currentExtension && (
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-extension_number" className="text-right">Extension</Label>
                                    <Input id="edit-extension_number" value={currentExtension.extension_number} onChange={(e) => setCurrentExtension({ ...currentExtension, extension_number: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-description" className="text-right">Description</Label>
                                    <Input id="edit-description" value={currentExtension.description || ''} onChange={(e) => setCurrentExtension({ ...currentExtension, description: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-status" className="text-right">Status</Label>
                                    <div className="flex items-center space-x-2 col-span-3">
                                        <Switch 
                                            id="edit-status"
                                            checked={currentExtension.is_active}
                                            onCheckedChange={(checked) => setCurrentExtension({ ...currentExtension, is_active: checked })}
                                        />
                                        <Label htmlFor="edit-status" className="text-sm text-muted-foreground">
                                            {currentExtension.is_active ? 'Active' : 'Inactive'}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={handleUpdateExtension}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Extension</DialogTitle>
                        </DialogHeader>
                        <p>Are you sure you want to delete extension {currentExtension?.extension_number}?</p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteExtension}>Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </motion.div>
    );
};

export default ExtensionsPage;
