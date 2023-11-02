import _ from "lodash";
import { useContext, useState } from "react";
import { useReactFlow } from "reactflow";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import IconComponent from "../../../../components/genericIconComponent";
import { TabsContext } from "../../../../contexts/tabsContext";
import EditNodeModal from "../../../../modals/EditNodeModal";
import { classNames } from "../../../../utils/utils";
import { NodeType } from "../../../../types/flow";
import ToggleShadComponent from "../../../../components/toggleShadComponent";
import { typesContext } from "../../../../contexts/typesContext";
import { Popover } from "@mui/material";
import BorderColorComponent from "../borderColorComponent";
import { darkContext } from "../../../../contexts/darkContext";
import BuildTrigger from "../../../../modals/embeddedModal/buildTrigger";

export default function NodeToolbarComponent({ data, setData, deleteNode,runnabler,setRunnabler,miniSize,setMiniSize,setBorder }) {
  const [nodeLength, setNodeLength] = useState(
    Object.keys(data.node.template).filter(
      (templateField) =>
        templateField.charAt(0) !== "_" &&
        data.node.template[templateField].show &&
        (data.node.template[templateField].type === "str" ||
          data.node.template[templateField].type === "bool" ||
          data.node.template[templateField].type === "float" ||
          data.node.template[templateField].type === "code" ||
          data.node.template[templateField].type === "prompt" ||
          data.node.template[templateField].type === "file" ||
          data.node.template[templateField].type === "Any" ||
          data.node.template[templateField].type === "int")
    ).length
  );

  const { flows, paste,openWebEditor,setOpenWebEditor,tabId,setEditFlowId,setEditNodeId,setIsBuilt } = useContext(TabsContext);
  // const reactFlowInstance = useReactFlow();
  const {reactFlowInstances} =useContext(typesContext);
  const {dark} =useContext(darkContext);
  function changeAINoteToNote(node:NodeType){
    // console.info("type is :",node)
        // Create a new node object
    const newNode: NodeType = {
      id: '000',
      type: "genericNode",
      position: {
        x: node.position.x ,
        y: node.position.y ,
      },
      data: {
        ..._.cloneDeep(node.data),
        node:{
          ..._.cloneDeep(node.data.node),
          base_classes:['Document'],
          display_name:"Note",
          template:{
            note:{
              ..._.cloneDeep(node.data.node.template.note),
              chat_view:false,
              fulline:true,
            },
            "_type":"Note"
          },
        },
        type:"Note",
        id: '000',
      },
    };
    node.data.node.template._type;
        // console.info("after new :",newNode)
    return newNode;
  }

  function webEdit(){
      setEditFlowId(tabId);
      setEditNodeId(data.id);
      setOpenWebEditor(true);
  }

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const popoverColor = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closePop = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'colour-popover' : undefined;


  return (
    <>
      <div className="w-26 h-10">
        <span className="isolate inline-flex rounded-md shadow-sm">
          <ShadTooltip content="Delete" side="top">
            <button
              className="relative inline-flex items-center rounded-l-md  bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring transition-all duration-500 ease-in-out hover:bg-muted focus:z-10"
              onClick={() => {
                deleteNode(data.id,tabId);
              }}
            >
              <IconComponent name="Trash2" className="h-4 w-4" />
            </button>
          </ShadTooltip>
          
          <ShadTooltip content="Duplicate" side="top">
            <button
              className={classNames(
                "relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10"
              )}
              onClick={(event) => {
                event.preventDefault();
                paste(
                  {
                    nodes: [reactFlowInstances.get(tabId).getNode(data.id)],
                    edges: [],
                  },
                  {
                    x: 50,
                    y: 10,
                    paneX: reactFlowInstances.get(tabId).getNode(data.id).position.x,
                    paneY: reactFlowInstances.get(tabId).getNode(data.id).position.y,
                  }
                );
              }}
            >
  
              <IconComponent name="Copy" className="h-4 w-4" />
            </button>
          </ShadTooltip>
          {reactFlowInstances.get(tabId)?.getNode(data.id).data.type=="AINote"&&(
            <>
            <ShadTooltip content="Copy as Note" side="top">
              <button
                className={classNames(
                  "relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10"
                )}
                onClick={(event) => {
                  event.preventDefault();
                  paste(
                    {
                      nodes: [changeAINoteToNote(reactFlowInstances.get(tabId).getNode(data.id))],
                      edges: [],
                    },
                    {
                      x: 50,
                      y: 10,
                      paneX: reactFlowInstances.get(tabId).getNode(data.id).position.x,
                      paneY: reactFlowInstances.get(tabId).getNode(data.id).position.y,
                    }
                  );
                }}
              >
                <IconComponent name="Copy" className="h-4 w-4" iconColor="Green"/>
              </button>
            </ShadTooltip>
            <BuildTrigger 
              flow={flows.find((flow)=>flow.id==tabId)}
              setIsBuilt={setIsBuilt}
              nodeId={data.id}
            />
          </>
          )}
          <ShadTooltip
            content={
              data.node.documentation === "" ? "Coming Soon" : "Documentation"
            }
            side="top"
          >
            <a
              className={classNames(
                "relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10" +
                  (data.node.documentation === ""
                    ? " text-muted-foreground"
                    : " text-foreground")
              )}
              target="_blank"
              rel="noopener noreferrer"
              href={data.node.documentation}
              // deactivate link if no documentation is provided
              onClick={(event) => {
                if (data.node.documentation === "") {
                  event.preventDefault();
                }
              }}
            >
              <IconComponent name="FileText" className="h-4 w-4 " />
            </a>
          </ShadTooltip>
          {(data.type=="Note" || data.type=="AINote")?(
            <>
            <ShadTooltip content="Runnable" side="top">
                <div
                  className={
                    "relative -ml-px inline-flex items-center bg-background p-0 text-foreground shadow-md ring-1 ring-inset  ring-ring transition-all duration-500 ease-in-out hover:bg-muted focus:z-10"
                  }
                >
                  <div
                  className={"mt-1"}>
                <ToggleShadComponent
                  disabled={false}
                  enabled={runnabler}
                  setEnabled={setRunnabler}
                  size="small"
                />
                </div>
            </div>
          </ShadTooltip>
          <ShadTooltip content="Full editor" side="top">
            
            <button
              className={classNames(
                "relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10"
              )}
              onClick={(event) => {
                event.preventDefault();
                webEdit();
                
              }}
            >
              <IconComponent name="ExternalLink" className="h-4 w-4"/>
            </button>
          </ShadTooltip>
          {(data.type=="Note")&&(
            <ShadTooltip content="Border Color" side="top">
            <>
            <button
              className={classNames(
                "relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10"
              )}
              onClick={popoverColor}
            >
              <IconComponent name="Disc" className="h-4 w-4"/>
            </button>
            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={closePop}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              sx={{borderRadius:8}}

            >
              <BorderColorComponent data={data} dark={dark} setBorder={setBorder} />
            </Popover>     
            </>       
          </ShadTooltip>
          )}


          </>
          ):(
            
          <ShadTooltip content={miniSize?"Full Size":"Mini Size"} side="top">
            <button
              className={classNames(
                "relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10" 
              )}
              // rel="noopener noreferrer"
              // href={"#"}
              // deactivate link if no documentation is provided
              onClick={(event) => {
                setMiniSize(!miniSize);
              }}
            >
            {miniSize?(
              <IconComponent name="Menu" className="h-4 w-4" />
            ):(
              <IconComponent name="Minus" className="h-4 w-4 " />
            )}
            </button>
          </ShadTooltip>        
             
          )}           
          <ShadTooltip content="Edit" side="top">
            <div>
              <EditNodeModal
                data={data}
                setData={setData}
                nodeLength={nodeLength}
              >
                <div
                  className={classNames(
                    "relative -ml-px inline-flex items-center rounded-r-md bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset  ring-ring transition-all duration-500 ease-in-out hover:bg-muted focus:z-10" +
                      (nodeLength == 0
                        ? " text-muted-foreground"
                        : " text-foreground")
                  )}
                >
                  <IconComponent name="Settings2" className="h-4 w-4 " />
                </div>
              </EditNodeModal>
            </div>
          </ShadTooltip>      
        </span>
      </div>
    </>
  );
}
