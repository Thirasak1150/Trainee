"use client"
import React, { useEffect, useState } from "react";
import "./custom-scrollbar.css";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserAccess } from "@/features/UserAccess/types/Users.type";


export default function UserAccessPage() {
  const [users, setUsers] = useState<UserAccess[]>([]);
  const [allUsers, setAllUsers] = useState<UserAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Define a type for the new user form data
  interface NewUserFormData {
    username: string;
    user_email: string;
    user_enabled: boolean;
    user_description: string;
    password: string;
  }

  const [newUser, setNewUser] = useState<NewUserFormData>({ 
    username: "", 
    user_email: "", 
    user_enabled: false, 
    user_description: "",
    password: ""
  });
  const [editingUser, setEditingUser] = useState<UserAccess | null>(null);
  const [viewingUser, setViewingUser] = useState<UserAccess | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      setIsDarkMode(htmlElement.classList.contains("dark"));
    };
    
    checkTheme();
    
    // Optional: Listen for theme changes
    const observer = new MutationObserver(() => checkTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    
    return () => observer.disconnect();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/api/users");
      console.log("response",response)
      setAllUsers(response.data);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load users. Please try again later.");
      setLoading(false);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setUsers(allUsers);
    } else {
      const value = searchTerm.toLowerCase();
      setUsers(
        allUsers.filter(
          user => 
            user.username.toLowerCase().includes(value) || 
            (user.user_email && user.user_email.toLowerCase().includes(value)) ||
            (user.user_description && user.user_description.toLowerCase().includes(value))
        )
      );
    }
  }, [searchTerm, allUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        username: newUser.username,
        email: newUser.user_email,
        password: newUser.password,
        user_enabled: String(newUser.user_enabled),
        description: newUser.user_description
      };
      
      const response = await axios.post("http://localhost:8000/api/users", userData);
      console.log("response", response);
      setUsers([...users, response.data]);
      setNewUser({ 
        username: "", 
        user_email: "", 
        user_enabled: false, 
        user_description: "",
        password: ""
      });
      setOpenDialog(false);
      toast.success("User added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add user");
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const response = await axios.put(`http://localhost:8000/api/users/${editingUser.user_uuid}`, {
        username: editingUser.username,
        email: editingUser.user_email,
        user_enabled: editingUser.user_enabled,
        api_key: editingUser.api_key || null,
        description: editingUser.user_description
      });
      setUsers(users.map(user => user.user_uuid === editingUser.user_uuid ? response.data : user));
      setEditingUser(null);
      setOpenDialog(false);
      toast.success("User updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (user_uuid: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/users/${user_uuid}`);
      setUsers(users.filter(user => user.user_uuid !== user_uuid));
      toast.success("User deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading users...</div>
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
      <Card className="mb-6 shadow-md md:mx-0 mx-4 ">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center ">User Access Management</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
            <div className="flex-1 md:flex-none">
              <Label htmlFor="search" className="sr-only">Search Users</Label>
              <Input 
                id="search"
                placeholder="Search users..."
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex-shrink-0 ">Add User</Button>
              </DialogTrigger>
              <DialogContent className={`w-[95%] sm:w-[500px] ${isDarkMode ? "bg-gray-900" : "bg-white"}`}> 
                <DialogHeader className="border-b pb-3">
                  <DialogTitle className={`text-xl font-bold ${isDarkMode ? "text-indigo-300" : "text-indigo-700"}`}>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={editingUser ? handleEditUser : handleAddUser} className="space-y-5 pt-5">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="username" className={`font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Username</Label>
                        <Input 
                          id="username" 
                          className={`mt-1 ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-indigo-50 border-indigo-200 text-gray-800"}`}
                          value={editingUser ? editingUser.username : newUser.username} 
                          onChange={(e) => editingUser ? setEditingUser({...editingUser, username: e.target.value}) : setNewUser({...newUser, username: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="user_email" className={`font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Email</Label>
                        <Input 
                          id="user_email" 
                          className={`mt-1 ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-indigo-50 border-indigo-200 text-gray-800"}`}
                          value={editingUser ? editingUser.user_email || "" : newUser.user_email} 
                          onChange={(e) => editingUser ? setEditingUser({...editingUser, user_email: e.target.value}) : setNewUser({...newUser, user_email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg border" style={{backgroundColor: isDarkMode ? "bg-gray-800" : "bg-indigo-50", borderColor: isDarkMode ? "border-gray-700" : "border-indigo-200"}}>
                      <Label htmlFor="user_enabled" className={`font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Enabled</Label>
                      <Switch 
                        id="user_enabled"
                        checked={editingUser ? editingUser.user_enabled === 'true' : newUser.user_enabled} 
                        onCheckedChange={(checked) => editingUser 
                          ? setEditingUser({...editingUser, user_enabled: checked ? 'true' : 'false'}) 
                          : setNewUser({...newUser, user_enabled: !!checked})}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                      />
                    </div>
                    {!editingUser && (
                      <div>
                        <Label htmlFor="password" className={`font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Password</Label>
                        <Input 
                          id="password" 
                          type="password"
                          className={`mt-2  ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-indigo-50 border-indigo-200 text-gray-800"}`}
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          required={!editingUser}
                        />
                      </div>
                    )}
                    {editingUser && (
                      <div>
                        <Label htmlFor="api_key" className={`font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>API Key</Label>
                        <Input 
                          id="api_key" 
                          className={`mt-2 font-mono text-sm break-all  ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-indigo-50 border-indigo-200 text-gray-800"}`}
                          value={editingUser.api_key || ""} 
                          onChange={(e) => setEditingUser({...editingUser, api_key: e.target.value})}
                          placeholder="Enter API key or leave blank to keep unchanged"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="user_description" className={`font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Description</Label>
                      <Input 
                        id="user_description" 
                        className={`mt-2  ${isDarkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-indigo-50 border-indigo-200 text-gray-800"}`}
                        value={editingUser ? editingUser.user_description || "" : newUser.user_description} 
                        onChange={(e) => editingUser 
                          ? setEditingUser({...editingUser, user_description: e.target.value}) 
                          : setNewUser({...newUser, user_description: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t" style={{borderColor: isDarkMode ? "border-gray-700" : "border-indigo-200"}}>
                    <Button type="button" variant="outline" size="sm" className={`${isDarkMode ? "border-gray-600 text-gray-200" : "border-indigo-300 text-indigo-700"}`} onClick={() => { setEditingUser(null); setOpenDialog(false); }}>Cancel</Button>
                    <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700">{editingUser ? "Update" : "Add"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* View User Details Dialog */}
            <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
              <DialogContent className={`w-[95%] sm:w-[600px] max-h-[80vh] overflow-y-auto shadow-xl rounded-lg ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
                <DialogHeader>
                  <DialogTitle className={`text-2xl font-bold ${isDarkMode ? "text-indigo-300" : "text-indigo-700"}`}>User Details</DialogTitle>
                </DialogHeader>
                {viewingUser && (
                  <div className="space-y-6 p-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className={`p-3 rounded-lg shadow-lg border-2 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-indigo-50 border-white"}`}>
                        <Label className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Username</Label>
                        <p className={`font-medium mt-1 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{viewingUser.username}</p>
                      </div>
                      <div className={`p-3 rounded-lg shadow-lg border-2 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-indigo-50 border-white"}`}>
                        <Label className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Email</Label>
                        <p className={`font-medium mt-1 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{viewingUser.user_email || '-'}</p>
                      </div>
                      <div className={`p-3 rounded-lg shadow-lg border-2 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-indigo-50 border-white"}`}>
                        <Label className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`h-3 w-3 rounded-full ${viewingUser.user_enabled === 'true' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className={`font-medium ${isDarkMode ? "text-gray-200 " : "text-gray-800"}`}>{viewingUser.user_enabled === 'true' ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg shadow-lg border-2 sm:col-span-2 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-indigo-50 border-white"}`}>
                        <Label className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>API Key</Label>
                        <p className={`font-mono text-sm p-2 rounded border mt-1 break-all ${isDarkMode ? "bg-gray-900 border-gray-700 text-gray-300" : "bg-white border-indigo-200 text-gray-700"}`}>
                          {viewingUser.api_key || 'Not set'}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg shadow-lg border-2 sm:col-span-2 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-indigo-50 border-white"}`}>
                        <Label className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>User UUID</Label>
                        <p className={`font-mono text-sm p-2 rounded border mt-1 break-all ${isDarkMode ? "bg-gray-900 border-gray-700 text-gray-300" : "bg-white border-indigo-200 text-gray-700"}`}>
                          {viewingUser.user_uuid}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg shadow-lg border-2 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-indigo-50 border-white"}`}>
                        <Label className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Domain UUID</Label>
                        <p className={`font-mono text-sm p-2 rounded border mt-1 break-all ${isDarkMode ? "bg-gray-900 border-gray-700 text-gray-300" : "bg-white border-indigo-200 text-gray-700"}`}>
                          {viewingUser.domain_uuid}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg shadow-lg border-2 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-indigo-50 border-white"}`}>
                        <Label className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Contact UUID</Label>
                        <p className={`font-mono text-sm p-2 rounded border mt-1 break-all ${isDarkMode ? "bg-gray-900 border-gray-700 text-gray-300" : "bg-white border-indigo-200 text-gray-700"}`}>
                          {viewingUser.contact_uuid || 'Not set'}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg shadow-lg border-2 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-indigo-50 border-white"}`}>
                        <Label className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Created</Label>
                        <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {viewingUser.insert_date ? new Date(viewingUser.insert_date).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg shadow-lg border-2 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-indigo-50 border-white"}`}>
                        <Label className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-indigo-600"}`}>Last Updated</Label>
                        <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {viewingUser.update_date ? new Date(viewingUser.update_date).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md md:mx-0 mx-4 backdrop-blur-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-lg sm:text-xl font-semibold ">Users List</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="hidden sm:table-header-group">
                  <TableRow>
                    <TableHead className="w-[150px] sm:w-[200px]">Username</TableHead>
                    <TableHead className="w-[200px] sm:w-[250px]">Email</TableHead>
                    <TableHead className="w-[100px] sm:w-[150px]">Status</TableHead>
                    <TableHead className="w-[200px] sm:w-[250px]">Api_key</TableHead>
                    <TableHead className="w-[150px] sm:w-[200px]">Insert Date</TableHead>
                    <TableHead className="w-[150px] sm:w-[200px]">Update Date</TableHead>
                    <TableHead className="w-[80px] sm:w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="mt-40">
                  {users.map((user) => (
                    <TableRow key={user.user_uuid} className="border-b transition-colors  hover:bg-muted/50 data-[state=selected]:bg-muted flex flex-col sm:table-row py-3 sm:py-0">
                      <TableCell className="font-medium sm:table-cell flex items-center gap-2"><span className="sm:hidden font-bold">Name:</span>{user.username}</TableCell>
                      <TableCell className="font-medium sm:table-cell flex items-center gap-2"><span className="sm:hidden font-bold">Email:</span>{user.user_email || '-'}</TableCell>
                      <TableCell className="sm:table-cell flex items-center gap-2">
                        <span className="sm:hidden font-bold">Status:</span>
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${user.user_enabled === 'true' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>{user.user_enabled === 'true' ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="sm:table-cell flex items-center gap-2">
  <span className="sm:hidden font-bold">Api_key:</span>
  {user.api_key ? `${user.api_key.slice(0, 2)}***` : '-'}
</TableCell>
                      <TableCell className="sm:table-cell flex items-center gap-2"><span className="sm:hidden font-bold">Inserted:</span>{user.insert_date ? new Date(user.insert_date).toLocaleString() : '-'}</TableCell>
                      <TableCell className="sm:table-cell flex items-center gap-2"><span className="sm:hidden font-bold">Updated:</span>{user.update_date ? new Date(user.update_date).toLocaleString() : '-'}</TableCell>
                      <TableCell className="flex items-center gap-2 sm:gap-4 pt-3 sm:pt-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setViewingUser(user);
                            setOpenViewDialog(true);
                          }}
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setEditingUser(user);
                            setOpenDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user.user_uuid)}
                        >
                          Delete
                        </Button>
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