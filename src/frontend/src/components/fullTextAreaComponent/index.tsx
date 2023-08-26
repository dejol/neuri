import { useEffect } from "react";
import { TypeModal } from "../../constants/enums";
import GenericModal from "../../modals/genericModal";
import { TextAreaComponentType } from "../../types/components";
import { Textarea } from "../ui/textarea";

export default function FullTextAreaComponent({
  value,
  onChange,
  disabled,
  editNode = false,
}: TextAreaComponentType) {
  // Clear text area
  useEffect(() => {
    if (disabled) {
      onChange("");
    }
  }, [disabled]);

  return (
    <div className="flex w-full items-center">
      <Textarea
        value={value}
        disabled={disabled}
        className={editNode ? "input-full-node input-note dark:input-note-dark" : ""}
        placeholder={"Type something..."}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
      
    </div>
  );
}
