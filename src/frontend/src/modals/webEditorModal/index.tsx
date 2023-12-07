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
import BaseModal from "../baseModal";
import { NodeDataType, NodeType } from "../../types/flow";
import { TabsContext } from "../../contexts/tabsContext";
import {useNodesState,useReactFlow} from "reactflow";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import { Boot, IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/editor";
import markdownModule from '@wangeditor/plugin-md'

// // Extend menu
// class MyMenu {
//    title:string;
//    tag:string;
//    iconSvg:string;
//   constructor() {
//     this.title = 'Save'
//     // this.iconSvg = '<svg >...</svg>'
//     this.tag = 'button'
//   }
//   getValue(editor) {
//     return ' hello '
//   }
//   isActive(editor) {
//     return false // or true
//   }
//   isDisabled(editor) {
//     return false // or true
//   }
//   exec(editor, value) {
//     editor.insertText(value) // value 即 this.getValue(editor) 的返回值
//   }
// }

export default function WebEditorModal({
  flow_id,
  node_id,
  children,
  open,
  setOpen,
}: {
  flow_id: string;
  node_id: string;
  open:boolean;
  setOpen: (open: boolean) => void;
  children?: ReactNode;
}) {

  const [height, setHeight] = useState(null);
  const { data ,reactFlowInstances} = useContext(typesContext);
  const [editValue, setEditValue] = useState("");
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const [error, setError] = useState<{
    detail: { error: string; traceback: string };
  }>(null);

  const { flows, saveFlow,getNodeId,tabId,setEditFlowId,setEditNodeId  } = useContext(TabsContext);
  let currentFlow = flows.find((flow) => flow.id === tabId);

  function handleClick() {
    if(node_id){
      let savedFlow = flows.find((flow) => flow.id === flow_id);
      let editedNode=savedFlow.data.nodes.find((node)=>node.id===node_id);
      if(editedNode.type=="noteNode"||editedNode.type=="mindNode"){
        editedNode.data.value=editValue;
      }else{
        editedNode.data.node.template.note.value=editValue;
      }
      saveFlow(savedFlow);
    }else{
      let newData = { type: "Note",node:data["notes"]["Note"]};
      let { type } = newData;
      let newId = getNodeId(type);
      let newNode: NodeType;
      // const reactflowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstances.get(tabId).project({
        x: 100 ,// - reactflowBounds.left,
        y: 100, //  - reactflowBounds.top,
      });
      newData.node.template.note.value=editValue;
      newNode = {
        id: newId,
        type: "genericNode",
        position,
        
        data: {
          ...newData,
          id: newId,
          value: null,
        },
      };

      // setNodes((nds) => nds.concat(newNode));
      // newNode.data.node.template.note.valu=editValue;
      // let nodes=savedFlow.data.nodes;
      // saveFlow(currentFlow);
      let nodesList=currentFlow.data.nodes;
      nodesList.push(newNode);
      reactFlowInstances.get(tabId).setNodes(nodesList);
      // updateFlow(savedFlow);
      saveFlow(currentFlow);
    }
    setSuccessData({ title: "白板数据保存成功" });
    cancelChange();
  }
  function cancelChange(){
    flow_id="";
    node_id="";
    setEditValue("");    
    setOpen(false);
  }

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

  // const [open, setOpen] = useState(false);
  function setValue(val){
    setEditValue(val);
  }
  useEffect(() => {
    if(open){
      let savedFlow = flows.find((flow) => flow.id === flow_id);
      if(savedFlow){
        if(node_id){
          let editedNode=savedFlow.data.nodes.find((node)=>node.data.id===node_id);
          if(editedNode){
            if(editedNode.type=="noteNode"||editedNode.type=="mindNode"){
              setEditValue(editedNode.data.value);
            }else{
              setEditValue(editedNode.data.node.template.note.value);
            }
          }
        }
      }
    }else{
      setEditValue("");
      setEditFlowId("");
      setEditNodeId("");
    }

  }, [open]);

  // useEffect(()=>{
  //   Boot.registerModule(markdownModule);

  //   const myMenuConf = {
  //     key: 'save',
  //     factory() {
  //       let savMenu=new MyMenu()
  //       savMenu.exec=(editor,value)=>{handleClick()};
  //       return savMenu;
  //     }
  //   }
  
  //   Boot.registerMenu(myMenuConf)
  // },[])

  // editor 实例
  Boot.registerModule(markdownModule);
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const toolbarConfig: Partial<IToolbarConfig> = { }
  //   toolbarConfig.toolbarKeys=[    
  //     'bold',
  //     'italic',
  //     'through',
  //     'bulletedList',
  //     'numberedList',
  //     'insertLink',
  //     'justifyCenter',
  //     'insertImage',
  //   ];
  toolbarConfig.excludeKeys = [
    'fullScreen',
    // 'italic',
    // 'group-more-style' // 排除菜单组，写菜单组 key 的值即可
];
  // toolbarConfig.insertKeys = {
  //   index: 0, // 插入的位置，基于当前的 toolbarKeys
  //   keys: ['save']
  // }
  const editorConfig: Partial<IEditorConfig> = {   
    placeholder: 'Type something...',
    autoFocus:false,
    MENU_CONF: {},
    onChange :(editor:IDomEditor)=>{
      setValue(editor.getHtml());
    },
    onBlur:(editor:IDomEditor)=>{
    },
    onFocus:(editor:IDomEditor)=>{
    }
    
};
editorConfig.MENU_CONF['uploadImage'] = {
  server: '/api/v1/upload/'+tabId,
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
  server: '/api/v1/upload/'+tabId,
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
  // 上传错误，或者触发 timeout 超时
  onError(file: File, err: any, res: any) {  
    setErrorData({
      title:`${file.name} 上传出错`,
      list:[err.toString()],
    })
    // console.log(`${file.name} 上传出错`, err, res);
},  
};

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
    // <BaseModal open={open} setOpen={setOpen} size="large">
    //   <BaseModal.Trigger>{children}</BaseModal.Trigger>
    //   <BaseModal.Header description="">
    //     <span className="pr-2">{(node_id&&node_id!="")?"Edit":"New"} Note Content</span>
    //     <IconComponent
    //       name="FileText"
    //       className="h-6 w-6 pl-1 text-primary "
    //       aria-hidden="true"
    //     />
    //   </BaseModal.Header>
    //   <BaseModal.Content>
      
        <div className="flex h-full w-full m-2 flex-col transition-all overflow-hidden">
          <div className="h-[91%] w-full">
            <Toolbar
                editor={editor}
                defaultConfig={toolbarConfig}
                mode={"default"}
                // style={{ borderBottom: '1px solid #ccc' }}
            />
              
            <div className="w-full h-[85%] items-center "
            // style={{cursor: 'text'}}
            >
              <Editor
                  defaultConfig={editorConfig}
                  value={editValue}
                  onCreated={setEditor}
                  mode="simple"
                  style={{ 
                    height: '100%',
                  minWidth:'300px',
                  minHeight:'300px',
                  width:'100%',
                  overflow:'hidden',
                  // fontSize:'20px',
                  //  overflowY: 'scroll' 
                  }} 
              />
            </div>
          </div>
          <div className="flex h-fit w-full justify-end">
          <Button className="mt-0  mr-4" onClick={cancelChange} type="button" variant={"secondary"}>
              取消
            </Button>
            <Button className="mt-0 mr-6" onClick={handleClick} type="submit">
              保存
            </Button>
          </div>
        </div>
    //   </BaseModal.Content>
    // </BaseModal>
  );
}
