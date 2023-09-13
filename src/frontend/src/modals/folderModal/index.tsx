import { useContext, useEffect, useRef, useState } from "react";
import EditFlowSettings from "../../components/EditFlowSettingsComponent";
import IconComponent from "../../components/genericIconComponent";
import { Button } from "../../components/ui/button";
import { alertContext } from "../../contexts/alertContext";
import { TabsContext } from "../../contexts/tabsContext";
import BaseModal from "../baseModal";
import { Label } from "../../components/ui/label";

export default function FolderModal({
  open,
  setOpen,
  isNew = false,
  popoverStatus,
  setPopoverStatus,
}: {
  isNew?:boolean;
  open: boolean;
  popoverStatus:boolean;
  setOpen: (open: boolean) => void;
  setPopoverStatus:(popoverStatus:boolean)=> void;
}) {
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const ref = useRef();
  const { flows, tabId, updateFlow, setTabsState, saveFlow,folders,addFolder } =
    useContext(TabsContext);
  const maxLength = 50;

  const [name, setName] = useState(
      isNew?"":(flows.find((flow) => flow.id === tabId).name)
  );
  const [folderId, setFolderId] = useState(
    isNew?"":(flows.find((flow) => flow.id === tabId).folder_id)
  );

  const [description, setDescription] = useState(
    isNew?"":(flows.find((flow) => flow.id === tabId).description)
  );
  const [invalidName, setInvalidName] = useState(false);
  function handleClick() {
    if(isNew){
      addFolder({"id":"","name":name,"description":description}).then((id) => {
        setPopoverStatus(true);
      });
      
      setSuccessData({ title: "New Folder is created" });
    }else{
      let savedFlow = flows.find((flow) => flow.id === tabId);
      savedFlow.name = name;
      savedFlow.description = description;
      saveFlow(savedFlow);
      setSuccessData({ title: "Changes saved successfully" });
    }
    setOpen(false);
  }

  return (
    <BaseModal open={open} setOpen={setOpen} size="small">
      <BaseModal.Header description="Detail about Folder">
        {isNew?(
          <span className="pr-2">New Folder</span>
        ):(
          <span className="pr-2">Settings</span>
        )}
        <IconComponent name="Settings2" className="mr-2 h-4 w-4 " />
      </BaseModal.Header>
      <BaseModal.Content>
          <EditFlowSettings
          invalidName={invalidName}
          setInvalidName={setInvalidName}
          name={name}
          description={description}
          flows={flows}
          tabId={tabId}
          setName={setName}
          setDescription={setDescription}
          updateFlow={updateFlow}
        />
      </BaseModal.Content>

      <BaseModal.Footer>
        <Button disabled={invalidName} onClick={handleClick} type="submit">
          Save
        </Button>
      </BaseModal.Footer>
    </BaseModal>
  );
}
