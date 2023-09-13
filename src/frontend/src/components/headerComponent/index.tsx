import { useContext, useEffect, useState } from "react";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import AlertDropdown from "../../alerts/alertDropDown";
import { USER_PROJECTS_HEADER } from "../../constants/constants";
import { alertContext } from "../../contexts/alertContext";
import { darkContext } from "../../contexts/darkContext";
import { TabsContext } from "../../contexts/tabsContext";
import { getRepoStars } from "../../controllers/API";
import IconComponent from "../genericIconComponent";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import MenuBar from "./components/menuBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Header() {
  const { flows, tabId } = useContext(TabsContext);
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
        </>         
        )}
      </div>
      <div className="round-button-div">

          {(current_flow&&current_flow.name) ?(
            <div className="header-menu-bar">
              {current_flow.name}
            </div>
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
