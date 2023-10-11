import { useEffect, useRef } from "react";
import _ from "lodash";
import IconComponent from "../../components/genericIconComponent";
import { useReactFlow } from 'reactflow';
import { Separator } from "../../components/ui/separator";
import { filterHTML } from "../../utils/utils";
export default function SearchListModal({
  open,
  setOpen,
  results,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  results:Array<any>;
}) {
  const { setCenter } = useReactFlow();
  const isOpen = useRef(open);
  const messagesRef = useRef(null);
  useEffect(() => {
    isOpen.current = open;
  }, [open]);
  const ref = useRef(null);

  useEffect(() => {
    if (open && ref.current) {
      ref.current.focus();
    }
  }, [open]);

   function focusNode(node) {
    const x = node.position.x + node.width / 2;
    const y = node.position.y + node.height / 2;
    setCenter(x, y, { zoom:1.1, duration: 1000 });
  }
  function getShotContent(node){
    let content="";
    if(node.type=="noteNode"){
      content=node.data.value;
    }else{
      if(node.data.type=="Note"||node.data.type=="AINote"){
        content=node.data.node.template.note.value;
      }
    }
    if(content){
      content=filterHTML(content)

        // const zoom = 1.1;
        content=content.substring(0,20)+"...";      
    }
    return content;
  }
  return (
          <div className="left-form-modal-iv-box mt-0">
            <div className="eraser-column-arrangement">
              <div className="eraser-size">
                <div className="eraser-position">
                  <button  onClick={() => {setOpen(false);}}>
                    <IconComponent
                      name="X"
                      className="h-5 w-5 text-primary hover:text-gray-600"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div ref={messagesRef} className="chat-message-div">
                  
                  <div ref={ref} className="my-2">{results.length} {results.length>1?"Results":"Result"}</div>
                  <Separator orientation="horizontal" />
                  {
                  results.map((flow, id) => (
                    (flow.data.nodes.length>0)&&(
                    <div className="mt-2">
                      <div>{flow.name}</div>
                      {flow.data.nodes.map((node,idx)=>(
                        <div className="flex justify-start mx-2">
                          <div className={"mx-1 border border-dashed border-ring "+
                          ((node.id.indexOf("noteNode")==0)?"input-note dark:input-note-dark ":"rounded-lg p-3 ") +
                          "font-normal"}>{getShotContent(node)}</div>
                          <button onClick={()=>{focusNode(node);}}>
                          <IconComponent
                            name="Crosshair"
                            className="h-4 w-4 text-primary hover:text-gray-600"
                            aria-hidden="true"
                          />
                          </button>
                      </div>
                      ))}
                     </div>
                    )

                  ))}
                </div>
              </div>
            </div>
          </div>
  );
}
