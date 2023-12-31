import { useContext, useEffect, useRef, useState } from "react";
import _ from "lodash";
import IconComponent from "../../components/genericIconComponent";
import { useReactFlow } from 'reactflow';
import { Separator } from "../../components/ui/separator";
import { filterHTML } from "../../utils/utils";
import ShadTooltip from "../../components/ShadTooltipComponent";
import { Button, List, ListItem } from "@mui/material";
import moment from "moment";
import { switchToBG } from "../../pages/FlowPage/components/borderColorComponent";
import { FlowType, NoteType } from "../../types/flow";
import { TabsContext } from "../../contexts/tabsContext";
import { darkContext } from "../../contexts/darkContext";
import { alertContext } from "../../contexts/alertContext";
import { APIClassType } from "../../types/api";
import AccordionComponent from "../../components/AccordionComponent";
import { locationContext } from "../../contexts/locationContext";
import React from "react";
export default function SearchListModal({
  open,
  setOpen,
  flowList,
  noteList,
  searchKeyword,
  folderId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  noteList:Array<NoteType>;
  flowList:Array<FlowType>;
  searchKeyword?:string;
  folderId:string;
}) {
  const { setCenter,fitView } = useReactFlow();
  const isOpen = useRef(open);
  const messagesRef = useRef(null);
  
  const { flows, tabId, setTabId, tabsState, isBuilt,folders,
    backup,restore,
    setEditFlowId,setEditNodeId,setTabValues,tabValues,notes,getNodeId,
    setSearchResult,addFlow,getSearchResult
   } =useContext(TabsContext);
  const { dark, setDark } = useContext(darkContext);
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const { screenWidth,setOpenFolderList,setOpenWebEditor,openWebEditor,noteOnly } = useContext(locationContext);

  // const [loading,setLoading] = useState(false);

  // useEffect(() => {
  //   if(folderId){
  //     setSearchResult({
  //       folderId:folderId,
  //       keyword:searchKeyword,
  //       flows:flows.filter((flow)=>flow.folder_id==folderId),
  //       notes:notes.filter((note)=>note.folder_id==folderId)
  //     });
  //   }else{
  //     if(!searchKeyword){
  //       setSearchResult({
  //         folderId:folderId,
  //         keyword:searchKeyword,
  //         flows:flows.filter((flow)=>!flow.folder_id),
  //         notes:notes.filter((note)=>!note.folder_id)
  //       });        
  //     }
  //   }
    
  // }, [flowList,noteList]);

  // useEffect(() => {
  //   setLoading(true);
  // }, []);

  useEffect(() => {
    isOpen.current = open;
  }, [open]);
  const ref = useRef(null);

  useEffect(() => {
    if (open && ref.current) {
      ref.current.focus();
    }
  }, [open]);

   function focusNode(node) {
    // const x = node.position.x + node.width / 2;
    // const y = node.position.y + node.height / 2;
    // setCenter(x, y, { zoom:1.1, duration: 1000 });
    fitView({nodes:[node],duration:1000,padding:0.1})
  }
  // function getShotContent(node){
  //   let content="";
  //   if(node.type=="noteNode"||node.type=="mindNode"){
  //     content=node.data.value;
  //   }else{
  //     if(node.data.type=="Note"||node.data.type=="AINote"){
  //       content=node.data.node.template.note.value;
  //     }
  //   }
  //   if(content){
  //     content=filterHTML(content)

  //       // const zoom = 1.1;
  //       content=content.substring(0,20)+"...";      
  //   }
  //   return content;
  // }
  function newNotebook(){
    addFlow({name:"未命名",description:"",id:"",data:null,folder_id:folderId},true,folderId)
    .then((id) => {
      tabValues.set(id.toString(),{id:id.toString(),type:"flow"})
      setTabId(id.toString());
      setSuccessData({ title: "New notebook successfully" });    
    });
  }
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
  function webEdit(flow_id,flow_name,node){
    // let cont=node.node.template.note.value;
      // setNoteContent(cont);
      if(tabId==flow_id){

      }else{
        setErrorData({title:"请先打开白板： '"+flow_name+"' "})
        return;
      }
      
      setEditFlowId(flow_id);
      if(node){
        setEditNodeId(node.id);
      }else{
        setEditNodeId("");
      }
      
      setOpenWebEditor(true);
  }

  const openNewTab=(id,type)=>{
    tabValues.set(id,{id:id,type:type})
    setTabId(id);
    if(screenWidth<=1024){
      setOpen(false);
      setOpenFolderList(false);
    }
  }
  let itemCount=0;
  function itemList(flow:FlowType,idx:number){
    itemCount=idx;
    return(
      <div className="mr-4 w-full">
      <AccordionComponent
          trigger={
            <ShadTooltip content={<p>{flow.description}<br/>
              <span className=" text-muted-foreground">
              {"ID:"+flow.id}<br/>
              {"编辑:"+moment(flow.update_at).local().format('YYYY-MM-DD HH:mm:ss')}<br/>
              {"创建:"+moment(flow.create_at).local().format('YYYY-MM-DD HH:mm:ss')}
              </span>                
              </p>} side="right">
              <div className={"file-component-badge-div justify-start h-4 ml-1 "+(flow.id==tabId?"text-blue-500":"")}
                    onClick={(event) => {
                      event.stopPropagation();
                      openNewTab(flow.id,"flow");
                    }}
                >
                  <IconComponent name="FileText" className="main-page-nav-button" />
                  {flow.name.substring(0,10)+(flow.name.length>10?"...":"")}
              </div>
            </ShadTooltip>
          }
          key={flow.id}
          keyValue={flow.id}
          open={[tabId]}
          side="left"
      >
      <List component="div" disablePadding={true} key="list-of-flows">
      {flow.data?.nodes.map((node, idx) => (
        (node.type=="noteNode"||node.type=="mindNode")?(
          // <ShadTooltip content={filterHTML(node.data.value)} side="right" key={idx}>
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
            className="pr-0 py-2  group/item"
            key={idx}
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
              {moment(node.data.update_at).format('YYYY-MM-DD')}
              </span>
              )}
            </div>
            {tabId==flow.id&&(
              <button onClick={()=>{focusNode(node);}} className="absolute inset-y-0 right-1 group/edit invisible group-hover/item:visible">
                <IconComponent
                  name="Crosshair"
                  className="h-4 w-4 text-primary hover:text-gray-600"
                  aria-hidden="true"
                />
              </button>
            )}
          </ListItem>
          // </ShadTooltip>                        
          ):(
            (node.data.type=="Note"||node.data.type=="AINote")&&(
              // <ShadTooltip 
              // content={filterHTML(node.data.node.template.note.value)}
              //  side="right">
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
                className="pr-0 py-2 group/item"
                key={idx}
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
                    {moment(node.data.update_at).format('YYYY-MM-DD')}
                    </span>
                  )}                      
                </div>               
                {tabId==flow.id&&(
                  <button onClick={()=>{focusNode(node);}} className="absolute inset-y-0 right-1 group/edit invisible group-hover/item:visible">
                    <IconComponent
                      name="Crosshair"
                      className="h-4 w-4 text-primary hover:text-gray-600"
                      aria-hidden="true"
                    />
                  </button>
                )}                
              </ListItem>
              //  </ShadTooltip>
              
            )
          )

      ))
      }

      </List>
      </AccordionComponent> 
      </div>
    );
  }

  return (
    <div className="search-list-bar-arrangement shadow-lg">
          <div className="left-form-modal-iv-box mt-0 shadow-xl">
            <div className="eraser-column-arrangement">
              <div className="eraser-size group/closeButton border-l-0">
                <div className=" absolute z-50 right-1 top-1">
                  <button onClick={() => {setOpen(false);}} className="invisible group-hover/closeButton:visible">
                    <IconComponent
                      name="X"
                      className="h-5 w-5 text-primary hover:text-gray-600"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div ref={messagesRef} className="chat-message-div mt-1">
                  {searchKeyword&&searchKeyword.length>0&&(!folderId)&&(
                    <>
                    <div ref={ref} className="my-2">{flowList.length+noteList.length} {(flowList.length+noteList.length)>1?"结果":"结果"}</div>
                    <Separator orientation="horizontal" />
                    </>
                  )}
                  {(flowList.length+noteList.length)>0?(
                    <>
                    <List component="div" disablePadding={true} className="self-start w-full" key="list-of-notes">
                    {noteList.map((note, idx) => (
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
                          className="p-0 pl-2 py-2"
                          key={idx}
                        >

                          <ShadTooltip content={<p><span className="text-sm text-muted-foreground">
                            {"编辑:"+moment(note.update_at).local().format('YYYY-MM-DD HH:mm:ss')}<br/>
                            {"创建:"+moment(note.create_at).local().format('YYYY-MM-DD HH:mm:ss')}</span></p>
                          } side="right">
                          <div className={"file-component-badge-div justify-start h-4 ml-[0.85rem] cursor-pointer "+(note.id==tabId?"text-blue-500":"")}
                            onClick={() => { openNewTab(note.id,"note");  }}>
                              <IconComponent name="Square" className="main-page-nav-button" />
                              {filterHTML(note.name).substring(0,9)+(filterHTML(note.name).length>9?"...":"")}
                          </div>   
                          </ShadTooltip>                  

                        </ListItem>
                    ))}                  
                    </List>
                    {!noteOnly&&(
                      <>
                        {flowList.map((flow, idx) => (
                          <React.Fragment key={idx}>
                            {itemList(flow,idx)}
                          </React.Fragment> 
                        ))}
                      
                        {(flowList.length!=0&&(itemCount+1)!==flowList.length)&&(
                          <IconComponent name="MoreHorizontal" className="main-page-nav-button animate-pulse" />
                        )}
                     </>
                    )}

                    </>
                  ):(
                    
                    <div className="w-full h-full grid content-center justify-center">
                      <div className="py-5 flex text-2xl justify-center">无笔记</div>
                      <div className="flex justify-between w-full">
                      <Button
                        variant="text"
                        className={"extra-side-bar-save-disable"}
                        onClick={(event) => {
                          // if(flow){
                          //   webEdit(flow.id,flow.name,null);
                          // }else{
                            let noteId=getNodeId("NewNote");
                            setTabId(noteId);
                            tabValues.set(noteId,{id:noteId,type:"note"})
                            notes.push({id:noteId,name:"",folder_id:folderId,content:{id:noteId,value:""}})
                          // }
                        }}
                      >
                        新建笔记
                      </Button>
                      <Button
                        variant="text"
                        className={"extra-side-bar-save-disable"}
                        onClick={newNotebook}
                      >
                        新建笔记本
                      </Button>
                    </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
    </div>      
  );
}
