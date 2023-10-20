import { useContext, useState } from "react";
import { TabsContext } from "../../../../contexts/tabsContext";
import { Link, useNavigate } from "react-router-dom";
import { alertContext } from "../../../../contexts/alertContext";
import { undoRedoContext } from "../../../../contexts/undoRedoContext";
import FlowSettingsModal from "../../../../modals/flowSettingsModal";
import ExportModal from "../../../../modals/exportModal";
import { classNames } from "../../../../utils/utils";

import IconComponent from "../../../genericIconComponent";
// import { Button } from "../../../ui/button";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
// import FolderPopover from "../../../../pages/FlowPage/components/FolderComponent";
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { darkContext } from "../../../../contexts/darkContext";

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(2),
    minWidth: 110,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

export const MenuBar = ({ flows, tabId }) => {
  const { addFlow,saveFlow,uploadFlow,tabsState } = useContext(TabsContext);
  const { setSuccessData, setErrorData } = useContext(alertContext);
  const { dark, setDark } = useContext(darkContext);
  const { undo, redo } = useContext(undoRedoContext);
  const [openSettings, setOpenSettings] = useState(false);
  const isPending = tabsState[tabId]?.isPending;
  const flow = flows.find((flow) => flow.id === tabId);

  const navigate = useNavigate();

  // function handleAddFlow() {
  //   try {
  //     addFlow(null, true).then((id) => {
  //       navigate("/flow/" + id);
  //     });
  //     // saveFlowStyleInDataBase();
  //   } catch (err) {
  //     setErrorData(err);
  //   }
  // }
  // let current_flow = flows.find((flow) => flow.id === tabId);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const muiTheme = createTheme({
        palette: {
          mode: dark?'dark':'light',
        },
      });
   
  return (
    <div className="round-button-div">
      {/* <Link to="/">
        <IconComponent name="ChevronLeft" className="w-4" />
      </Link> */}
        
{/*   
        <ShadTooltip content="New" side="bottom">
          <button
            className={
              "extra-side-bar-buttons " 
            }
            onClick={() => {
              handleAddFlow();
            }}
          >
            <IconComponent
              name="Plus"
              className={
                "side-bar-button-size" 
              }
            />
          </button>
        </ShadTooltip> */}   
        <ShadTooltip content="Save" side="bottom">
          <button
            className={
              "extra-side-bar-buttons " + (isPending ? "" : "button-disable")
            }
            onClick={(event) => {
              saveFlow(flow).then(()=>{
                setSuccessData({ title: "Changes saved successfully" });

              });
            }}
          >
            <IconComponent
              name="Save"
              className={
                "side-bar-button-size" +
                (isPending ? " remind-blue" : " extra-side-bar-save-disable")
              }
            />
          </button>
        </ShadTooltip>          
        <ShadTooltip content="Undo" side="bottom">
          <button
            className={
              "extra-side-bar-buttons " 
            }
            onClick={() => {
              undo();
            }}
          >
            <IconComponent
              name="Undo"
              className={
                "side-bar-button-size" 
              }
            />
          </button>
        </ShadTooltip>

        <ShadTooltip content="Redo" side="bottom">
          <button
            className={
              "extra-side-bar-buttons " 
            }
            onClick={() => {
              redo();
            }}
          >
            <IconComponent
              name="Redo"
              className={
                "side-bar-button-size" 
              }
            />
          </button>
        </ShadTooltip>

      <div className="mt-1">
          <button
            className={
              "extra-side-bar-save-disable relative" 
            }
            onClick={handleClick}
          >
            <IconComponent name="Menu" className={ "side-bar-button-size" } aria-hidden="true" />
          </button>
        <ThemeProvider theme={muiTheme}>
          <StyledMenu
              id="flow-menu"
              MenuListProps={{
                'aria-labelledby': 'demo-customized-button',
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              
          >
          {/* <MenuItem 
            disabled={!isPending}
            onClick={(event) => {
              handleClose();
              if(flow.id==tabId){
                saveFlow(flow).then(()=>{
                  setSuccessData({ title: "Changes saved successfully" });
                });
              }else{
                setErrorData({title:"Fail to save, please check the Tabs is correct"})
              }

            }} disableRipple>
          <IconComponent name="Save" className={"side-bar-button-size mr-2" }/>
          Save
          </MenuItem> */}
          <MenuItem onClick={() => {
                uploadFlow();
                handleClose();
              }}
          disableRipple>
          <IconComponent name="FileUp" className={ "side-bar-button-size mr-2" } />
          Import
          </MenuItem>
          <ExportModal>
            <MenuItem disableRipple>
            <IconComponent name="FileDown" className={ "side-bar-button-size mr-2" } />
            Export
            </MenuItem>
          </ExportModal>
          <Divider sx={{ my: 0.5 }} />        
          <MenuItem onClick={() => {
                setOpenSettings(true);
                handleClose();
              }}
          disableRipple>
          <IconComponent name="Settings2" className={ "side-bar-button-size mr-2" } />
          Settings
          </MenuItem>
          </StyledMenu>
        </ThemeProvider>
      </div>
        <FlowSettingsModal
          open={openSettings}
          setOpen={setOpenSettings}
        ></FlowSettingsModal>
    </div>
    
  );
};

export default MenuBar;
