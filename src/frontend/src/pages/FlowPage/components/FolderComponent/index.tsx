import { useContext, useEffect, useState,Fragment } from "react";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import IconComponent from "../../../../components/genericIconComponent";
import { Input } from "../../../../components/ui/input";
import { Separator } from "../../../../components/ui/separator";
import { alertContext } from "../../../../contexts/alertContext";
import { TabsContext } from "../../../../contexts/tabsContext";
import { typesContext } from "../../../../contexts/typesContext";
import { darkContext } from "../../../../../src/contexts/darkContext"

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

import { Link } from "react-router-dom";

import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton'
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Button from '@mui/material/Button';
import {Button as Button1} from "../../../../components/ui/button"

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Collapse from '@mui/material/Collapse';
import FlowSettingsModal from "../../../../modals/flowSettingsModal";
import FolderModal from "../../../../modals/folderModal";
import AccordionComponent from "../../../../components/AccordionComponent";
import { transform } from "lodash";
import { filterHTML } from "../../../../utils/utils";
import WebEditorModal from "../../../../modals/webEditorModal";

export default function FolderPopover() {
  const { data, templates } = useContext(typesContext);
  const { flows, tabId, tabsState, isBuilt,folders,
    addFlow,addFolder,setOpenFolderList,setOpenWebEditor,openWebEditor
   } =useContext(TabsContext);
  const { dark, setDark } = useContext(darkContext);
  const flow = flows.find((flow) => flow.id === tabId);
  const [popoverState, setPopoverState] = useState(false);
  const [open, setOpen] = useState(false);
  const [openFolder, setOpenFolder] = useState(false);

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
  function webEdit(flow_id,node){
    // let cont=node.node.template.note.value;
      // setNoteContent(cont);
      setEditFlowId(flow_id);
      if(node){
        setEditNodeId(node.id);
      }else{
        setEditNodeId("");
      }
      
      // console.log("vaaue:",node);
      setOpenWebEditor(true);
  }

  const [newFolderId, setNewFolderId] = useState("");
  // const [noteContent, setNoteContent] = useState("");
  const [editFlowId, setEditFlowId] = useState("");
  const [editNodeId, setEditNodeId] = useState("");


  // useEffect(()=>{
  //   console.log("noteContent:",noteContent);
  // },[noteContent]);
  const list = () => (
    <Box
      sx={{ width: 200 }}
      role="presentation"
      // onKeyDown={toggleDrawer(false)}
      
    >
      
    {folders.map((folder, idx) => (
      <div className="file-component-accordion-div mr-2" key={idx}>
      <AccordionComponent
        trigger={
          <div className="file-component-badge-div justify-start">
            <div
            // className="-mb-1 "
            onClick={(event) => {
              event.stopPropagation();
            }}
            >
            </div>
            <IconComponent name="Folder" className="main-page-nav-button" />
            {folder.name}
          </div>
        }
        key={idx}
        keyValue={folder.id}
        open={[(flow&&flow.folder_id)?flow.folder_id:""]}
      >
        <div className="file-component-tab-column">
        <List component="div" disablePadding={true}>
      {flows.map((flow, idx) => (
          (flow.folder_id && flow.folder_id==folder.id)&&(
              <AccordionComponent
                      trigger={
                        <ShadTooltip content={flow.description} side="right">
                          <div className="ml-0">
                          <Button1
                          size="sm"
                          variant="link"
                          onClick={() => {
                            window.location.href="/flow/"+flow.id;
                          }}
                          >
                          <IconComponent name="FileText" className="main-page-nav-button" />
                           {flow.name}
                          </Button1>                          
                        </div>
                        </ShadTooltip>
                      }
                      key={idx}
                      keyValue={flow.id}
                    >
                      <List component="div" disablePadding={true}>
                      {flow.data?.nodes.map((node, idx) => (
                        (node.data.type=="Note"||node.data.type=="AINote")&&(
                          <ShadTooltip content={filterHTML(node.data.node.template.note.value)} side="right">
                          <ListItem  
                            sx={{ pl: 2 }}
                            draggable={true}
                            onDragStart={(event) =>
                              onDragStart(event, {
                                type: node.data.type,
                                node: node.data.node,
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
                            <div className="ml-5 items-center border border-dashed border-ring input-note dark:input-note-dark w-24 cursor-grab font-normal">
                            {filterHTML(node.data.node.template.note.value).substring(0,20)}
                            </div>
                            <button onClick={()=>{webEdit(flow.id,node.data);}} className="ml-2">
                              <IconComponent
                                name="ExternalLink"
                                className="h-4 w-4 text-primary hover:text-gray-600"
                                aria-hidden="true"
                              />
                            </button>
                          </ListItem>
                          </ShadTooltip>
                        )
                      ))
                      }

                      </List>
                      
              </AccordionComponent>


          )
        ))}
        
        </List>          
        </div>
      </AccordionComponent>
    </div>
    ))}
      <DisclosureComponent
        openDisc={false}
        // className={"components-disclosure-top-arrangement"}
        button={{
          title: "Unclassified",
          Icon:
          nodeIconsLucide.unknown,
        }}
      >
        
        <List component="div" disablePadding>
        {flows.map((flow, idx) => (
          !flow.folder_id&&(
            <AccordionComponent
            trigger={
              <ShadTooltip content={flow.description} side="right">
                <div className="ml-0">
                <Button1
                size="sm"
                variant="link"
                onClick={() => {
                  window.location.href="/flow/"+flow.id;
                }}
                >
                  <IconComponent name="FileText" className="main-page-nav-button" />
                 {flow.name}
                </Button1>                          
              </div>
              </ShadTooltip>
            }
            key={idx}
            keyValue={flow.id}
          >
            <List component="div" disablePadding={true}>
            {flow.data.nodes.map((node, idx) => (
              (node.data.type=="Note"||node.data.type=="AINote")&&(
                <ShadTooltip content={filterHTML(node.data.node.template.note.value)} side="right">
                <ListItem 
                  sx={{ pl: 2 }}
                  draggable={true}
                  onDragStart={(event) =>
                    onDragStart(event, {
                      type: node.data.type,
                      node: node.data.node,
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
                  <div className="ml-5 items-center border border-dashed border-ring input-note dark:input-note-dark w-30 h-25 cursor-grab font-normal">
                  {filterHTML(node.data.node.template.note.value).substring(0,20)}
                  </div>
                  <button onClick={()=>{webEdit(flow.id,node.data);}} className="ml-2">
                    <IconComponent
                      name="ExternalLink"
                      className="h-4 w-4 text-primary hover:text-gray-600"
                      aria-hidden="true"
                    />
                  </button>                  
                </ListItem>
                </ShadTooltip>
              )
            ))
            }

            </List>
            
    </AccordionComponent>
          )
        ))}
        </List>
      </DisclosureComponent>
    </Box>
  );

  return (
    <div className={"side-bar-arrangement"}>
      <div className={"side-bar-search-div-placement"}>
        <div className="header-end-display">
            <ShadTooltip content="New note" side="bottom">
              <button
                className={"extra-side-bar-save-disable"}
                onClick={(event) => {
                  webEdit(flow.id,null);
                }}
              >
                <IconComponent
                  name="PlusSquare"
                  className={
                    "side-bar-button-size"
                  }
                />
              </button>
            </ShadTooltip>  
            <ShadTooltip content="New notebook" side="bottom">
              <button
                className={"extra-side-bar-save-disable"}
                onClick={(event) => {
                  setNewFolderId('');
                  setPopoverState(false);
                  setOpen(true)                  
                }}
              >
                <IconComponent
                  name="FilePlus"
                  className={
                    "side-bar-button-size"
                  }
                />
              </button>
            </ShadTooltip>  
            <ShadTooltip content="New folder" side="bottom">
              <button
                className={"extra-side-bar-save-disable"}
                onClick={(event) => {
                  setPopoverState(false);
                  setOpenFolder(true);                  
                }}
              >
                <IconComponent
                  name="FolderPlus"
                  className={
                    "side-bar-button-size"
                  }
                />
              </button>
            </ShadTooltip>                          
        </div>
    </div>
    <div className="side-bar-components-div-arrangement pb-0">
      <div className="left-form-modal-iv-box mt-0">
      <div className="eraser-column-arrangement">
        <div className="eraser-size">
          <div className="chat-message-div">
            {list()}
          </div>
        </div>
      </div>
    </div>
        <FlowSettingsModal
          open={open}
          setOpen={setOpen}
          isNew={true}
          newFolderId={newFolderId}
        ></FlowSettingsModal>
        <FolderModal
          open={openFolder}
          setOpen={setOpenFolder}
          isNew={true}
          popoverStatus={popoverState}
          setPopoverStatus={setPopoverState}
          folders={folders}
          folderId={newFolderId}
        ></FolderModal>
        <WebEditorModal
          setOpen={setOpenWebEditor}
          open={openWebEditor}
          flow_id={editFlowId}
          node_id={editNodeId}
        ></WebEditorModal>
    </div>  
  </div>
  );
}
