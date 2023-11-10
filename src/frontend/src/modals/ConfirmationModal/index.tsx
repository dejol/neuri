import { useState } from "react";
import { Button } from "../../components/ui/button";
import { ConfirmationModalType } from "../../types/components";
import { nodeIconsLucide } from "../../utils/styleUtils";
import BaseModal from "../baseModal";

export default function ConfirmationModal({
  title,
  asChild,
  titleHeader,
  modalContent,
  modalContentTitle,
  cancelText,
  confirmationText,
  children,
  icon,
  data,
  index,
  onConfirm,
}: ConfirmationModalType) {

  const [open, setOpen] = useState(false);
  return (
    <BaseModal size="x-small" open={open} setOpen={setOpen}>
      <BaseModal.Trigger asChild={asChild}>{children}</BaseModal.Trigger>
      <BaseModal.Header description={titleHeader}>
        <span className="pr-2">{title}</span>

      </BaseModal.Header>
      <BaseModal.Content>
        {modalContentTitle != "" && (
          <>
            <strong>{modalContentTitle}</strong>
            <br></br>
          </>
        )}
        <span>{modalContent}</span>
      </BaseModal.Content>

      <BaseModal.Footer>
        <Button
          className="ml-3"
          onClick={() => {
            setOpen(false);
            onConfirm(index, data);
          }}
        >
          {confirmationText}
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            setOpen(false);
          }}
        >
          {cancelText}
        </Button>
      </BaseModal.Footer>
    </BaseModal>
  );
}
