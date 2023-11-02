import { cloneDeep } from "lodash";
import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import CodeAreaComponent from "../../../../components/codeAreaComponent";
import Dropdown from "../../../../components/dropdownComponent";
import FloatComponent from "../../../../components/floatComponent";
import IconComponent from "../../../../components/genericIconComponent";
import InputComponent from "../../../../components/inputComponent";
import InputFileComponent from "../../../../components/inputFileComponent";
import InputListComponent from "../../../../components/inputListComponent";
import IntComponent from "../../../../components/intComponent";
import PromptAreaComponent from "../../../../components/promptComponent";
import TextAreaComponent from "../../../../components/textAreaComponent";
import FullTextAreaComponent from "../../../../components/fullTextAreaComponent";

import ToggleShadComponent from "../../../../components/toggleShadComponent";
import { TOOLTIP_EMPTY } from "../../../../constants/constants";
import { TabsContext } from "../../../../contexts/tabsContext";
import { typesContext } from "../../../../contexts/typesContext";
import { ParameterComponentType } from "../../../../types/components";
import { TabsState } from "../../../../types/tabs";
import { isValidConnection } from "../../../../utils/reactflowUtils";
import {
  nodeColors,
  nodeIconsLucide,
  nodeNames,
} from "../../../../utils/styleUtils";
import { classNames, groupByFamily } from "../../../../utils/utils";
import HtmlViewComponent from "../../../../components/htmlViewComponent";
import EmbeddedModal from "../../../../modals/embeddedModal";

export default function ParameterComponent({
  left,
  id,
  data,
  setData,
  tooltipTitle,
  title,
  color,
  type,
  name = "",
  required = false,
  optionalHandle = null,
  info = "",
  nodeSelected,
}: ParameterComponentType): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const refHtml = useRef<HTMLDivElement & ReactNode>(null);
  const infoHtml = useRef<HTMLDivElement & ReactNode>(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const [position, setPosition] = useState(0);
  const { setTabsState, tabId, save, flows } = useContext(TabsContext);
  const {isBuilt, setIsBuilt } = useContext(TabsContext);
  const { tabsState } = useContext(TabsContext);

  const flow = flows.find((flow) => flow.id === tabId)?.data?.nodes ?? null;
  const currentFlow = flows.find((flow) => flow.id === tabId);
  // Update component position
  useEffect(() => {
    if (ref.current && ref.current.offsetTop && ref.current.clientHeight) {
      setPosition(ref.current.offsetTop + ref.current.clientHeight / 2);
      updateNodeInternals(data.id);
    }
  }, [data.id, ref, ref.current, ref.current?.offsetTop, updateNodeInternals]);

  useEffect(() => {
    updateNodeInternals(data.id);
  }, [data.id, position, updateNodeInternals]);

  const { reactFlowInstances } = useContext(typesContext);
  let disabled =
    reactFlowInstances.get(tabId)?.getEdges().some((edge) => edge.targetHandle === id) ??
    false;

  const { data: myData } = useContext(typesContext);

  const handleOnNewValue = (newValue: string | string[] | boolean): void => {

    let oldRunnable=data.node.runnable;
    // console.log("runnable data:",oldRunnable);

    let newData = cloneDeep(data);
    newData.node!.runnable = oldRunnable;
    newData.node!.template[name].value = newValue;
    setData(newData);
    // console.log("new data:",newData)
    // console.log("name data:",name)

    // Set state to pending
    //@ts-ignore
    setTabsState((prev: TabsState) => {
      if (Object.keys(prev).length === 0) {
        let newTabsState: TabsState 
        newTabsState = { 
          [tabId]: { 
            isPending: true,
            formKeysData: {},
           }
        };
        return newTabsState;
      }
      // console.log("tabId in handleOnNewValue of ParameterComponent:",tabId)
        return {
          ...prev,
          [tabId]: {
            ...prev[tabId],
            isPending: true,
            formKeysData: prev[tabId]?.formKeysData,
          },
        };
      
    });
    renderTooltips();
  };

  useEffect(() => {
    if (name === "openai_api_base") console.log(info);
    // @ts-ignore
    infoHtml.current = (
      <div className="h-full w-full break-words">
        {info.split("\n").map((line, index) => (
          <p key={index} className="block">
            {line}
          </p>
        ))}
      </div>
    );
  }, [info]);

  function renderTooltips() {
    let groupedObj = groupByFamily(myData, tooltipTitle!, left, flow!);

    if (groupedObj && groupedObj.length > 0) {
      //@ts-ignore
      refHtml.current = groupedObj.map((item, index) => {
        const Icon: any =
          nodeIconsLucide[item.family] ?? nodeIconsLucide["unknown"];

        return (
          <span
            key={index}
            className={classNames(
              index > 0 ? "mt-2 flex items-center" : "flex items-center"
            )}
          >
            <div
              className="h-5 w-5"
              style={{
                color: nodeColors[item.family],
              }}
            >
              <Icon
                className="h-5 w-5"
                strokeWidth={1.5}
                style={{
                  color: nodeColors[item.family] ?? nodeColors.unknown,
                }}
              />
            </div>
            <span className="ps-2 text-xs text-foreground">
              {nodeNames[item.family] ?? "Other"}
              <span className="text-xs">
                {" "}
                {item.type === "" ? "" : " - "}
                {item.type.split(", ").length > 2
                  ? item.type.split(", ").map((el, index) => (
                      <React.Fragment key={el + index}>
                        <span>
                          {index === item.type.split(", ").length - 1
                            ? el
                            : (el += `, `)}
                        </span>
                      </React.Fragment>
                    ))
                  : item.type}
              </span>
            </span>
          </span>
        );
      });
    } else {
      //@ts-ignore
      refHtml.current = <span>{TOOLTIP_EMPTY}</span>;
    }
  }

  useEffect(() => {
    renderTooltips();
  }, [tooltipTitle, flow]);
  
  return (
    <div
      ref={ref}
      className={
        (data.type=="Note"&&!left)?"":
          // (data.type=="AINote"&&!left)?"hidden ":""+
          ((data.node.mini_size==undefined||!data.node.mini_size)?"h-full ":"generic-node-merge-template h-10 ")+
          ((type=="str" && (data.node?.template[name].fulline||data.node?.template[name].chat_view))?"":"mt-1 ")+
          "flex w-full flex-wrap items-center justify-between bg-muted " +
          ((type=="str" && (data.node?.template[name].fulline||data.node?.template[name].chat_view))?"":"px-5 ")+
          ((data.node.mini_size==undefined||!data.node.mini_size)?
          !(type=="str" && (data.node?.template[name].fulline||data.node?.template[name].chat_view))?"py-2 ":"":"") 
      }
    >
      <>
     {!(type=="str" && (data.node?.template[name].fulline||data.node?.template[name].chat_view))&&left
     &&data.type!=="AINote" 
     && (
          <div className={
              "w-full truncate text-sm" +
              (left ? "" : " text-end") +
              (info !== "" ? " flex items-center" : "")
            }
          >
            {(title&&title=="PromptTemplate")?"全能指令":title}
            <span className="text-status-red">{required ? " *" : ""}</span>
            <div className="">
              {info !== "" && (
                <ShadTooltip content={infoHtml.current}>
                  {/* put div to avoid bug that does not display tooltip */}
                  <div>
                    <IconComponent
                      name="Info"
                      className="relative bottom-0.5 ml-2 h-3 w-4"
                    />
                  </div>
                </ShadTooltip>
              )}
            </div>
          </div>
       )}
        

        {left &&
        (type === "str" ||
          type === "bool" ||
          type === "float" ||
          type === "code" ||
          type === "prompt" ||
          type === "file" ||
          type === "int") &&
        !optionalHandle ? (
          <></>
        ) : (
          <ShadTooltip
            styleClasses={"tooltip-fixed-width custom-scroll nowheel"}
            delayDuration={0}
            content={refHtml.current}
            side={left ? "left" : "right"}
          >
            <Handle
              type={left ? "target" : "source"}
              position={left ? Position.Left : Position.Right}
              id={id}
              isValidConnection={(connection) =>
                isValidConnection(connection, reactFlowInstances.get(tabId)!)
              }
              className={classNames(
                left ? "-ml-0.5 " : "-mr-0.5 ",
                "h-3 w-3 rounded-full border-2 bg-background"
              )}
              style={{
                borderColor: color,
                top: position,
              }}
            ></Handle>
          </ShadTooltip>
        )}

        {left === true &&
        type === "str" &&
        !data.node?.template[name].options ? (
          <div className={
            (data.node.mini_size!=undefined&&data.node.mini_size) ?"hidden ":""+
            ((data.node?.template[name].fulline)?"":"mt-2 ")+
             "w-full h-full"
          }>
            {data.node?.template[name].list ? (
              <InputListComponent
                disabled={disabled}
                value={
                  !data.node.template[name].value ||
                  data.node.template[name].value === ""
                    ? [""]
                    : data.node.template[name].value
                }
                onChange={handleOnNewValue}
              />
            ) : data.node?.template[name].multiline ? (
              <TextAreaComponent
                disabled={disabled}
                value={data.node.template[name].value ?? ""}
                onChange={handleOnNewValue}
              />
              
              ) : data.node?.template[name].fulline ? (
                <FullTextAreaComponent
                  value={data.node.template[name].value ?? ""}
                  onChange={handleOnNewValue}
                  data={data}
                  nodeSelected={nodeSelected}
                />  
              ) : data.node?.template[name].chat_view ? (
                  <div className="input-full-node-wrap input-note dark:input-note-dark">
                    {
                    (isBuilt && tabsState[currentFlow.id+"-"+data.id] &&
                    tabsState[currentFlow.id+"-"+data.id].formKeysData &&
                    tabsState[currentFlow.id+"-"+data.id].formKeysData.input_keys!==null)? (
                    <EmbeddedModal
                    sourceData={data}
                    setSourceData={setData}
                    key={currentFlow.id}
                    flow={currentFlow}
                    name={name}
                  />
                  ):(
                    <HtmlViewComponent
                      contentValue={data.node.template[name].value}
                      onChange={handleOnNewValue}
                      data={data}
                      nodeSelected={nodeSelected}
                    />
                  )}
                </div>                             

            ) : (
              <InputComponent
                disabled={disabled}
                password={data.node?.template[name].password ?? false}
                value={data.node?.template[name].value ?? ""}
                onChange={handleOnNewValue}
              />
            )}
          </div>
        ) : left === true && type === "bool" ? (
          <div className={(data.node.mini_size!=undefined&&data.node.mini_size) ?"hidden ":""+"mt-2 w-full"}>
            <ToggleShadComponent
              disabled={disabled}
              enabled={data.node?.template[name].value ?? false}
              setEnabled={(isEnabled) => {
                handleOnNewValue(isEnabled);
              }}
              size="large"
            />
          </div>
        ) : left === true && type === "float" ? (
          <div className={(data.node.mini_size!=undefined&&data.node.mini_size) ?"hidden ":""+"mt-2 w-full"}>
            <FloatComponent
              disabled={disabled}
              value={data.node?.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : left === true &&
          type === "str" &&
          data.node?.template[name].options ? (
          <div className={(data.node.mini_size!=undefined&&data.node.mini_size) ?"hidden ":""+"mt-2 w-full"}>
            <Dropdown
              options={data.node.template[name].options}
              onSelect={handleOnNewValue}
              value={data.node.template[name].value ?? "Choose an option"}
            ></Dropdown>
          </div>
        ) : left === true && type === "code" ? (
          <div className={(data.node.mini_size!=undefined&&data.node.mini_size) ?"hidden ":""+"mt-2 w-full"}>
            <CodeAreaComponent
              dynamic={data.node?.template[name].dynamic ?? false}
              setNodeClass={(nodeClass) => {
                data.node = nodeClass;
              }}
              nodeClass={data.node}
              disabled={disabled}
              value={data.node?.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : left === true && type === "file" ? (
          <div className={(data.node.mini_size!=undefined&&data.node.mini_size) ?"hidden ":""+"mt-2 w-full"}>
            <InputFileComponent
              disabled={disabled}
              value={data.node?.template[name].value ?? ""}
              onChange={handleOnNewValue}
              fileTypes={data.node?.template[name].fileTypes}
              suffixes={data.node?.template[name].suffixes}
              onFileChange={(filePath: string) => {
                data.node!.template[name].file_path = filePath;
                save();
              }}
            ></InputFileComponent>
          </div>
        ) : left === true && type === "int" ? (
          <div className={(data.node.mini_size!=undefined&&data.node.mini_size) ?"hidden ":""+"mt-2 w-full"}>
            <IntComponent
              disabled={disabled}
              value={data.node?.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : left === true && type === "prompt" ? (
          <div className={(data.node.mini_size!=undefined&&data.node.mini_size) ?"hidden ":""+"mt-2 w-full"}>
            <PromptAreaComponent
              field_name={name}
              setNodeClass={(nodeClass) => {
                data.node = nodeClass;
              }}
              nodeClass={data.node}
              disabled={disabled}
              value={data.node?.template[name].value ?? ""}
              onChange={handleOnNewValue}
            />
          </div>
        ) : (
          <></>
        )}
      </>
    </div>
  );
}
