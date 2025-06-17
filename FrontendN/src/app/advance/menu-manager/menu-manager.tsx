import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Crown, Loader2, Pencil, Check, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

// --- API Service ---
const API_BASE_URL = 'http://localhost:8000/api';

const apiService = {
  getRoles: () => axios.get(`${API_BASE_URL}/roles`),
  getMenusForRole: (roleId: string) => axios.get(`${API_BASE_URL}/menu/role/${roleId}`),
  updateMenuName: (type: 'header' | 'item', id: string, name: string) => axios.put(`${API_BASE_URL}/menu/name/${type}/${id}`, { name }),
  resetAllMenuNames: () => axios.post(`${API_BASE_URL}/menu/reset-names`),
  updateMenuAccess: (type: 'header' | 'item', roleId: string, menuId: string, enabled: boolean) => 
    axios.put(`${API_BASE_URL}/menu/${type}/${roleId}/${menuId}?enable=${enabled}`),
};

// --- Type Interfaces ---
interface Role {
  roles_id: string;
  name: string;
  description: string;
}

interface MenuItem {
  menu_items_id: string;
  name_default: string;
  name_custom?: string | null;
  path: string;
  icon: string | null;
  order_index: number;
  role_menu_items?: { roles_id: string }[];
}

interface MenuHeader {
  menu_headers_id: string;
  name_default: string;
  name_custom?: string | null;
  order_index: number;
  menu_items: MenuItem[];
  role_menus?: { roles_id: string }[];
}

// --- Component ---
const MenuManagerPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [menusForRole, setMenusForRole] = useState<MenuHeader[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // --- Data Fetching Functions ---
  const fetchRoles = useCallback(async () => {
    try {
      const response = await apiService.getRoles();
      if (response.data && Array.isArray(response.data)) {
        setRoles(response.data);
      } else {
        toast.error("Received invalid data for roles.");
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error("Failed to fetch roles.");
    }
  }, []);

  const fetchMenusForRole = useCallback(async (roleId: string) => {
    setLoadingMenus(true);
    try {
      const response = await apiService.getMenusForRole(roleId);
      setMenusForRole(response.data || []);
    } catch (error) {
      console.error('Error fetching menus for role:', error);
      toast.error("Failed to fetch menus for the selected role.");
      setMenusForRole([]);
    } finally {
      setLoadingMenus(false);
    }
  }, []);

  // --- Effects ---
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    if (selectedRole) {
      fetchMenusForRole(selectedRole);
    }
  }, [selectedRole, fetchMenusForRole]);

  // --- Event Handlers ---
  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setIsModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setSelectedRole(null);
      setMenusForRole([]);
    }
  };

  const refreshMenus = () => {
    if (selectedRole) {
      fetchMenusForRole(selectedRole);
    }
  }

  const handleNameUpdate = async (type: 'header' | 'item', id: string) => {
    try {
      await apiService.updateMenuName(type, id, editingName);
      toast.success("Menu name updated successfully!");
      setEditingId(null);
      refreshMenus();
    } catch (error) {
      console.error('Failed to update name:', error);
      toast.error("Failed to update menu name.");
    }
  };

  const handleResetAllNames = async () => {
    try {
      await apiService.resetAllMenuNames();
      toast.success("All menu names have been reset to default.");
      setIsResetConfirmOpen(false);
      refreshMenus();
    } catch (error) {
      console.error('Failed to reset names:', error);
      toast.error("Failed to reset menu names.");
    }
  };

  const handleAccessChange = async (type: 'header' | 'item', id: string, enabled: boolean) => {
    if (!selectedRole) return;
    try {
      await apiService.updateMenuAccess(type, selectedRole, id, enabled);
      toast.success(`Access has been ${enabled ? 'granted' : 'revoked'}.`);
      refreshMenus();
    } catch (error) {
      console.error('Failed to update access:', error);
      toast.error("Failed to update access rights.");
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'user': return <Users className="w-8 h-8 text-blue-500" />;
      case 'admin': return <Shield className="w-8 h-8 text-green-500" />;
      case 'superadmin': return <Crown className="w-8 h-8 text-red-500" />;
      default: return <Users className="w-8 h-8 text-gray-500" />;
    }
  };

  // --- Render --- 
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto py-6 px-2 sm:px-4 lg:px-6 max-w-full sm:max-w-7xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-foreground">Menu Access Management</h1>
        <p className="text-muted-foreground text-center mb-8">Select a Role to view and manage its menu access rights.</p>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role) => (
              <Card
                  key={role.roles_id}
                  onClick={() => handleRoleSelect(role.roles_id)}
                  className={`cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1`}
              >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">{role.name}</CardTitle>
                  {getRoleIcon(role.name)}
                  </CardHeader>
                  <CardContent>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  </CardContent>
              </Card>
              ))}
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={handleModalOpenChange}>
          <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                Manage Access for: <span className="text-primary font-bold">{roles.find(r => r.roles_id === selectedRole)?.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto -mx-6 px-6 py-4 border-y">
            {loadingMenus ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-2">Loading menus...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {menusForRole.map((header) => {
                  const isHeaderEnabled = !!header.role_menus?.length;
                  return (
                    <div key={header.menu_headers_id} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-grow">
                              {editingId === header.menu_headers_id ? (
                                  <Input
                                      value={editingName}
                                      onChange={(e) => setEditingName(e.target.value)}
                                      className="h-8 flex-grow"
                                  />
                              ) : (
                                  <Label htmlFor={`header-${header.menu_headers_id}`} className="text-lg font-semibold text-foreground">
                                      {header.name_custom || header.name_default}
                                  </Label>
                              )}
                              {editingId === header.menu_headers_id ? (
                                  <>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNameUpdate('header', header.menu_headers_id)}><Check className="h-4 w-4" /></Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                                  </>    
                              ) : (
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingId(header.menu_headers_id); setEditingName(header.name_custom || header.name_default);}}>
                                      <Pencil className="h-4 w-4" />
                                  </Button>
                              )}
                          </div>
                        <Switch
                          id={`header-${header.menu_headers_id}`}
                          checked={isHeaderEnabled}
                          onCheckedChange={(checked) => handleAccessChange('header', header.menu_headers_id, checked)}
                        />
                      </div>
                      {isHeaderEnabled && (
                      <div className="pl-6 mt-4 space-y-3 flex flex-col gap-4">
                        {header.menu_items.map((item) => {
                          const isItemEnabled = !!item.role_menu_items?.length;
                          return (
                            <div key={item.menu_items_id} className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-grow">
                                  {editingId === item.menu_items_id ? (
                                      <Input
                                          value={editingName}
                                          onChange={(e) => setEditingName(e.target.value)}
                                          className="h-8 flex-grow"
                                      />
                                  ) : (
                                      <Label htmlFor={`item-${item.menu_items_id}`} className="text-sm text-muted-foreground">
                                          {item.name_custom || item.name_default}
                                      </Label>
                                  )}
                                  {editingId === item.menu_items_id ? (
                                      <>
                                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNameUpdate('item', item.menu_items_id)}><Check className="h-4 w-4" /></Button>
                                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                                      </> 
                                  ) : (
                                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingId(item.menu_items_id); setEditingName(item.name_custom || item.name_default);}}>
                                          <Pencil className="h-4 w-4" />
                                      </Button>
                                  )}
                              </div>
                              <Switch
                                id={`item-${item.menu_items_id}`}
                                checked={isItemEnabled}
                                onCheckedChange={(checked) => handleAccessChange('item', item.menu_items_id, checked)}
                              />
                            </div>
                          );
                        })}
                      </div>)}
                    </div>
                  );
                })}
              </div>
            )}
            </div>
            <DialogFooter className="pt-4 flex-col-reverse sm:flex-row sm:justify-between">
              <Button variant="destructive" onClick={() => setIsResetConfirmOpen(true)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset All Names
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently reset all custom menu names across the entire system to their default values. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetAllNames} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, reset all names
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};

export default MenuManagerPage;