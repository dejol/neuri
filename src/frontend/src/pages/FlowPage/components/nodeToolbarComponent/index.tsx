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

export default function NodeToolbarComponent({ data, setData, deleteNode,runnabler,setRunnabler,miniSize,setMiniSize }) {
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

  const { paste } = useContext(TabsContext);
  const reactFlowInstance = useReactFlow();
  function changeAINoteToNote(node:NodeType){
    // console.info("type is :",node)
        // Create a new node object
    const newNode: NodeType = {
      id: '000',
      type: "genericNode",
      position: {
        x: node.position.x ,
        y:  node.position.y ,
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

  return (
    <>
      <div className="w-26 h-10">
        <span className="isolate inline-flex rounded-md shadow-sm">
          <ShadTooltip content="Delete" side="top">
            <button
              className="relative inline-flex items-center rounded-l-md  bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring transition-all duration-500 ease-in-out hover:bg-muted focus:z-10"
              onClick={() => {
                deleteNode(data.id);
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
                    nodes: [reactFlowInstance.getNode(data.id)],
                    edges: [],
                  },
                  {
                    x: 50,
                    y: 10,
                    paneX: reactFlowInstance.getNode(data.id).position.x,
                    paneY: reactFlowInstance.getNode(data.id).position.y,
                  }
                );
              }}
            >
  
              <IconComponent name="Copy" className="h-4 w-4" />
            </button>
          </ShadTooltip>
          {reactFlowInstance.getNode(data.id).data.type=="AINote"&&(

         
          <ShadTooltip content="Copy as Note" side="top">
            <button
              className={classNames(
                "relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10"
              )}
              onClick={(event) => {
                event.preventDefault();
                paste(
                  {
                    nodes: [changeAINoteToNote(reactFlowInstance.getNode(data.id))],
                    edges: [],
                  },
                  {
                    x: 50,
                    y: 10,
                    paneX: reactFlowInstance.getNode(data.id).position.x,
                    paneY: reactFlowInstance.getNode(data.id).position.y,
                  }
                );
              }}
            >
              <IconComponent name="Copy" className="h-4 w-4" iconColor="Green"/>
            </button>
          </ShadTooltip>
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
            <ShadTooltip content="Runnable" side="top">
                <div
                  className={classNames(
                    "relative -ml-px inline-flex items-center rounded-r-md bg-background px-0 py-0 text-foreground shadow-md ring-1 ring-inset  ring-ring transition-all duration-500 ease-in-out hover:bg-muted focus:z-10" +
                      (nodeLength == 0
                        ? " text-muted-foreground"
                        : " text-foreground")
                  )}
                >
                <ToggleShadComponent
                  disabled={false}
                  enabled={runnabler}
                  setEnabled={setRunnabler}
                  size="small"
                />
            </div>
          </ShadTooltip>
          ):(
            <>
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
      </>  
          )}


        </span>
      </div>
    </>
  );
}
