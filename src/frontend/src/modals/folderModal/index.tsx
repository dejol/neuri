import { useContext, useEffect, useRef, useState } from "react";
import EditFlowSettings from "../../components/EditFlowSettingsComponent";
import IconComponent from "../../components/genericIconComponent";
import { Button } from "../../components/ui/button";
import { alertContext } from "../../contexts/alertContext";
import { TabsContext } from "../../contexts/tabsContext";
import BaseModal from "../baseModal";
import { Label } from "../../components/ui/label";
import { FolderType } from "../../types/flow";

export default function FolderModal({
  open,
  setOpen,
  isNew = false,
  popoverStatus,
  setPopoverStatus,
  folderId,
  folders,
}: {
  folderId?:string;
  isNew?:boolean;
  open: boolean;
  popoverStatus:boolean;
  setOpen: (open: boolean) => void;
  setPopoverStatus:(popoverStatus:boolean)=> void;
  folders: Array<FolderType>;
}) {
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const ref = useRef();
  const { flows, tabId, updateFlow, setTabsState, saveFlow,addFolder,saveFolder } =
    useContext(TabsContext);
  const maxLength = 50;

  const [name, setName] = useState(
      isNew?"":(folders.find((folder) => folder.id === folderId).name)
  );
  // const [folderId, setFolderId] = useState(
  //   isNew?"":(flows.find((flow) => flow.id === tabId).folder_id)
  // );

  const [description, setDescription] = useState(
    isNew?"":(folders.find((folder) => folder.id === folderId).description)
  );
  useEffect(()=>{
    if(!isNew){
      setName(folders.find((folder) => folder.id === folderId).name);
      setDescription(folders.find((folder) => folder.id === folderId).description);
    }
  },[folderId]);

  const [invalidName, setInvalidName] = useState(false);
  function handleClick() {
    if(isNew){
      addFolder({"id":"","name":name,"description":description}).then((id) => {
        setPopoverStatus(true);
      });
      
      setSuccessData({ title: "New Folder is created" });
    }else{
      let savedFolder = folders.find((folder) => folder.id === folderId);
      savedFolder.name = name;
      savedFolder.description = description;
      saveFolder(savedFolder);
      console.log("save folder:%s:%s",name,description);
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
          <span className="pr-2">Edit Folder</span>
        )}
        <IconComponent name="Folder" className="mr-2 h-4 w-4 " />
      </BaseModal.Header>
      <BaseModal.Content>
          <EditFlowSettings
          invalidName={invalidName}
          setInvalidName={setInvalidName}
          name={name}
          description={description}
          flows={flows}//never use insize
          tabId={tabId}//never use insize
          setName={setName}
          setDescription={setDescription}
          updateFlow={updateFlow}//never use insize
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
