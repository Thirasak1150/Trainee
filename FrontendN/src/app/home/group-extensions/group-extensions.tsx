import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';

interface Extension {
  extension_id: string;
  extension_number: string;
}

interface GroupExtension {
  group_id: string;
  name: string;
  description: string;
  is_active: boolean;
  extensions: Extension[];
}

const GroupExtensions = () => {
  const API_URL = import.meta.env.VITE_PUBLIC_API_URL;
  console.log("API_URL:", API_URL);
  const domains_id = useSelector((state: any) => state.user.domains_id);

  const [groups, setGroups] = useState<GroupExtension[]>([]);
  const [availableExtensions, setAvailableExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedExtensions, setSelectedExtensions] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<GroupExtension | null>(null);

  // State for Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GroupExtension | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSelectedExtensions, setEditSelectedExtensions] = useState<string[]>([]);
  const [extensionsForEdit, setExtensionsForEdit] = useState<Extension[]>([]);

  const fetchGroups = async () => {
    if (!domains_id) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/group-extensions/${domains_id}`);
      console.log("Groupsdasdasdsads:", response.data);
      if (Array.isArray(response.data)) {
        setGroups(response.data);

      } else {
        console.error('API did not return an array for groups:', response.data);
        setGroups([]);
        toast.error('Received invalid data for groups.');
      }
    } catch (error) {
      console.error('Failed to fetch group extensions:', error);
      toast.error('Failed to fetch group extensions.');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableExtensions = async () => {
    if (!domains_id) return;
    try {
      const response = await axios.get(`${API_URL}/api/group-extensions/available/${domains_id}`);
      if (Array.isArray(response.data)) {
        setAvailableExtensions(response.data);
      } else {
        console.error('API did not return an array for available extensions:', response.data);
        setAvailableExtensions([]); // Reset to empty array to prevent crash
        toast.error('Received invalid data for available extensions.');
      }
    } catch (error) {
      console.error('Failed to fetch available extensions:', error);
      toast.error('Failed to fetch available extensions.');
      setAvailableExtensions([]); // Also reset on error
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchAvailableExtensions();
  }, [domains_id]);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      toast.warning('Group name is required.');
      return;
    }

    try {
      const newGroupData = {
        name: newGroupName,
        description: newGroupDescription,
        domain_id: domains_id,
        extension_ids: selectedExtensions,
      };
      const response = await axios.post(`${API_URL}/api/group-extensions/`, newGroupData);
      setGroups([...groups, response.data]);
      toast.success(`Group "${response.data.name}" created successfully.`);
      resetAddGroupForm();
      fetchAvailableExtensions(); // Refresh available extensions
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group.');
    }
  };

  const resetAddGroupForm = () => {
    setIsDialogOpen(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setSelectedExtensions([]);
  };

  const openDeleteDialog = (group: GroupExtension) => {
    setGroupToDelete(group);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      await axios.delete(`${API_URL}/api/group-extensions/${groupToDelete.group_id}`);
      setGroups(groups.filter(g => g.group_id !== groupToDelete.group_id));
      toast.success(`Group "${groupToDelete.name}" deleted successfully.`);
    } catch (error) {
      console.error('Failed to delete group:', error);
      toast.error('Failed to delete group.');
    } finally {
      setIsDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  const openEditDialog = (group: GroupExtension) => {
    setEditingGroup(group);
    setEditGroupName(group.name);
    setEditGroupDescription(group.description || '');
    setEditIsActive(group.is_active);
    setEditSelectedExtensions(group.extensions.map(ext => ext.extension_id));

    // Combine available extensions with the ones already in the group for the dialog list
    const currentGroupExtIds = new Set(group.extensions.map(e => e.extension_id));
    const combinedExtensions = [
      ...group.extensions,
      ...availableExtensions.filter(ext => !currentGroupExtIds.has(ext.extension_id))
    ];
    // Sort them for consistent display
    combinedExtensions.sort((a, b) => a.extension_number.localeCompare(b.extension_number));
    setExtensionsForEdit(combinedExtensions);

    setIsEditDialogOpen(true);
  };

  const handleEditCheckboxChange = (extensionId: string) => {
    setEditSelectedExtensions(prev => 
      prev.includes(extensionId) 
        ? prev.filter(id => id !== extensionId) 
        : [...prev, extensionId]
    );
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    if (!editGroupName.trim()) {
      toast.warning('Group name is required.');
      return;
    }

    try {
      const updatedGroupData = {
        name: editGroupName,
        description: editGroupDescription,
        is_active: editIsActive,
        extension_ids: editSelectedExtensions,
      };
      const response = await axios.put(`${API_URL}/api/group-extensions/${editingGroup.group_id}`, updatedGroupData);
      
      // Update the state
      setGroups(groups.map(g => g.group_id === editingGroup.group_id ? response.data : g));
      toast.success(`Group "${response.data.name}" updated successfully.`);
      
      // Close dialog and refresh other data
      setIsEditDialogOpen(false);
      setEditingGroup(null);
      fetchAvailableExtensions(); // Refresh the list of unassigned extensions
    } catch (error) {
      console.error('Failed to update group:', error);
      toast.error('Failed to update group.');
    }
  };
  
  const handleCheckboxChange = (extensionId: string) => {
    setSelectedExtensions(prev => 
      prev.includes(extensionId) 
        ? prev.filter(id => id !== extensionId) 
        : [...prev, extensionId]
    );
  };

  return (
    <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="container mx-auto p-4">
      <div className="container mx-auto py-6 px-2 sm:px-4 lg:px-6 max-w-full sm:max-w-6xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Group Extensions</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => fetchAvailableExtensions()}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Group</DialogTitle>
                <DialogDescription>
                  Create a new group and assign available extensions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Sales Team"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Extensions</Label>
                  <div className="max-h-48 overflow-y-auto border p-2 rounded-md">
                    {availableExtensions.length > 0 ? (
                      availableExtensions.map(ext => (
                        <div key={ext.extension_id} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={ext.extension_id}
                            onCheckedChange={() => handleCheckboxChange(ext.extension_id)}
                            checked={selectedExtensions.includes(ext.extension_id)}
                          />
                          <label
                            htmlFor={ext.extension_id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {ext.extension_number}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No available extensions.</p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetAddGroupForm}>Cancel</Button>
                <Button type="submit" onClick={handleAddGroup}>Create Group</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No groups found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="hidden sm:table-header-group">
                  <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Extensions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.group_id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted flex flex-col sm:table-row py-3 sm:py-0">
                      <TableCell className="font-medium sm:table-cell flex items-center gap-2">
                        <span className="sm:hidden font-bold">Group Name:</span>
                        {group.name}
                      </TableCell>
                      <TableCell className="sm:table-cell flex items-center gap-2">
                        <span className="sm:hidden font-bold">Description:</span>
                        {group.description || '-'}
                      </TableCell>
                      <TableCell className="sm:table-cell flex items-center gap-2">
                        <span className="sm:hidden font-bold">Status:</span>
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${group.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>{group.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="sm:table-cell">
                        <span className="sm:hidden font-bold mb-2 flex">Extensions:</span>
                        <div className="flex flex-wrap gap-1">
                          {group.extensions.map(ext => (
                            <Badge key={ext.extension_id} variant="secondary">{ext.extension_number}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right sm:table-cell">
                        <div className="flex gap-2 justify-end mt-2 sm:mt-0">
                          <Button variant="default" size="icon" className="hover:text-yellow-400" onClick={() => openEditDialog(group)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" className="text-red-500 hover:text-red-700" onClick={() => openDeleteDialog(group)}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the group
              <strong> {groupToDelete?.name}</strong> and disassociate its extensions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteGroup}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Group: {editingGroup?.name}</DialogTitle>
            <DialogDescription>
              Update the group details and assigned extensions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editGroupDescription}
                onChange={(e) => setEditGroupDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
               <Switch
                id="edit-status"
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
              <Label htmlFor="edit-status" className="text-sm text-muted-foreground">{editIsActive ? 'Active' : 'Inactive'}</Label>
            </div>
            <div className="grid gap-2">
              <Label>Extensions</Label>
              <div className="max-h-48 overflow-y-auto border p-2 rounded-md">
                {extensionsForEdit.length > 0 ? (
                  extensionsForEdit.map(ext => (
                    <div key={ext.extension_id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={`edit-${ext.extension_id}`}
                        onCheckedChange={() => handleEditCheckboxChange(ext.extension_id)}
                        checked={editSelectedExtensions.includes(ext.extension_id)}
                      />
                      <label htmlFor={`edit-${ext.extension_id}`} className="text-sm font-medium">
                        {ext.extension_number}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No extensions available to assign.</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleUpdateGroup}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </motion.div>
  );
};

export default GroupExtensions;