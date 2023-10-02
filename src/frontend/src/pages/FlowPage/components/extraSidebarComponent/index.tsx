import { useContext, useEffect, useState } from "react";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import IconComponent from "../../../../components/genericIconComponent";
import { Input } from "../../../../components/ui/input";
import { Separator } from "../../../../components/ui/separator";
import { alertContext } from "../../../../contexts/alertContext";
import { TabsContext } from "../../../../contexts/tabsContext";
import { typesContext } from "../../../../contexts/typesContext";
import ApiModal from "../../../../modals/ApiModal";
import ExportModal from "../../../../modals/exportModal";
import { APIClassType, APIObjectType } from "../../../../types/api";
import {
  nodeColors,
  nodeIconsLucide,
  nodeNames,
} from "../../../../utils/styleUtils";
import { classNames } from "../../../../utils/utils";
import DisclosureComponent from "../DisclosureComponent";
import { Button } from "../../../../components/ui/button"

export default function ExtraSidebar() {
  const { data, templates } = useContext(typesContext);
  const { flows, tabId, uploadFlow, tabsState, saveFlow, isBuilt } =
    useContext(TabsContext);
  const { setSuccessData, setErrorData } = useContext(alertContext);
  const [dataFilter, setFilterData] = useState(data);
  const [search, setSearch] = useState("");
  const isPending = tabsState[tabId]?.isPending;
  function onDragStart(
    event: React.DragEvent<any>,
    data: { type: string; node?: APIClassType }
  ) {
    //start drag event
    var crt = event.currentTarget.cloneNode(true);
    crt.style.position = "absolute";
    crt.style.top = "-500px";
    crt.style.right = "-500px";
    crt.classList.add("cursor-grabbing");
    document.body.appendChild(crt);
    event.dataTransfer.setDragImage(crt, 0, 0);
    event.dataTransfer.setData("nodedata", JSON.stringify(data));
  }

  // Handle showing components after use search input
  function handleSearchInput(e: string) {
    setFilterData((_) => {
      let ret = {};
      Object.keys(data).forEach((d: keyof APIObjectType, i) => {
        ret[d] = {};
        let keys = Object.keys(data[d]).filter((nd) =>
          nd.toLowerCase().includes(e.toLowerCase())
        );
        keys.forEach((element) => {
          ret[d][element] = data[d][element];
        });
      });
      return ret;
    });
  }
  const flow = flows.find((flow) => flow.id === tabId);
  useEffect(() => {
    // show components with error on load
    let errors = [];
    Object.keys(templates).forEach((component) => {
      if (templates[component].error) {
        errors.push(component);
      }
    });
    if (errors.length > 0)
      setErrorData({ title: " Components with errors: ", list: errors });
  }, []);

const [menuopen, setMenuOpen] = useState(false);

const handleDrawer = () => {
  setSearch("");
  setMenuOpen(!menuopen);
};

  return (
    <div 
    className={menuopen?"side-bar-arrangement":"small-side-bar-arrangement"}
    >
{/* 工具栏从这里开始 */}
<div className={menuopen?"side-bar-search-div-placement":"flex justify-end mt-2"}>
      {menuopen &&(
        <div>
        <Input
        type="text"
        name="search"
        id="search"
        placeholder="Search"
        className="nopan nodrag noundo nocopy input-search"
        onChange={(event) => {
          handleSearchInput(event.target.value);
          // Set search input state
          setSearch(event.target.value);
        }}
      />
      <div className="search-icon">
        <IconComponent
          name="Search"
          className={"h-5 w-5 stroke-[1.5] text-primary"}
          aria-hidden="true"
        
        />
      </div>
      </div>
      )}
        <Button
            className="gap-2"
            variant={ "link"}
            size="sm"
            onClick={handleDrawer}
          >

          {menuopen ?(
          <IconComponent name="ChevronsRight" className="w-3"   />
          ):(
            <IconComponent name="ChevronsLeft" className="w-3" />
          )}
        </Button>

    </div>
    {!menuopen ?(
      <>
      {Object.keys(dataFilter)
        .sort()
        .map((SBSectionName: keyof APIObjectType, index) =>
          ((SBSectionName=="notes"||SBSectionName=="custom_components"||SBSectionName=="prompts")&&Object.keys(dataFilter[SBSectionName]).length > 0) && (
        <div key={index}>
        {Object.keys(dataFilter[SBSectionName])
          .sort()
          .map((SBItemName: string, index) => (
            (!(SBSectionName=="custom_components"&&SBItemName=="CustomComponent"))&&(
              (!(SBSectionName=="prompts"&&SBItemName!="PromptTemplate"))&&(
            <ShadTooltip
              content={data[SBSectionName][SBItemName].display_name=="PromptTemplate"?"全能指令":data[SBSectionName][SBItemName].display_name}
              side="left"
              key={index}
            >
              <div key={index} data-tooltip-id={SBItemName} className="m-1">
                <div
                  draggable={!data[SBSectionName][SBItemName].error}
                  className={
                    "side-bar-mini-components-border bg-background" +
                    (data[SBSectionName][SBItemName].error
                      ? " cursor-not-allowed select-none"
                      : "")
                  }
                  style={{
                    borderLeftColor:
                      nodeColors[SBSectionName] ?? nodeColors.unknown,
                  }}
                  onDragStart={(event) =>
                    onDragStart(event, {
                      type: SBItemName,
                      node: data[SBSectionName][SBItemName],
                    })
                  }
                  onDragEnd={() => {
                    document.body.removeChild(
                      document.getElementsByClassName(
                        "cursor-grabbing"
                      )[0]
                    );
                  }}
                >
                  <div className="side-bar-mini-components-div-form">
                  <IconComponent
                      name={nodeIconsLucide[SBItemName] ? SBItemName : SBSectionName }
                      className="side-bar-components-icon w-10 h-8"
                      iconColor={`${nodeColors[SBItemName]}`}
                    />
                  </div>
                </div>
              </div>
            </ShadTooltip>
              )
            )
          ))}
        </div>
          )
        )}
      </>
    ):(
      <div className="side-bar-components-div-arrangement">
        {Object.keys(dataFilter)
          .sort()
          .map((SBSectionName: keyof APIObjectType, index) =>
            Object.keys(dataFilter[SBSectionName]).length > 0 ? (
              <DisclosureComponent
                openDisc={search.length == 0 ? false : true}
                key={index}
                
                button={{
                  title: nodeNames[SBSectionName] ?? nodeNames.unknown,
                  Icon:
                    nodeIconsLucide[SBSectionName] ?? nodeIconsLucide.unknown,
                }}
              >
                <div className="side-bar-components-gap">
                  {Object.keys(dataFilter[SBSectionName])
                    .sort()
                    .map((SBItemName: string, index) => (
                      <ShadTooltip
                        content={data[SBSectionName][SBItemName].display_name}
                        side="left"
                        key={index}
                      >
                        <div key={index} data-tooltip-id={SBItemName}>
                          <div
                            draggable={!data[SBSectionName][SBItemName].error}
                            className={
                              "side-bar-components-border bg-background" +
                              (data[SBSectionName][SBItemName].error
                                ? " cursor-not-allowed select-none"
                                : "")
                            }
                            style={{
                              borderLeftColor:
                                nodeColors[SBSectionName] ?? nodeColors.unknown,
                                marginLeft:38
                            }}
                            onDragStart={(event) =>
                              onDragStart(event, {
                                type: SBItemName,
                                node: data[SBSectionName][SBItemName],
                              })
                            }
                            onDragEnd={() => {
                              document.body.removeChild(
                                document.getElementsByClassName(
                                  "cursor-grabbing"
                                )[0]
                              );
                            }}
                          >
                            <div className="side-bar-components-div-form">
                            <IconComponent
                                name={nodeIconsLucide[SBItemName] ? SBItemName : SBSectionName }
                                className="side-bar-components-icon"
                                iconColor={`${nodeColors[SBItemName]}`}
                              />
                              <span className="side-bar-components-text">
                                {data[SBSectionName][SBItemName].display_name}
                              </span>
                              {/* <IconComponent
                                name="Menu"
                                className="side-bar-components-icon "
                              /> */}
                            </div>
                          </div>
                        </div>
                      </ShadTooltip>
                    ))}
                </div>
              </DisclosureComponent>
            ) : (
              <div key={index}></div>
            )
          )}
      </div>

    )}
    </div>
  );
}
