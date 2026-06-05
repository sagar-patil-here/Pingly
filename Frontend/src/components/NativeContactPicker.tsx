"use client";

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";

type NativeContactPickerProps = {
  onContactSelected: (name: string, phoneNumber: string) => void;
  className?: string;
};

export default function NativeContactPicker({ onContactSelected, className }: NativeContactPickerProps) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const isSupported =
      typeof navigator !== "undefined" &&
      "contacts" in navigator &&
      typeof (window as any).ContactsManager !== "undefined";

    setSupported(Boolean(isSupported));
  }, []);

  if (!supported) {
    return null;
  }

  const handlePick = async () => {
    try {
      const picked = await (navigator as any).contacts.select(["name", "tel"], {
        multiple: false,
      });

      if (!picked || picked.length === 0) {
        toast("No contact selected");
        return;
      }

      const contact = picked[0];
      const rawName = Array.isArray(contact.name) ? contact.name[0] : contact.name ?? "";
      const rawTel = Array.isArray(contact.tel) ? contact.tel[0] : contact.tel ?? "";
      const cleaned = String(rawTel).replace(/[^0-9]/g, "");

      if (!cleaned) {
        toast.error("Selected contact has no phone number");
        return;
      }

      // Propagate selection to parent form state without changing other form handlers
      onContactSelected(String(rawName || ""), cleaned);
      toast.success("Contact selected");
    } catch (error: any) {
      if (error?.name === "NotAllowedError") {
        toast.error("Permission denied to access contacts");
      } else {
        toast.error(error?.message || "Contact selection failed");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handlePick}
      className={`inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 text-[11px] h-7 ${className ?? ""}`}
    >
      <Users className="h-4 w-4" />
      Pick
    </button>
  );
}
