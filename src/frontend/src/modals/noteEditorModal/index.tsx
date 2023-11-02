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
import { typesContext } from "../../contexts/typesContext";
import { postCustomComponent, postValidateCode } from "../../controllers/API";
import { APIClassType } from "../../types/api";
import moment from "moment";
import { NodeDataType, NodeType, NoteType } from "../../types/flow";
import { TabsContext } from "../../contexts/tabsContext";
import {useNodesState,useReactFlow} from "reactflow";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import { IButtonMenu,Boot, IDomEditor, IEditorConfig, IToolbarConfig, IModuleConf } from "@wangeditor/editor";
import markdownModule from '@wangeditor/plugin-md';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";

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

  const { setErrorData, setSuccessData } = useContext(alertContext);
  const [error, setError] = useState<{
    detail: { error: string; traceback: string };
  }>(null);

  const { notes,folders,saveNote,addNote,removeNote,setTabId,tabValues } = useContext(TabsContext);
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
  toolbarConfig.excludeKeys = [
    'fullScreen',

  ];

  const editorConfig: Partial<IEditorConfig> = {   
    placeholder: 'Type something...',
    autoFocus:false,
    MENU_CONF: {},
    onChange :(editor:IDomEditor)=>{
      setEditValue(editor.getHtml());
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

  return (
        <div className="flex h-full w-full flex-col transition-all overflow-hidden " >
          <div className="w-full m-2">
            <Toolbar
                editor={editor}
                defaultConfig={toolbarConfig}
                mode={"default"}
                // style={{ borderBottom: '1px solid #ccc' }}
            />
            </div>
            <div className=" w-full border"  
            style={{alignItems:"center",overflowY: 'auto',height:"calc(100% - 10px)",
                    padding:"20px 50px 50px 50px",margin:"10px auto 15px auto",
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
                 <span className="whitespace-nowrap text-sm text-muted-foreground">上次编辑时间:{moment(udpateAt).local().format("LLL")}</span>
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
        </div>
  );
}
