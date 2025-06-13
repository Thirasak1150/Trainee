"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
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
import { useUser } from "../Usercontext";

interface Domain {
  domain_uuid: string;
  domain_parent_uuid: string | null;
  domain_name: string;
  domain_enabled: boolean;
  domain_description: string | null;
  insert_date: string | null;
  insert_user: string | null;
  update_date: string | null;
  update_user: string | null;
}

export default function DomainPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [allDomains, setAllDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {user_uuid} = useUser()
  const [newDomain, setNewDomain] = useState({ domain_name: "", domain_enabled: false, domain_description: "" ,created_by:user_uuid});
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/domain");
      setAllDomains(response.data);
      setDomains(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load domains. Please try again later.");
      setLoading(false);
      console.error(err);
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
      setDomains(
        allDomains.filter(
          domain => 
            domain.domain_name.toLowerCase().includes(value) || 
            (domain.domain_description && domain.domain_description.toLowerCase().includes(value))
        )
      );
    }
  }, [searchTerm, allDomains]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("newDomain",newDomain)
    try {
 
      const response = await axios.post("http://localhost:8000/api/domain", newDomain);
      setDomains([...domains, response.data]);
      setNewDomain({ domain_name: "", domain_enabled: false, domain_description: "" ,created_by:user_uuid});
      setOpenDialog(false);
      toast.success("Domain added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add domain");
    }
  };

  const handleEditDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDomain) return;
    try {
      const response = await axios.put(`http://localhost:8000/api/domain/${editingDomain.domain_uuid}`, {
        domain_name: editingDomain.domain_name,
        domain_enabled: editingDomain.domain_enabled,
        domain_description: editingDomain.domain_description
      });
      setDomains(domains.map(domain => domain.domain_uuid === editingDomain.domain_uuid ? response.data : domain));
      setEditingDomain(null);
      setOpenDialog(false);
      toast.success("Domain updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update domain");
    }
  };

  const handleDeleteDomain = async (domain_uuid: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/domain/${domain_uuid}`);
      setDomains(domains.filter(domain => domain.domain_uuid !== domain_uuid));
      toast.success("Domain deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete domain");
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
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
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
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-shrink-0">Add Domain</Button>
              </DialogTrigger>
              <DialogContent className="w-[95%] sm:w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingDomain ? "Edit Domain" : "Add New Domain"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={editingDomain ? handleEditDomain : handleAddDomain} className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="domain_name">Domain Name</Label>
                    <Input 
                      id="domain_name" 
                      value={editingDomain ? editingDomain.domain_name : newDomain.domain_name} 
                      onChange={(e) => editingDomain ? setEditingDomain({...editingDomain, domain_name: e.target.value}) : setNewDomain({...newDomain, domain_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="domain_enabled">Enabled</Label>
                    <Switch 
                      id="domain_enabled"
                      checked={editingDomain ? editingDomain.domain_enabled : newDomain.domain_enabled} 
                      onCheckedChange={(checked) => editingDomain ? setEditingDomain({...editingDomain, domain_enabled: checked === true}) : setNewDomain({...newDomain, domain_enabled: checked === true})}
                      className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                    />
                  </div>
                  <div className="">
                    <Label className="mb-3" htmlFor="domain_description">Description</Label>
                    <Input 
                      id="domain_description" 
                      value={editingDomain ? editingDomain.domain_description || "" : newDomain.domain_description} 
                      onChange={(e) => editingDomain ? setEditingDomain({...editingDomain, domain_description: e.target.value}) : setNewDomain({...newDomain, domain_description: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => { setEditingDomain(null); setOpenDialog(false); }}>Cancel</Button>
                    <Button type="submit" size="sm">{editingDomain ? "Update" : "Add"}</Button>
                  </div>
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
                <TableHeader className="hidden sm:table-header-group">
                  <TableRow>
                    <TableHead className="w-[150px] sm:w-[200px]">Domain Name</TableHead>
                    <TableHead className="w-[100px] sm:w-[150px]">Status</TableHead>
                    <TableHead className="w-[200px] sm:w-[250px]">Description</TableHead>
                    <TableHead className="w-[150px] sm:w-[200px]">Insert Date</TableHead>
                    <TableHead className="w-[150px] sm:w-[200px]">Update Date</TableHead>
                    <TableHead className="w-[80px] sm:w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain) => (
                    <TableRow key={domain.domain_uuid} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted flex flex-col sm:table-row py-3 sm:py-0">
                      <TableCell className="font-medium sm:table-cell flex items-center gap-2"><span className="sm:hidden font-bold">Name:</span>{domain.domain_name}</TableCell>
                      <TableCell className="sm:table-cell flex items-center gap-2">
                        <span className="sm:hidden font-bold">Status:</span>
                        <div className="flex items-center gap-2">
                          <span 
                            className={`h-3 w-3 rounded-full ${domain.domain_enabled ? 'bg-green-500' : 'bg-red-500'}`}
                          ></span>
                          <span>{domain.domain_enabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="sm:table-cell flex items-center gap-2"><span className="sm:hidden font-bold">Desc:</span>{domain.domain_description || '-'}</TableCell>
                      <TableCell className="sm:table-cell flex items-center gap-2"><span className="sm:hidden font-bold">Inserted:</span>{domain.insert_date ? new Date(domain.insert_date).toLocaleString() : '-'}</TableCell>
                      <TableCell className="sm:table-cell flex items-center gap-2"><span className="sm:hidden font-bold">Updated:</span>{domain.update_date ? new Date(domain.update_date).toLocaleString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700" onClick={() => { setEditingDomain(domain); setOpenDialog(true); }}>
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
                                    <AlertDialogAction onClick={() => handleDeleteDomain(domain.domain_uuid)}>Continue</AlertDialogAction>
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
}