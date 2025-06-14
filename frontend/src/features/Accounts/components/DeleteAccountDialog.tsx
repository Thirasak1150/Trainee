"use client";
import React from "react";
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
import { Button } from "@/components/ui/button";
import { Account } from "@/features/Accounts/types/Formdata";

interface Props {
  open: boolean;
  setOpen: (acc: Account | null) => void;
  account: Account | null;
  onDelete: () => void;
}

const DeleteAccountDialog: React.FC<Props> = ({ open, setOpen, account, onDelete }) => (
  <AlertDialog open={open} onOpenChange={(v) => !v && setOpen(null)}>
    <AlertDialogTrigger asChild>{/* trigger handled externally */}</AlertDialogTrigger>
    <AlertDialogContent className="w-[95%] sm:max-w-sm">
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the account
          <span className="font-bold"> &quot;{account?.username}&quot; </span>.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => setOpen(null)}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onDelete}>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeleteAccountDialog;
