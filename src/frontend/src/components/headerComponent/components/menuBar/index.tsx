import { useContext, useEffect, useState } from "react";
import { TabsContext } from "../../../../contexts/tabsContext";
import { Link, useNavigate } from "react-router-dom";
import { alertContext } from "../../../../contexts/alertContext";
import { undoRedoContext } from "../../../../contexts/undoRedoContext";
import FlowSettingsModal from "../../../../modals/flowSettingsModal";
import ExportModal from "../../../../modals/exportModal";
import { classNames } from "../../../../utils/utils";

import IconComponent from "../../../genericIconComponent";
import { Button } from "../../../ui/button";
import ShadTooltip from "../../../../components/ShadTooltipComponent";
// import FolderPopover from "../../../../pages/FlowPage/components/FolderComponent";
import { styled, alpha } from '@mui/material/styles';
// import Button from '@mui/material/Button';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { darkContext } from "../../../../contexts/darkContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../ui/dropdown-menu";
import { ConfirmDialogModal } from "../../../../modals/confirmModal";
import BuildTrigger from "../../buildTrigger";

export const StyledMenu = styled((props: MenuProps) => (
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

export const MenuBar = ({ tabId }) => {
  const { setTabId,addFlow,saveFlow,uploadFlow,tabsState,flows,tabValues,notes,
    folders,addNote,saveNote,removeNote,setNotes,isBuilt,setIsBuilt } = useContext(TabsContext);
  const { setSuccessData, setErrorData } = useContext(alertContext);
  const { dark, setDark } = useContext(darkContext);
  const { undo, redo } = useContext(undoRedoContext);
  const [openSettings, setOpenSettings] = useState(false);
  // const [openBuilder, setOpenBuilder] = useState(false);

  const isPending = tabsState[tabId]?.isPending;
  const flow = flows.find((flow) => flow.id === tabId);
  const [folderId,setFolderId]= useState(notes.find((note) => note.id === tabId)?notes.find((note) => note.id === tabId).folder_id:""); // for NoteEditor
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open,setOpen] = useState(Boolean(anchorEl));
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    // setOpen(true);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };
  const muiTheme = createTheme({
        palette: {
          mode: dark?'dark':'light',
        },
      });
  useEffect(()=>{
    setOpen(Boolean(anchorEl));
  },[anchorEl]);        
  useEffect(()=>{
    if(tabValues.get(tabId)&&tabValues.get(tabId).type=="note"){
      let note = notes.find((note) => note.id === tabId);
      if(note){
        setFolderId(note.folder_id);
      }
    }
  },[tabId]);

  useEffect(()=>{
    let note = notes.find((note) => note.id === tabId);
    if(note){
      note.folder_id=folderId;
    }
  },[folderId]);

  function handleSaveNote() {
    if(tabId){
      let savedNote = notes.find((note) => note.id === tabId);
      if(tabId.startsWith("NewNote")){
        savedNote.folder_id=folderId;
        // console.log("note:",savedNote);
        addNote(savedNote).then((id)=>{
          tabValues.delete(tabId);
          savedNote.id=id.toString();
          savedNote.content.id=id.toString();
          tabValues.set(id.toString(),{id:id.toString(),type:"note"});
          setTabId(id.toString());
          setSuccessData({ title: "创建笔记成功" });
          
        });
        }else{
          saveNote(savedNote).then((res)=>{
            // tabValues.delete(tabId);
            setSuccessData({ title: "笔记保存成功" });
          });
        }
      // setTabId("")
    }    
  }
  const [openConfirm,setOpenConfirm] = useState(false);

  function listSubFolders(parentId:string){
    return(
      folders.filter((folderItem)=>folderItem.parent_id==parentId)
        .map((folder, idx) => (
        <div className={!parentId?"":"ml-3"} key={idx}>
          <DropdownMenuItem
            onClick={() => {
              setFolderId(folder.id);
            }}
            className="cursor-pointer"
            key={idx}
            >
            <div className={"file-component-badge-div justify-start "}>
            <IconComponent name="Folder" className="main-page-nav-button" />
            {folder.name}
            </div>
            {/* <div className="mr-0">
              {flows.filter((flow)=>flow.folder_id==folder.id).length+
                  notes.filter((note)=>note.folder_id==folder.id).length}
            </div>  */}
          </DropdownMenuItem>
          {listSubFolders(folder.id)}
        </div>
      ))
    )
  }
  return (
    <div className="round-button-div">
      {/* <Link to="/">
        <IconComponent name="ChevronLeft" className="w-4" />
      </Link> */}
      {tabValues.get(tabId)&&tabValues.get(tabId).type=="flow"?(
        <>
          <BuildTrigger
            // open={true}
            // setOpen={setOpenBuilder}
            isBuilt={isBuilt}
            setIsBuilt={setIsBuilt}
            flow={flow}
          />
        <ShadTooltip content="保存" side="bottom">
          <button
            className={
              "extra-side-bar-buttons " + (isPending ? "" : "button-disable")
            }
            onClick={(event) => {
              saveFlow(flow).then(()=>{
                setSuccessData({ title: "成功保存白板数据" });

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
        <ShadTooltip content="撤销" side="bottom">
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
        <ShadTooltip content="重做" side="bottom">
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
            导入
            </MenuItem>
            <ExportModal>
              <MenuItem disableRipple>
              <IconComponent name="FileDown" className={ "side-bar-button-size mr-2" } />
              导出
              </MenuItem>
            </ExportModal>
            <Divider sx={{ my: 0.5 }} />        
            <MenuItem onClick={() => {
                  setOpenSettings(true);
                  handleClose();
                }}
            disableRipple>
            <IconComponent name="Settings2" className={ "side-bar-button-size mr-2" } />
            设置
            </MenuItem>
            </StyledMenu>
          </ThemeProvider>
        </div>
        <FlowSettingsModal
          open={openSettings}
          setOpen={setOpenSettings}
        ></FlowSettingsModal>
        </>
      ):(
        tabValues.get(tabId)&&tabValues.get(tabId).type=="note"&&(
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button asChild variant="primary" size="sm">
                  <div className="header-menu-bar-display">
                  <IconComponent name="Folder" className="main-page-nav-button" />
                    <div className="header-menu-flow-name">
                    {folders&&folders.map((folder,idx) => (
                      (folder.id==folderId)&&(
                        <div key={idx}>{folder.name}</div>
                      )
                    ))}
                    {!folderId&&(
                      <div key="unclass">暂未分类</div>
                    )}
                    </div>
                    <IconComponent name="ChevronDown" className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-50">
                {/* {folders.map((folder, idx) => (

                <DropdownMenuItem
                  onClick={() => {
                    setFolderId(folder.id);
                  }}
                  className="cursor-pointer"
                  key={idx}
                  >
                {folder.name}
                </DropdownMenuItem>
                ))} */}
                {listSubFolders("")}
                <DropdownMenuItem
                onClick={() => {
                  setFolderId("");
                }}
                className="cursor-pointer"
                >
                  <div className={"file-component-badge-div justify-start "}>
                    <IconComponent name="Folder" className="main-page-nav-button" />
                    暂未分类
                  </div>
                  {/* <div className="mr-0">
                    {flows.filter((flow)=>!flow.folder_id).length+
                        notes.filter((note)=>!note.folder_id).length}
                  </div>                    */}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> 
          <ShadTooltip content="保存" side="bottom">
          <button
            className={
              "extra-side-bar-buttons " 
            }
            onClick={handleSaveNote}
          >
            <IconComponent
              name="Save"
              className={
                "side-bar-button-size remind-blue" 
              }
            />
          </button>
        </ShadTooltip>          
        {/* <ShadTooltip content="Undo" side="bottom">
          <button
            className={
              "extra-side-bar-buttons " 
            }
            onClick={() => {
              // undo();
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
              // redo();
            }}
          >
            <IconComponent
              name="Redo"
              className={
                "side-bar-button-size" 
              }
            />
          </button>
        </ShadTooltip> */}

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
                id="note-menu"
                MenuListProps={{
                  'aria-labelledby': 'demo-customized-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                
            >
                
            <MenuItem onClick={() => {
                  handleClose();
                  setOpenConfirm(true);
                }}
            disableRipple>
            <IconComponent name="Trash2" className={ "side-bar-button-size mr-2" } />
            删除
            </MenuItem>
            </StyledMenu>
          </ThemeProvider>
        </div>
          </>
        )
      )}
    <ConfirmDialogModal
      title="确认操作"
      content="删除操作是不可恢复，您是否确认"
      confirm={()=>{
        let note=notes.find((note) => note.id === tabId);
        if(note){
          setTabId("");
          if(tabId.startsWith("NewNote")){
            setNotes(notes.filter((note) => note.id !== tabId));
          }else{
            removeNote(tabId);
          }
          setSuccessData({ title: "成功删除笔记" });
          tabValues.delete(tabId);
        }
      }}
      open={openConfirm}
      setOpen={setOpenConfirm}
    />

    </div>
  );
};

export default MenuBar;
