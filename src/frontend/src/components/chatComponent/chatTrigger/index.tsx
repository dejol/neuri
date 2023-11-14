import { Transition } from "@headlessui/react";

import { useContext } from "react";
import {
  CHAT_CANNOT_OPEN_DESCRIPTION,
  CHAT_CANNOT_OPEN_TITLE,
  FLOW_NOT_BUILT_DESCRIPTION,
  FLOW_NOT_BUILT_TITLE,
} from "../../../constants/constants";
import { alertContext } from "../../../contexts/alertContext";
import IconComponent from "../../genericIconComponent";
import { TabsContext } from "../../../contexts/tabsContext";

export default function ChatTrigger({ open, setOpen, isBuilt, canOpen }) {
  const { setErrorData } = useContext(alertContext);
  const { openAssistant } = useContext(TabsContext);
  function handleClick() {
    if (isBuilt) {
      if (canOpen) {
        setOpen(!open);
      } else {
        setErrorData({
          title: CHAT_CANNOT_OPEN_TITLE,
          list: [CHAT_CANNOT_OPEN_DESCRIPTION],
        });
      }
    } else {
      setErrorData({
        title: FLOW_NOT_BUILT_TITLE,
        list: [FLOW_NOT_BUILT_DESCRIPTION],
      });
    }
  }

  return (
    <Transition
      // show={!open}
      show={isBuilt!=null && canOpen}
      appear={true}
      enter="transition ease-out duration-300"
      enterFrom="translate-y-96"
      enterTo="translate-y-0"
      leave="transition ease-in duration-300"
      leaveFrom="translate-y-0"
      leaveTo="translate-y-96"
    >
      <button
        onClick={handleClick}
        className={
          "shadow-round-btn-shadow hover:shadow-round-btn-shadow message-button bottom-2 left-1 " +
          (!isBuilt || !canOpen ? "cursor-not-allowed" :(!open&&openAssistant? "animate-pulse cursor-pointer":"cursor-pointer"))
        }
      >
        <div className="flex gap-3">
          <IconComponent
            name="MessagesSquare"
            className={
              "h-5 w-5 transition-all " +
              (isBuilt && canOpen
                ? "message-button-icon"
                : "disabled-message-button-icon")
            }
          />
        </div>
      </button>
    </Transition>
  );
}
