import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import axios from 'axios';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

const API_BASE_URL = 'http://192.168.1.126:8000';

// API fetching utility
const api = {
  // @ts-ignore
  get: (url) => axios.get(`${API_BASE_URL}${url}`).then(res => res.data),
  // @ts-ignore
  post: (url, data) => axios.post(`${API_BASE_URL}${url}`, data).then(res => res.data),
  // @ts-ignore
  put: (url, data) => axios.put(`${API_BASE_URL}${url}`, data).then(res => res.data),
        // @ts-ignore
  delete: (url) => axios.delete(`${API_BASE_URL}${url}`).then(res => res.data),
};

// Type definitions
interface Contact {
  contact_id: string;
  full_name: string;
  phone_number?: string;
  contact_type: 'INTERNAL' | 'EXTERNAL';
  domain_id?: string;
  extension_id?: string;
  extension_number?: string;
  domain?: { domain_id: string; domain_name: string };
}

interface Domain {
  domains_id: string;
  domain_name: string;
}

interface Extension {
  extension_id: string;
  extension_number: string;
  domain: { domain_name: string };
}

const initialFormData = {
  full_name: '',
  phone_number: '',
  contact_type: 'EXTERNAL' as 'INTERNAL' | 'EXTERNAL',
  domain_id: '',
  extension_id: '',
};

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'INTERNAL' | 'EXTERNAL'>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({ full_name: '', domain_id: '', extension_id: '', phone_number: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = filterType === 'ALL' ? '/api/contacts/' : `/api/contacts?contact_type=${filterType}`;
      const [contactsData, extensionsData] = await Promise.all([
        api.get(url),
        api.get('/api/extensions/domains'),
      ]);
      setContacts(contactsData || []);
      setDomains(extensionsData || []);
      // If a domain is already selected, refresh its extensions
      if (formData.domain_id) {
        await loadExtensionsByDomain(formData.domain_id);
      }
    } catch (error) {
      toast.error('Failed to load data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadExtensionsByDomain = async (domainId: string) => {
    try {
      const data = await api.get(`/api/extensions/domain/${domainId}`);
      setExtensions(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load extensions');
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof typeof initialFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'contact_type') {
      if (value === 'EXTERNAL') {
        setFormData(prev => ({ ...prev, domain_id: '', extension_id: '' }));
      } else {
        // reset extension list when switching back to INTERNAL
        if (formData.domain_id) {
          loadExtensionsByDomain(formData.domain_id);
        }
      }
    }
    if (name === 'domain_id') {
      // when domain changes fetch its extensions
      loadExtensionsByDomain(value);
      setFormData(prev => ({ ...prev, extension_id: '' }));
    }
  };

  const validateForm = () => {
    const errors = { full_name: '', domain_id: '', extension_id: '', phone_number: '' };
    let isValid = true;
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
      isValid = false;
    }
    if (formData.contact_type === 'INTERNAL') {
      if (!formData.domain_id) {
        errors.domain_id = 'Domain is required for INTERNAL contacts';
        isValid = false;
      }
      if (!formData.extension_id) {
        errors.extension_id = 'Extension is required for INTERNAL contacts';
        isValid = false;
      }
    } else if (formData.contact_type === 'EXTERNAL') {
      if (!formData.phone_number?.trim()) {
        errors.phone_number = 'Phone number is required for EXTERNAL contacts';
        isValid = false;
      }
    }
    setFormErrors(errors);
    return isValid;
  };

  const openFormModal = (contact: Contact | null = null) => {
    setSelectedContact(contact);
    setFormErrors({ full_name: '', domain_id: '', extension_id: '', phone_number: '' });
    if (contact) {
      setFormData({
        full_name: contact.full_name,
        phone_number: contact.phone_number || '',
        contact_type: contact.contact_type,
        domain_id: contact.domain ? contact.domain.domain_id : '',
        extension_id: contact.extension_id || '',
      });
    } else {
      setFormData(initialFormData);
    }
    setIsFormOpen(true);
  };

  const openDeleteAlert = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDeleteAlertOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const promise = selectedContact
      ? api.put(`/api/contacts/${selectedContact.contact_id}`, formData)
      : api.post('/api/contacts', formData);

    toast.promise(promise, {
      loading: `${selectedContact ? 'Updating' : 'Creating'} contact...`,
      success: () => {
        fetchData();
        setIsFormOpen(false);
        return `Contact ${selectedContact ? 'updated' : 'created'} successfully.`;
      },
      error: (err) => `Error: ${err.response?.data?.detail || 'Something went wrong.'}`,
    });
  };

  const handleDelete = async () => {
    if (!selectedContact) return;
    
    toast.promise(api.delete(`/api/contacts/${selectedContact.contact_id}`), {
      loading: 'Deleting contact...',
      success: () => {
        fetchData();
        setIsDeleteAlertOpen(false);
        return 'Contact deleted successfully.';
      },
      error: (err) => `Error: ${err.response?.data?.detail || 'Something went wrong.'}`,
    });
  };

  const availableExtensions = useMemo(() => {
    const linkedExtensionIds = new Set(contacts.map(c => c.extension_id));
    if (selectedContact?.extension_id) {
        linkedExtensionIds.delete(selectedContact.extension_id);
    }
    return extensions.filter(ext => !linkedExtensionIds.has(ext.extension_id));
  }, [contacts, extensions, selectedContact]);

  const filteredContacts = useMemo(() => contacts.filter(contact => contact.full_name.toLowerCase().includes(searchTerm.toLowerCase())), [contacts, searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto py-6 px-2 sm:px-4 lg:px-6 max-w-full sm:max-w-7xl">
        <Card className="mb-6 shadow-md md:mx-0 mx-4">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center">Contacts Management</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
              <div className="flex-1 md:flex-none">
                <Label htmlFor="search" className="sr-only">Search Contacts</Label>
                <Input
                  id="search"
                  placeholder="Search contacts..."
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select onValueChange={(value: 'ALL' | 'INTERNAL' | 'EXTERNAL') => setFilterType(value)} defaultValue="ALL">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                  <SelectItem value="EXTERNAL">External</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="flex-shrink-0" onClick={() => openFormModal()}><IconPlus className="mr-2 h-4 w-4" /> Add Contact</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md md:mx-0 mx-4">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl font-semibold">Contacts List</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500 text-sm sm:text-base">Loading contacts...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm sm:text-base">No contacts found.</div>
            ) : (
              <div className="overflow-x-auto hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Type</TableHead>
                      {filterType !== 'EXTERNAL' && <TableHead>Extension</TableHead>}
                      {filterType !== 'EXTERNAL' && <TableHead>Domain</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map(contact => (
                      <TableRow key={contact.contact_id}>
                        <TableCell className="font-medium">{contact.full_name}</TableCell>
                        <TableCell>{contact.phone_number || '-'}</TableCell>
                        <TableCell>{contact.contact_type}</TableCell>
                        {filterType !== 'EXTERNAL' && <TableCell>{contact.extension_number || '-'}</TableCell>}
                        {filterType !== 'EXTERNAL' && <TableCell>{contact.domain?.domain_name || '-'}</TableCell>}
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="default" size="icon" className="hover:text-yellow-400" onClick={() => openFormModal(contact)}><IconEdit size={18} /></Button>
                            <Button variant="destructive" size="icon" className="text-red-500 hover:text-red-700" onClick={() => openDeleteAlert(contact)}><IconTrash size={18} /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Mobile View (Cards) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredContacts.map(contact => (
                <Card key={contact.contact_id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-semibold">Full Name:</div>
                      <div>{contact.full_name}</div>

                      <div className="font-semibold">Phone:</div>
                      <div>{contact.phone_number || '-'}</div>

                      <div className="font-semibold">Type:</div>
                      <div>{contact.contact_type}</div>

                      {contact.contact_type === 'INTERNAL' && (
                        <>
                          <div className="font-semibold">Extension:</div>
                          <div>{contact.extension_number || '-'}</div>

                          <div className="font-semibold">Domain:</div>
                          <div>{contact.domain?.domain_name || '-'}</div>
                        </>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="default" size="icon" className="hover:text-yellow-400" onClick={() => openFormModal(contact)}><IconEdit size={18} /></Button>
                      <Button variant="destructive" size="icon" className="text-red-500 hover:text-red-700" onClick={() => openDeleteAlert(contact)}><IconTrash size={18} /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-xl max-w-full">
            <DialogHeader>
              <DialogTitle>{selectedContact ? 'Edit' : 'Add'} Contact</DialogTitle>
              <DialogDescription>Fill in the details for the contact.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="mb-2" htmlFor="full_name">Full Name</Label>
                <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
                {formErrors.full_name && <p className="text-red-500 text-sm mt-1">{formErrors.full_name}</p>}
              </div>
              {formData.contact_type === 'EXTERNAL' && (
                <div>
                  <Label className="mb-2" htmlFor="phone_number">Phone Number</Label>
                  <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
                  {formErrors.phone_number && <p className="text-red-500 text-sm mt-1">{formErrors.phone_number}</p>}
                </div>
              )}
              <div>
                <Label className="mb-2" htmlFor="contact_type">Contact Type</Label>
                <Select onValueChange={(value) => handleSelectChange('contact_type', value)} value={formData.contact_type}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXTERNAL">External</SelectItem>
                    <SelectItem value="INTERNAL">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.contact_type === 'INTERNAL' && (
                <div className="mb-4">
                  <Label className="mb-2" htmlFor="domain_id">Domain</Label>
                  <Select onValueChange={(value) => handleSelectChange('domain_id', value)} value={formData.domain_id}>
                    <SelectTrigger><SelectValue placeholder="Select a domain" /></SelectTrigger>
                    <SelectContent>
                      {domains.map((d) => (
                        <SelectItem key={d.domains_id} value={d.domains_id}>{d.domain_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.domain_id && <p className="text-red-500 text-sm mt-1">{formErrors.domain_id}</p>}
                </div>
              )}

              {formData.contact_type === 'INTERNAL' && formData.domain_id && (
                <div>
                  <Label className="mb-2" htmlFor="extension_id">Extension</Label>
                  <Select onValueChange={(value) => handleSelectChange('extension_id', value)} value={formData.extension_id}>
                    <SelectTrigger><SelectValue placeholder="Select an extension" /></SelectTrigger>
                    <SelectContent>
                      {availableExtensions.length > 0 ? (
                        availableExtensions.map(ext => (
                          <SelectItem key={ext.extension_id} value={ext.extension_id}>
                            {ext.extension_number} ({ext.domain.domain_name})
                          </SelectItem>
                        ))
                      ) : (
                        <p className="p-2 text-sm text-muted-foreground">No available extensions.</p>
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.extension_id && <p className="text-red-500 text-sm mt-1">{formErrors.extension_id}</p>}
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit">{selectedContact ? 'Save Changes' : 'Create Contact'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Alert Dialog */}
        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the contact "{selectedContact?.full_name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};

export default ContactsPage;