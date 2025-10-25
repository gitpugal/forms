// LogoutConfirmationDialog.js

import React from "react";
import { Button } from "./ui/button";
import { Modal } from "@/components/ui/modal";

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      title="Logout Confirmation"
      description="Are you sure you want to logout?"
      isOpen={isOpen}
      onClose={onCancel}
    >
      <div className="flex justify-end">
        <Button className="mr-2" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>Logout</Button>
      </div>
    </Modal>
  );
};

export default LogoutConfirmationDialog;
