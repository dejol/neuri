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
import { TabsContext } from "../../contexts/tabsContext";
import { switchToBG } from "../../pages/FlowPage/components/borderColorComponent";
import { darkContext } from "../../contexts/darkContext";

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
const { tabId } =useContext(TabsContext);
//below is wangEditor
// const [toolbarOn,setToolbarOn] = useState(false);
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
  {
    key: "image",
    title: "Image",
    iconSvg:'<svg viewBox="0 0 1024 1024"><path d="M959.877 128l0.123 0.123v767.775l-0.123 0.122H64.102l-0.122-0.122V128.123l0.122-0.123h895.775zM960 64H64C28.795 64 0 92.795 0 128v768c0 35.205 28.795 64 64 64h896c35.205 0 64-28.795 64-64V128c0-35.205-28.795-64-64-64zM832 288.01c0 53.023-42.988 96.01-96.01 96.01s-96.01-42.987-96.01-96.01S682.967 192 735.99 192 832 234.988 832 288.01zM896 832H128V704l224.01-384 256 320h64l224.01-192z"></path></svg>',
    menuKeys:['insertImage','uploadImage',]
  },
];
// 编辑器配置
// const [focus,setFocus] =useState(false);
const [focusEditor,setFocusEditor] =useState(false);
const focusEditorRef = useRef(false);
useEffect(() => {
  focusEditorRef.current = focusEditor;
}, [focusEditor]);



function handleChange(content){
  if(focusEditorRef.current){
    onChange(content);
  }
}
const editorConfig: Partial<IEditorConfig> = {   
    placeholder: '展示结果...',
    autoFocus:false,
    MENU_CONF:{},
    onChange :(editor:IDomEditor)=>{
      // setToolbarOn(true);
      handleChange(editor.getHtml());
    },
    onBlur:(editor:IDomEditor)=>{
      // setToolbarOn(false);
      setFocusEditor(false);
    },
    onFocus:(editor:IDomEditor)=>{
      // setToolbarOn(true);
      setFocusEditor(true)
    }    
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

// const node = useStoreState((state) => state.nodes[id]);
const [isDragging, setIsDragging] = useState(false);
const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
const ref = useRef<HTMLDivElement>(null);
// const { reactFlowInstance } = useContext(typesContext);
const handleMouseDown = (event) => {
  // console.log("call handleMouseDown");
  event.stopPropagation();
  // setIsDragging(true);
  // setMouseOffset({
  //   x: event.clientX - event.currentTarget.getBoundingClientRect().left,
  //   y: event.clientY - event.currentTarget.getBoundingClientRect().top,
  // });
};

// const handleMouseMove = (event) => {
//   // console.log("call handleMouseMove",reactFlowInstance.getNode(data.id).position.x);

//   if (isDragging) {
//     const dx = event.clientX - mouseOffset.x - reactFlowInstance.getNode(data.id).position.x - dragOffset.x;
//     const dy = event.clientY - mouseOffset.y - reactFlowInstance.getNode(data.id).position.y - dragOffset.y;
//     // console.log("dx:[",dx,"]dy:[",dy,"]")
//     // Replace the following condition with your own logic to control the draggable area
//     if (dx > 10 && dx < 90 && dy > 10 && dy < 90) {
//       reactFlowInstance.getNode(data.id).position = { x: reactFlowInstance.getNode(data.id).position.x + dx, y: reactFlowInstance.getNode(data.id).position.y + dy };
//       setDragOffset({ x: dragOffset.x + dx, y: dragOffset.y + dy });
//     }
//   }
// };

const handleMouseUp = () => {
  // console.log("call handleMouseUp");
  setIsDragging(false);
  setDragOffset({ x: 0, y: 0 });
};
// useEffect(() => {
//     setToolbarOn(nodeSelected);
// }, [nodeSelected]);
const {dark} =useContext(darkContext);

  return (
    <>  
    <NodeToolbar offset={2} className="bg-muted fill-foreground stroke-foreground rounded-md shadow-sm border">
    <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode={"simple"}
        // style={{ border: '1px solid #ccc' }}
        className="m-1"

    />
    </NodeToolbar>
    <div className="left-form-modal-iv-box ">
    <div className="eraser-column-arrangement">
        <div className="eraser-size-embedded">
            <div className="chat-message-div">
                <div >
                    <div className="form-modal-chat-text-position">
                        <div>
                            <div className="w-full">
                                <div className="w-full">
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
                    backgroundColor:switchToBG(data.borderColor,dark),                     
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
