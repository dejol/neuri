import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-twilight";
// import "ace-builds/webpack-resolver";
import { ReactNode, useContext, useEffect, useState,useRef } from "react";
import AceEditor from "react-ace";
import IconComponent from "../../components/genericIconComponent";
import { Button } from "../../components/ui/button";
import { WEB_EDITOR_DIALOG_SUBTITLE } from "../../constants/constants";
import { alertContext } from "../../contexts/alertContext";
import { darkContext } from "../../contexts/darkContext";
import { postBuildInit, postContentAssistant } from "../../controllers/API";
import moment from "moment";
import { FlowType, NodeDataType, NodeType, NoteType } from "../../types/flow";
import { TabsContext } from "../../contexts/tabsContext";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import { IButtonMenu,Boot, IDomEditor, IEditorConfig, IToolbarConfig, IModuleConf } from "@wangeditor/editor";
import markdownModule from '@wangeditor/plugin-md';
import { locationContext } from "../../contexts/locationContext";
import { useSSE } from "../../contexts/SSEContext";
import { enforceMinimumLoadingTime, getAssistantFlow } from "../../utils/utils";
import Chat from "../../components/chatComponent";
import LeftFormModal from "../leftFormModal";
import { Transition } from "@headlessui/react";
import ChatTrigger from "../../components/chatComponent/chatTrigger";


export default function NoteEditorModal({
  note_id,
  title,
  content,
}: {
  note_id: string;
  title:string;
  content?: string;
}) {

  const [height, setHeight] = useState(null);
  // const { data } = useContext(typesContext);
  const [editValue, setEditValue] = useState(content);
  const [name, setName] = useState(title);
  const [folderId, setFolderId] = useState("");
  const [createAt, setCreateAt] = useState(new Date());
  const [udpateAt, setUpdateAt] = useState(new Date());
  const [open,setOpen]=useState(false);
  const [canOpen, setCanOpen] = useState(false);
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const { screenWidth,openAssistant } = useContext(locationContext);
  const { updateSSEData, isBuilding, setIsBuilding } = useSSE();
  const [error, setError] = useState<{
    detail: { error: string; traceback: string };
  }>(null);
    const assistantOn = useRef(false);

  const [tempFlow,setTempFlow] =useState({id:note_id,name:"noteEdit",description:"",data:null})
  const { notes,folders,tabsState,tabValues,isBuilt,setIsBuilt,setTabsState, } = useContext(TabsContext);
  useEffect(()=>{
    let note=notes.find((note) => note.id === note_id);
    if(note){
      setFolderId(note.folder_id);
      setCreateAt(note.create_at);
      setUpdateAt(note.update_at);
    }
  },[note_id])

  useEffect(()=>{
    let note=notes.find((note) => note.id === note_id);
    if(note){
      note.name=name;
      note.content.value=editValue;
    }
  },[name,editValue])

  // function handleClick() {
  //   if(note_id&&!note_id.startsWith("NewNote")){
  //     let savedNote = notes.find((note) => note.id === note_id);
  //     savedNote.content.value=editValue;
  //     savedNote.name=name;
  //     savedNote.folder_id=folderId;
  //     saveNote(savedNote).then((res)=>{
  //       console.log("res:",res);
  //       cancelChange();
  //       setSuccessData({ title: "Changes saved successfully" });
  //     });
  //   }else if(!note_id ||note_id.startsWith("NewNote")){
  //     let newNote: NoteType;
  //     newNote = {
  //       id: "",
  //       name:name,
  //       folder_id:folderId,
  //       content: {
  //         id: "",
  //         value: editValue,
  //       },
  //     };
  //     addNote(newNote).then((id)=>{
  //       newNote.id=id.toString();
  //       newNote.content.id=id.toString();
  //       notes.push(newNote);
  //       cancelChange();
  //       setSuccessData({ title: "Add Note successfully" });
  //     });
  //   }
    
  // }
  // function cancelChange(){
  //   setEditValue("");
  //   setTabId("");
  //   tabValues.delete(note_id);
  //   note_id="";
  // }

  useEffect(() => {
    // Function to be executed after the state changes
    const delayedFunction = setTimeout(() => {
      if (error?.detail.error !== undefined) {
        //trigger to update the height, does not really apply any height
        setHeight("90%");
      }
      //600 to happen after the transition of 500ms
    }, 600);

    // Cleanup function to clear the timeout if the component unmounts or the state changes again
    return () => {
      clearTimeout(delayedFunction);
    };
  }, [error, setHeight]);


  // editor menu
  Boot.registerModule(markdownModule);

  const [editor, setEditor] = useState<IDomEditor | null>(null);
  const toolbarConfig: Partial<IToolbarConfig> = { };
  if(screenWidth>1024){
    toolbarConfig.excludeKeys = [
      'fullScreen'
  
    ];
  }else{
    toolbarConfig.excludeKeys = [
      'fullScreen','insertTable','codeBlock','emotion','lineHeight','fontFamily','fontSize',
      'headerSelect','blockquote','color','bgColor','insertLink'
  
    ];
  }


  const editorConfig: Partial<IEditorConfig> = {   
    placeholder: 'Type something...',
    autoFocus:false,
    MENU_CONF: {},
    onChange :(editor:IDomEditor)=>{
      setEditValue(editor.getHtml());
      setConChanged(true);
    },
    onBlur:(editor:IDomEditor)=>{
    },
    onFocus:(editor:IDomEditor)=>{
    }
    
  };

  editorConfig.MENU_CONF['uploadImage'] = {
    server: '/api/v1/upload/'+note_id,
    fieldName: 'file',
  
//   customInsert(res: any, insertFn:InsertFnType) {  
//     // res 即服务端的返回结果
//   // console.log("res:",res);
//     // 从 res 中找到 url alt href ，然后插入图片
//     insertFn(res.data.url, res.data.alt, res.data.href)
// },  
   // 单个文件的最大体积限制，默认为 2M
   maxFileSize: 1 * 1024 * 1024, // 1M

   // 最多可上传几个文件，默认为 100
   maxNumberOfFiles: 10,

   // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
   allowedFileTypes: ['image/*'],

   // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
  //  meta: {
  //      token: 'xxx',
  //      otherKey: 'yyy'
  //  },

   // 将 meta 拼接到 url 参数中，默认 false
  //  metaWithUrl: false,

   // 自定义增加 http  header
  //  headers: {
  //      Accept: 'text/x-json',
  //      otherKey: 'xxx'
  //  },

   // 跨域是否传递 cookie ，默认为 false
  //  withCredentials: true,

   // 超时时间，默认为 10 秒
  //  timeout: 5 * 1000, // 5 秒 
  // 上传错误，或者触发 timeout 超时
  onError(file: File, err: any, res: any) {  
    setErrorData({
      title:`${file.name} 上传出错`,
      list:[err.toString()],
    })
    // console.log(`${file.name} 上传出错`, err, res);
},  
};
editorConfig.MENU_CONF['uploadVideo'] = {
  server: '/api/v1/upload/'+note_id,
  fieldName: 'file',

  // 单个文件的最大体积限制，默认为 10M
  maxFileSize: 5 * 1024 * 1024, // 5M

  // 最多可上传几个文件，默认为 5
  maxNumberOfFiles: 3,

  // 选择文件时的类型限制，默认为 ['video/*'] 。如不想限制，则设置为 []
  allowedFileTypes: ['video/*'],

  // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
  // meta: {
  //     token: 'xxx',
  //     otherKey: 'yyy'
  // },

  // 将 meta 拼接到 url 参数中，默认 false
  // metaWithUrl: false,

  // 自定义增加 http  header
  // headers: {
  //     Accept: 'text/x-json',
  //     otherKey: 'xxx'
  // },

  // 跨域是否传递 cookie ，默认为 false
  // withCredentials: true,

  // 超时时间，默认为 30 秒
  timeout: 15 * 1000, // 15 秒

  // 视频不支持 base64 格式插入
  // 单个文件上传失败
  onFailed(file: File, res: any) {  
      console.log(`${file.name} 上传失败`, res)
  },

  // 上传错误，或者触发 timeout 超时
  onError(file: File, err: any, res: any) {  
      setErrorData({
        title:`${file.name} 上传出错`,
        list:[err.toString()],
      })
      // console.log(`${file.name} 上传出错`, err, res);
  },
}



  // 及时销毁 editor ，重要！
  useEffect(() => {
    // console.log("call fullText useEffect");
      return () => {
          if (editor == null) return
          editor.destroy()
          setEditor(null)
      }
  }, [editor]);

  const changedContent = useRef(false);
  const [conChanged,setConChanged]=useState(false);//内容是否已经变化，暂时用在判断AI 助手是否需要工作上

  useEffect(()=>{
    assistantOn.current=openAssistant;
    let delay=1000*60; //one minute
    let intervalId = null;
    if(assistantOn.current){
      intervalId = setInterval(
            ()=>{
            
            if(assistantOn.current&&changedContent.current&&!isBuilding){
              // console.log("note_id:",note_id);
              postContentAssistant(name+'\r\n'+editValue,note_id).then((resp)=>{
                if(resp){
                  // console.log("resp:",resp);
                  handleBuild(getAssistantFlow(note_id,resp.data.result.msg));
                }
              });

            }
            changedContent.current=false;
          }, 
        delay);
    }else{
      clearInterval(intervalId);
    }
    return () => {
      clearInterval(intervalId);
    };
  },[openAssistant]);

  useEffect(()=>{
    changedContent.current=conChanged;
  },[conChanged]);  

  async function handleBuild(flow: FlowType) {
    
    try {
      if (isBuilding) {
        return;
      }
      const minimumLoadingTime = 200; // in milliseconds
      const startTime = Date.now();
      setIsBuilding(true);
      const allNodesValid = await streamNodeData(flow);
      await enforceMinimumLoadingTime(startTime, minimumLoadingTime);
      // console.log("flow:",flow,allNodesValid);

      setIsBuilt(allNodesValid);
      if (!allNodesValid) {
        console.error( "Oops! Looks like you missed something");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsBuilding(false);
    }
  }

  async function streamNodeData(flow: FlowType) {
    // Step 1: Make a POST request to send the flow data and receive a unique session ID
    const response = await postBuildInit(flow);
    const { flowId } = response.data;
    // Step 2: Use the session ID to establish an SSE connection using EventSource
    let validationResults = [];
    let finished = false;
    const apiUrl = `/api/v1/build/stream/${flowId}`;
    const eventSource = new EventSource(apiUrl);
    eventSource.onmessage = (event) => {
      // If the event is parseable, return
      if (!event.data) {
        return;
      }
      const parsedData = JSON.parse(event.data);
      // console.log("parseData:",parsedData);
      // if the event is the end of the stream, close the connection
      if (parsedData.end_of_stream) {
        // Close the connection and finish
        finished = true;
        eventSource.close();

        return;
      } else if (parsedData.log) {
        // If the event is a log, log it
        // setSuccessData({ title: parsedData.log });
      } else if (parsedData.input_keys !== undefined) {
        // console.log("flowId:",flowId);
        setTabsState((old) => {
          return {
            ...old,
            [flowId]: {
              ...old[flowId],
              formKeysData: parsedData,
            },
          };
        });
      } else {
        // Otherwise, process the data
        const isValid = processStreamResult(parsedData);
        // setProgress(parsedData.progress);
        validationResults.push(isValid);
      }
    };

    eventSource.onerror = (error: any) => {
      console.error("EventSource failed:", error);
      eventSource.close();
      if (error.data) {
        const parsedData = JSON.parse(error.data);
        // setErrorData({ title: parsedData.error });
        setIsBuilding(false);
      }
    };
    // Step 3: Wait for the stream to finish
    while (!finished) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      finished = validationResults.length === flow.data.nodes.length;
    }
    // setOpen(finished);
    // Step 4: Return true if all nodes are valid, false otherwise
    return validationResults.every((result) => result);
  }

  function processStreamResult(parsedData) {
    // Process each chunk of data here
    // Parse the chunk and update the context
    try {
      updateSSEData({ [parsedData.id]: parsedData });
    } catch (err) {
      console.log("Error parsing stream data: ", err);
    }
    return parsedData.valid;
  } 
  return (
        <div className="flex h-full w-full flex-col transition-all overflow-hidden " >
          <div className="w-full m-1 mb-0">
            <Toolbar
                editor={editor}
                defaultConfig={toolbarConfig}
                mode={"default"}
                // style={{ borderBottom: '1px solid #ccc' }}
            />
            </div>
            <div className=" w-full border"  
            style={{alignItems:"center",overflowY: 'auto',height:"calc(100% - 10px)",
                    padding:"2% 2% 2% 2%",margin:"10px auto 15px auto",
                    boxShadow:"box-shadow: 0 2px 10px rgb(0 0 0 / 12%)",
                    // backgroundColor:"#fff"
            }}
             >
            <div style={{padding:5,paddingBottom:1,borderBottom:"1px solid #e8e8e8"}}
                  className="flex">

                <input style={{outline:"none",border:0,lineHeight:1,width:"100%",fontSize:25}}
                 className="bg-muted" 
                 placeholder="Title..."
                 value={name}
                 onChange={(event)=>{
                  setName(event.target.value);                  
                }}
                 />
                 <span className="whitespace-nowrap text-sm text-muted-foreground">编辑:{moment(udpateAt).local().format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
            <div className="w-full items-center">
              <Editor
                  defaultConfig={editorConfig}
                  value={editValue}
                  onCreated={setEditor}
                  mode="simple"
                  style={{ 
                    // height: '100%',
                  minWidth:'300px',
                  minHeight:'300px',
                  width:'100%',
                  // overflow:'hidden',
                  // fontSize:'20px',
                  //  overflowY: 'scroll' 
                  }} 
              />
            </div>
          </div>
          {/* <div className="flex h-fit w-[90%] justify-between"> 
             <Button  onClick={()=>{
                let note=notes.find((note) => note.id === note_id);
                if(note){
                  setTabId("");
                  removeNote(note_id);
                  setSuccessData({ title: "Delete Note successfully" });
                  setEditValue("");
                  setName("");
                  tabValues.delete(note_id);
                }
              }} type="button" className="mx-2" variant={"secondary"}>
                <IconComponent name="Trash2" className="h-4 w-4 mr-2" />
              Delete
            </Button>            
            <div className="mb-2 mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button asChild variant="primary" size="sm">
                  <div className="header-menu-bar-display">
                    <div className="header-menu-flow-name">
                    {folders&&folders.map((folder,idx) => (
                      (folder.id==folderId)&&(
                        <div key={idx}>{folder.name}</div>
                      )
                    ))}
                    {!folderId&&(
                      <div key="unclass">Unclassified</div>
                    )}
                    </div>
                    <IconComponent name="ChevronDown" className="h-4 w-4" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-50">
                {folders.map((folder, idx) => (
                <DropdownMenuItem
                  onClick={() => {
                    setFolderId(folder.id);
                  }}
                  className="cursor-pointer"
                  key={idx}
                  >
                {folder.name}
                </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                onClick={() => {
                  setFolderId("");
                }}
                className="cursor-pointer"
                >Unclassified</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>    
             <Button className="mt-0 mr-6" onClick={handleClick} type="submit">
              Save
            </Button> 
           </div> */}

            <Chat open={open} setOpen={setOpen} isBuilt={isBuilt} setIsBuilt={setIsBuilt} 
              canOpen={canOpen} setCanOpen={setCanOpen} 
              flow={tempFlow}/>

              {tabsState[note_id] &&
                tabsState[note_id].formKeysData && 
                  canOpen&&(
                  <Transition
                  show={open}
                  appear={true}
                  // enter="transition-transform duration-500 ease-out"
                  // enterFrom={"transform translate-x-[-100%]"}
                  // enterTo={"transform translate-x-0"}
                  leave="transition-transform duration-500 ease-in"
                  leaveFrom={"transform translate-x-0"}
                  leaveTo={"transform translate-x-[-100%]"}
                  // className={"chat-message-modal-thought-cursor"}

                > 
                <div className="fixed bottom-14 left-0">   
                  <div className={"left-side-bar-arrangement"+(screenWidth<=1024?" w-[24rem]":"")}>     
                  <LeftFormModal
                    key={note_id}
                    flow={tempFlow}
                    open={open}
                    setOpen={setOpen}
                    needCheckFlow={false}
                  />
                  </div>   
                </div>
                </Transition>
                )}
        </div>
  );
}
