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

export default function FolderPopover() {
  const { data, templates } = useContext(typesContext);
  const { flows, tabId, tabsState, isBuilt,folders,addFlow,addFolder } =
    useContext(TabsContext);
  const { dark, setDark } = useContext(darkContext);
  const flow = flows.find((flow) => flow.id === tabId);
  const [popoverState, setPopoverState] = useState(false);
  const [open, setOpen] = useState(false);
  const [openFolder, setOpenFolder] = useState(false);


  const toggleDrawer =
    (status:boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setPopoverState(status);
    };
    const darkTheme = ()=>{
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

  const [newFolderId, setNewFolderId] = useState("");
  const list = () => (
    <Box
      sx={{ width: 265 }}
      role="presentation"
      onKeyDown={toggleDrawer(false)}
    >
    {folders.map((folder, idx) => (
      <div className="file-component-accordion-div mr-5" key={idx}>
      <AccordionComponent
        trigger={
          <div className="file-component-badge-div justify-start">
            <div
            className="-mb-1 "
            onClick={(event) => {
              event.stopPropagation();
            }}
            >
              <ShadTooltip content="New notebook" side="bottom">
              <Button1
                size="sm"
                variant="link"
                onClick={() => {
                  setNewFolderId(folder.id);
                  setPopoverState(false);
                  setOpen(true)
                }}
                >
                  <IconComponent name="Plus" className="main-page-nav-button" />
                </Button1>
                </ShadTooltip>
            </div>
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
            <ListItemButton  
              sx={{ pl: 4 }}
              onClick={() => {
                window.location.href="/flow/"+flow.id;
              }}
            >
              <ListItemIcon>
                <IconComponent name="File" className="w-4"/>
              </ListItemIcon>
              <ListItemText primary={flow.name} secondary= {flow.description}/>
            </ListItemButton>
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
          title: "Others",
          Icon:
          nodeIconsLucide["NoteBooks"] ?? nodeIconsLucide.unknown,
        }}
      >
        
        <List component="div" disablePadding>
        {flows.map((flow, idx) => (
          !flow.folder_id&&(
            <ListItemButton  
              sx={{ pl: 4 }}
              onClick={() => {
                window.location.href="/flow/"+flow.id;
              }}
            >
              <ListItemIcon>
                <IconComponent name="File" className="w-4"/>
              </ListItemIcon>
              <ListItemText primary={flow.name} />
            </ListItemButton>
          )
        ))}
        </List>
      </DisclosureComponent>
    </Box>
  );

  return (
    <div>
      <ThemeProvider theme={darkTheme}>
      <Fragment key={'right'}>
      <ShadTooltip content="Folder" side="bottom">
        <button 
        className="extra-side-bar-save-disable mt-2"
        onClick={toggleDrawer(true)}
        >
          <IconComponent name="Sidebar" className="side-bar-button-size " />
        </button>
      </ShadTooltip>
        <Drawer
          anchor={'left'}
          open={popoverState}
          onClose={toggleDrawer(false)}
          hideBackdrop={true}
        >
          <div className="mt-1 ml-3 flex justify-start mt-1">
          <Link to="/" className="mr-5">
            <img src="/logo.svg" width="40px" alt="Neuri"/>
          </Link>
          <Link to="/">
          <Button1
            className="gap-2"
            variant={location.pathname === "/" ? "primary" : "secondary"}
            size="sm"
          >
          <IconComponent name="ChevronLeft" className="w-4" />
          <div className="flex-1">Back</div>
          </Button1>
          
        </Link>    
          </div>
          {list()}
        <ShadTooltip content="New Folder" side="left">
          <Button 
          onClick={() => {
            setPopoverState(false);
            setOpenFolder(true);
          }}
          >
          <IconComponent name="Plus" className="w-6" />
          </Button>
        </ShadTooltip>
        </Drawer>
      </Fragment>
      </ThemeProvider>
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
  </div>  
  );
}
