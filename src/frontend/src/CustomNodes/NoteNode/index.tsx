import { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/core";
import { Boot } from "@wangeditor/editor";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import { useContext, useEffect, useRef, useState } from "react";
import { Handle, NodeResizer, NodeToolbar, Position, useReactFlow, useStore, useStoreApi } from "reactflow";
import markdownModule from '@wangeditor/plugin-md'
import { TabsContext } from "../../contexts/tabsContext";
import zIndex from "@mui/material/styles/zIndex";

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
  // const [toolbarOn,setToolbarOn] = useState(false);
  Boot.registerModule(markdownModule);

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
      'insertImage',
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
      
      onChange :(editor:IDomEditor)=>{
          handleChange(editor.getHtml());
          setToolbarOn(true);
      },
      onBlur:(editor:IDomEditor)=>{
        // setToolbarOn(false);
        // setFocusEditor(false)
        setToolbarOn(false);
      },
      onFocus:(editor:IDomEditor)=>{
        // setFocusEditor(true)
        // setToolbarOn(true);
        setToolbarOn(true);
      }
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
  const { flows, tabId } =useContext(TabsContext);
  const connectionNodeId = useStore(connectionNodeIdSelector);
  // console.log("connectionNodeId:%s,id:%s",connectionNodeId,id);
  const isConnecting = !!connectionNodeId;
  const isTarget = connectionNodeId && connectionNodeId !== id;
  // const label = isTarget ? 'Drop here' : 'Drag to connect';

  const { setCenter } = useReactFlow();
  function focusNode() {
    let flow = flows.find((flow) => flow.id === tabId);
    let node=flow.data?.nodes.find((node)=>node.id===id);
    if (!node) return;
    const x = node.position.x + node.width / 2;
    const y = node.position.y + node.height / 2;
    setCenter(x, y, { zoom:0.8, duration: 1000 });
  }
  const [toolbarOn,setToolbarOn] =useState(false);
  useEffect(()=>{
    setToolbarOn(selected);

  },[selected])
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
    >
      <NodeResizer  isVisible={selected} minWidth={225} minHeight={225} handleClassName="w-5 h-5"/>
      <div style={{cursor: 'text',position:"relative",zIndex:2}} onMouseDownCapture={handleMouseDown} className="bg-muted h-full">
        <NodeToolbar offset={2} isVisible={toolbarOn}>
          <Toolbar
              editor={editor}
              defaultConfig={toolbarConfig}
              mode={"simple"}
              style={{ border: '1px solid #ccc' }}
          />
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