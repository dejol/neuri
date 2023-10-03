import { useState,useEffect,useRef,useContext } from "react";
import {NodeDataType} from "../../types/flow/index"
// import { TypeModal } from "../../constants/enums";
// import GenericModal from "../../modals/genericModal";
// import { TextAreaComponentType } from "../../types/components";

// import { Textarea } from "../ui/textarea";
// import {CKEditor} from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import '../../style/custom.css'
import { Boot } from '@wangeditor/editor'
import { typesContext } from "../../contexts/typesContext";
import markdownModule from '@wangeditor/plugin-md'
import { NodeToolbar } from "reactflow";


// import ReactMarkdown from "react-markdown";
// import rehypeMathjax from "rehype-mathjax";
// import remarkGfm from "remark-gfm";
// import remarkMath from "remark-math";
// import CodeTabsComponent from "../../components/codeTabsComponent";
// import {CKEditor} from "@ckeditor/ckeditor5-react";

export default function HtmlViewComponent({
  contentValue,
  onChange,
  data,
  nodeSelected,
}: {contentValue:any;  
  onChange: (value: string[] | string) => void;
  data:NodeDataType;
  nodeSelected:boolean;
}) {
  /*
   // The configuration of the <CKEditor> instance.
   const editorConfig = {
    // plugins: [
    //     // A set of editor features to be enabled and made available to the user.
    //     Essentials, Heading, Bold, Italic, Underline,
    //     Link, Paragraph, Table, TableToolbar,

    //     // Your custom plugin implementing the widget is loaded here.
    //     ProductPreviewEditing
    // ],
    toolbar: [
        'heading',
        '|',
        'bold', 'italic', 'underline',
        '|',
        'link', 'insertTable',
        '|',
        'undo', 'redo'
    ],
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
        ]
    },
    // The configuration of the Products plugin. It specifies a function that will allow
    // the editor to render a React <ProductPreview> component inside a product widget.
    // products: {
    //     productRenderer: ( id, domElement ) => {
    //         const product = this.props.products.find( product => product.id === id );
    //         const root = createRoot( domElement );

    //         root.render(
    //             <ProductPreview id={id} {...product} />
    //         );
    //     }
    // }
};
*/
//below is wangEditor
const [toolbarOn,setToolbarOn] = useState(false);
Boot.registerModule(markdownModule)

// editor 实例
const [editor, setEditor] = useState<IDomEditor | null>(null)

// 编辑器内容
// const [html, setHtml] = useState(contentValue)

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
// const [focus,setFocus] =useState(false);
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
      setFocusEditor(false);
      setToolbarOn(false);
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

// const node = useStoreState((state) => state.nodes[id]);
const [isDragging, setIsDragging] = useState(false);
const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
const ref = useRef<HTMLDivElement>(null);
const { reactFlowInstance } = useContext(typesContext);
const handleMouseDown = (event) => {
  // console.log("call handleMouseDown");
  event.stopPropagation();
  // setIsDragging(true);
  // setMouseOffset({
  //   x: event.clientX - event.currentTarget.getBoundingClientRect().left,
  //   y: event.clientY - event.currentTarget.getBoundingClientRect().top,
  // });
};

const handleMouseMove = (event) => {
  // console.log("call handleMouseMove",reactFlowInstance.getNode(data.id).position.x);

  if (isDragging) {
    const dx = event.clientX - mouseOffset.x - reactFlowInstance.getNode(data.id).position.x - dragOffset.x;
    const dy = event.clientY - mouseOffset.y - reactFlowInstance.getNode(data.id).position.y - dragOffset.y;
    // console.log("dx:[",dx,"]dy:[",dy,"]")
    // Replace the following condition with your own logic to control the draggable area
    if (dx > 10 && dx < 90 && dy > 10 && dy < 90) {
      reactFlowInstance.getNode(data.id).position = { x: reactFlowInstance.getNode(data.id).position.x + dx, y: reactFlowInstance.getNode(data.id).position.y + dy };
      setDragOffset({ x: dragOffset.x + dx, y: dragOffset.y + dy });
    }
  }
};

const handleMouseUp = () => {
  // console.log("call handleMouseUp");
  setIsDragging(false);
  setDragOffset({ x: 0, y: 0 });
};


  return (
    <>
    <NodeToolbar offset={3}>
    <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode={"simple"}
        style={{ border: '1px solid #ccc' }}
    />
    </NodeToolbar>
    <div className="left-form-modal-iv-box ">
    <div className="eraser-column-arrangement">
        <div className="eraser-size-embedded">
            <div className="chat-message-div">
                <div >
                    <div className="form-modal-chat-text-position">
                        <div className="form-modal-chat-text">
                            <div className="w-full">
                                <div className="w-full dark:text-white">
                                    <div className="w-full" 
                                    style={{cursor: 'text',}}
                                    onMouseDownCapture={handleMouseDown}
                                    // onMouseMove={handleMouseMove}
                                    // onMouseUpCapture={handleMouseUp}
                                    >   
{/*                                                         
                                    <CKEditor
                    editor={ ClassicEditor }
                    data={contentValue}
                    config={editorConfig}
                    onReady={ editor => {
                        // You can store the "editor" and use when it is needed.
                        
                        console.log( 'Editor is ready to use!', editor );
                    } }
                    onChange={ ( event, editor ) => {
                        const data = editor.getData();
                        onChange(data);
                        console.log( { event, editor, data } );
                    } }
                    onBlur={ ( event, editor ) => {
                        console.log( 'Blur.', editor );
                    } }
                    onFocus={ ( event, editor ) => {
                        console.log( 'Focus.', editor );
                    } }
                />  */}

                                
                 <div style={{ border: '0px solid #ccc',  zIndex: 100}}>
                <Editor
                    defaultConfig={editorConfig}
                    value={contentValue}
                    onCreated={setEditor}
                    // onChange={editor => {
                      // setHtml(editor.getHtml());
                      // onChange(editor.getHtml());
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
                              {/* <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeMathjax]}
                          className="markdown prose min-w-full text-primary word-break-break-word
                      dark:prose-invert"
                          components={{
                            pre({ node, ...props }) {
                              return <>{props.children}</>;
                            },
                            code: ({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) => {
                              if (children.length) {
                                if (children[0] === "▍") {
                                  return (
                                    <span className="form-modal-markdown-span">
                                      ▍
                                    </span>
                                  );
                                }

                                children[0] = (children[0] as string).replace(
                                  "`▍`",
                                  "▍"
                                );
                              }

                              const match = /language-(\w+)/.exec(
                                className || ""
                              );

                              return !inline ? (
                                <CodeTabsComponent
                                  isMessage
                                  tabs={[
                                    {
                                      name: (match && match[1]) || "",
                                      mode: (match && match[1]) || "",
                                      image:
                                        "https://curl.se/logo/curl-symbol-transparent.png",
                                      language: (match && match[1]) || "",
                                      code: String(children).replace(/\n$/, ""),
                                    },
                                  ]}
                                  activeTab={"0"}
                                  setActiveTab={() => {}}
                                />
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {contentValue}
                        </ReactMarkdown> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>                  
</div>  
</>
  );
}
