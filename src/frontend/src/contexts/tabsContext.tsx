import _ from "lodash";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MarkerType, Viewport, addEdge } from "reactflow";
import ShortUniqueId from "short-unique-id";
import {
  deleteFlowFromDatabase,
  downloadFlowsFromDatabase,
  readFlowsFromDatabase,
  saveFlowToDatabase,
  updateFlowInDatabase,
  uploadFlowsToDatabase,
  readFoldersFromDatabase,
  saveFolderToDatabase,
  updateFolderInDatabase,
  deleteFolderFromDatabase,
  loginUserFromDatabase,
  saveNoteToDatabase,
  updateNoteInDatabase,
  readNotesFromDatabase,
  deleteNoteFromDatabase,
  downloadNotesFromDatabase,
  downloadFoldersFromDatabase,
  uploadAllToDatabase,
} from "../controllers/API";
import { APIClassType, APITemplateType } from "../types/api";
import { FlowType, NodeType,FolderType, UserType, NoteType } from "../types/flow";
import { TabsContextType, TabsState } from "../types/tabs";
import {
  addVersionToDuplicates,
  addFolderToDuplicates,
  updateIds,
  updateTemplate,
} from "../utils/reactflowUtils";
import { getRandomDescription, getRandomName } from "../utils/utils";
import { alertContext } from "./alertContext";
import { typesContext } from "./typesContext";
import { AuthContext } from "./authContext";
const uid = new ShortUniqueId({ length: 5 });

const TabsContextInitialValue: TabsContextType = {
  save: () => { },
  tabId: "",
  pageTitle:"",
  setTabId: (index: string) => { },
  setPageTitle: (title: string) => { },
  // tabValues: [""], //临时使用，来测试一下tabs功能
  // setTabValues: (values: Array<string>) => { },//临时使用，来测试一下tabs功能
  tabValues: new Map<"",{id:"",type:"",viewport?:Viewport}>(),
  setTabValues: () => {},

  // loginUserId: "",
  // setLoginUserId: (index: string) => { },
  flows: [],
  folders: [],
  notes:[],
  setNotes:()=>{},
  removeFlow: (id: string) => { },
  addFlow: async (flowData?: any) => "",
  addFolder: async (folderData?: any) => "",
  saveFolder: async (folder: FolderType) => { },
  saveNote: async (note: NoteType) => { },
  addNote:async (noteData?: NoteType) => "",
  removeNote: (id: string) => { },
  removeFolder: (id: string) => { },
  updateFlow: (newFlow: FlowType,who?:string) => { },
  incrementNodeId: () => uid(),
  downloadFlow: (flow: FlowType) => { },
  downloadFlows: () => { },
  uploadFlows: () => { },
  backup:()=>{ },
  restore:()=>{ },
  uploadFlow: () => { },
  isBuilt: false,
  setIsBuilt: (state: boolean) => { },
  isEMBuilt: false,
  setIsEMBuilt: (state: boolean) => { },  

  // openFolderList:false,
  // setOpenFolderList: (state: boolean) => { },
  // openModelList:false,
  // setOpenModelList: (state: boolean) => { },
  // openWebEditor:false,
  // setOpenWebEditor: (state: boolean) => { },
  // openMiniMap:false,
  // setOpenMiniMap: (state: boolean) => { },
  // openAssistant:false,
  // setOpenAssistant: (state: boolean) => { },  

  hardReset: () => { },
  saveFlow: async (flow: FlowType) => { },
  lastCopiedSelection: null,
  setLastCopiedSelection: (selection: any) => { },
  tabsState: {},
  setTabsState: (state: TabsState) => { },
  getNodeId: (nodeType: string) => "",
  getNewEdgeId:(oldId: string) => "",
  setTweak: (tweak: any) => { },
  getTweak: [],
  setSearchResult: (results:{folderId:"",keyword:"",notes:[],flows:[]}) => { },
  getSearchResult: {folderId:"",keyword:"",notes:[],flows:[]},
  paste: (
    selection: { nodes: any; edges: any; },
    position: { x: number; y: number; paneX?: number; paneY?: number; }
  ) => { },
  login: async (user: UserType)=>"",
  editNodeId:"",
  editFlowId:"",
  setEditFlowId: (editFlowId: string) => { },
  setEditNodeId: (editNodeId: string) => { },

};

export const TabsContext = createContext<TabsContextType>(
  TabsContextInitialValue
);

export function TabsProvider({ children }: { children: ReactNode }) {
  const { setErrorData, setNoticeData,setSuccessData } = useContext(alertContext);
  const { getAuthentication, isAuthenticated,userData } = useContext(AuthContext);

  const [tabId, setTabId] = useState("");
  // const [loginUserId, setLoginUserId] = useState("");

  const [flows, setFlows] = useState<Array<FlowType>>([]);
  
  const [folders, setFolders] = useState<Array<FolderType>>([]);
  const [notes, setNotes] = useState<Array<NoteType>>([]);
  const [pageTitle,setPageTitle] =useState("");
  const [id, setId] = useState(uid());
  const { templates, reactFlowInstances } = useContext(typesContext);
  const [lastCopiedSelection, setLastCopiedSelection] = useState(null);
  const [tabsState, setTabsState] = useState<TabsState>({});
  const [getTweak, setTweak] = useState([]);
  const [getSearchResult, setSearchResult] = useState({folderId:"",keyword:"",notes:[],flows:[]});
  const [editFlowId, setEditFlowId] = useState("");//for webEditorModal
  const [editNodeId, setEditNodeId] = useState("");//for webEditorModal
  const newNodeId = useRef(uid());
  function incrementNodeId() {
    newNodeId.current = uid();
    return newNodeId.current;
  }

  function save() {
    // added clone deep to avoid mutating the original object
    let Saveflows = _.cloneDeep(flows);
    if (Saveflows.length !== 0) {
      Saveflows.forEach((flow) => {
        if (flow.data && flow.data?.nodes)
          flow.data?.nodes.forEach((node) => {
            if(node.type=="genericNode"){
            //looking for file fields to prevent saving the content and breaking the flow for exceeding the the data limite for local storage
            Object.keys(node.data.node.template).forEach((key) => {
              if (node.data.node.template[key].type === "file") {
                node.data.node.template[key].content = null;
                node.data.node.template[key].value = "";
              }
            });
           }
          });
      });
      window.localStorage.setItem(
        "tabsData",
        JSON.stringify({ tabId, flows: Saveflows, id })
      );
    }
  }

  function refreshFlows() {
    getTabsDataFromDB().then((DbData) => {
      if (DbData && Object.keys(templates).length > 0) {
        try {
          processDBData(DbData);
          updateStateWithDbData(DbData);
        } catch (e) {
          console.error(e);
        }
      }
    });
  }
  function refreshFolders() {
      getFoldersDataFromDB().then((DbData) => {
        setFolders(DbData);
        // console.log("folders:",DbData)
        // if (DbData && Object.keys(templates).length > 0) {
        //   try {
            
        //     processDBData(DbData);
            
        //   } catch (e) {
        //     console.error(e);
        //   }
        // }
      });
    
   
  }
  function refreshNotes() {
    getNotesDataFromDB().then((DbData) => {
      setNotes(DbData);
    });
  
 
}
  useEffect(() => {
    // get data from db
    //get tabs locally saved
    // let tabsData = getLocalStorageTabsData();
    // console.log("getAuthentication:",getAuthentication());
    if (getAuthentication() === true) {
      refreshFolders();
      refreshFlows();
      refreshNotes();
    }
  }, [templates,getAuthentication()]);

  useEffect(() => {
    // get data from db
    //get tabs locally saved
    // setLoginUserId(localStorage.getItem('login'));    
    // if(userData){
    //   setLoginUserId(userData.id);

    // }

  }, []);
  // useEffect(() => {
  //   console.log("loginUserId:",loginUserId);
  //   if(loginUserId){
  //     refreshFolders();
  //     refreshFlows();
  //     refreshNotes();
  //   }
  // }, [loginUserId]);

  function getTabsDataFromDB() {
    //get tabs from db
    return readFlowsFromDatabase();
  }
  function getFoldersDataFromDB() {
    //get folders from db

    // if(loginUserId){
      return readFoldersFromDatabase();
    // }
    // return;
  }
  function getNotesDataFromDB() {
    //get notes from db
      return readNotesFromDatabase();
  }
  function processDBData(DbData) {
    DbData.forEach((flow) => {
      try {
        if (!flow.data) {
          return;
        }
        processFlowEdges(flow);
        processFlowNodes(flow);
      } catch (e) {
        console.error(e);
      }
    });
  }

  function processFlowEdges(flow) {
    if (!flow.data || !flow.data.edges) return;
    // flow.data.edges.forEach((edge) => {
    //   edge.className = "";
    //   let targetNode=flow.data.nodes.find((node)=>node.id==edge.target);
    //   edge.style = { 
    //     // stroke: "#555", 
    //     stroke: targetNode?targetNode.data?.borderColor : "",
    //     strokeWidth:6 
    //   };
    // });
  }

  function updateDisplay_name(node: NodeType, template: APIClassType) {
    node.data.node.display_name = template["display_name"] || node.data.type;
  }

  function updateNodeDocumentation(node: NodeType, template: APIClassType) {
    node.data.node.documentation = template["documentation"];
  }

  function processFlowNodes(flow) {
    if (!flow.data || !flow.data.nodes) return;
    flow.data.nodes.forEach((node: NodeType) => {
      if(node.type!=="genericNode") return;
      const template = templates[node.data.type];
      if (!template) {
        setErrorData({ title: `Unknown node type: ${node.data.type}` });
        return;
      }
      if (Object.keys(template["template"]).length > 0) {
        updateDisplay_name(node, template);
        updateNodeBaseClasses(node, template);
        updateNodeEdges(flow, node, template);
        updateNodeDescription(node, template);
        updateNodeTemplate(node, template);
        updateNodeDocumentation(node, template);
      }
    });
  }

  function updateNodeBaseClasses(node: NodeType, template: APIClassType) {
    node.data.node.base_classes = template["base_classes"];
  }

  function updateNodeEdges(
    flow: FlowType,
    node: NodeType,
    template: APIClassType
  ) {
    flow.data.edges.forEach((edge) => {
      if (edge.source === node.id) {
        if(edge.sourceHandle){
          edge.sourceHandle = edge.sourceHandle
          .split("|")
          .slice(0, 2)
          .concat(template["base_classes"])
          .join("|");
        }

      }
    });
  }

  function updateNodeDescription(node: NodeType, template: APIClassType) {
    node.data.node.description = template["description"];
  }

  function updateNodeTemplate(node: NodeType, template: APIClassType) {
    node.data.node.template = updateTemplate(
      template["template"] as unknown as APITemplateType,
      node.data.node.template as APITemplateType
    );
  }

  function updateStateWithDbData(tabsData) {
    setFlows(tabsData);
  }

  function hardReset() {
    newNodeId.current = uid();
    setTabId("");

    setFlows([]);
    setId(uid());
  }

  /**
   * Downloads the current flow as a JSON file
   */
  function downloadFlow(
    flow: FlowType,
    flowName: string,
    flowDescription?: string
  ) {
    // create a data URI with the current flow data
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify({ ...flow, name: flowName, description: flowDescription })
    )}`;

    // create a link element and set its properties
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${
      flowName && flowName != ""
        ? flowName
        : flows.find((f) => f.id === tabId).name
    }.json`;

    // simulate a click on the link element to trigger the download
    link.click();
    setNoticeData({
      title: "Warning: Critical data, JSON file may include API keys.",
    });
  }

  function downloadFlows() {
    downloadFlowsFromDatabase().then((flows) => {
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(flows)
      )}`;

      // create a link element and set its properties
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `flows.json`;

      // simulate a click on the link element to trigger the download
      link.click();
    });
  }
  function backup() {
    let backupTime=new Date();
    let backup={backupTime:new Date(),userId:userData.id}
    downloadFlowsFromDatabase().then((flows) => {
      backup['flows']=flows.flows;
      downloadNotesFromDatabase().then((notes)=>{
        backup['notes']=notes.notes;
        downloadFoldersFromDatabase().then((folders)=>{
          backup['folders']=folders.folders;
          const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(backup)
          )}`;
          // create a link element and set its properties
          const link = document.createElement("a");
          link.href = jsonString;
          link.download = `backup-${backupTime}.json`;
    
          // simulate a click on the link element to trigger the download
          link.click();
        })
      })
    });

  }
  function getNodeId(nodeType: string) {
    return nodeType + "-" + incrementNodeId();
  }

  function getNewEdgeId(oldId:string){
    let prefix=oldId.split('-')[0];
    return getNodeId(prefix);
  }
  /**
   * Creates a file input and listens to a change event to upload a JSON flow file.
   * If the file type is application/json, the file is read and parsed into a JSON object.
   * The resulting JSON object is passed to the addFlow function.
   */
  function uploadFlow(newProject?: boolean, file?: File) {
    if (file) {
      file.text().then((text) => {
        // parse the text into a JSON object
        let flow: FlowType = JSON.parse(text);

        addFlow(flow, newProject);
      });
    } else {
      // create a file input
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      // add a change event listener to the file input
      input.onchange = (e: Event) => {
        // check if the file type is application/json
        if (
          (e.target as HTMLInputElement).files[0].type === "application/json"
        ) {
          // get the file from the file input
          const currentfile = (e.target as HTMLInputElement).files[0];
          // read the file as text
          currentfile.text().then((text) => {
            // parse the text into a JSON object
            let flow: FlowType = JSON.parse(text);

            addFlow(flow, newProject);
          });
        }
      };
      // trigger the file input click event to open the file dialog
      input.click();
    }
  }

  function uploadFlows() {
    // create a file input
    const input = document.createElement("input");
    input.type = "file";
    // add a change event listener to the file input
    input.onchange = (event: Event) => {
      // check if the file type is application/json
      if (
        (event.target as HTMLInputElement).files[0].type === "application/json"
      ) {
        // get the file from the file input
        const file = (event.target as HTMLInputElement).files[0];
        // read the file as text
        const formData = new FormData();
        formData.append("file", file);
        uploadFlowsToDatabase(formData).then(() => {
          refreshFlows();
        });
      }
    };
    // trigger the file input click event to open the file dialog
    input.click();
  }

  function restore() {
    // create a file input
    const input = document.createElement("input");
    input.type = "file";
    // add a change event listener to the file input
    input.onchange = (event: Event) => {
      // check if the file type is application/json
      if (
        (event.target as HTMLInputElement).files[0].type === "application/json"
      ) {
        // get the file from the file input
        const file = (event.target as HTMLInputElement).files[0];
        
        // read the file as text
        const formData = new FormData();
        formData.append("file", file); 
        try {
          uploadAllToDatabase(formData).then((res) => {
            if(res&&res['status']==201){
              refreshFolders();
              refreshNotes();
              refreshFlows();
              setSuccessData({title:res['message']});
            }else{
              setErrorData({title:res['message']});
            } 
          });          
        } catch (error) {
          setErrorData(error);
        }       
      }
    };
    // trigger the file input click event to open the file dialog
    input.click();
  }

  /**
   * Removes a flow from an array of flows based on its id.
   * Updates the state of flows and tabIndex using setFlows and setTabIndex hooks.
   * @param {string} id - The id of the flow to remove.
   */
  function removeFlow(id: string) {
    const index = flows.findIndex((flow) => flow.id === id);
    if (index >= 0) {
      deleteFlowFromDatabase(id).then(() => {
        setFlows(flows.filter((flow) => flow.id !== id));
      });
    }
  }
  /**
   * Removes a folder from an array of folders based on its id.
   * Updates the state of folders and tabIndex using setFolders.
   * @param {string} id - The id of the folder to remove.
   */
    function removeFolder(id: string) {
      const index = folders.findIndex((folder) => folder.id === id);
      if (index >= 0) {
        deleteFolderFromDatabase(id).then(() => {
          setFolders(folders.filter((folder) => folder.id !== id));
        });
      }
    }
  
  /**
   * Removes a note from an array of notes based on its id.
   * Updates the state of notes and Index using setNotes.
   * @param {string} id - The id of the note to remove.
   */
    function removeNote(id: string) {
      const index = notes.findIndex((note) => note.id === id);
      if (index >= 0) {
        deleteNoteFromDatabase(id).then(() => {
          setNotes(notes.filter((note) => note.id !== id));
        });
      }
    }
  /**
   * Add a new flow to the list of flows.
   * @param flow Optional flow to add.
   */

  function paste(
    selectionInstance,
    position: { x: number; y: number; paneX?: number; paneY?: number }
  ) {
    let minimumX = Infinity;
    let minimumY = Infinity;
    let idsMap = {};
    let nodes = reactFlowInstances.get(tabId).getNodes();
    let edges = reactFlowInstances.get(tabId).getEdges();
    selectionInstance.nodes.forEach((node) => {
      if (node.position.y < minimumY) {
        minimumY = node.position.y;
      }
      if (node.position.x < minimumX) {
        minimumX = node.position.x;
      }
    });

    const insidePosition = position.paneX
      ? { x: position.paneX + position.x, y: position.paneY + position.y }
      : reactFlowInstances.get(tabId).screenToFlowPosition({ x: position.x, y: position.y });

    selectionInstance.nodes.forEach((node: NodeType) => {
      // Generate a unique node ID
      let newId = getNodeId(node.data.type);
      idsMap[node.id] = newId;
      // Create a new node object
      const newNode: NodeType = {
        id: newId,
        type: node.type,
        position: {
          x: insidePosition.x + node.position.x - minimumX,
          y: insidePosition.y + node.position.y - minimumY,
        },
        data: {
          ..._.cloneDeep(node.data),
          id: newId,
        },
      };
      // Add the new node to the list of nodes in state
      nodes = nodes
        .map((node) => ({ ...node, selected: false }))
        .concat({ ...newNode, selected: false });
    });
    reactFlowInstances.get(tabId).setNodes(nodes);

    selectionInstance.edges.forEach((edge) => {
      
      let source = idsMap[edge.source];
      let target = idsMap[edge.target];
      // console.log("source:",source)
      // let sourceNode=nodes.find((node)=>node.id==source);
      // let targetNode=nodes.find((node)=>node.id==target);

      if(edge.id.startsWith("reactflow__edge-")){   
        let sourceHandleSplitted = edge.sourceHandle.split("|");
        let sourceHandle =
          sourceHandleSplitted[0] +
          "|" +
          source +
          "|" +
          sourceHandleSplitted.slice(2).join("|");
        let targetHandleSplitted = edge.targetHandle.split("|");
        let targetHandle =
          targetHandleSplitted.slice(0, -1).join("|") + "|" + target;
        let id =
          "reactflow__edge-" +
          source +
          sourceHandle +
          "-" +
          target +
          targetHandle;
        // console.log("edge:",edge);
        edges = addEdge(
          {
            source,
            target,
            sourceHandle,
            targetHandle,
            id,
            style: { 
              strokeWidth:6 
            },
            className:
              targetHandle.split("|")[0] === "Text"
                ? "stroke-gray-800 "
                : "stroke-gray-900 ",
            animated: targetHandle.split("|")[0] === "Text",
            selected: false,
          },
          edges.map((edge) => ({ ...edge, selected: false }))
        );
      }else{
        let id =getNewEdgeId(edge.id);
        edges = addEdge(
          {
            ...edge,
            source,
            target,
            // markerEnd:{
            //   type: MarkerType.ArrowClosed,
            //   // color: 'black',
            // },
            // type:edge.type,
            id,
            // style: { strokeWidth:6 },
            // selected: false,
          },
          edges.map((edge) => ({ ...edge, selected: false }))
        );
      }
      
    });
    reactFlowInstances.get(tabId).setEdges(edges);
  }

  const addFlow = async (
    flow?: FlowType,
    newProject?: Boolean,
    folder_id?:string
  ): Promise<String> => {
    if (newProject) {
      let flowData = extractDataFromFlow(flow);
      if (flowData.description == "") {
        flowData.description = getRandomDescription();
      }

      // Create a new flow with a default name if no flow is provided.
      const newFlow = createNewFlow(flowData, flow);
      processFlowEdges(newFlow);
      processFlowNodes(newFlow);

      const flowName = addVersionToDuplicates(newFlow, flows);

      newFlow.name = flowName;
      if(folder_id){
        newFlow.folder_id=folder_id;
      }
      
    
      try {
        const { id } = await saveFlowToDatabase(newFlow);
        // Change the id to the new id.
        newFlow.id = id;

        // Add the new flow to the list of flows.
        addFlowToLocalState(newFlow);

        // Return the id
        return id;
      } catch (error) {
        // Handle the error if needed
        console.error("Error while adding flow:", error);
        throw error; // Re-throw the error so the caller can handle it if needed
      }
    } else {
      paste(
        { nodes: flow.data.nodes, edges: flow.data.edges },
        { x: 10, y: 10 }
      );
    }
  };
  const addFolder = async (
    folder?: FolderType
  ): Promise<String> => {
      let newFolder = {
        description: "NOT DESC",
        name: getRandomName(),
        user_id:folder?.user_id ?? userData.id,
        parent_id:"",
        id: "",
      }
      if(folder){
        newFolder.description=folder.description;
        // newFolder.name=folder.name;
        let flowName = addFolderToDuplicates(folder, folders);
        newFolder.name = flowName;        
        newFolder.parent_id=folder.parent_id??"";
      }


      try {
        const { id } = await saveFolderToDatabase(newFolder);
        refreshFolders();
        // Return the id
        return id;
      } catch (error) {
        // Handle the error if needed
        console.error("Error while adding folder:", error);
        throw error; // Re-throw the error so the caller can handle it if needed
      }

  };
  const addNote = async (
    note?: NoteType
  ): Promise<String> => {
      let newNote = {
        content:{id:"",value:""},
        name: "NO-NAME",
        user_id:note?.user_id ?? userData.id,
        folder_id:"",
        id: "",
      }
      if(note){
        newNote.content.value=note.content?.value;
        newNote.name=note.name;
        newNote.folder_id=note?.folder_id;
      }
      try {
        const { id } = await saveNoteToDatabase(newNote);
        refreshNotes();
        // Return the id
         //update tabs state
         setTabsState((prev) => {
          return {
            ...prev,
            [tabId]: {
              ...prev[tabId],
              isPending: false,
            },
          };
        });
        return id;
      } catch (error) {
        // Handle the error if needed
        console.error("Error while adding note:", error);
        throw error; // Re-throw the error so the caller can handle it if needed
      }

  };

  const extractDataFromFlow = (flow) => {
    let data = flow?.data ? flow.data : null;
    const description = flow?.description ? flow.description : "";

    if (data) {
      updateEdges(data.edges);
      updateNodes(data.nodes, data.edges);
      updateIds(data, getNodeId); // Assuming updateIds is defined elsewhere
    }

    return { data, description };
  };

  const updateEdges = (edges) => {
    edges.forEach((edge) => {
      edge.className =
        (edge.targetHandle.split("|")[0] === "Text"
          ? "stroke-gray-800 "
          : "stroke-gray-900 ") + " stroke-connection";
      edge.animated = edge.targetHandle.split("|")[0] === "Text";
    });
  };

  const updateNodes = (nodes, edges) => {
    nodes.forEach((node) => {
      if(node.type!=="genericNode") return;
      const template = templates[node.data.type];
      if (!template) {
        setErrorData({ title: `Unknown node type: ${node.data.type}` });
        return;
      }
      if (Object.keys(template["template"]).length > 0) {
        node.data.node.base_classes = template["base_classes"];
        edges.forEach((edge) => {
          if (edge.source === node.id) {
            edge.sourceHandle = edge.sourceHandle
              .split("|")
              .slice(0, 2)
              .concat(template["base_classes"])
              .join("|");
          }
        });
        node.data.node.description = template["description"];
        node.data.node.template = updateTemplate(
          template["template"] as unknown as APITemplateType,
          node.data.node.template as APITemplateType
        );
      }
    });
  };

  const createNewFlow = (flowData, flow) => ({
    description: flowData.description,
    name: flow?.name ?? getRandomName(),
    data: flowData.data?? {"nodes": [], "edges": []},
    folder_id: flow?.folder_id ?? "",
    user_id: flow?.user_id ?? userData.id,
    id: "",
  });

  const addFlowToLocalState = (newFlow) => {
    setFlows((prevState) => {
      return [...prevState, newFlow];
    });
  };

  /**
   * Updates an existing flow with new data
   * @param newFlow - The new flow object containing the updated data
   * @param who - indicated who call this function ,just for debugging
   */
  function updateFlow(newFlow: FlowType,who?:string) {
    // console.log("newFlow:",who,newFlow.data);
    setFlows((prevState) => {
      const newFlows = [...prevState];
      const index = newFlows.findIndex((flow) => flow.id === newFlow.id);
      if (index !== -1) {
        newFlows[index].description = newFlow.description ?? "";
        newFlows[index].data.edges = newFlow.data.edges;
        newFlows[index].data.nodes = newFlow.data.nodes;
        if(newFlow.data.viewport&&
          !(newFlow.data.viewport.x==0&&newFlow.data.viewport.y==0&&newFlow.data.viewport.zoom==1)){
            newFlows[index].data.viewport = newFlow.data.viewport;
        }

        newFlows[index].name = newFlow.name;
        newFlows[index].user_id = userData.id;

        // console.log("afterUpdated:",newFlows[index]);
      }
      

      return newFlows;
    });
  }

  async function saveFlow(newFlow: FlowType) {
    try {
      // updates flow in db
      newFlow.user_id=userData.id;
      const updatedFlow = await updateFlowInDatabase(newFlow);
      if (updatedFlow) {
        // updates flow in state
        setFlows((prevState) => {
          const newFlows = [...prevState];
          const index = newFlows.findIndex((flow) => flow.id === newFlow.id);
          if (index !== -1) {
            newFlows[index].description = newFlow.description ?? "";
            newFlows[index].folder_id = newFlow.folder_id ?? "";
            newFlows[index].data = newFlow.data;
            newFlows[index].name = newFlow.name;
            newFlows[index].user_id = userData.id;
            newFlows[index].update_at = updatedFlow.update_at;
          }
          
          return newFlows;
        });
        //update tabs state
        setTabsState((prev) => {
          return {
            ...prev,
            [tabId]: {
              ...prev[tabId],
              isPending: false,
            },
          };
        });
      }
    } catch (err) {
      setErrorData(err);
    }
  }
  async function saveFolder(newFolder: FolderType) {
    try {
      // updates folder in db
      if(!newFolder.user_id){
        newFolder.user_id=userData.id;
      }
      const updatedFolder = await updateFolderInDatabase(newFolder);
      if (updatedFolder) {
        // updates folder in state
        setFolders((prevFolders) => {
          const newFolders = [...prevFolders];
          const index = newFolders.findIndex((folder) => folder.id === newFolder.id);
          if (index !== -1) {
            newFolders[index].description = newFolder.description ?? "";
            newFolders[index].name = newFolder.name;
          }
          return newFolders;
        });
        // //update tabs state
        // setTabsState((prev) => {
        //   return {
        //     ...prev,
        //     [tabId]: {
        //       ...prev[tabId],
        //       isPending: false,
        //     },
        //   };
        // });
      }
    } catch (err) {
      setErrorData(err);
    }
  }
  async function saveNote(newNote: NoteType) {
    try {
      // updates note in db
      if(!newNote.user_id){
        newNote.user_id=userData.id;
      }
      const updatedNote = await updateNoteInDatabase(newNote);
      if (updatedNote) {
        // updates note in state
        setNotes((prevNotes) => {
          const newNotes = [...prevNotes];
          const index = newNotes.findIndex((note) => note.id === newNote.id);
          if (index !== -1) {
            newNotes[index].content = newNote.content ?? {id:newNote.id,value:""};
            newNotes[index].name = newNote.name;
            newNotes[index].update_at=updatedNote.update_at;
          }
          return newNotes;
        });
         //update tabs state
         setTabsState((prev) => {
          return {
            ...prev,
            [tabId]: {
              ...prev[tabId],
              isPending: false,
            },
          };
        });
      }
    } catch (err) {
      setErrorData(err);
    }
  }
  const login = async (
    user: UserType
  ): Promise<String> => {
    let resp = await loginUserFromDatabase(user);
    // console.log("response return:",resp)
    // if(resp.password=="******"){
    //   return "true";
    // }
    return resp;

  }

  const [isBuilt, setIsBuilt] = useState(false);
  const [isEMBuilt, setIsEMBuilt] = useState(false);

  // const [openFolderList, setOpenFolderList] = useState(JSON.parse(window.localStorage.getItem("openFolder")) ?? false);
  // const [openModelList, setOpenModelList] = useState(JSON.parse(window.localStorage.getItem("openModel")) ?? false);
  // const [openWebEditor, setOpenWebEditor] = useState(false);
  // const [openMiniMap, setOpenMiniMap] = useState(JSON.parse(window.localStorage.getItem("openMiniMap")) ?? false);
  // const [openAssistant, setOpenAssistant] = useState(false);

  // useEffect(() => {
  //   window.localStorage.setItem("openFolder", openFolderList.toString());
  // }, [openFolderList]);
  // useEffect(() => {
  //   window.localStorage.setItem("openModel", openModelList.toString());
  // }, [openModelList]);
  // useEffect(() => {
  //   window.localStorage.setItem("openMiniMap", openMiniMap.toString());
  // }, [openMiniMap]);

  const [tabValues, setTabValues] = useState(new Map);

  return (
    <TabsContext.Provider
      value={{
        pageTitle,
        setPageTitle,
        saveFlow,
        isBuilt,
        setIsBuilt,
        isEMBuilt,
        setIsEMBuilt,
        getNewEdgeId,
        lastCopiedSelection,
        setLastCopiedSelection,
        hardReset,
        tabId,
        setTabId,
        tabValues, 
        setTabValues,        
        flows,
        folders,
        notes,
        setNotes,
        saveNote,
        addNote,
        removeNote,
        save,
        incrementNodeId,
        removeFlow,
        addFlow,
        addFolder,
        saveFolder,
        removeFolder,
        updateFlow,
        downloadFlow,
        downloadFlows,
        backup,
        restore,
        uploadFlows,
        uploadFlow,
        getNodeId,
        tabsState,
        setTabsState,
        paste,
        getTweak,
        setTweak,
        setSearchResult,
        getSearchResult,
        login,
        // loginUserId,
        // setLoginUserId,
        editFlowId,
        editNodeId,
        setEditFlowId,
        setEditNodeId

      }}
    >
      {children}
    </TabsContext.Provider>
  );
}
