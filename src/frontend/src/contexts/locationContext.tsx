import { createContext, ReactNode, useEffect, useState } from "react";

//types for location context
type locationContextType = {
  current: Array<string>;
  setCurrent: (newState: Array<string>) => void;
  isStackedOpen: boolean;
  setIsStackedOpen: (newState: boolean) => void;
  showSideBar: boolean;
  setShowSideBar: (newState: boolean) => void;
  extraNavigation: {
    title: string;
    options?: Array<{
      name: string;
      href: string;
      icon: any;
      children?: Array<any>;
    }>;
  };
  setExtraNavigation: (newState: {
    title: string;
    options?: Array<{
      name: string;
      href: string;
      icon: any;
      children?: Array<any>;
    }>;
  }) => void;
  extraComponent: any;
  setExtraComponent: (newState: any) => void;
  screenWidth:number;

  openFolderList:boolean,
  setOpenFolderList: (state: boolean) => void,
  openSearchList:boolean,
  setOpenSearchList: (state: boolean) => void,
  openModelList:boolean,
  setOpenModelList: (state: boolean) => void,
  openWebEditor:boolean,
  setOpenWebEditor: (state: boolean) => void,
  openMiniMap:boolean,
  setOpenMiniMap: (state: boolean) => void,
  openAssistant:boolean,
  setOpenAssistant: (state: boolean) => void,  
  noteOnly:boolean,
  setNoteOnly: (state: boolean) => void,  
};

//initial value for location context
const initialValue = {
  //actual
  current: window.location.pathname.replace(/\/$/g, "").split("/"),
  isStackedOpen:
    window.innerWidth > 1024 && window.location.pathname.split("/")[1]
      ? true
      : false,
  setCurrent: () => {},
  setIsStackedOpen: () => {},
  showSideBar: window.location.pathname.split("/")[1] ? true : false,
  setShowSideBar: () => {},
  extraNavigation: { title: "" },
  setExtraNavigation: () => {},
  extraComponent: <></>,
  setExtraComponent: () => {},
  screenWidth:window.innerWidth,
  openFolderList:JSON.parse(window.localStorage.getItem("openFolder")) ?? false,
  setOpenFolderList: (state: boolean) => { },
  openSearchList:JSON.parse(window.localStorage.getItem("openSearch")) ?? false,
  setOpenSearchList: (state: boolean) => { },  
  openModelList:JSON.parse(window.localStorage.getItem("openModel")) ?? false,
  setOpenModelList: (state: boolean) => { },
  openWebEditor:false,
  setOpenWebEditor: (state: boolean) => { },
  openMiniMap:JSON.parse(window.localStorage.getItem("openMiniMap")) ?? false,
  setOpenMiniMap: (state: boolean) => { },
  openAssistant:false,
  setOpenAssistant: (state: boolean) => { },  
  noteOnly:JSON.parse(window.localStorage.getItem("noteOnly")) ?? false,
  setNoteOnly: (state: boolean) => { },  
};

export const locationContext = createContext<locationContextType>(initialValue);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState(initialValue.current);
  const [isStackedOpen, setIsStackedOpen] = useState(
    initialValue.isStackedOpen
  );
  const [screenWidth,setScreenWidth] =useState(initialValue.screenWidth);
  const [showSideBar, setShowSideBar] = useState(initialValue.showSideBar);
  const [extraNavigation, setExtraNavigation] = useState({ title: "" });
  const [extraComponent, setExtraComponent] = useState(<></>);

  const [openFolderList, setOpenFolderList] = useState(initialValue.openFolderList);
  const [openSearchList, setOpenSearchList] = useState(initialValue.openSearchList);
  const [openModelList, setOpenModelList] = useState(initialValue.openModelList);
  const [openWebEditor, setOpenWebEditor] = useState(false);
  const [openMiniMap, setOpenMiniMap] = useState(initialValue.openMiniMap);
  const [openAssistant, setOpenAssistant] = useState(false);
  const [noteOnly, setNoteOnly] = useState(initialValue.noteOnly);

  useEffect(() => {
    window.localStorage.setItem("openFolder", openFolderList.toString());
  }, [openFolderList]);
  useEffect(() => {
    window.localStorage.setItem("openModel", openModelList.toString());
  }, [openModelList]);
  useEffect(() => {
    window.localStorage.setItem("openMiniMap", openMiniMap.toString());
  }, [openMiniMap]);  
  useEffect(() => {
    window.localStorage.setItem("openSearch", openSearchList.toString());
  }, [openSearchList]);  
  useEffect(() => {
    window.localStorage.setItem("noteOnly", noteOnly.toString());
  }, [noteOnly]);  
  return (
    <locationContext.Provider
      value={{
        isStackedOpen,
        setIsStackedOpen,
        current,
        setCurrent,
        showSideBar,
        setShowSideBar,
        extraNavigation,
        setExtraNavigation,
        extraComponent,
        setExtraComponent,
        screenWidth,
        openFolderList,
        setOpenFolderList,
        openSearchList,
        setOpenSearchList,
        openModelList,
        setOpenModelList,
        openWebEditor,
        setOpenWebEditor,
        openMiniMap,
        setOpenMiniMap,
        openAssistant,
        setOpenAssistant,
        noteOnly,
        setNoteOnly,
      }}
    >
      {children}
    </locationContext.Provider>
  );
}
