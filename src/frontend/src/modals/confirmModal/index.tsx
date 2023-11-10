import { ReactNode, forwardRef, useContext, useState } from "react";
import { Button } from "../../components/ui/button";

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, ThemeProvider, createTheme } from "@mui/material";
import { darkContext } from "../../contexts/darkContext";

export function ConfirmDialogModal({title,content,confirm,open,setOpen}:{
  title:string;
  content:string;
  confirm:any;
  open:boolean;
  setOpen:(open:boolean)=>void;
}){
  const { dark } = useContext(darkContext);

  const handleClose = () => {
    setOpen(false);
  };
  const muiTheme = createTheme({
    palette: {
      mode: dark?'dark':'light',
    },
  }); 
  return (
    <ThemeProvider theme={muiTheme}>
    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {content}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>不确定</Button>
          <Button onClick={confirm} autoFocus>
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider> 
  );
}