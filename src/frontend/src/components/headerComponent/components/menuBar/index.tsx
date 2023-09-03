import { useContext, useState } from "react";
import { TabsContext } from "../../../../contexts/tabsContext";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "../../../ui/dropdown-menu";

import { Link, useNavigate } from "react-router-dom";
import { alertContext } from "../../../../contexts/alertContext";
import { undoRedoContext } from "../../../../contexts/undoRedoContext";
import FlowSettingsModal from "../../../../modals/flowSettingsModal";
import ExportModal from "../../../../modals/exportModal";
import { classNames } from "../../../../utils/utils";

import IconComponent from "../../../genericIconComponent";
import { Button } from "../../../ui/button";
import ShadTooltip from "../../../../components/ShadTooltipComponent";

export const MenuBar = ({ flows, tabId }) => {
  const { addFlow,saveFlow,uploadFlow,tabsState } = useContext(TabsContext);
  const { setSuccessData, setErrorData } = useContext(alertContext);

  const { undo, redo } = useContext(undoRedoContext);
  const [openSettings, setOpenSettings] = useState(false);
  const isPending = tabsState[tabId]?.isPending;
  const flow = flows.find((flow) => flow.id === tabId);

  const navigate = useNavigate();

  function handleAddFlow() {
    try {
      addFlow(null, true).then((id) => {
        navigate("/flow/" + id);
      });
      // saveFlowStyleInDataBase();
    } catch (err) {
      setErrorData(err);
    }
  }
  let current_flow = flows.find((flow) => flow.id === tabId);

  return (
    <div className="round-button-div">
      {/* <Link to="/">
        <IconComponent name="ChevronLeft" className="w-4" />
      </Link> */}
              
              <ShadTooltip content="New" side="bottom">
          <button
            className={
              "extra-side-bar-buttons " 
            }
            onClick={() => {
              handleAddFlow();
            }}
          >
            <IconComponent
              name="Plus"
              className={
                "side-bar-button-size" 
              }
            />
          </button>
        </ShadTooltip>      
        <ShadTooltip content="Save" side="top">
          <button
            className={
              "extra-side-bar-buttons " + (isPending ? "" : "button-disable")
            }
            onClick={(event) => {
              saveFlow(flow);
              setSuccessData({ title: "Changes saved successfully" });
            }}
          >
            <IconComponent
              name="Save"
              className={
                "side-bar-button-size" +
                (isPending ? " " : " extra-side-bar-save-disable")
              }
            />
          </button>
        </ShadTooltip>      
        <ShadTooltip content="Import" side="top">
          <button
            className="extra-side-bar-buttons"
            onClick={() => {
              uploadFlow();
            }}
          >
            <IconComponent name="FileUp" className="side-bar-button-size " />
          </button>
        </ShadTooltip>
        <ExportModal>
          <ShadTooltip content="Export" side="top">
            <div className={classNames("extra-side-bar-buttons")}>
              <IconComponent
                name="FileDown"
                className="side-bar-button-size"
              />
            </div>
          </ShadTooltip>
        </ExportModal>

        <ShadTooltip content="Settings" side="bottom">
          <button
            className={
              "extra-side-bar-buttons " 
            }
            onClick={() => {
              setOpenSettings(true);
            }}
          >
            <IconComponent
              name="Settings2"
              className={
                "side-bar-button-size" 
              }
            />
          </button>
        </ShadTooltip>
        <ShadTooltip content="Undo" side="bottom">
          <button
            className={
              "extra-side-bar-buttons " 
            }
            onClick={() => {
              undo();
            }}
          >
            <IconComponent
              name="Undo"
              className={
                "side-bar-button-size" 
              }
            />
          </button>
        </ShadTooltip>

        <ShadTooltip content="Redo" side="bottom">
          <button
            className={
              "extra-side-bar-buttons " 
            }
            onClick={() => {
              redo();
            }}
          >
            <IconComponent
              name="Redo"
              className={
                "side-bar-button-size" 
              }
            />
          </button>
        </ShadTooltip>

    </div>
  );
};

export default MenuBar;
