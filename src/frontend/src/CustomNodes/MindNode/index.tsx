import { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/core";
import { Boot } from "@wangeditor/editor";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import { useContext, useEffect, useState } from "react";
import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow, useStore, useStoreApi, useUpdateNodeInternals } from "reactflow";
import markdownModule from '@wangeditor/plugin-md'
import { TabsContext } from "../../contexts/tabsContext";
import ShadTooltip from "../../components/ShadTooltipComponent";
import IconComponent from "../../components/genericIconComponent";
import { cloneDeep } from "lodash";
import { typesContext } from "../../contexts/typesContext";
import { locationContext } from "../../contexts/locationContext";
import { darkContext } from "../../contexts/darkContext";
import { switchToBG } from "../../pages/FlowPage/components/borderColorComponent";
import BorderColorComponent from "../../pages/FlowPage/components/borderColorComponent";
import { Expand } from "lucide-react";
import { getAllRelatedNode } from "../../utils/utils";
import BuildTrigger from "../../modals/embeddedModal/buildTrigger";

const connectionNodeIdSelector = (state) => state.connectionNodeId;
const sourceStyle = { zIndex: 1 };
const hide = (hidden,ids) => (nodeOrEdge) => {
  let indx=ids.findIndex((id)=>id==nodeOrEdge.id)
  if(indx>=0){
    nodeOrEdge.hidden = hidden;
  }
  return nodeOrEdge;
};
export default function MindNode({
  id,
  data,
  selected,
  xPos,
  yPos,
}: {
  id:string,
  data: {id:string,value:string,type:string,borderColor?:string,update_at?:Date,numOftarget?:number}; 
  selected: boolean;
  xPos:number;
  yPos:number;
}) {
  const [toolbarOn,setToolbarOn] = useState(false);
  Boot.registerModule(markdownModule);
  const { flows, tabId,updateFlow,setIsEMBuilt } =useContext(TabsContext);
  const { reactFlowInstances } = useContext(typesContext);
  const {dark} =useContext(darkContext);
  const {isInteractive} =useContext(locationContext);
  const [borderColour,setBorderColour] =useState(data.borderColor??"inherit");
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
      {
        key: "video",
        title: "Video",
        iconSvg:'<svg viewBox="0 0 1024 1024"><path d="M981.184 160.096C837.568 139.456 678.848 128 512 128S186.432 139.456 42.816 160.096C15.296 267.808 0 386.848 0 512s15.264 244.16 42.816 351.904C186.464 884.544 345.152 896 512 896s325.568-11.456 469.184-32.096C1008.704 756.192 1024 637.152 1024 512s-15.264-244.16-42.816-351.904zM384 704V320l320 192-320 192z"></path></svg>',
        menuKeys:['insertVideo','uploadVideo',]
      },
    ];

  // 编辑器配置
  function handleChange(content){
    // if(focusEditorRef.current){
    //   onChange(content);
    // }
    data.value=content;
    data.update_at=new Date();
    refreshCurrentFlow();
  }
  useEffect(()=>{
    data.borderColor=borderColour;
    data.update_at=new Date();
  },[borderColour]);

  const editorConfig: Partial<IEditorConfig> = {   
      placeholder: '请输入内容...',
      autoFocus:false,
      MENU_CONF: {},
      onChange :(editor:IDomEditor)=>{
          handleChange(editor.getHtml());
      },

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
  const [editable,setEditable]=useState(false);

  const handleMouseDown = (event) => {
    if(editable)
      event.stopPropagation();
  };
  const connectionNodeId = useStore(connectionNodeIdSelector);
  const isConnecting = !!connectionNodeId;
  const isTarget = connectionNodeId && connectionNodeId !== id&&(connectionNodeId&&connectionNodeId.toString().startsWith("mindNode"));
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

  function focusNextNode(){
    let flow = flows.find((flow) => flow.id === tabId);
    let ed=flow.data?.edges.find((edge)=>(edge.source===id&&edge.source!=edge.target));
    if(ed){
      let node=flow.data?.nodes.find((node)=>node.id===ed.target);  
      fitView({nodes:[node],duration:1000,padding:0.1})
    }
  }
  function focusPrevNode(){
    let flow = flows.find((flow) => flow.id === tabId);
    let edge=flow.data?.edges.find((edge)=>(edge.target===id&&edge.source!=edge.target));
    if(edge){
      let node=flow.data?.nodes.find((node)=>node.id===edge.source);  
      fitView({nodes:[node],duration:1000,padding:0.1})
    } 
  }
  function refreshCurrentFlow(){
    let myFlow = flows.find((flow) => flow.id === tabId);
    if (reactFlowInstances.get(tabId) && myFlow) {
      let flow = cloneDeep(myFlow);
      flow.data = reactFlowInstances.get(tabId).toObject();
      reactFlowInstances.get(tabId).setNodes(flow.data.nodes);
      flow.data.viewport=myFlow.data.viewport; //for the bug of cloneDeep()
      updateFlow(flow);
    }
  }
  const [hidden, setHidden] = useState(true);

  function expandNode(){
    let flow = flows.find((flow) => flow.id === tabId);
    let edges=flow.data?.edges.filter((edge)=>(edge.source===id));
    data.numOftarget=edges.length;
    let ids=[];
    let nodeIds=[];
    edges.forEach((edge)=>{
      
        ids.push(edge.id);
      if(edge.type!="floating"){
        nodeIds.push(edge.target);
        getAllRelatedNode(flow,edge.target,ids,nodeIds)
      }
    })
    reactFlowInstances.get(tabId).setEdges((eds) => eds.map(hide(hidden,ids)));
    reactFlowInstances.get(tabId).setNodes((nds) => nds.map(hide(hidden,nodeIds)));
    setHidden(!hidden);

  }
  return (
    <div className={"h-full p-1 "+
        (isTarget ? "bg-status-green":"bg-background")+
        " border-8 rounded-3xl" +(selected?" border-ring":"")
      }
          onDoubleClick={(event)=>{
            event.stopPropagation();
            focusNode();
        }}
        style={{position:"relative",borderColor:borderColour}}
        onMouseEnter={(event)=>{
          setToolbarOn(true);
        }}
        onMouseOut={(event)=>{
          let timer=setTimeout(() => { setToolbarOn(false);}, 15000);
          timer=null;
          // setToolbarOn(false);
        }}
        
    >
      <div style={{cursor: editable?'text':'pointer',position:"relative",zIndex:2}} 
          onMouseDownCapture={handleMouseDown} 
          onDoubleClick={(event)=>{
            event.stopPropagation();
            setEditable(true);
           }}
           onBlur={()=>{
            setEditable(false);
           }}          
          className="bg-muted h-full border-0 rounded-3xl">

        {isInteractive&&(
          <>
          <NodeToolbar offset={2} align={"end"} isVisible={toolbarOn}  position={Position.Left}>
          <div className="m-0 mt-2 bg-muted fill-foreground stroke-foreground text-primary [&>button]:border-b-border hover:[&>button]:bg-border">
            <ShadTooltip content="Prev Node" side="left" >
              <button onClick={focusPrevNode}>
                <IconComponent name="SkipBack" className="side-bar-button-size" />
              </button>
            </ShadTooltip>            
          </div>  
          </NodeToolbar>

          <NodeToolbar offset={2} align={"end"} isVisible={toolbarOn} position={Position.Right}>
          <div className="m-0 mt-2 bg-muted fill-foreground stroke-foreground text-primary [&>button]:border-b-border hover:[&>button]:bg-border">
            <ShadTooltip content="Next Node" side="right" >
              <button onClick={focusNextNode}>
                <IconComponent name="SkipForward" className="side-bar-button-size" />
              </button>
            </ShadTooltip>            
          </div>  
          </NodeToolbar>          
          </>

        )} 
        {editable?(
          <Editor
            defaultConfig={editorConfig}
            value={data.value}
            onCreated={setEditor}
              mode="simple"
              style={{ height: '100%',
              minWidth:'300px',
              maxWidth:'700px',
              minHeight:'100px',
              maxHeight:'300px',
              width:'100%',
              fontSize:'20px',
              backgroundColor:switchToBG(borderColour,dark),
               overflowY: 'scroll' 
            }} 
            className="border-0 rounded-3xl"
          />
        ):(
          <div className="border-0 rounded-3xl p-3 w-full h-full" style={{backgroundColor:switchToBG(borderColour,dark),minWidth:'300px',minHeight:'100px',fontSize:'20px'}}>
            <div dangerouslySetInnerHTML={{__html:data.value}} className="mindNode"/>
            
          </div>
        )}
          
      </div>
      {!isConnecting ? (
          <Handle
            // className="customHandle"
            position={Position.Right}
            type="source"
            // style={sourceStyle}
            className={data.numOftarget>0?"-mr-5 h-5 w-5 rounded-full border-2 bg-background cursor-pointer":"h-1 w-1"}
            style={{
              borderColor: borderColour,
              zIndex:1,
            }}      
            onClick={expandNode}     
          >
          {(!hidden)?(
          <div className="h-5 w-5 absolute flex -top-1 left-1" >{data.numOftarget??0}</div>
          ):data.numOftarget>0&&(
              <IconComponent name="Minus" className="h-4 w-4" />
          )}
          </Handle>
      ):(
        <Handle
          className="customHandle"
          position={Position.Right}
          type="source"
          style={sourceStyle}
          // className={data.numOftarget>0?"-mr-5 h-5 w-5 rounded-full border-2 bg-background cursor-pointer":"h-1 w-1"}    
        >
        </Handle>
      )}
      <Handle type="target" position={Position.Left}  className="customHandle"/>
    </div>
  );
}

