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
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Collapse from '@mui/material/Collapse';
import FlowSettingsModal from "../../../../modals/flowSettingsModal";
import FolderModal from "../../../../modals/folderModal";

export default function FolderPopover() {
  const { data, templates } = useContext(typesContext);
  const { flows, tabId, uploadFlow, tabsState, saveFlow, isBuilt,folders,addFlow,addFolder } =
    useContext(TabsContext);
  const { setSuccessData, setErrorData } = useContext(alertContext);
  const [dataFilter, setFilterData] = useState(data);
  const [search, setSearch] = useState("");
  const isPending = tabsState[tabId]?.isPending;
  const { dark, setDark } = useContext(darkContext);

  // Handle showing notebook after use search input
  function handleSearchInput(e: string) {

  }
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
          // mode: 'dark',
        },
      });

  };

  const [newFolderId, setNewFolderId] = useState("");


  const list = () => (
    <Box
      sx={{ width: 265 }}
      role="presentation"
      // onClick={toggleDrawer()}
      onKeyDown={toggleDrawer(false)}
    >
    {folders.map((folder, idx) => (
      <DisclosureComponent
        openDisc={false}
        // className={"components-disclosure-top-arrangement"}
        button={{
          title: folder.name,
          Icon:
          nodeIconsLucide["Folder"] ?? nodeIconsLucide.unknown,
        }}

      >        
        <List component="div" disablePadding={true}>
          <ListItemButton  
              sx={{ pl: 4 }}
              // onClick={() => {
              //   addFlow(null,true,folder.id).then((id) => {
              //     window.location.href="/flow/"+ id;
              //   });

              // }}
              onClick={() => {
                setNewFolderId(folder.id);
                setPopoverState(false);
                // console.log("folder id is :",folder.id)
                setOpen(true)
              }}
            >
              <ListItemIcon>
                <IconComponent name="Plus" className="w-4"/>
              </ListItemIcon>
              <ListItemText primary="New NoteBook" />
          </ListItemButton>
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
              <ListItemText primary={flow.name} />
            </ListItemButton>
          )
        ))}
        
        </List>
        </DisclosureComponent>
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
      <CssBaseline />
      <Fragment key={'right'}>
      <ShadTooltip content="Folder" side="bottom">
        <Button onClick={toggleDrawer(true)}><IconComponent name="Folder" className="w-6" /></Button>
      </ShadTooltip>
        <Drawer
          anchor={'right'}
          open={popoverState}
          onClose={toggleDrawer(false)}
        >
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
