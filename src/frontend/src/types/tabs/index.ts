import { Dispatch, SetStateAction } from "react";
import { FlowType, TweaksType,FolderType, UserType } from "../flow";

export type TabsContextType = {
  saveFlow: (flow: FlowType) => Promise<void>;
  save: () => void;
  tabId: string;
  setTabId: (index: string) => void;
  loginUserId: string,
  setLoginUserId: (index: string) => void,
  flows: Array<FlowType>;
  folders:Array<FolderType>;
  removeFlow: (id: string) => void;
  addFlow: (flowData?: FlowType, newProject?: boolean,folder_id?:string) => Promise<String>;
  addFolder: (folderData?: FolderType) => Promise<String>;
  saveFolder: (folder: FolderType) => Promise<void>;
  removeFolder: (id: string) => void;
  updateFlow: (newFlow: FlowType) => void;
  incrementNodeId: () => string;
  downloadFlow: (
    flow: FlowType,
    flowName: string,
    flowDescription?: string
  ) => void;
  downloadFlows: () => void;
  uploadFlows: () => void;
  isBuilt: boolean;
  setIsBuilt: (state: boolean) => void;
  isLogin: boolean;
  setIsLogin: (state: boolean) => void;
  openFolderList:boolean;
  setOpenFolderList: (state: boolean) => void;
  openWebEditor:boolean,
  setOpenWebEditor: (state: boolean) => void;
  uploadFlow: (newFlow?: boolean, file?: File) => void;
  hardReset: () => void;
  getNodeId: (nodeType: string) => string;
  tabsState: TabsState;
  setTabsState: Dispatch<SetStateAction<TabsState>>;
  paste: (
    selection: { nodes: any; edges: any },
    position: { x: number; y: number; paneX?: number; paneY?: number }
  ) => void;
  lastCopiedSelection: { nodes: any; edges: any };
  setLastCopiedSelection: (selection: { nodes: any; edges: any }) => void;
  setTweak: (tweak: TweaksType) => void;
  getTweak: TweaksType[];
  setSearchResult: (node: Array<any>) => void;
  getSearchResult: any[];
  login:(user:UserType) => Promise<String>;
};

export type TabsState = {
  [key: string]: {
    isPending: boolean;
    formKeysData: {
      template?: string;
      input_keys?: Object;
      memory_keys?: Array<string>;
      handle_keys?: Array<string>;
    };
  };
};
