import { useState,useEffect } from "react";
import { TypeModal } from "../../constants/enums";
import GenericModal from "../../modals/genericModal";
import { TextAreaComponentType } from "../../types/components";
import { Textarea } from "../ui/textarea";
// import {CKEditor} from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import { Editor, Toolbar } from '@wangeditor/editor-for-react'
// import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
// import '@wangeditor/editor/dist/css/style.css' // 引入 css

export default function FullTextAreaComponent({
  value,
  onChange,
  disabled,
  editNode = false,
}: TextAreaComponentType) {
  // Clear text area
  useEffect(() => {
    if (disabled) {
      onChange("");
    }
  }, [disabled]);
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

// editor 实例
// const [editor, setEditor] = useState<IDomEditor | null>(null)   // TS 语法
// const [editor, setEditor] = useState(null)                   // JS 语法

// 编辑器内容
// const [html, setHtml] = useState(value)

// 模拟 ajax 请求，异步设置 html
// useEffect(() => {
//     setTimeout(() => {
//         setHtml('<p>hello world</p>')
//     }, 1500)
// }, [])

// 工具栏配置
// const toolbarConfig: Partial<IToolbarConfig> = { }  // TS 语法
// const toolbarConfig = { }                        // JS 语法

// 编辑器配置
// const editorConfig: Partial<IEditorConfig> = {    // TS 语法
// const editorConfig = {                         // JS 语法
    // placeholder: '请输入内容...',
// }

// 及时销毁 editor ，重要！
// useEffect(() => {
//     return () => {
//         if (editor == null) return
//         editor.destroy()
//         setEditor(null)
//     }
// }, [editor])
  return (
    <div className="w-full h-full items-center">
      <Textarea
        value={value}
        disabled={disabled}
        className={editNode ? "input-full-node input-note dark:input-note-dark" : ""}
        placeholder={"Type something..."}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
                {/* <CKEditor
                    editor={ ClassicEditor }
                    data={value}
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
                /> */}
{/*                 
                 <div style={{ border: '1px solid #ccc', zIndex: 100}}>
                <Toolbar
                    editor={editor}
                    defaultConfig={toolbarConfig}
                    mode="simple"
                    style={{ borderBottom: '1px solid #ccc' }}
                />
                <Editor
                    defaultConfig={editorConfig}
                    value={html}
                    onCreated={setEditor}
                    onChange={editor => setHtml(editor.getHtml())}
                    mode="default"
                    style={{ height: '100px', overflowY: 'scroll' }}
                />
            </div> */}

    </div>
  );
}
