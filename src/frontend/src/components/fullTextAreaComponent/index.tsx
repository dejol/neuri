import { useRef,useState,useEffect } from "react";
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import '../../style/custom.css'
import { Boot } from '@wangeditor/editor'
import markdownModule from '@wangeditor/plugin-md'
import {NodeDataType} from "../../types/flow/index"
import { NodeToolbar } from "reactflow";
export default function FullTextAreaComponent({
  value,
  onChange,
  data,
  nodeSelected,
}: {
  onChange: (value: string[] | string) => void;
  value: string;
  data?:NodeDataType;
  nodeSelected:boolean;
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
      return () => {
          if (editor == null) return
          editor.destroy()
          setEditor(null)
      }
  }, [editor])
  
  const handleMouseDown = (event) => {
    event.stopPropagation();
  };
  return (
    <>
      <NodeToolbar offset={2}>
      <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode={"simple"}
          style={{ border: '1px solid #ccc' }}
      />
      </NodeToolbar>
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
              fontSize:'20px',
              //  overflowY: 'scroll' 
            }} 
          />
                 
      </div>
    </>
  );
}
