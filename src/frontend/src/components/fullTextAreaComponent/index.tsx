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
export default function FullTextAreaComponent({
  value,
  onChange,
  data,
}: {
  onChange: (value: string[] | string) => void;
  value: string;
  data:NodeDataType;
}) {
  const [toolbarOn,setToolbarOn] = useState(false);
  Boot.registerModule(markdownModule);

  // editor 实例
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  
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
  // 编辑器配置
  // console.log('runnable:',data.node.runnable);
  const [focus,setFocus] =useState(true);
  const editorConfig: Partial<IEditorConfig> = {   
      placeholder: '请输入内容...',
      autoFocus:false,
      
      onChange :(editor:IDomEditor)=>{
        // console.log('runnable 1:',data.node.runnable);
        // if(focus){
          // console.log('content', editor.getHtml());
          onChange(editor.getHtml());
          // console.log('runnable 2:',data.node.runnable);

        // }
      },
      onBlur:(editor:IDomEditor)=>{
        setToolbarOn(false);
        // console.log('onBlur');
      },
      onFocus:(editor:IDomEditor)=>{
        // setFocus(true)
        // console.log('onFocus');
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
  const [isDragging, setIsDragging] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const { reactFlowInstance } = useContext(typesContext);
  const handleMouseDown = (event) => {
    event.stopPropagation();
    // setIsDragging(true);
    // setMouseOffset({
    //   x: event.clientX - event.currentTarget.getBoundingClientRect().left,
    //   y: event.clientY - event.currentTarget.getBoundingClientRect().top,
    // });
  };
  
  const handleMouseMove = (event) => {
    if (isDragging) {
      const dx = event.clientX - mouseOffset.x - reactFlowInstance.getNode(data.id).position.x - dragOffset.x;
      const dy = event.clientY - mouseOffset.y - reactFlowInstance.getNode(data.id).position.y - dragOffset.y;
      if (dx > 10 && dx < 90 && dy > 10 && dy < 90) {
        reactFlowInstance.getNode(data.id).position = { x: reactFlowInstance.getNode(data.id).position.x + dx, y: reactFlowInstance.getNode(data.id).position.y + dy };
        setDragOffset({ x: dragOffset.x + dx, y: dragOffset.y + dy });
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <div className="w-full  items-center input-full-node input-note dark:input-note-dark"
    style={{cursor: 'text'}}
    onMouseDownCapture={handleMouseDown}
    // onMouseMove={handleMouseMove}
    // onMouseUpCapture={handleMouseUp}
    >
      {/* <Textarea
        value={value}
        // disabled={disabled}
        // className={editNode ? "input-full-node input-note dark:input-note-dark" : ""}
        placeholder={"Type something..."}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      /> */}
      {toolbarOn &&(
                      <Toolbar
                      editor={editor}
                      defaultConfig={toolbarConfig}
                      mode="simple"
                      style={{ borderBottom: '1px solid #ccc' }}
                  />
      )}

      <Editor
                    defaultConfig={editorConfig}
                    value={value}
                    onCreated={setEditor}
                    onChange={editor => {
                      
                      //onChange(editor.getHtml());
                      // console.log(editor.getHtml());
                    }}
                    mode="default"
                    style={{ height: '95%',

                    //  overflowY: 'scroll' 
                    }} 
                />
                 
    </div>
  );
}
