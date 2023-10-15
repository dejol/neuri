import { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/core";
import { Boot } from "@wangeditor/editor";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import { useContext, useEffect, useRef, useState } from "react";
import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow, useStore, useStoreApi, useUpdateNodeInternals } from "reactflow";
import markdownModule from '@wangeditor/plugin-md'
import { TabsContext } from "../../contexts/tabsContext";
import ShadTooltip from "../../components/ShadTooltipComponent";
import IconComponent from "../../components/genericIconComponent";
import { cloneDeep } from "lodash";
import { typesContext } from "../../contexts/typesContext";

const connectionNodeIdSelector = (state) => state.connectionNodeId;
const sourceStyle = { zIndex: 1 };

export default function NoteNode({
  id,
  data,
  selected,
  xPos,
  yPos,
}: {
  id:string,
  data: {id:string,value:string,type:string}; 
  selected: boolean;
  xPos:number;
  yPos:number;
}) {
  const [toolbarOn,setToolbarOn] = useState(false);
  Boot.registerModule(markdownModule);
  const { flows, tabId,updateFlow } =useContext(TabsContext);
  const {  reactFlowInstance } = useContext(typesContext);

  const updateNodeInternals = useUpdateNodeInternals();

  // editor 实例
  const [editor, setEditor] = useState<IDomEditor | null>(null)  
  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = { }
    toolbarConfig.toolbarKeys=[    
      'bold',
      'italic',
      'through',
      'bulletedList',
      'numberedList',
      'insertLink',
      'justifyCenter',
      {
        key: "image",
        title: "Image",
        iconSvg:'<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
        menuKeys:['insertImage','uploadImage',]
      },
    ];

  // 编辑器配置
  // const [focusEditor,setFocusEditor] =useState(false);
  const focusEditorRef = useRef(false);

  // useEffect(() => {
  //   focusEditorRef.current = focusEditor;
  // }, [focusEditor]);
  // useEffect(() => {
  //   if(!selected &&toolbarOn){
  //     setToolbarOn(false);
  //   }
  // }, [selected]);


  function handleChange(content){
    // if(focusEditorRef.current){
    //   onChange(content);
    // }
    data.value=content;
  }
  const editorConfig: Partial<IEditorConfig> = {   
      placeholder: 'Type something...',
      autoFocus:false,
      MENU_CONF: {},
      onChange :(editor:IDomEditor)=>{
          handleChange(editor.getHtml());
          // setToolbarOn(true);
      },
      onBlur:(editor:IDomEditor)=>{
        // setToolbarOn(false);
        // setFocusEditor(false)
        // setToolbarOn(false);
      },
      onFocus:(editor:IDomEditor)=>{
        // setFocusEditor(true)
        // setToolbarOn(true);
        // setToolbarOn(true);
      }
  }
  editorConfig.MENU_CONF['uploadImage'] = {
    server: '/api/v1/upload/'+tabId,
    fieldName: 'file',
    // customInsert(res: any, insertFn:InsertFnType) { 
    //       // res 即服务端的返回结果
    //     // console.log("res:",res);
    //       // 从 res 中找到 url alt href ，然后插入图片
    //       insertFn(res.data.url, res.data.alt, res.data.href)
    //   },
  
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
        // 单个文件上传失败
    onFailed(file: File, res: any) {   
      // onFailed(file, res) {           
          console.log(`${file.name} 上传失败`, res)
      },
  
      // 上传错误，或者触发 timeout 超时
      onError(file: File, err: any, res: any) {  
      // onError(file, err, res) {              
          console.log(`${file.name} 上传出错`, err, res)
      },
  }

  // 及时销毁 editor ，重要！
  useEffect(() => {
      return () => {
          if (editor == null) return
          editor.destroy()
          setEditor(null)
      }
  }, [editor])
  
  const handleMouseDown = (event) => {
    event.stopPropagation();
  };
  const connectionNodeId = useStore(connectionNodeIdSelector);
  // console.log("connectionNodeId:%s,id:%s",connectionNodeId,id);
  const isConnecting = !!connectionNodeId;
  const isTarget = connectionNodeId && connectionNodeId !== id;
  // const label = isTarget ? 'Drop here' : 'Drag to connect';

  const { setCenter,fitView } = useReactFlow();
  function focusNode() {
    let flow = flows.find((flow) => flow.id === tabId);
    let node=flow.data?.nodes.find((node)=>node.id===id);
    if (!node) return;
    // const x = node.position.x + node.width / 2;
    // const y = node.position.y + node.height / 2;
    fitView({nodes:[node],duration:1000,padding:0.1})
    // setCenter(x, y, { zoom:0.8, duration: 1000 });
  }
  // const [toolbarOn,setToolbarOn] =useState(false);
  // useEffect(()=>{
  //   setToolbarOn(selected);

  // },[selected])

  function focusNextNode(){
    let flow = flows.find((flow) => flow.id === tabId);
    let ed=flow.data?.edges.find((edge)=>(edge.source===id&&edge.source!=edge.target));
    // console.log("edge:",ed);
    if(ed){
      let node=flow.data?.nodes.find((node)=>node.id===ed.target);
      // const x = node.position.x + node.width / 2;
      // const y = node.position.y + node.height / 2;
      // setCenter(x, y, { zoom:0.8, duration: 1000 });    
      fitView({nodes:[node],duration:1000,padding:0.1})
    }
  }
  function focusPrevNode(){
    let flow = flows.find((flow) => flow.id === tabId);
    let edge=flow.data?.edges.find((edge)=>(edge.target===id&&edge.source!=edge.target));
    // console.log("prev-edge:",edge);
    if(edge){
      let node=flow.data?.nodes.find((node)=>node.id===edge.source);
      // const x = node.position.x + node.width / 2;
      // const y = node.position.y + node.height / 2;
      // setCenter(x, y, { zoom:0.8, duration: 1000 });   
      fitView({nodes:[node],duration:1000,padding:0.1})
    } 
  }
  function refreshCurrentFlow(){
    let myFlow = flows.find((flow) => flow.id === tabId);
    if (reactFlowInstance && myFlow) {
      let flow = cloneDeep(myFlow);
      flow.data = reactFlowInstance.toObject();
      reactFlowInstance.setNodes(flow.data.nodes);
      updateFlow(flow);
    }
  }
  return (
    <div className={"h-full p-1 "+
        (isTarget ? "bg-status-green":"bg-background")+
        " border-8 rounded-lg" 
      }
          onDoubleClick={(event)=>{
            event.stopPropagation();
            focusNode();
        }}
        style={{position:"relative"}}
        onMouseEnter={(event)=>{
          setToolbarOn(true);
        }}
        onMouseOut={(event)=>{
          let timer=setTimeout(() => { setToolbarOn(false);}, 5000);
          timer=null;
          // setToolbarOn(false);
        }}
        
    >
      <NodeResizer isVisible={selected} minWidth={225} minHeight={225} handleClassName="w-5 h-5"
                   onResizeEnd={refreshCurrentFlow}/>
      <div style={{cursor: 'text',position:"relative",zIndex:2}} onMouseDownCapture={handleMouseDown} className="bg-muted h-full">
        <NodeToolbar offset={2}>
        <div className="flex justify-between w-full m-0">  
          <div className="m-0">    
          <Toolbar
              editor={editor}
              defaultConfig={toolbarConfig}
              mode={"simple"}
              style={{ border: '1px solid #ccc' }}
          /> 
          </div> 
        </div>          
        </NodeToolbar>
          <NodeToolbar offset={2} isVisible={toolbarOn}  position={Position.Left}>
          <div className="m-0 mt-2 bg-muted fill-foreground stroke-foreground text-primary [&>button]:border-b-border hover:[&>button]:bg-border">
            <ShadTooltip content="Prev Node" side="left" >
              <button onClick={focusPrevNode}>
                <IconComponent name="SkipBack" className="side-bar-button-size" />
              </button>
            </ShadTooltip>            
          </div>  
          </NodeToolbar>
          <NodeToolbar offset={2} isVisible={toolbarOn} position={Position.Right}>
          <div className="m-0 mt-2 bg-muted fill-foreground stroke-foreground text-primary [&>button]:border-b-border hover:[&>button]:bg-border">
            <ShadTooltip content="Next Node" side="right" >
              <button onClick={focusNextNode}>
                <IconComponent name="SkipForward" className="side-bar-button-size" />
              </button>
            </ShadTooltip>            
          </div>  
          </NodeToolbar>          
          <Editor
            defaultConfig={editorConfig}
            value={data.value}
            onCreated={setEditor}
              // onChange={editor => {                 
                //onChange(editor.getHtml());
                // console.log(editor.getHtml());
              // }}
              mode="simple"
              style={{ height: '100%',
              minWidth:'200px',
              minHeight:'200px',
              width:'100%',
              fontSize:'20px',
              //  overflowY: 'scroll' 
            }} 
          />
          
      </div>
      {!isConnecting && (
          <Handle
            className="customHandle"
            position={Position.Top}
            type="source"
            style={sourceStyle}
            
          />
        )}
      <Handle type="target" position={Position.Top} id="a" className="customHandle"/>
    </div>
  );
}