import { useContext, useEffect, useState,Fragment } from "react";
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
import { Input } from "../ui/input";

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

export default function Header() {
  const { flows, tabId,isLogin,setIsLogin,setSearchResult,setOpenFolderList,openFolderList,folders,setLoginUserId,setOpenMiniMap,openMiniMap,openAssistant,setOpenAssistant } = useContext(TabsContext);
  const { dark, setDark } = useContext(darkContext);
  const { notificationCenter,setNoticeData } = useContext(alertContext);
  const location = useLocation();

  let current_flow = flows.find((flow) => flow.id === tabId);
  var current_folder;
  if(current_flow){
      current_folder = folders.find((folder) => folder.id === current_flow.folder_id);
  }
  

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

  function logout(){
    setLoginUserId("");
    setIsLogin(false);
    localStorage.setItem('login',"");
    localStorage.setItem('userName',"");
    navigate("/");
  }

  const store = useStoreApi();
  const [searchKeyword,setSearchKeyword] =useState('');
  const { setCenter } = useReactFlow();

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

    if(results.length==1){
      setCenter(results[0].x, results[0].y, { zoom:0.8, duration: 1000 });
    }else{
      setSearchResult(results);
    }
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // function callAssistant(){
  //  postNotesAssistant(current_flow).then((resp)=>{
  //     // console.log("resp:",resp);
  //     setNoticeData({title:resp.data.result.msg})
  //   });

  // }
  const muiTheme = ()=>{
    if(dark){
      return createTheme({
        palette: {
          mode: 'dark',
        },
      });
    }
    return createTheme({
      palette: {
         mode: 'light',
      },
    });

};
  return (
    <div className="header-arrangement">
      
        {tabId === "" || !tabId ? (
          <>
          <div className="header-start-display">
          <Link to="/" className="ml-2">
            <img src="/logo.svg" width="40px" alt="Neuri"/>
          </Link>
          </div>
          <div className="flex justify-start">
          </div>
          </>
        ) : (
          <>
          <div className="header-start-display">
            <Link to="/" className="ml-2">
              <img src="/logo.svg" width="40px" alt="Neuri"/>
            </Link>
            {/* <ShadTooltip content="Folder" side="bottom">
          <button 
          className="extra-side-bar-save-disable"
          onClick={()=>{setOpenFolderList(!openFolderList);}}
          >
            <IconComponent name={openFolderList?"X":"Sidebar"} className="side-bar-button-size " />
          </button>
          </ShadTooltip> */}
      </div>
      <div className="flex justify-start">
          <div className="header-menu-bar">
          <Link to="/" className="gap-2">          
          <div className="flex-1">Home</div>
          </Link>
          <IconComponent name="ChevronRight" className="w-4" />
            {current_flow&&current_folder&&(
              <>
                <div>{current_folder.name}</div>
                <IconComponent name="ChevronRight" className="w-4" />
              </>
            )}
            {(current_flow&&current_flow.name) &&(
               <div>{current_flow.name}</div>
            )}
          </div>

      </div>

        </>         
        )}
     
      <div className="round-button-div">
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
        {flows.findIndex((f) => tabId === f.id) !== -1 && tabId !== "" && (
          <MenuBar flows={flows} tabId={tabId} />
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

            {(isLogin) ? (
              <ThemeProvider theme={muiTheme}>
              <Fragment>
                <ShadTooltip content="Account" side="bottom">
                <IconButton
                  onClick={(event: React.MouseEvent<HTMLElement>) => {
                    setAnchorEl(event.currentTarget);}}
                  size="small"
                  sx={{ ml: 0 }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                  {localStorage.getItem('userName').charAt(0).toUpperCase()}
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
                  //
                  }
                }>
                  <IconComponent name="User" className="side-bar-button-size mr-2" />
                  {localStorage.getItem('userName')}
                </MenuItem>
                <MenuItem onClick={()=>{
                    setDark(!dark);    
                  }
                }>
                  {dark ? (
                    <IconComponent name="SunIcon" className="side-bar-button-size mr-2" />
                  ) : (
                    <IconComponent name="MoonIcon" className="side-bar-button-size mr-2" />
                  )}
                    model
                </MenuItem>
                <MenuItem onClick={()=>{
                    
                    setOpenAssistant(!openAssistant);  
                  }
                }>
                  {openAssistant ? (
                    <IconComponent name="MicOff" className="side-bar-button-size mr-2" />
                  ) : (
                    <IconComponent name="Mic" className="side-bar-button-size mr-2" />
                  )}
                  AI Assistant
                </MenuItem>                
                <MenuItem onClick={()=>{
                    setOpenMiniMap(!openMiniMap);    
                  }
                }>
                  {openMiniMap ? (
                    <IconComponent name="Square" className="side-bar-button-size mr-2" />
                  ) : (
                    <IconComponent name="Move" className="side-bar-button-size mr-2" />
                  )}
                  Mini Map
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />  
                <MenuItem onClick={()=>{
                    logout();    
                  }
                }>
                  <IconComponent name="LogOut" className="side-bar-button-size mr-2" />Logout
                </MenuItem>
              </Menu>
              </Fragment>
              </ThemeProvider>
            ) : (
              <ShadTooltip content="Login" side="bottom"> 
              <button
              className="extra-side-bar-save-disable"
              onClick={() => {
                logout();      
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
