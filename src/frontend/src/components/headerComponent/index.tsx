import { useContext, useEffect, useState,Fragment, SyntheticEvent } from "react";
// import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import { Link, useLocation, useNavigate} from "react-router-dom";
import AlertDropdown from "../../alerts/alertDropDown";
import { USER_PROJECTS_HEADER } from "../../constants/constants";
import { alertContext } from "../../contexts/alertContext";
import { darkContext } from "../../contexts/darkContext";
import { TabsContext } from "../../contexts/tabsContext";
// import { getRepoStars } from "../../controllers/API";
import IconComponent from "../genericIconComponent";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import MenuBar from "./components/menuBar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
import ShadTooltip from "../ShadTooltipComponent";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import { useStoreApi, useReactFlow } from 'reactflow';
import { filterHTML } from "../../utils/utils";

import {Button as Button1, ThemeProvider, createTheme} from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { cloneDeep } from "lodash";
import { postNotesAssistant } from "../../controllers/API";
import { typesContext } from "../../contexts/typesContext";
import DocumentTitle from 'react-document-title';
import ToggleShadComponent from "../toggleShadComponent";
import {StyledMenu} from './components/menuBar'
import { AuthContext } from "../../contexts/authContext";
import { locationContext } from "../../contexts/locationContext";

export default function Header() {
  const { flows,notes, tabId,setTabId,tabValues,setTabValues,setNotes,setPageTitle,pageTitle,
    backup,restore,getNodeId,addFlow,getSearchResult } = useContext(TabsContext);
  const { dark, setDark } = useContext(darkContext);
  const { notificationCenter,setNoticeData,setSuccessData } = useContext(alertContext);
  const {  reactFlowInstances, setReactFlowInstances } = useContext(typesContext);
  const curPath=useLocation().pathname;
  const { userData,logout } = useContext(AuthContext);
  const { screenWidth,setOpenFolderList,
    openFolderList,setOpenMiniMap,openMiniMap,openAssistant,
    setOpenAssistant,setOpenSearchList,openSearchList,noteOnly } = useContext(locationContext);


  // const location = useLocation();

  // let current_flow = flows.find((flow) => flow.id === tabId);
  // var current_folder;
  // if(current_flow){
  //     current_folder = folders.find((folder) => folder.id === current_flow.folder_id);
  // }
  

  // const [stars, setStars] = useState(null);

  // Get and set numbers of stars on header
  // useEffect(() => {
  //   async function fetchStars() {
  //     const starsCount = await getRepoStars("logspace-ai", "langflow");
  //     setStars(starsCount);
  //   }
  //   fetchStars();
  // }, []);
  const navigate = useNavigate();


  // const store = useStoreApi();
  // const [searchKeyword,setSearchKeyword] =useState('');
  // const { setCenter } = useReactFlow();

  // const searchNode = () => {
  //   // const { nodeInternals } = store.getState();
  //   // const nodes = Array.from(nodeInternals).map(([, node]) => node);
  //   let results=[];
  //   if (flows.length > 0) {
  //     flows.forEach((flow) => {
  //       let nodes=flow.data.nodes;
  //       let tempNodes=[];
  //       if (nodes.length > 0) {
  //         nodes.forEach((node) => {
  //           let content="";
  //           if(node.type=="noteNode"){
  //             content=node.data.value;
  //           }else{
  //             if(node.data.type=="Note"||node.data.type=="AINote"){
  //               content=node.data.node.template.note.value;
  //             }
  //           }
  //           if(content){
  //             content=filterHTML(content)
  //             if(content&&content.indexOf(searchKeyword)>=0){
  //               const x = node.position.x + node.width / 2;
  //               const y = node.position.y + node.height / 2;
  //               // const zoom = 1.1;
  //               let begin=content.indexOf(searchKeyword);
  //               begin=(begin-10)>0?begin-10:0;
  //               content=content.substring(begin,begin+20+searchKeyword.length);
  //               content=(begin==0?"":"...")+content+"...";
  //               // tempNodes.push({"id":node.id,"x":x,"y":y,"content":content})
  //               tempNodes.push(node);
  //             }
  //           }
  //         });
    
  //       }
  //       let tempFlow=cloneDeep(flow);
  //       tempFlow.data.nodes=tempNodes;
  //       results.push(tempFlow);
  //     });
  //   }

  //   if(results.length==1){
  //     setCenter(results[0].x, results[0].y, { zoom:0.8, duration: 1000 });
  //   }else{
  //     setSearchResult(results);
  //   }
  // };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  // const handleClick = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorEl(event.currentTarget);
  // };
  // const handleClose = () => {
  //   setAnchorEl(null);
  // };
  // function callAssistant(){
  //  postNotesAssistant(current_flow).then((resp)=>{
  //     // console.log("resp:",resp);
  //     setNoticeData({title:resp.data.result.msg})
  //   });

  // }
  const [anchorNew, setAnchorNew] = useState<null | HTMLElement>(null);
  const [openNew,setOpenNew] = useState(Boolean(anchorNew));
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorNew(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorNew(null);
    setOpenNew(false);
  };
  useEffect(()=>{
    setOpenNew(Boolean(anchorNew));
  },[anchorNew]); 

  const muiTheme = createTheme({
        palette: {
          mode: dark?'dark':'light',
        },
      });
  const fullScreen =()=>{
    if (!document.fullscreenElement) {
      let de=document.documentElement;
      if(de.requestFullscreen){
        de.requestFullscreen()
      }
      else if(de.webkitRequestFullscreen){
        de.webkitRequestFullscreen();
      }else if(de.mozRequestFullscreen){
        de.mozRequestFullscreen();
      }

    } else {
      document.exitFullscreen();
    }
  }

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    // if(reactFlowInstances.get(tabId)){
    //   let cloneRFI=cloneDeep(reactFlowInstances);
    //   let prevViewport=cloneRFI.get(tabId).getViewport();
    //    console.log("prevView:",tabId,prevViewport)
    //    tabValues.set(tabId,{flowId:tabId,type:"flow",viewport:prevViewport});
    //    console.log("valuesView:",tabId,tabValues.get(tabId).viewport);
    // }

    // console.log("veiwPort:",reactFlowInstances.get(tabId).getViewport());
    // if(reactFlowInstances.get(newValue)&&tabValues.get(newValue).viewport){
    //   console.log("setviewport----");
    //   reactFlowInstances.get(newValue).setViewport(tabValues.get(newValue).viewport);
    // }
    setTabId(newValue);
    // setReactFlowInstance(null);
  };

  useEffect(()=>{
    let title="欢迎"; //default page title
    // if(tabId&&tabId.length>0){
      let tabObj=tabValues.get(tabId);
      if(tabObj){
        if(tabObj.type=="note"){
          let curNote=notes.find((note)=>note.id==tabId);
          title=curNote.name;
        }else if(tabObj.type=="flow"){
          let flow=flows.find((flow)=>flow.id==tabId);
          if(flow)
            title=flow.name;
        }
        
      }
    // }
    setPageTitle(title);
  },[tabId]);

  function prevTabId(targetKey:string){
    const keysArray = Array.from(tabValues.keys());
    const targetKeyIndex = keysArray.indexOf(targetKey);
    if (targetKeyIndex > 0) {
      const previousKey = keysArray[targetKeyIndex - 1];
      return previousKey;
    } else {
      return "";
    }
  }
  return (
    <div className={"header-arrangement"+(dark?"":" bg-[url('/beams-basic.png')]")}>
      <DocumentTitle title={pageTitle+" - Neuri"}/>
        {/* {tabId === "" || !tabId ? (
          <>
          <div className="header-start-display">
          <Link to="/" className="ml-2">
            <img src="/logo.svg" width="40px" alt="Neuri"/>
          </Link>
          </div>
          <div className="flex justify-start">
          </div>
          </>
        ) : ( */}
          <>
          <div className="header-start-display">
            <Link to="/" className="ml-2">
              <img src="/logo.svg" width="40px" alt="Neuri"/>
            </Link>
          </div>
          <div className="flex justify-start">
            {curPath.startsWith("/app")&&(
            <div className="header-menu-bar w-full space-x-8">
              <ShadTooltip content="目录" side="bottom">
                <button 
                className="extra-side-bar-save-disable"
                onClick={()=>{
                  let tempValue=openFolderList;
                  setOpenFolderList(!tempValue);
                  // if(screenWidth<=1024){
                    setOpenSearchList(!tempValue);
                  // }
                }}
                >
                  <IconComponent name={"Sidebar"} className={"side-bar-button-size "+(openFolderList?"remind-blue":"" )} />
                </button>
              </ShadTooltip>
              {noteOnly?(
                <ShadTooltip content="创建新笔记" side="bottom">
                  <button
                    className={"extra-side-bar-save-disable"}
                    onClick={()=>{
                      handleClose();
                      let noteId=getNodeId("NewNote");
                      setTabId(noteId);
                      tabValues.set(noteId,{id:noteId,type:"note"})
                      let folderId=getSearchResult?getSearchResult.folderId:"";
                      notes.push({id:noteId,name:"",folder_id:folderId,content:{id:noteId,value:""}})                      
                    }}
                  >
                    <IconComponent name="PlusSquare" className={"side-bar-button-size"} />
                  </button>
                </ShadTooltip>
              ):(
                <>
                <ShadTooltip content="创建" side="bottom">
                <button
                  className={"extra-side-bar-save-disable"}
                  onClick={handleClick}
                >
                  <IconComponent
                    name="Edit"
                    className={
                      "side-bar-button-size"
                    }
                  />
                </button>
              </ShadTooltip>
                <ThemeProvider theme={muiTheme}>
                  <StyledMenu
                      id="new-menu"
                      MenuListProps={{
                        'aria-labelledby': 'demo-customized-button',
                      }}
                      anchorEl={anchorNew}
                      open={openNew}
                      onClose={handleClose}
                      
                  >
                  <MenuItem onClick={() => {
                        handleClose();
                        let noteId=getNodeId("NewNote");
                        setTabId(noteId);
                        tabValues.set(noteId,{id:noteId,type:"note"})
                        let folderId=getSearchResult?getSearchResult.folderId:"";
                        notes.push({id:noteId,name:"",folder_id:folderId,content:{id:noteId,value:""}})
                      }}
                  disableRipple>
                  <IconComponent name="PlusSquare" className={ "side-bar-button-size mr-2" } />
                  笔记
                  </MenuItem>                      
                  <MenuItem onClick={() => {
                        handleClose();
                        let folderId=getSearchResult?getSearchResult.folderId:"";
                        addFlow({name:"未命名",description:"",id:"",data:null,folder_id:folderId},true,folderId)
                        .then((id) => {
                          tabValues.set(id.toString(),{id:id.toString(),type:"flow"})
                          setTabId(id.toString());
                          setSuccessData({ title: "新的白板已创建" });    
                        });                        }}
                  disableRipple>
                  <IconComponent name="FilePlus" className={ "side-bar-button-size mr-2" } />
                   白板
                  </MenuItem>                        

                  </StyledMenu>
                </ThemeProvider>  
                </>
              )}
                
              {/* <Link to="/" className="gap-2">          
              <div className="flex-1">Home</div>
              </Link>
              <IconComponent name="ChevronRight" className="w-4" /> */}
                {/* {current_flow&&current_folder&&(
                  <>
                    <div>{current_folder.name}</div>
                    <IconComponent name="ChevronRight" className="w-4" />
                  </>
                )}
                {(current_flow&&current_flow.name) &&(
                  <div>{current_flow.name}</div>
                )} */}
            </div>
            )}
      </div>

    </>         
    {/* )} */}
  
      <div className="round-button-div">
      {curPath.startsWith("/app")&&screenWidth>1024&&(
        <Box sx={{ height:"2.8rem" }}>
          <Tabs value={tabId} onChange={handleChange} aria-label="neuri tabs"
          sx={{height:"45px",minHeight:"45px",maxWidth:"600px",minWidth:"200px"}} 
          variant="scrollable">
              <Tab 
                className="p-3 mt-1"
                style={{borderTop: 1,borderTopRightRadius:10,borderTopLeftRadius:10,borderStyle:"inset"}}
                label={(<div className="flex">欢迎</div>)}  
                value={""} 
                sx={{color:"unset"}}
              />
              {Array.from(tabValues.values()).map((value,inx)=>{
                let label="";
                if(value.id!=""){
                  if(value.type=="flow"){
                    let flow = flows.find((flow) => flow.id === value.id);
                    if(flow){
                      label=flow.name; 
                    }
                  }else{
                    let note = notes.find((note) => note.id === value.id);
                    if(note){
                      label=note.name; 
                    }else{
                      label="New Note";
                    }
                  }
                  
                }
                return(
                  <Tab 
                    className="p-3 mt-1 group/item"
                    style={{borderTop: 1,borderTopRightRadius:10,borderTopLeftRadius:10,borderStyle:"inset"}}
                    label={
                    (<div className="flex">
                      <IconComponent name={value.type=="flow"?"FileText":"Square"} className={"w-4 h-4 mr-2"} />{label}
                    <button onClick={(event)=>{
                      // let newValues=cloneDeep(tabValues);
                      // newValues=newValues.filter((value) => value !== key);
                      // setTabValues(newValues);
                      // event.stopPropagation();
                      if(value.id.startsWith("NewNote")){
                        setNotes(notes.filter((note) => note.id !== value.id));
                      }
                      setTabId(prevTabId(value.id));
                      // reactFlowInstances.delete(value.flowId);
                      // setTimeout(()=>{
                        
                      tabValues.delete(value.id);
                      if(value.type=="flow"){
                        reactFlowInstances.delete(value.id);
                      }
                      // },1000);
                      // setReactFlowInstance(null);
                    }} className="invisible group-hover/item:visible">
                      <IconComponent name={"X"} className="w-4 h-4 ml-2" />
                    </button>
                    </div>)
                  }  
                  value={value.id} 
                  sx={{color:"unset"}}
                  // icon={
                  //   (
                  //     <IconComponent name={"File"} className="mx-2" />
                  //   )
                  // } iconPosition="start" className="mb-4" 
                  />
                )                        
              })}

          </Tabs>
        </Box>
      )}
          {/* {(current_flow&&current_flow.name) ?(
            <>
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
            // handleSearchInput(event.target.value);
            // Set search input state
            // setSearch(event.target.value);
            // if(event.target.value&&event.target.value.length>3){
              setSearchKeyword(event.target.value);
              // focusNode(event.target.value);
            // }
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
        </>     
            ):(
              <></>
          )} */}

        
        {/* <Link to="/community">
          <Button
            className="gap-2"
            variant={
              location.pathname === "/community" ? "primary" : "secondary"
            }
            size="sm"
          >
            <IconComponent name="Users2" className="h-4 w-4" />
            <div className="flex-1">Community Examples</div>
          </Button>
        </Link> */}
      </div>
      <div className="header-end-division">
        <div className="header-end-display">
          {/* <a
            href="https://github.com/logspace-ai/langflow"
            target="_blank"
            rel="noreferrer"
            className="header-github-link"
          >
            <FaGithub className="mr-2 h-5 w-5" />
            Star
            <div className="header-github-display">{stars}</div>
          </a>
          <a
            href="https://twitter.com/logspace_ai"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground"
          >
            <FaTwitter className="side-bar-button-size" />
          </a>
          <a
            href="https://discord.gg/EqksyE2EX9"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground"
          >
            <FaDiscord className="side-bar-button-size" />
          </a> */}
        { tabId !== "" && (
          <MenuBar tabId={tabId} />
        )}
        {!curPath.startsWith("/app")&&userData&&(
           <ShadTooltip content="Back to APP" side="bottom">
           <button
            className="extra-side-bar-save-disable" 
             onClick={(event) => {
               navigate("/app");
             }}
             
           >
             <IconComponent
               name="ArrowLeft"
               className={
                 "side-bar-button-size remind-blue"
               }
             />
           </button>
         </ShadTooltip> 
        )}
          <Separator orientation="vertical" />
          <AlertDropdown>
            <div className="extra-side-bar-save-disable relative">
              {notificationCenter && (
                <div className="header-notifications"></div>
              )}
              <IconComponent
                name="Bell"
                className="side-bar-button-size"
                aria-hidden="true"
              />
            </div>
          </AlertDropdown>

            {(userData) ? (
              <ThemeProvider theme={muiTheme}>
              
                <ShadTooltip content={userData.username} side="bottom">
                <IconButton
                  onClick={(event: React.MouseEvent<HTMLElement>) => {
                    setAnchorEl(event.currentTarget);}}
                  size="small"
                  sx={{ ml: 0 }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32, }} className={userData.profile_image}>
                    {userData.username.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                </ShadTooltip>

               <Menu         
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={()=>{setAnchorEl(null);}}
                onClick={()=>{setAnchorEl(null);}}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 0.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                <MenuItem onClick={()=>{
                  navigate("/account/settings");
                  }
                }>
                  <IconComponent name="User" className="side-bar-button-size mr-2" />
                  个人偏好
                </MenuItem>
                {(userData&&userData.is_superuser&&(
                  <MenuItem onClick={()=>{
                    navigate("/admin");
                    }
                  }>
                    <IconComponent name="Users2" className="side-bar-button-size mr-2" />
                    账号管理
                  </MenuItem>
                ))}
                <MenuItem onClick={()=>{
                    setDark(!dark);    
                  }
                }>
                  {dark ? (
                    <IconComponent name="SunIcon" className="side-bar-button-size mr-2" />
                  ) : (
                    <IconComponent name="MoonIcon" className="side-bar-button-size mr-2" />
                  )}
                    显示模式
                </MenuItem>
                
                <MenuItem onClick={()=>{
                      setOpenAssistant(!openAssistant);  
                    }
                  }
                    className="px-0 pr-1"
                  >
                    {/* {openAssistant ? (
                      <IconComponent name="MicOff" className="side-bar-button-size mr-2" />
                    ) : (
                      <IconComponent name="Mic" className="side-bar-button-size mr-2" />
                    )} */}
                    <ToggleShadComponent
                    disabled={false}
                    enabled={openAssistant}
                    setEnabled={setOpenAssistant}
                    size="small"
                  />
                  AI助理
                </MenuItem>                  
                {tabValues.get(tabId)&&tabValues.get(tabId).type=="flow"&&(
                  <MenuItem onClick={()=>{
                      setOpenMiniMap(!openMiniMap);    
                    }
                  }
                  className="px-0 pr-1"
                  >
                    
                    <ToggleShadComponent
                      disabled={false}
                      enabled={openMiniMap}
                      setEnabled={setOpenMiniMap}
                      size="small"
                    />
                    全览地图
                  </MenuItem>
                )}
                                      
                <MenuItem onClick={fullScreen}>
                  <IconComponent name="Maximize" className="side-bar-button-size mr-2" />
                  {(document.fullscreenElement)?"退出":"进入"}全屏
                </MenuItem>                  
                <Divider sx={{ my: 0.5 }} />  
                <MenuItem onClick={()=>{
                  backup();
                  }
                }>
                  <IconComponent name="Download" className="side-bar-button-size mr-2" />
                  备份笔记数据
                </MenuItem>
                <MenuItem onClick={()=>{
                  restore();
                  }
                }>
                  <IconComponent name="Upload" className="side-bar-button-size mr-2" />
                  恢复笔记数据
                </MenuItem>                
                <Divider sx={{ my: 0.5 }} /> 
                <MenuItem onClick={()=>{
                    logout();    
                    setTabId("");
                    navigate("/login");
                  }
                }>
                  <IconComponent name="LogOut" className="side-bar-button-size mr-2" />退出账号
                </MenuItem>
               </Menu>
              </ThemeProvider>
            ) : (
              <ShadTooltip content="登陆" side="bottom"> 
              <button
              className="extra-side-bar-save-disable"
              onClick={() => {
                navigate("/login");     
              }}
            >
              <IconComponent name="LogIn" className="side-bar-button-size" />
              </button>       
          </ShadTooltip>  
            )}
        </div>
      </div>
    </div>
  );
}
