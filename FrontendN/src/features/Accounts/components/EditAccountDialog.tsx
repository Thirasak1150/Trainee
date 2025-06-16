import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { FormData, Role } from "../../Accounts/types/Formdata";

interface EditAccountDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  formData: FormData;
  setFormData: (fn: (prev: FormData) => FormData) => void;
  roles: Role[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

/** Dialog for editing existing account details */
const EditAccountDialog: React.FC<EditAccountDialogProps> = ({
  open,
  setOpen,
  formData,
  setFormData,
  roles,
  onSubmit,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[95%] sm:w-[500px]">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-xl font-bold">Edit Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-5 pt-5">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="username" className="font-semibold">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  className="mt-1"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  className="mt-1"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role" className="font-semibold">
                Role
              </Label>
              <Select
                value={formData.roles_id}
                onValueChange={value => setFormData(prev => ({ ...prev, roles_id: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.roles_id} value={role.roles_id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg border">
              <Label htmlFor="enabled" className="font-semibold">
                Enabled
              </Label>
              <Switch
                id="enabled"
                name="user_enabled"
                checked={formData.user_enabled}
                onCheckedChange={checked => setFormData(prev => ({ ...prev, user_enabled: checked }))}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
              />
            </div>
            <div>
              <Label htmlFor="password" className="font-semibold">
                New Password (leave blank to keep current)
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                className="mt-2"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAccountDialog;
