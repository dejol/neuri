import { useEffect, useRef } from "react";
import _ from "lodash";
import IconComponent from "../../components/genericIconComponent";
import { useReactFlow } from 'reactflow';
import { Separator } from "../../components/ui/separator";
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

   function focusNode(x,y) {
    setCenter(x, y, { zoom:1.1, duration: 1000 });
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
                  {results.map((node, id) => (
                    <>
                    <div className="flex justify-start mx-2">
                      <div className="mx-1 border border-dashed border-ring input-note dark:input-note-dark font-normal">{node.content}</div>
                    <button onClick={()=>{focusNode(node.x,node.y);}}>
                    <IconComponent
                      name="Crosshair"
                      className="h-4 w-4 text-primary hover:text-gray-600"
                      aria-hidden="true"
                    />
                    </button>
                     </div>
                     <Separator orientation="horizontal" className="w-30 my-2"  />
                     </>
                  ))}
                </div>
              </div>
            </div>
          </div>
  );
}
