'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Crown, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";


interface Role {
  roles_id: string;
  name: string;
  description: string;
}

interface MenuItem {
  menu_items_id: string;
  name_default: string;
  path: string;
  icon: string | null;
  order_index: number;
  role_menu_items?: { roles_id: string }[];
}

interface MenuHeader {
  menu_headers_id: string;
  name_default: string;
  order_index: number;
  menu_items: MenuItem[];
  role_menus?: { roles_id: string }[];
}

const MenuManagerPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [menusForRole, setMenusForRole] = useState<MenuHeader[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);


  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://192.168.1.126:8000/api/roles');
        if (response.data && Array.isArray(response.data)) {
            setRoles(response.data);
        } else {
            console.error('Error fetching roles: Data is not an array', response.data);
            toast.error("Received invalid data for roles.");
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error("Failed to fetch roles.");
      }
    };

    fetchRoles();
  }, [toast]);

  useEffect(() => {
    if (selectedRole) {
      setLoadingMenus(true);
      const fetchMenusForRole = async () => {
        console.log("selectedRole", selectedRole);
        try {
          const response = await axios.get(`http://192.168.1.126:8000/api/menu/role/${selectedRole}`);
          setMenusForRole(response.data || []);
        } catch (error) {
          console.error('Error fetching menus for role:', error);
          toast.error("Failed to fetch menus for the selected role.");
          setMenusForRole([]); // Reset on error
        } finally {
          setLoadingMenus(false);
        }
      };

      fetchMenusForRole();
    }
  }, [selectedRole, toast]);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
        const selectedRoleData = roles.find(r => r.roles_id === roleId);
    if (selectedRoleData) {
      toast.success(`Managing menus for ${selectedRoleData.name}.`);
    }
  };

  const handleAccessChange = async (type: 'header' | 'item', id: string, enabled: boolean) => {
    if (!selectedRole) return;

    const endpoint = type === 'header'
      ? `http://192.168.1.126:8000/api/menu/role/${selectedRole}/header/${id}?enable=${enabled}`
      : `http://192.168.1.126:8000/api/menu/role/${selectedRole}/item/${id}?enable=${enabled}`;

    try {
      await axios.put(endpoint);
      toast.success(`Access has been ${enabled ? 'granted' : 'revoked'}.`);

      // Refresh the role-specific menu data to reflect the change
      const response = await axios.get(`http://192.168.1.126:8000/api/menu/role/${selectedRole}`);
      setMenusForRole(response.data || []);

    } catch (error) {
      console.error('Failed to update access:', error);
      toast.error("Failed to update access rights.");
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'user':
        return <Users className="w-8 h-8 text-blue-500" />;
      case 'admin':
        return <Shield className="w-8 h-8 text-green-500" />;
      case 'superadmin':
        return <Crown className="w-8 h-8 text-red-500" />;
      default:
        return <Users className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Menu Access Management</h1>
      <p className="text-muted-foreground text-center mb-8">Select a Role to view and manage its menu access rights.</p>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
            <Card
                key={role.roles_id}
                onClick={() => handleRoleSelect(role.roles_id)}
                className={`cursor-pointer transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 ${
                selectedRole === role.roles_id
                    ? 'border-primary ring-2 ring-primary shadow-xl'
                    : 'border-border'
                }`}
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

      {selectedRole && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Menus for {roles.find(r => r.roles_id === selectedRole)?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMenus ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="ml-2">Loading menus...</p>
                </div>
              ) : (
                <div className="space-y-4">

                  {menusForRole.map((header) => {
                    const isHeaderEnabled = header.role_menus && header.role_menus.length > 0;

                    return (
                      <div key={header.menu_headers_id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`header-${header.menu_headers_id}`} className="text-lg font-semibold">{header.name_default}</Label>
                          <Switch
                            id={`header-${header.menu_headers_id}`}
                            checked={isHeaderEnabled}
                            onCheckedChange={(checked) => handleAccessChange('header', header.menu_headers_id, checked)}
                          />
                        </div>
                        <div className="pl-6 mt-4 space-y-3">
                          {header.menu_items.map((item) => {
                            const isItemEnabled = item.role_menu_items && item.role_menu_items.length > 0;

                            return (
                              <div key={item.menu_items_id} className="flex items-center justify-between">
                                <Label htmlFor={`item-${item.menu_items_id}`} className="text-sm">{item.name_default}</Label>
                                <Switch
                                  id={`item-${item.menu_items_id}`}
                                  checked={isItemEnabled}
                                  onCheckedChange={(checked) => handleAccessChange('item', item.menu_items_id, checked)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MenuManagerPage;