import { useContext, useEffect, useState } from "react";
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
export default function Header() {
  const { flows, tabId,isLogin,setIsLogin,setSearchResult,setOpenFolderList,openFolderList } = useContext(TabsContext);
  const { dark, setDark } = useContext(darkContext);
  const { notificationCenter } = useContext(alertContext);
  const location = useLocation();

  let current_flow = flows.find((flow) => flow.id === tabId);

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
    localStorage.setItem('login',"");
    setIsLogin(false);
    navigate("/");
  }

  const store = useStoreApi();
  const [searchKeyword,setSearchKeyword] =useState('');

  const searchNode = () => {
    const { nodeInternals } = store.getState();
    const nodes = Array.from(nodeInternals).map(([, node]) => node);
    let results=[];
    if (nodes.length > 0) {
      nodes.forEach((node) => {
        if(node.data.type=="Note"||node.data.type=="AINote"){
          let content=node.data.node.template.note.value;
          content=filterHTML(content)
          if(content&&content.indexOf(searchKeyword)>=0){
            const x = node.position.x + node.width / 2;
            const y = node.position.y + node.height / 2;
            // const zoom = 1.1;
            let begin=content.indexOf(searchKeyword);
            begin=(begin-10)>0?begin-10:0;
            content=content.substring(begin,begin+20+searchKeyword.length);
            content=(begin==0?"":"...")+content+"...";
            results.push({"id":node.id,"x":x,"y":y,"content":content})
            // setCenter(x, y, { zoom, duration: 1000 });
          }
        }
      });

    }
    setSearchResult(results);
  };



  return (
    <div className="header-arrangement">
      <div className="header-start-display">
        {tabId === "" || !tabId ? (
          <>
          <Link to="/" className="m-3">
            <img src="/logo.svg" width="40px" alt="Neuri"/>
          </Link>
            <a
              href="https://www.neuri.ai/"
              target="_blank"
              rel="noreferrer"
              className="header-waitlist-link-box"
            >
              <span>Join Us</span>
            </a>
          </>
        ) : (
          <>
          <Link to="/" className="m-3">
            <img src="/logo.svg" width="40px" alt="Neuri"/>
          </Link>
          <Link to="/">
          <Button
            className="gap-2"
            variant={location.pathname === "/" ? "primary" : "secondary"}
            size="sm"
          >
          <IconComponent name="ChevronLeft" className="w-4" />
          <div className="flex-1">Back</div>
          </Button>
          
        </Link> 
        <ShadTooltip content="Folder" side="bottom">
        <button 
        className="extra-side-bar-save-disable"
         onClick={()=>{setOpenFolderList(!openFolderList);}}
        >
          <IconComponent name={openFolderList?"X":"Sidebar"} className="side-bar-button-size " />
        </button>
      </ShadTooltip>
        </>         
        )}
      </div>
      <div className="round-button-div">
          {(current_flow&&current_flow.name) ?(
            <>
            <div className="header-menu-bar">
              {current_flow.name}
            </div>
          <div className="side-bar-search-div-placement">
          <div className="ml-1 ">
          <Input
          type="text"
          name="search"
          id="search-node"
          placeholder="Search note"
          className="nopan nodrag noundo nocopy input-search w-60"
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
              <Link to="/">
              <Button
                className="gap-2"
                variant={location.pathname === "/" ? "primary" : "secondary"}
                size="sm"
              >
              <IconComponent name="Home" className="h-4 w-4" />
              <div className="flex-1">{USER_PROJECTS_HEADER}</div>
               </Button>
             </Link>
          )}

        
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
          <ShadTooltip content="Log Out" side="bottom">
          <button
            className="extra-side-bar-save-disable"
            onClick={() => {
              logout();      
            }}
          >
            {(localStorage.getItem('login')=="true") ? (
              <IconComponent name="LogOut" className="side-bar-button-size" />
            ) : (
              <IconComponent name="LogIn" className="side-bar-button-size" />
            )}
          </button>       
          </ShadTooltip>   
          <button
            className="extra-side-bar-save-disable"
            onClick={() => {
              setDark(!dark);
            }}
          >
            {dark ? (
              <IconComponent name="SunIcon" className="side-bar-button-size" />
            ) : (
              <IconComponent name="MoonIcon" className="side-bar-button-size" />
            )}
          </button>
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
        </div>
      </div>
    </div>
  );
}
