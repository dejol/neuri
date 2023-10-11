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
import { cloneDeep, transform } from "lodash";
import { filterHTML } from "../../../../utils/utils";

export default function FolderPopover() {
  const { data, templates } = useContext(typesContext);
  const { flows, tabId, tabsState, isBuilt,folders,
    downloadFlows,uploadFlows,setOpenFolderList,setOpenWebEditor,openWebEditor,
    setEditFlowId,setEditNodeId
   } =useContext(TabsContext);
  const { dark, setDark } = useContext(darkContext);
  const flow = flows.find((flow) => flow.id === tabId);
  const [popoverState, setPopoverState] = useState(false);
  const [open, setOpen] = useState(false);
  const [isNewFolder, setIsNewFoler] = useState(true);
  const [openFolder, setOpenFolder] = useState(false);
  const [search, setSearch] = useState(flows);
  const [searchKeyword,setSearchKeyword] =useState('');

  // let resultFlows=cloneDeep(flows);
  useEffect(()=>{
    if(searchKeyword.length>0&&search.length>0){
      // setSearch(search);
    }else{
      setSearch(flows);
    }
    // console.log("length of flows:",getSearchResult.length)
  },[search])

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
      
      setOpenWebEditor(true);
  }

  const [newFolderId, setNewFolderId] = useState("");

  const searchNode = () => {
    // const { nodeInternals } = store.getState();
    // const nodes = Array.from(nodeInternals).map(([, node]) => node);
    let results=[];
    if (flows.length > 0) {
      flows.forEach((flow) => {
        let nodes=flow.data.nodes;
        let tempNodes=[];
        if (nodes.length > 0) {
          nodes.forEach((node) => {
            let content="";
            if(node.type=="noteNode"){
              content=node.data.value;
            }else{
              if(node.data.type=="Note"||node.data.type=="AINote"){
                content=node.data.node.template.note.value;
              }
            }
            if(content){
              content=filterHTML(content)
              if(content&&content.indexOf(searchKeyword)>=0){
                const x = node.position.x + node.width / 2;
                const y = node.position.y + node.height / 2;
                // const zoom = 1.1;
                let begin=content.indexOf(searchKeyword);
                begin=(begin-10)>0?begin-10:0;
                content=content.substring(begin,begin+20+searchKeyword.length);
                content=(begin==0?"":"...")+content+"...";
                // tempNodes.push({"id":node.id,"x":x,"y":y,"content":content})
                tempNodes.push(node);
              }
            }
          });
    
        }
        let tempFlow=cloneDeep(flow);
        tempFlow.data.nodes=tempNodes;
        results.push(tempFlow);
      });
    }

    // if(results.length==1){
    //   setCenter(results[0].x, results[0].y, { zoom:0.8, duration: 1000 });
    // }else{
      setSearch(results);
    // }
  };  
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
          <ShadTooltip content={folder.description} side="right">
          <div className="file-component-badge-div justify-start h-4"
            onDoubleClick={(event)=>{
              event.stopPropagation();
              setNewFolderId(folder.id);
              setIsNewFoler(false);
              setOpenFolder(true);
            }}
          >
            <IconComponent name="Folder" className="main-page-nav-button" />
            {folder.name}
          </div>
          </ShadTooltip>
        }
        key={idx}
        keyValue={folder.id}
        
        open={[(flow&&flow.folder_id)?flow.folder_id:""]}
      >
        <div className="file-component-tab-column">
        <List component="div" disablePadding={true}>
      {search.map((flow, idx) => (
          ((search.length>0?flow.data.nodes.length>0:true)&&flow.folder_id && flow.folder_id==folder.id)&&(
              <AccordionComponent
                      trigger={
                        <ShadTooltip content={flow.description} side="right">
                          <div className="file-component-badge-div justify-start h-4 ml-1">
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
                      open={[searchKeyword.length>0?flow.id:""]}
                    >
                      <List component="div" disablePadding={true}>
                      {
                      flow.data?.nodes.map((node, idx) => (
                        (node.type=="noteNode")?(
                          <ShadTooltip content={filterHTML(node.data.value)} side="right" key={idx}>
                          <ListItem  
                            sx={{ pl: 2 }}
                            draggable={true}
                            onDragStart={(event) =>
                              onDragStart(event, {
                                type: node.type,
                                node: node.data,
                              })
                            }
                            onDragEnd={() => {
                              document.body.removeChild(
                                document.getElementsByClassName(
                                  "cursor-grabbing"
                                )[0]
                              );
                            }}
                            className="pr-0 py-2"
                          >
                            <div className="ml-5 items-center border border-dashed border-ring rounded-lg p-3 w-40 cursor-grab font-normal"
                            onDoubleClick={(event)=>{
                              event.preventDefault();
                              webEdit(flow.id,node.data);
                              }}>
                            {filterHTML(node.data.value).substring(0,20)}
                            </div>
                          </ListItem>
                          </ShadTooltip>                        ):(
                          (node.data.type=="Note"||node.data.type=="AINote")&&(
                            <ShadTooltip content={filterHTML(node.data.node.template.note.value)} side="right" key={idx}>
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
                              className="pr-0 py-2"
                            >
                              <div className="ml-5 items-center border border-dashed border-ring input-note dark:input-note-dark w-40 cursor-grab font-normal"
                              onDoubleClick={(event)=>{
                                event.preventDefault();
                                webEdit(flow.id,node.data);
                                }}>
                              {filterHTML(node.data.node.template.note.value).substring(0,20)}
                              </div>
                            </ListItem>
                            </ShadTooltip>
                          )
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
    <div className="file-component-accordion-div mr-2">

      <AccordionComponent
        trigger={
          <ShadTooltip content="所有没有归类到文件夹的都放在这里" side="right">
          <div className="file-component-badge-div justify-start h-4">

            <IconComponent name="Folder" className="main-page-nav-button" />
            Unclassified
          </div>
          </ShadTooltip>
        }
        keyValue={"f000"}
        >
        <List component="div" disablePadding>
        {search.map((flow, idx) => (
          (search.length>0?flow.data.nodes.length>0:true)&&!flow.folder_id&&(
            <AccordionComponent
            trigger={
              <ShadTooltip content={flow.description} side="right">
                <div className="file-component-badge-div justify-start h-4 ml-1">
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
                  className="pr-0 py-2"
                >
                  <div className="ml-5 items-center border border-dashed border-ring input-note dark:input-note-dark w-40 cursor-grab font-normal"
                  onDoubleClick={()=>{webEdit(flow.id,node.data);}}>
                  {filterHTML(node.data.node.template.note.value).substring(0,20)}
                  </div>               
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
      </AccordionComponent>
     </div> 
    </Box>
  );

  return (
    <div className={"left-side-folder-arrangement"}>
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
                  setIsNewFoler(true);
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
        <div className="side-bar-search-div-placement">
          <div className="ml-1 ">
          <Input
          type="text"
          name="search"
          id="search-node"
          placeholder="Search note"
          className="nopan nodrag noundo nocopy input-search"
          onKeyUp={(event)=>{
            // console.log("event.key:",event.key);
            // console.log("value:",event);
            if(event.key=="Enter"){
              searchNode();
            }
            
          }}
          onChange={(event) => {
              setSearchKeyword(event.target.value);
          }}
        />
        <div className="search-icon right-5">
          <IconComponent
            name="Search"
            className={"h-5 w-5 stroke-[1.5] text-primary"}
            aria-hidden="true"
          
          />
        </div>
        </div>
        </div>    
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
          isNew={isNewFolder}
          popoverStatus={popoverState}
          setPopoverStatus={setPopoverState}
          folders={folders}
          folderId={newFolderId}
        ></FolderModal>
    </div>  
    <div className={"side-bar-search-div-placement justify-end"}>
        <div className="header-end-display">
            <ShadTooltip content="Backup NoteBooks" side="top">
              <button
                className={"extra-side-bar-save-disable mr-6"}
                onClick={(event) => {
                  downloadFlows();
                }}
              >
                <IconComponent
                  name="Download"
                  className={
                    "side-bar-button-size"
                  }
                />
              </button>
            </ShadTooltip>  
            <ShadTooltip content="Restore NoteBooks" side="top">
              <button
                className={"extra-side-bar-save-disable"}
                onClick={(event) => {
                  uploadFlows();
                }}
              >
                <IconComponent
                  name="Upload"
                  className={
                    "side-bar-button-size"
                  }
                />
              </button>
            </ShadTooltip>  
        </div>
      </div>
  </div>
  );
}
