import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-twilight";
// import "ace-builds/webpack-resolver";
import { ReactNode, useContext, useEffect, useState } from "react";
import AceEditor from "react-ace";
import IconComponent from "../../components/genericIconComponent";
import { Button } from "../../components/ui/button";
import { WEB_EDITOR_DIALOG_SUBTITLE } from "../../constants/constants";
import { alertContext } from "../../contexts/alertContext";
import { darkContext } from "../../contexts/darkContext";
import { typesContext } from "../../contexts/typesContext";
import { postCustomComponent, postValidateCode } from "../../controllers/API";
import { APIClassType } from "../../types/api";
import BaseModal from "../baseModal";
import FullTextAreaComponent from "../../components/fullTextAreaComponent";
import { NodeDataType, NodeType } from "../../types/flow";
import { TabsContext } from "../../contexts/tabsContext";

export default function WebEditorModal({
  flow_id,
  node_id,
  children,
  open,
  setOpen,
}: {
  flow_id: string;
  node_id: string;
  open:boolean;
  setOpen: (open: boolean) => void;
  children?: ReactNode;
}) {

  const [height, setHeight] = useState(null);

  const [editValue, setEditValue] = useState("");
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const [error, setError] = useState<{
    detail: { error: string; traceback: string };
  }>(null);
  const { flows, saveFlow} = useContext(TabsContext);
 
  function handleClick() {
    let savedFlow = flows.find((flow) => flow.id === flow_id);
    let editedNode=savedFlow.data.nodes.find((node)=>node.id===node_id);
    editedNode.data.node.template.note.value=editValue;
    saveFlow(savedFlow);
    setSuccessData({ title: "Changes saved successfully" });
    setOpen(false);
  }

  useEffect(() => {
    // Function to be executed after the state changes
    const delayedFunction = setTimeout(() => {
      if (error?.detail.error !== undefined) {
        //trigger to update the height, does not really apply any height
        setHeight("90%");
      }
      //600 to happen after the transition of 500ms
    }, 600);

    // Cleanup function to clear the timeout if the component unmounts or the state changes again
    return () => {
      clearTimeout(delayedFunction);
    };
  }, [error, setHeight]);

  // const [open, setOpen] = useState(false);
  function setValue(val){
    setEditValue(val);
  }
  useEffect(() => {
    let savedFlow = flows.find((flow) => flow.id === flow_id);
    
    if(savedFlow){
      let editedNode=savedFlow.data.nodes.find((node)=>node.data.id===node_id);
       setEditValue(editedNode.data.node.template.note.value);
    }
    // let editedNode=savedFlow.data.nodes.find((node)=>node.id===node_id);
    // setEditValue(editedNode.data.template.note.value);
    // setValue(value);
  }, [flow_id,node_id]);

  return (
    <BaseModal open={open} setOpen={setOpen}>
      <BaseModal.Trigger>{children}</BaseModal.Trigger>
      <BaseModal.Header description="">
        <span className="pr-2">Edit Note Content</span>
        <IconComponent
          name="FileText"
          className="h-6 w-6 pl-1 text-primary "
          aria-hidden="true"
        />
      </BaseModal.Header>
      <BaseModal.Content>
        <div className="flex h-[95%] w-full flex-col transition-all">
          <div className="h-full w-full">
            <FullTextAreaComponent
              value={editValue ?? ""}
              onChange={setValue}
              nodeSelected={true}
            />
          </div>
          <div
            className={
              "w-full transition-all delay-500 " +
              (error?.detail.error !== undefined ? "h-2/6" : "h-0")
            }
          >
            <div className="mt-1 h-full w-full overflow-y-auto overflow-x-clip text-left custom-scroll">
              <h1 className="text-lg text-destructive">
                {error?.detail?.error}
              </h1>
              <div className="ml-2 w-full text-sm text-status-red word-break-break-word">
                <pre className="w-full word-break-break-word">
                  {error?.detail?.traceback}
                </pre>
              </div>
            </div>
          </div>
          <div className="flex h-fit w-full justify-end">
            <Button className="mt-3" onClick={handleClick} type="submit">
              Save
            </Button>
          </div>
        </div>
      </BaseModal.Content>
    </BaseModal>
  );
}
