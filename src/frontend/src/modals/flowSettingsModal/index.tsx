import { useContext, useEffect, useRef, useState } from "react";
import EditFlowSettings from "../../components/EditFlowSettingsComponent";
import IconComponent from "../../components/genericIconComponent";
import { Button } from "../../components/ui/button";
import { SETTINGS_DIALOG_SUBTITLE } from "../../constants/constants";
import { alertContext } from "../../contexts/alertContext";
import { TabsContext } from "../../contexts/tabsContext";
import BaseModal from "../baseModal";
import { DropdownMenu,DropdownMenuTrigger, DropdownMenuItem,DropdownMenuContent} from "../../components/ui/dropdown-menu";
import { Label } from "../../components/ui/label";
import { useNavigate } from "react-router-dom";

export default function FlowSettingsModal({
  open,
  setOpen,
  isNew = false,
  newFolderId="",
}: {
  newFolderId?:string;
  isNew?:boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const ref = useRef();
  const { flows, tabId, updateFlow, setTabsState, saveFlow,folders,addFlow } =
    useContext(TabsContext);
  const maxLength = 50;

  const [name, setName] = useState(
      isNew?"":(flows.find((flow) => flow.id === tabId).name)
  );
  const [folderId, setFolderId] = useState(
    isNew?newFolderId:(flows.find((flow) => flow.id === tabId).folder_id)
  );

  const [description, setDescription] = useState(
    isNew?"":(flows.find((flow) => flow.id === tabId).description)
  );
  const [invalidName, setInvalidName] = useState(false);
  const navigate = useNavigate();

  function handleClick() {

    if(isNew){
      if(!folderId){
        addFlow({"name":name,"description":description,"id":"","data":null,"folder_id":newFolderId},true,newFolderId)
        .then((id) => {
         navigate("/flow/" + id);
       });
      }else{
        addFlow({"name":name,"description":description,"id":"","data":null,"folder_id":folderId},true,folderId)
        .then((id) => {
         navigate("/flow/" + id);
       });
      }
      setSuccessData({ title: "New notebook successfully" });
    }else{
      let savedFlow = flows.find((flow) => flow.id === tabId);
      savedFlow.name = name;
      savedFlow.description = description;
      savedFlow.folder_id = folderId;
      saveFlow(savedFlow);
      setSuccessData({ title: "Changes saved successfully" });
    }
    setOpen(false);
  }

  return (
    <BaseModal open={open} setOpen={setOpen} size="medium">
      <BaseModal.Header description={SETTINGS_DIALOG_SUBTITLE}>
        {isNew?(
          <span className="pr-2">New notebook</span>
        ):(
          <span className="pr-2">Settings</span>
        )}
        <IconComponent name="Settings2" className="mr-2 h-4 w-4 " />
      </BaseModal.Header>
      <BaseModal.Content>
      <Label>
        <div className="edit-flow-arrangement">
          <span className="font-medium">Folder:</span>{" "}
        </div>
        <div className="mb-2 mt-2">
        <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button asChild variant="primary" size="sm">
                  <div className="header-menu-bar-display">
                    <div className="header-menu-flow-name">
                    {folders.map((folder) => (
                      ((isNew&&folder.id==newFolderId)||(!isNew&&folder.id==folderId))&&(
                        <>{folder.name}</>
                      )
                    ))}
                    </div>
                    <IconComponent name="ChevronDown" className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-50">
                {folders.map((folder, idx) => (
                <DropdownMenuItem
                  onClick={() => {
                    setFolderId(folder.id);
                  }}
                  className="cursor-pointer"
                  >
                {folder.name}
                </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
      </Label>
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
