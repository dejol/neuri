import { useRef,useState,useEffect,useContext } from "react";
import { TypeModal } from "../../constants/enums";
import GenericModal from "../../modals/genericModal";
import { TextAreaComponentType } from "../../types/components";
import { Textarea } from "../ui/textarea";
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import '../../style/custom.css'
import { Boot } from '@wangeditor/editor'
import { typesContext } from "../../contexts/typesContext";
import markdownModule from '@wangeditor/plugin-md'
import {NodeDataType} from "../../types/flow/index"
import { cloneDeep } from "lodash";
import { Background, NodeToolbar } from "reactflow";
import { red } from "@mui/material/colors";
export default function FullTextAreaComponent({
  value,
  onChange,
  data,
  nodeSelected,
  defualtToolbar=false,
}: {
  onChange: (value: string[] | string) => void;
  value: string;
  data?:NodeDataType;
  nodeSelected:boolean;
  defualtToolbar?:boolean;
}) {
  const [toolbarOn,setToolbarOn] = useState(false);
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
  if(!defualtToolbar){
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
  }
//   toolbarConfig.excludeKeys = [
//     'headerSelect',
//     'italic',
//     'group-more-style' // 排除菜单组，写菜单组 key 的值即可
// ];
  
  // 编辑器配置
  const [focusEditor,setFocusEditor] =useState(false);
  const focusEditorRef = useRef(false);

  useEffect(() => {
    focusEditorRef.current = focusEditor;
  }, [focusEditor]);
  useEffect(() => {
    if(!nodeSelected &&toolbarOn){
      setToolbarOn(false);
    }
  }, [nodeSelected]);


  function handleChange(content){
    if(focusEditorRef.current){
      onChange(content);
    }
  }
  const editorConfig: Partial<IEditorConfig> = {   
      placeholder: 'Type something...',
      autoFocus:false,
      
      onChange :(editor:IDomEditor)=>{
          handleChange(editor.getHtml());
      },
      onBlur:(editor:IDomEditor)=>{
        setToolbarOn(false);
        setFocusEditor(false)
      },
      onFocus:(editor:IDomEditor)=>{
        setFocusEditor(true)
        setToolbarOn(true);
      }
  }

  // 及时销毁 editor ，重要！
  useEffect(() => {
    // console.log("call fullText useEffect");
      return () => {
          if (editor == null) return
          editor.destroy()
          setEditor(null)
      }
  }, [editor])
  
  // const node = useStoreState((state) => state.nodes[id]);
  // const [isDragging, setIsDragging] = useState(false);
  // const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  // const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // const { reactFlowInstance } = useContext(typesContext);
  const handleMouseDown = (event) => {
    event.stopPropagation();
    // setIsDragging(true);
    // setMouseOffset({
    //   x: event.clientX - event.currentTarget.getBoundingClientRect().left,
    //   y: event.clientY - event.currentTarget.getBoundingClientRect().top,
    // });
  };
  
  // const handleMouseMove = (event) => {
  //   if (isDragging) {
  //     const dx = event.clientX - mouseOffset.x - reactFlowInstance.getNode(data.id).position.x - dragOffset.x;
  //     const dy = event.clientY - mouseOffset.y - reactFlowInstance.getNode(data.id).position.y - dragOffset.y;
  //     if (dx > 10 && dx < 90 && dy > 10 && dy < 90) {
  //       reactFlowInstance.getNode(data.id).position = { x: reactFlowInstance.getNode(data.id).position.x + dx, y: reactFlowInstance.getNode(data.id).position.y + dy };
  //       setDragOffset({ x: dragOffset.x + dx, y: dragOffset.y + dy });
  //     }
  //   }
  // };
  
  // const handleMouseUp = () => {
  //   setIsDragging(false);
  //   setDragOffset({ x: 0, y: 0 });
  // };

  return (
    <>
    {(defualtToolbar||toolbarOn) &&(
      (defualtToolbar?(
        <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode={"default"}
        // style={{ borderBottom: '1px solid #ccc' }}
    />
      ):(
        <NodeToolbar offset={3}>
        <Toolbar
            editor={editor}
            defaultConfig={toolbarConfig}
            mode={"simple"}
            style={{ border: '1px solid #ccc' }}
        />
        </NodeToolbar>
      ))
    )}
    <div className="w-full items-center input-full-node input-note dark:input-note-dark"
    style={{cursor: 'text'}}
    onMouseDownCapture={handleMouseDown}
    >
      <Editor
                    defaultConfig={editorConfig}
                    value={value}
                    onCreated={setEditor}
                    // onChange={editor => {
                      
                      //onChange(editor.getHtml());
                      // console.log(editor.getHtml());
                    // }}
                    mode="simple"
                    style={{ height: '95%',
                    minWidth:'200px',
                    minHeight:'200px',
                    width:'100%',

                    //  overflowY: 'scroll' 
                    }} 
                />
                 
    </div>
    </>
  );
}
