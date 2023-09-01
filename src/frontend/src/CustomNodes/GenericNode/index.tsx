import { cloneDeep } from "lodash";
import { useContext, useEffect, useState } from "react";
import { NodeResizer,NodeToolbar, useUpdateNodeInternals } from "reactflow";
import ShadTooltip from "../../components/ShadTooltipComponent";
import Tooltip from "../../components/TooltipComponent";
import IconComponent from "../../components/genericIconComponent";
import { useSSE } from "../../contexts/SSEContext";
import { TabsContext } from "../../contexts/tabsContext";
import { typesContext } from "../../contexts/typesContext";
import NodeToolbarComponent from "../../pages/FlowPage/components/nodeToolbarComponent";
import { NodeDataType } from "../../types/flow";
import { cleanEdges } from "../../utils/reactflowUtils";
import { nodeColors, nodeIconsLucide } from "../../utils/styleUtils";
import { classNames, toTitleCase } from "../../utils/utils";
import ParameterComponent from "./components/parameterComponent";
import EmbeddedModal from "../../modals/embeddedModal";
import ReactMarkdown from "react-markdown";
import rehypeMathjax from "rehype-mathjax";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import CodeTabsComponent from "../../components/codeTabsComponent";

export default function GenericNode({
  data: olddata,
  selected,
}: {
  data: NodeDataType;
  selected: boolean;
}) {
  const [data, setData] = useState(olddata);
  const { updateFlow, flows, tabId } = useContext(TabsContext);
  const updateNodeInternals = useUpdateNodeInternals();
  const { types, deleteNode, reactFlowInstance } = useContext(typesContext);
  const name = nodeIconsLucide[data.type] ? data.type : types[data.type];
  const [validationStatus, setValidationStatus] = useState(null);
  // State for outline color
  
  const { sseData, isBuilding } = useSSE();
  useEffect(() => {
    olddata.node = data.node;
    let myFlow = flows.find((flow) => flow.id === tabId);
    if (reactFlowInstance && myFlow) {
      let flow = cloneDeep(myFlow);
      
      flow.data = reactFlowInstance.toObject();
      cleanEdges({
        flow: {
          edges: flow.data.edges,
          nodes: flow.data.nodes,
        },
        updateEdge: (edge) => {
          flow.data.edges = edge;
          reactFlowInstance.setEdges(edge);
          updateNodeInternals(data.id);
        },
      });
      updateFlow(flow);
    }
  }, [data]);
  const currentFlow = flows.find((flow) => flow.id === tabId);

  const [open,setOpen]=useState(false);
  const {isBuilt, setIsBuilt } = useContext(TabsContext);
  const { tabsState } = useContext(TabsContext);

  // console.log("currentFlowId:"+currentFlow.id);
  // console.log("statusAll["+open+"]["+isBuilt+"]["+tabsState[currentFlow.id]+"]["+tabsState[currentFlow.id].formKeysData+"]")

  // New useEffect to watch for changes in sseData and update validation status
  useEffect(() => {
    const relevantData = sseData[data.id];
    if (relevantData) {
      // Extract validation information from relevantData and update the validationStatus state
      setValidationStatus(relevantData);
    } else {
      setValidationStatus(null);
    }
  }, [sseData, data.id]);
  // if(data.type=="NoteEnd" && data.id=="NoteEnd-UR3HS"){
  //   console.log("init data----:",data);
  // }
  return (
    <>

      <NodeToolbar>
        <NodeToolbarComponent
          data={data}
          setData={setData}
          deleteNode={deleteNode}
        ></NodeToolbarComponent>
      </NodeToolbar>
      {(data.type=="Note" || data.type=="NoteEnd") &&(
        <NodeResizer color="red" handleStyle={{background:'red'}} lineStyle={{background:'red'}} isVisible={selected} minWidth={100} minHeight={100}/>
      )}
      <div
        className={classNames(
          selected ? "border border-ring" : "border",
          data.type =="Note"?" generic-resize-node-div"
          :data.type =="NoteEnd"?" generic-resize-node-div"
          :" generic-node-div"
        )}
        
      >
        {data.node.beta && (
          <div className="beta-badge-wrapper">
            <div className="beta-badge-content">BETA</div>
          </div>
        )}
        <div className="generic-node-div-title">
          <div className="generic-node-title-arrangement">
            <IconComponent
              name={name}
              className="generic-node-icon"
              iconColor={`${nodeColors[types[data.type]]}`}
            />
            <div className="generic-node-tooltip-div">
              <ShadTooltip content={data.node.display_name}>
                <div className="generic-node-tooltip-div text-primary">
                  {data.node.display_name}
                </div>
              </ShadTooltip>
            </div>
          </div>
          <div className="round-button-div">
            <div>
              <Tooltip
                title={
                  isBuilding ? (
                    <span>Building...</span>
                  ) : !validationStatus ? (
                    <span className="flex">
                      Build{" "}
                      <IconComponent
                        name="Zap"
                        className="mx-0.5 h-5 fill-build-trigger stroke-build-trigger stroke-1"
                      />{" "}
                      flow to validate status.
                    </span>
                  ) : (
                    <div className="max-h-96 overflow-auto">
                      {typeof validationStatus.params === "string"
                        ? validationStatus.params
                            .split("\n")
                            .map((line, index) => <div key={index}>{line}</div>)
                        : ""}
                    </div>
                  )
                }
              >
                <div className="generic-node-status-position">
                  <div
                    className={classNames(
                      validationStatus && validationStatus.valid
                        ? "green-status"
                        : "status-build-animation",
                      "status-div"
                    )}
                  ></div>
                  <div
                    className={classNames(
                      validationStatus && !validationStatus.valid
                        ? "red-status"
                        : "status-build-animation",
                      "status-div"
                    )}
                  ></div>
                  <div
                    className={classNames(
                      !validationStatus || isBuilding
                        ? "yellow-status"
                        : "status-build-animation",
                      "status-div"
                    )}
                  ></div>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className={classNames(
          data.type == "Note"
          ?"generic-resize-node-desc"
          :data.type == "NoteEnd"
          ?"generic-resize-2-node-desc":"generic-node-desc"
        )}
        >
          {data.node.description!==""?(
          <div className="generic-node-desc-text">{data.node.description}</div>
          ):(
            <></>
          )
          }
          <>
            {Object.keys(data.node.template)
              .filter((templateField) => templateField.charAt(0) !== "_")
              .map((templateField: string, idx) => (
                <div key={idx}>
                  {data.node.template[templateField].show &&
                  !data.node.template[templateField].advanced ? (
                    (data.type == "NoteEnd"&&data.node.template[templateField].type=="str")?(
                        <div className="input-full-node-wrap input-note dark:input-note-dark">
                          {
                          (isBuilt && tabsState[currentFlow.id] &&
                          tabsState[currentFlow.id].formKeysData &&
                          tabsState[currentFlow.id].formKeysData.input_keys!==null)? (
                          <EmbeddedModal
                          sourceData={data}
                          setSourceData={setData}
                          key={currentFlow.id}
                          flow={currentFlow}
                          name={templateField}
                        />):(
<div className="left-form-modal-iv-box ">
    <div className="eraser-column-arrangement">
        <div className="eraser-size-embedded">
            <div className="chat-message-div">
                <div className="form-modal-chat-position  ">
                    <div className="form-modal-chat-text-position">
                        <div className="form-modal-chat-text">
                            <div className="w-full">
                                <div className="w-full dark:text-white">
                                    <div className="w-full">                       
                             
                              <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeMathjax]}
                          className="markdown prose min-w-full text-primary word-break-break-word
                      dark:prose-invert"
                          components={{
                            pre({ node, ...props }) {
                              return <>{props.children}</>;
                            },
                            code: ({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) => {
                              if (children.length) {
                                if (children[0] === "▍") {
                                  return (
                                    <span className="form-modal-markdown-span">
                                      ▍
                                    </span>
                                  );
                                }

                                children[0] = (children[0] as string).replace(
                                  "`▍`",
                                  "▍"
                                );
                              }

                              const match = /language-(\w+)/.exec(
                                className || ""
                              );

                              return !inline ? (
                                <CodeTabsComponent
                                  isMessage
                                  tabs={[
                                    {
                                      name: (match && match[1]) || "",
                                      mode: (match && match[1]) || "",
                                      image:
                                        "https://curl.se/logo/curl-symbol-transparent.png",
                                      language: (match && match[1]) || "",
                                      code: String(children).replace(/\n$/, ""),
                                    },
                                  ]}
                                  activeTab={"0"}
                                  setActiveTab={() => {}}
                                />
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                           {data.node.template[templateField].value}
                        </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>                  
</div>          
                        )}

                      </div>                                
                    ):(
                    <ParameterComponent
                      key={
                        (data.node.template[templateField].input_types?.join(
                          ";"
                        ) ?? data.node.template[templateField].type) +
                        "|" +
                        templateField +
                        "|" +
                        data.id
                      }
                      data={data}
                      setData={setData}
                      color={
                        nodeColors[
                          types[data.node.template[templateField].type]
                        ] ??
                        nodeColors[data.node.template[templateField].type] ??
                        nodeColors.unknown
                      }
                      title={
                        data.node.template[templateField].display_name
                          ? data.node.template[templateField].display_name
                          : data.node.template[templateField].name
                          ? toTitleCase(data.node.template[templateField].name)
                          : toTitleCase(templateField)
                      }
                      info={data.node.template[templateField].info}
                      name={templateField}
                      tooltipTitle={
                        data.node.template[templateField].input_types?.join(
                          "\n"
                        ) ?? data.node.template[templateField].type
                      }
                      required={data.node.template[templateField].required}
                      id={
                        (data.node.template[templateField].input_types?.join(
                          ";"
                        ) ?? data.node.template[templateField].type) +
                        "|" +
                        templateField +
                        "|" +
                        data.id
                      }
                      left={true}
                      type={data.node.template[templateField].type}
                      optionalHandle={
                        data.node.template[templateField].input_types
                      }
                    />
                    )
                  ) : (
                    <></>
                  )}
                </div>
              ))}
            <div
              className={classNames(
                Object.keys(data.node.template).length < 1 ? "hidden" : "",
                "flex-max-width justify-center"
              )}
            >
              {" "}
            </div>


          
            <ParameterComponent
              key={[data.type, data.id, ...data.node.base_classes].join("|")}
              data={data}
              setData={setData}
              color={nodeColors[types[data.type]] ?? nodeColors.unknown}
              title={
                data.node.output_types && data.node.output_types.length > 0
                  ? data.node.output_types.join("|")
                  : data.type
              }
              tooltipTitle={data.node.base_classes.join("\n")}
              id={[data.type, data.id, ...data.node.base_classes].join("|")}
              type={data.node.base_classes.join("|")}
              left={false}
            />
          </>
        </div>
      </div>
    </>
  );
}
