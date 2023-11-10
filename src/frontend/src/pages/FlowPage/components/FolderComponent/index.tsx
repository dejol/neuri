import { useContext, useEffect, useState,Fragment } from "react";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
import IconComponent from "../../../../components/genericIconComponent";
import { Input } from "../../../../components/ui/input";
// import { Separator } from "../../../../components/ui/separator";
import { alertContext } from "../../../../contexts/alertContext";
import { TabsContext } from "../../../../contexts/tabsContext";
// import { typesContext } from "../../../../contexts/typesContext";
// import { darkContext } from "../../../../../src/contexts/darkContext"

// import ApiModal from "../../../../modals/ApiModal";
// import ExportModal from "../../../../modals/exportModal";
// import { APIClassType, APIObjectType } from "../../../../types/api";
// import {
//   nodeColors,
//   nodeIconsLucide,
//   nodeNames,
// } from "../../../../utils/styleUtils";
// import { classNames } from "../../../../utils/utils";
// import DisclosureComponent from "../DisclosureComponent";

// import { Link } from "react-router-dom";

// import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
// import Drawer from '@mui/material/Drawer';
// import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
// import Toolbar from '@mui/material/Toolbar';
// import List from '@mui/material/List';
// import Divider from '@mui/material/Divider';
// import IconButton from '@mui/material/IconButton';
// import ListItemButton from '@mui/material/ListItemButton'
// import ListItem from '@mui/material/ListItem';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import ListSubheader from '@mui/material/ListSubheader';
// import Button from '@mui/material/Button';
// import {Button} from "../../../../components/ui/button"

// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import Collapse from '@mui/material/Collapse';
// import FlowSettingsModal from "../../../../modals/flowSettingsModal";
import FolderModal from "../../../../modals/folderModal";
import AccordionComponent from "../../../../components/AccordionComponent";
import { cloneDeep, transform } from "lodash";
import { filterHTML } from "../../../../utils/utils";
// import moment from 'moment';
// import { switchToBG } from "../borderColorComponent"
// import { FolderType } from "../../../../types/flow";
// import { ConfirmDialogModal } from "../../../../modals/confirmModal";

export default function FolderPopover() {
  // const { data, templates } = useContext(typesContext);
  const { flows, tabId, setTabId, 
    // tabsState, isBuilt,
    // backup,restore,setOpenFolderList,setOpenWebEditor,openWebEditor,
    // setEditFlowId,setEditNodeId,setTabValues,getNodeId,
    setSearchResult,getSearchResult,addFolder,removeFolder,tabValues,notes,folders
   } =useContext(TabsContext);
  // const { dark, setDark } = useContext(darkContext);
  const flow = flows.find((flow) => flow.id === tabId);
  // const [popoverState, setPopoverState] = useState(false);
  // const [open, setOpen] = useState(false);
  const [isNewFolder, setIsNewFoler] = useState(true);
  const [openFolder, setOpenFolder] = useState(false);
  // const [search, setSearch] = useState([]);
  // const [searchNote, setSearchNote] = useState([]);
  const [parentId,setParentId] =useState('');

  const [searchKeyword,setSearchKeyword] =useState('');
  const { setErrorData, setSuccessData } = useContext(alertContext);

  // let resultFlows=cloneDeep(flows);
  // useEffect(()=>{
  //   if(searchKeyword.length>0&&search.length>0){
  //     // setSearch(search);
  //   }else{
  //     setSearch(flows);
  //   }
  //   // console.log("length of flows:",getSearchResult.length)
  // },[search])

  // function onDragStart(
  //   event: React.DragEvent<any>,
  //   data: { type: string; node?: APIClassType }
  // ) {
  //   //start drag event
  //   var crt = event.currentTarget.cloneNode(true);
  //   crt.style.position = "absolute";
  //   crt.style.top = "-500px";
  //   crt.style.right = "-500px";
  //   crt.classList.add("cursor-grabbing");
  //   document.body.appendChild(crt);
  //   event.dataTransfer.setDragImage(crt, 0, 0);
  //   event.dataTransfer.setData("nodedata", JSON.stringify(data));
  // }
  // function webEdit(flow_id,flow_name,node){
  //   // let cont=node.node.template.note.value;
  //     // setNoteContent(cont);
  //     if(tabId==flow_id){

  //     }else{
  //       setErrorData({title:"Please open '"+flow_name+"' first!"})
  //       return;
  //     }
      

  //     setEditFlowId(flow_id);
  //     if(node){
  //       setEditNodeId(node.id);
  //     }else{
  //       setEditNodeId("");
  //     }
      
  //     setOpenWebEditor(true);
  // }

  const [newFolderId, setNewFolderId] = useState("");

  const searchNode = () => {
    // const { nodeInternals } = store.getState();
    // const nodes = Array.from(nodeInternals).map(([, node]) => node);
    let results=[];
    // if(!searchKeyword||searchKeyword.length==0){
    //   setSearch([]);
    //   return;
    // }
    if (flows.length > 0) {
      flows.forEach((flow) => {
        if(!flow.data){return;}
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
                tempNodes.push(node);
              }
            }
          });
    
        }
        if(tempNodes.length>0){
          let tempFlow=cloneDeep(flow);
          tempFlow.data.nodes=tempNodes;
          results.push(tempFlow);
        }else if((flow.description&&flow.description.indexOf(searchKeyword)>=0)||flow.name.indexOf(searchKeyword)>=0){
          let tempFlow=cloneDeep(flow);
          results.push(tempFlow);
        }
      });
    }
    let tempNotes=[];
    if (notes.length > 0) {
      notes.forEach((note) => {
        if(!note.content||!note.content.value){return;}
        let content=filterHTML(note.content.value)
        if(content&&content.indexOf(searchKeyword)>=0){
          tempNotes.push(note);
        }
      });
    }
    setSearchResult({folderId:"",keyword:searchKeyword,notes:tempNotes,flows:results});
    
    // }
  };  
  // useEffect(()=>{
  //   console.log("noteContent:",noteContent);
  // },[noteContent]);
  const openNewTab=(id,type)=>{
    // let newValues=cloneDeep(tabValues);
    // let exiting=newValues.find((item)=>item===id);
    // if(!exiting){
    //   newValues.push(id);
    //   setTabValues(newValues);
    // }
    tabValues.set(id,{id:id,type:type})
    setTabId(id);
  }
  const [openAccordion,setOpenAccordion]= useState([]);
  function findParentId(openId:Array<string>,folderId:string){
    openId.push(folderId);
    let folder=folders.find((folder)=>folder.id==folderId);
    if(folder.parent_id){
      // openId.push(folder.parent_id);
      findParentId(openId,folder.parent_id);
    }
  }
  function findSubId(openId:Array<string>,folderId:string){
    openId.push(folderId);
    let folder=folders.filter((folder)=>folder.parent_id==folderId);
    if(folder.length>0){
      folder.map((item)=>{
        findSubId(openId,item.id);
      });
    }
    
  }
  function calNumOfItem(folderId:string){
    let folderIds=[];
    findSubId(folderIds,folderId);
    let totalNum=0;
    folderIds.map((id)=>{
      totalNum+=flows.filter((flow)=>flow.folder_id==id).length+
      notes.filter((note)=>note.folder_id==id).length;
    })
    return totalNum;
  }
  function listSubFolders(parentId:string){
    return(
      folders.filter((folderItem)=>folderItem.parent_id==parentId)
        .map((folder, idx) => (
        <div className={!parentId?"":"ml-3"} key={idx}>
        <AccordionComponent
          trigger={
            <ShadTooltip content={folder.description} side="right">
            <div className="file-component-badge-div justify-space h-4 group/item "
              onDoubleClick={(event)=>{
                event.stopPropagation();
                setNewFolderId(folder.id);
                setIsNewFoler(false);
                setOpenFolder(true);
                
              }}
              onClick={(event)=>{
                event.stopPropagation();
                setSearchResult({
                  folderId:folder.id,
                  keyword:searchKeyword,
                  flows:flows.filter((flow)=>flow.folder_id==folder.id),
                  notes:notes.filter((note)=>note.folder_id==folder.id)
                });
              }}
            > 
              <div className={"file-component-badge-div justify-start "+(getSearchResult.folderId==folder.id?"text-blue-500":"")}>
              <IconComponent name="Folder" className="main-page-nav-button" />
              {folder.name}
              </div>
              <button className="invisible group-hover/item:visible"
                  onClick={(event)=>{
                    event.stopPropagation();                    
                      let deleteId=[];                      
                      findSubId(deleteId,folder.id);
                      let deleted=false;
                      
                      deleteId.filter((item)=>item!==folder.id).map((id)=>{
                        let index = flows.findIndex((flow) => flow.folder_id === id);
                        let indexNote = notes.findIndex((folder) => folder.folder_id === id);
                        if (index >= 0||indexNote>=0) {
                          setErrorData({title:`删除${id}操作失败，可能有白板/笔记/文件夹在本文件夹下面，请检查。`});
                        }else{
                          removeFolder(id);
                          deleted=true;
                        }          
                      });
                      
                      let index = flows.findIndex((flow) => flow.folder_id === folder.id);
                      let indexNote = notes.findIndex((folder) => folder.folder_id === folder.id);
                      if (index >= 0||indexNote>=0) {
                        setErrorData({title:`删除${folder.name}操作失败，可能有白板/笔记/文件夹在本文件夹下面，请检查。 `});
                      }else{
                        removeFolder(folder.id);
                        deleted=true;
                      } 

                      if(deleted)
                        setSuccessData({ title: "一个或多个文件夹删除成功" });                                  
                  }}
              >
                <IconComponent name="Trash2" className="main-page-nav-button" />
              </button>             
              <button className="invisible group-hover/item:visible"
                  onClick={(event)=>{
                    event.stopPropagation();                    
                    addFolder({id:"",parent_id:folder.id,name:"新建文件夹",description:""}).then((id) => {
                      // setPopoverStatus(true);
                      setSuccessData({ title: "新建文件夹创建成功" }); 
                      let openId=[];                      
                      findParentId(openId,folder.id);
                      setOpenAccordion(openId);
                    });
                    
                                                      
                  }}
              >
                <IconComponent name="Plus" className="main-page-nav-button" />
              </button>
              <div className="mr-2">
                <span className="text-sm text-muted-foreground">{calNumOfItem(folder.id)}</span>
              </div> 
            </div>
            </ShadTooltip>

          }
          key={idx}
          keyValue={folder.id}
          side="left"
          open={openAccordion}
        >
          <>{listSubFolders(folder.id)}</>
          
        </AccordionComponent>
        </div>
      ))
    )
  }
  const list = () => (
    <Box
      sx={{ width: 200 }}
      role="presentation"
      // onKeyDown={toggleDrawer(false)}
      
    >
      
    {/* {folders.map((folder, idx) => (
      (!folder.parent_id&&(
        <div className="file-component-accordion-div mr-2" key={idx}>
        <AccordionComponent
          trigger={
            <ShadTooltip content={folder.description} side="right">
            <div className="file-component-badge-div justify-space h-4 group/item "
              onDoubleClick={(event)=>{
                event.stopPropagation();
                setNewFolderId(folder.id);
                setIsNewFoler(false);
                setOpenFolder(true);
                
              }}
              onClick={(event)=>{
                event.stopPropagation();
                setSearchResult({
                  keyword:searchKeyword,
                  flows:flows.filter((flow)=>flow.folder_id==folder.id),
                  notes:notes.filter((note)=>note.folder_id==folder.id)
                });
              }}
            > 
              <div className="file-component-badge-div justify-start">
              <IconComponent name="Folder" className="main-page-nav-button" />
              {folder.name}
              </div>
              <button className="invisible group-hover/item:visible ml-3"
                  onClick={(event)=>{
                    event.stopPropagation();
                    setPopoverState(false);
                    setIsNewFoler(true);
                    setParentId(folder.id);
                    setOpenFolder(true);                    
                  }}
              >
                <IconComponent name="Plus" className="main-page-nav-button" />
              </button>
            </div>
            </ShadTooltip>
  
          }
          key={idx}
          keyValue={folder.id}
          
          open={[(flow&&flow.folder_id)?flow.folder_id:""]}
        >

           <div className="file-component-tab-column">
          <List component="div" disablePadding={true}>
        {(search.length>0?search:flows).map((flow, idx) => (
            (flow.folder_id && flow.folder_id==folder.id&&(search.length>0?flow.data.nodes.length>0:true))&&(
                <AccordionComponent
                        trigger={
                          <ShadTooltip content={<p>{flow.description}<br/>
                            <span className=" text-muted-foreground">
                            {"ID:"+flow.id}<br/>
                            {"编辑时间:"+moment(flow.update_at).local().format('LLL')}<br/>
                            {"创建时间:"+moment(flow.create_at).local().format('LLL')}
                            </span>                
                            </p>} side="right">
                            <div className="file-component-badge-div justify-start h-4 ml-1">
                            <Button
                            size="small"
                            // variant="link"
                            style={{textTransform:"none"}}
                            disableRipple
                            onClick={() => {
                              // window.location.href="/flow/"+flow.id;
                              openNewTab(flow.id,"flow");
                            }}
                            startIcon={<IconComponent name="FileText" className="main-page-nav-button" />}
                            >
                             {flow.name}
                            </Button>                          
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
                                  style={{backgroundColor:node.data.borderColor?switchToBG(node.data.borderColor,dark):""}}
                              onDoubleClick={(event)=>{
                                event.preventDefault();
                                  webEdit(flow.id,flow.name,node.data);
                                }}>
                              {filterHTML(node.data.value)?(
                                filterHTML(node.data.value).substring(0,20)
                                ):(
                                 <span className="text-sm text-ring">非文本内容</span>
                              )}
                              {node.data.update_at!=undefined&&(
                                <span className="text-sm text-ring"><br/>
                                {moment(node.data.update_at).format('LL')}
                                </span>
                              )}
                              </div>
                            </ListItem>
                            </ShadTooltip>                        
                            ):(
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
                                <div className={"ml-5 items-center border border-dashed border-ring w-40 cursor-grab font-normal "+(node.data.type=="AINote"?"input-note dark:input-note-dark":"rounded-lg p-3")}
                                    style={{backgroundColor:node.data.borderColor?switchToBG(node.data.borderColor,dark):""}}
                                onDoubleClick={(event)=>{
                                  event.preventDefault();
                                  webEdit(flow.id,flow.name,node.data);
                                  }}>
                                {filterHTML(node.data.node.template.note.value)?(
                                  filterHTML(node.data.node.template.note.value).substring(0,20)
                                  ):(
                                  <span className="text-sm text-ring">非文本内容</span>
                                )}
                                {node.data.update_at!=undefined&&(
                                    <span className="text-sm text-ring"><br/>
                                    {moment(node.data.update_at).format('LL')}
                                    </span>
                                  )}                               
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
  
  
        {(searchNote.length>0?searchNote:notes).map((note, idx) => (
            (note.folder_id && note.folder_id==folder.id)&&(
                <ListItem  
                  sx={{ pl: 2 }}
                  draggable={true}
                  onDragStart={(event) =>
                    onDragStart(event, {
                      type: "noteNode",
                      node:{value:(note.name?("<p><strong style='font-size:19px;'>"+note.name+"</strong></p>"):"")+note.content.value} ,
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
  
  
                  <div className="file-component-badge-div justify-start h-4">
                    <ShadTooltip content={<p><span className="text-sm text-muted-foreground">{"编辑时间:"+moment(note.update_at).local().format('LLL')}<br/>{"创建时间:"+moment(note.create_at).local().format('LLL')}</span></p>} side="right">
                      <Button
                      size="small"
                      // variant="link"
                      style={{textTransform:"none"}}
                      disableRipple
                      onClick={() => {
                        openNewTab(note.id,"note");
                        // webEdit(note.id,note.name,note.content.value);
                      }}
                      startIcon={<IconComponent name="Square" className="main-page-nav-button" />}
                      >
                      {filterHTML(note.name).substring(0,20)}
                      </Button>        
                      
                    </ShadTooltip>                  
                  </div>                
                </ListItem>
      
              )
            ))
          }
          </List>          
          </div>
  
        </AccordionComponent>
      </div>
      ))

    ))} */}
      {listSubFolders("")}
    <div className="file-component-accordion-div">
      <AccordionComponent
        trigger={
          <ShadTooltip content="所有没有归类到文件夹的都放在这里" side="right">
          <div className="file-component-badge-div justify-start h-4 "
              onClick={(event)=>{
                event.stopPropagation();
                setSearchResult({
                  folderId:"",
                  keyword:searchKeyword,
                  flows:flows.filter((flow)=>!flow.folder_id),
                  notes:notes.filter((note)=>!note.folder_id)
                });
              }}
            >
            <div className={"file-component-badge-div justify-start "+(getSearchResult.folderId==""?"text-blue-500/80":"")}>
            <IconComponent name="Folder" className="main-page-nav-button" />
            暂未分类
            </div>
            <div className="mr-2">
              <span className="text-sm text-muted-foreground">{flows.filter((flow)=>!flow.folder_id).length+
                    notes.filter((note)=>!note.folder_id).length}
              </span>
              </div>
          </div>
          </ShadTooltip>

        }
        keyValue={"f000"}  
        side="left"
        >
          <div className="flex justify-center">**无子目录**</div>
        {/* <List component="div" disablePadding>
        {(search.length>0?search:flows).map((flow, idx) => (
          (search.length>0?flow.data.nodes.length>0:true)&&!flow.folder_id&&(
            <AccordionComponent
            trigger={
              <ShadTooltip content={<p>{flow.description}<br/>
              <span className="text-sm text-muted-foreground">
                {"编辑时间:"+moment(flow.update_at).local().format('LLL')}<br/>
                {"创建时间:"+moment(flow.create_at).local().format('LLL')}    
                </span>            
                </p>
                } side="right">
                <div className="file-component-badge-div justify-start h-4 ml-1">
                <Button
                size="small"
                style={{textTransform:"none"}}
                // variant="text"
                disableRipple
                onClick={() => {
                  openNewTab(flow.id,"flow");

                }}
                startIcon={<IconComponent name="FileText" className="main-page-nav-button" />}
                >
                 {flow.name}
                 </Button>
              </div>
              </ShadTooltip>
            }
            key={idx}
            keyValue={flow.id}
          >
            <List component="div" disablePadding={true}>
            {flow.data?.nodes.map((node, idx) => (
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
                      style={{backgroundColor:node.data.borderColor?switchToBG(node.data.borderColor,dark):""}}
                  onDoubleClick={(event)=>{
                    event.preventDefault();
                      webEdit(flow.id,flow.name,node.data);
                    }}>
                  {filterHTML(node.data.value)?(
                    filterHTML(node.data.value).substring(0,20)
                    ):(
                      <span className="text-sm text-ring">非文本内容</span>
                   )}
                  {node.data.update_at!=undefined&&(
                    <span className="text-sm text-ring"><br/>
                    {moment(node.data.update_at).format('LL')}
                    </span>
                    )}
                  </div>
                </ListItem>
                </ShadTooltip>                        
                ):(
                  (node.data.type=="Note"||node.data.type=="AINote")&&(
                    <ShadTooltip 
                    content={filterHTML(node.data.node.template.note.value)}
                     side="right">
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
                      <div className={"ml-5 items-center border border-dashed border-ring w-40 cursor-grab font-normal "+(node.data.type=="AINote"?"input-note dark:input-note-dark":"rounded-lg p-3")}
                          style={{backgroundColor:node.data.borderColor?switchToBG(node.data.borderColor,dark):""}}
                      onDoubleClick={()=>{webEdit(flow.id,flow.name,node.data);}}>
                      {filterHTML(node.data.node.template.note.value)?(
                        filterHTML(node.data.node.template.note.value).substring(0,20)
                      ):(
                        <span className="text-sm text-ring">非文本内容</span>
                      )}
                      {node.data.update_at!=undefined&&(
                          <span className="text-sm text-ring"><br/>
                          {moment(node.data.update_at).format('LL')}
                          </span>
                        )}                      
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
        {(searchNote.length>0?searchNote:notes).map((note, idx) => (
          (!note.folder_id )&&(
              <ListItem  
                sx={{ pl: 2 }}
                draggable={true}
                onDragStart={(event) =>
                  onDragStart(event, {
                    type: "noteNode",
                    node:{value:(note.name?("<p><strong style='font-size:19px;'>"+note.name+"</strong></p>"):"")+note.content.value} ,
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


                <div className="file-component-badge-div justify-start h-4">
                <ShadTooltip content={<p><span className="text-sm text-muted-foreground">{"编辑时间:"+moment(note.update_at).local().format('LLL')}<br/>{"创建时间:"+moment(note.create_at).local().format('LLL')}</span></p>} side="right">
                    <Button
                    size="small"
                    style={{textTransform:"none"}}
                    disableRipple
                    onClick={() => {
                      openNewTab(note.id,"note");
                      // webEdit(note.id,note.name,note.content.value);
                    }}
                    startIcon={<IconComponent name="Square" className="main-page-nav-button" />}
                    >
                    
                    {filterHTML(note.name).substring(0,20)?? "无文本"}
                    
                    </Button>        
                    </ShadTooltip>                  
                </div>              
                  
              </ListItem>
    
            )
          ))
        }
        </List> */}
      </AccordionComponent>
    </div> 

    </Box>
  );

  return (
    <div className={"left-side-folder-arrangement border-r-0"}>
      {/* <div className={"side-bar-search-div-placement"}>
        <div className="header-end-display">
              <ShadTooltip content="New note" side="bottom">
              <button
                className={"extra-side-bar-save-disable"}
                onClick={(event) => {
                  if(flow){
                    webEdit(flow.id,flow.name,null);
                  }else{
                    let noteId=getNodeId("NewNote");
                    setTabId(noteId);
                    tabValues.set(noteId,{id:noteId,type:"note"})
                    notes.push({id:noteId,name:"",folder_id:"",content:{id:noteId,value:""}})
                  }
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
                  // setNewFolderId('');
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
        </div>
      </div> */}
    <div className="side-bar-components-div-arrangement pb-0">
      <div className="left-form-modal-iv-box mt-0">
        <div className="eraser-column-arrangement">
          <div className="eraser-size">
          <div className="side-bar-search-div-placement">
            <div className="ml-1 mt-1 ">
            <Input
            type="text"
            name="search"
            id="search-node"
            placeholder="查找笔记"
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

        {/* <FlowSettingsModal
          open={open}
          setOpen={setOpen}
          isNew={true}
          newFolderId={newFolderId}
        ></FlowSettingsModal> */}
        <FolderModal
          open={openFolder}
          setOpen={setOpenFolder}
          isNew={isNewFolder}
          // popoverStatus={popoverState}
          // setPopoverStatus={setPopoverState}
          folders={folders}
          folderId={newFolderId}
          parentId={parentId}
        ></FolderModal>

    </div>  
    <div className={"side-bar-search-div-placement justify-end"}>
        <div className="header-end-display">
        <ShadTooltip content="创建新的文件夹" side="right">
              <button
                className={"extra-side-bar-save-disable"}
                onClick={(event) => {  
                  addFolder({id:"",parent_id:'',name:"新建文件夹",description:""}).then((id) => {
                    setSuccessData({ title: "新建文件夹创建成功" }); 
                  });                                 
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
  </div>
  );
}
