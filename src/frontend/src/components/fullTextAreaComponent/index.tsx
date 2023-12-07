import { useRef,useState,useEffect, useContext } from "react";
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import '../../style/custom.css'
import { Boot } from '@wangeditor/editor'
import markdownModule from '@wangeditor/plugin-md'
import {NodeDataType} from "../../types/flow/index"
import { Handle, NodeToolbar, Position, addEdge, useEdgesState } from "reactflow";
import { TabsContext } from "../../contexts/tabsContext";
import { darkContext } from "../../contexts/darkContext";
import { cloneDeep } from "lodash";
import { getNextBG, switchToBG } from "../../pages/FlowPage/components/borderColorComponent";
import { typesContext } from "../../contexts/typesContext";
import { undoRedoContext } from "../../contexts/undoRedoContext";

export default function FullTextAreaComponent({
  value,
  onChange,
  data,
  // setBorder,
  nodeSelected,
}: {
  onChange: (value: string[] | string) => void;
  value: string;
  data?:NodeDataType;
  // setBorder: (value: string) => void;
  nodeSelected:boolean;
}) {
  const { tabId,getNodeId,flows,getNewEdgeId } =useContext(TabsContext);
  // const flow=flows.find((flow)=>flow.id===tabId);

  // const { takeSnapshot } = useContext(undoRedoContext);

  // const [toolbarOn,setToolbarOn] = useState(false);
  Boot.registerModule(markdownModule);

  // editor 实例
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  // useEffect(()=>{
  //   setToolbarOn(defualtToolbar);
  // },[defualtToolbar]);
  // 编辑器内容
  // const [html, setHtml] = useState(value)
  
  // 模拟 ajax 请求，异步设置 html
  // useEffect(() => {
  //     setTimeout(() => {
  //         setHtml('<p>hello world</p>')
  //     }, 1500)
  // }, [])
  
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
  const [focusEditor,setFocusEditor] =useState(false);
  const focusEditorRef = useRef(false);

  useEffect(() => {
    focusEditorRef.current = focusEditor;
  }, [focusEditor]);
  // useEffect(() => {
  //     setToolbarOn(false);
  // }, [nodeSelected]);

  // useEffect(() => {
  //   let currNode=flow.data.nodes.find((node)=>node.id===data.id);

  // if(navigator.clipboard && navigator.clipboard.readText){
  //   navigator.clipboard.readText().then((value:string)=>{
  //     try {
  //       const jsonObject = JSON.parse(value);
  //       // let root=createNoteNode("JSON 对象",{x:currNode.position.x+700,y:currNode.position.y});
  //       // let currZoom=reactFlowInstances.get(tabId).getViewport().zoom;
  //       // takeSnapshot();
  //       // createNodeEdge(currNode.position.x+currNode.width+100,currNode.position.y,value,currNode.id);
  //       // createNodesFromJson(currNode.position.x+currNode.width+100,currNode.position.y,jsonObject,currNode.id);        
  //     } catch (error) {
  //       console.log("value is not json:",value);
  //     }
  //   });
  // }

  // }, [value]);

  function handleChange(content){
    if(focusEditorRef.current){
      onChange(content);
    }
  }
  const { reactFlowInstances } = useContext(typesContext);

  // function createNoteNode(newValue,newPosition,type?:string,borderColour?:string){
  //   if(!type){
  //     type="noteNode";
  //   }
  //   let flow=flows.find((flow)=>flow.id===tabId);

  //   if(!newPosition){
  //     let currNode=flow.data.nodes.find((node)=>node.id===data.id);
  //     newPosition={x:currNode.position.x+400,y:currNode.position.y+20};
  //   }
  //   let newId = getNodeId(type);
  //   let newNode = {
  //     id: newId,
  //     type: type,
  //     position:newPosition,
  //     data: {
  //       id:newId,
  //       type:type,
  //       value:newValue,
  //       borderColor:borderColour??"",
  //       numOftarget:0
  //     },
  //     width:220,
  //     height:220,
  //     selected:false,
  //     sourcePosition: Position.Right,
  //     targetPosition: Position.Left,
  //   };
  //   // let nodesList=flow.data.nodes;
  //   flow.data.nodes.push(newNode);
  //   // nodesList.push(newNode);
  
  //   reactFlowInstances.get(tabId).setNodes(flow.data.nodes);
  //   return newNode;
  // }

  // function createNodesFromJson(clientX,clientY,jsonObj,sourceId){
  //   let numX=1;
  //   let numY=0;
  //   let currZoom=1; //reactFlowInstances.get(tabId).getViewport().zoom;
  //   for (let key in jsonObj) {
  //     // setTimeout(function() {
  //       let newNodeId=createNodeEdge(clientX,clientY+200*numY*currZoom,key,sourceId);
  //       if (typeof jsonObj[key] === "object" && jsonObj[key] !== null) {
  //         numY+=createNodesFromJson(clientX+400*numX*currZoom,clientY+200*numY*currZoom,jsonObj[key],newNodeId);
  //       }else{
  //         createNodeEdge(clientX+400*numX*currZoom,clientY+200*numY*currZoom,jsonObj[key],newNodeId);
  //       }
  //       numY+=1;
  //     // }, 2000);
  //   }
  //   return numY-1;
  // }
  // function createNodeEdge(clientX,clientY,content,sourceId){
  //     // we need to remove the wrapper bounds, in order to get the correct position
  //     let sourceNode=flow?.data?.nodes.find((n)=>n.id==sourceId);
  //     let newNode=createNoteNode(content, 
  //     {
  //                   x: clientX, 
  //                   y: clientY 
  //               },
  //     "mindNode",getNextBG((sourceNode?sourceNode.data.borderColor:""))
  //     );

  //     let newEdeg={
  //       id:getNewEdgeId("mindEdeg"),
  //       source:sourceId,
  //       target:newNode.id,
  //       style: { 
  //         stroke: getNextBG((sourceNode?sourceNode.data.borderColor:"")),
  //         strokeWidth:6,
          
  //       },
  //       className:"stroke-foreground stroke-connection ",
  //       // markerEnd:{
  //       //   type: MarkerType.ArrowClosed,
  //       //   // color: 'black',
  //       // },
  //       type:(sourceNode.type == "noteNode"||sourceNode.type=="genericNode")?"simplebezier":"smoothstep",
  //       selectable:false,
  //       deletable:false,
  //       updatable:false,
  //       // animated:true,
  //     };


  //     flow.data.edges.push(newEdeg);    
  //     reactFlowInstances.get(tabId).setEdges(flow.data.edges);

  //     if(!sourceNode.data.numOftarget)sourceNode.data.numOftarget=0;
  //     sourceNode.data.numOftarget+=1;
  //     return newNode.id;
  // }

  const editorConfig: Partial<IEditorConfig> = {   
      placeholder: 'Type something...',
      autoFocus:false,
      MENU_CONF:{},
      onChange :(editor:IDomEditor)=>{
          handleChange(editor.getHtml());
          // createNoteNode(editor.getHtml(),null);
      },
      onBlur:(editor:IDomEditor)=>{
        // setToolbarOn(false);
        setFocusEditor(false)
      },
      onFocus:(editor:IDomEditor)=>{
        setFocusEditor(true)
        // setToolbarOn(true);
      }
  }
  editorConfig.MENU_CONF['image'] = {

  }
  editorConfig.MENU_CONF['uploadImage'] = {

    server: '/api/v1/upload/'+tabId,
    fieldName: 'file',
    // customInsert(res: any, insertFn:InsertFnType) {  
    //       insertFn(res.data.url, res.data.alt, res.data.href)
    //   },
  
     // 单个文件的最大体积限制，默认为 2M
     maxFileSize: 1 * 1024 * 1024, // 1M

     // 最多可上传几个文件，默认为 100
     maxNumberOfFiles: 10,
 
     // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
     allowedFileTypes: ['image/*'],

        // 单个文件上传失败
    onFailed(file: File, res: any) {   
          console.log(`${file.name} 上传失败`, res)
      },
  
      // 上传错误，或者触发 timeout 超时
      onError(file: File, err: any, res: any) {  
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
  const {dark} =useContext(darkContext);
  // const [borderColour,setBorderColour] =useState(data.borderColor??"inherit");
  // useEffect(() => {
  //     setBorder(borderColour); //for update flow data and prepare for save setting into DB
  // },[borderColour,dark]); 

  return (
    <div className=" h-full p-1"
    // style={{cursor: 'text',borderColor:data.borderColor}}
    // style={{cursor: editable?'text':'pointer'}}
    onMouseDownCapture={handleMouseDown}
    onDoubleClick={(event)=>{
      event.stopPropagation();
      setEditable(true);
     }}
     onBlur={()=>{
      setEditable(false);
     }}

    >
      <NodeToolbar offset={2} className="bg-muted fill-foreground stroke-foreground rounded-md shadow-sm border" >
      {editable&&(
      <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode={"simple"}
          // style={{ border: '1px solid #ccc' }}
          className="m-1"
      />
      )}
      </NodeToolbar>
      {/* <NodeToolbar offset={30} position={Position.Bottom}>
        <BorderColorComponent
              data={data}
              setBorder={setBorderColour}
              dark={dark}
            />   
      </NodeToolbar>            */}

<Handle type="target" position={Position.Left} id="responseContaner" style={{ zIndex: 1 }}  className="customHandle"/>

        <div style={{cursor: editable?'text':'pointer',position:"relative",zIndex:2}} className="bg-muted h-full ">
        <Editor
          defaultConfig={editorConfig}
          value={value}
          onCreated={setEditor}
            // onChange={editor => {                 
              //onChange(editor.getHtml());
              // console.log(editor.getHtml());
            // }}
            mode="simple"
            style={{ height: '100%',
            minWidth:'300px',
            minHeight:'300px',
            width:'100%',
            fontSize:'20px',
            backgroundColor:switchToBG(data.borderColor,dark),
            //  overflowY: 'scroll' 
            }} 
          />

        </div>   

      </div>
  );
}
