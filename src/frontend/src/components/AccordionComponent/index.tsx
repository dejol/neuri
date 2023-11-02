import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { AccordionComponentType } from "../../types/components";

export default function AccordionComponent({
  trigger,
  children,
  open = [],
  keyValue,
  side,
}: AccordionComponentType) {
  const [value, setValue] = useState(
    open.length === 0 ? "" : getOpenAccordion()
  );

  useEffect(()=>{
    setValue(open.length === 0 ? "" : getOpenAccordion());
  },[open])

  function getOpenAccordion() {
    let value = "";
    open.forEach((el) => {
      if (el == trigger) {
        value = trigger;
      }else if(el==keyValue){
        value = keyValue;
      }
    });

    return value;
  }

  function handleClick() {
    value === "" ? setValue(keyValue) : setValue("");
  }

  return (
    <>
      <Accordion
        type="single"
        className="w-full"
        value={value}
        onValueChange={setValue}
      >
        <AccordionItem value={keyValue} className="border-0">
          <AccordionTrigger
            onClick={() => {
              handleClick();
            }}
            className={"ml-3 py-2 "+(side=="left"?"flex-row-reverse":"")}
            
          >
            {trigger}
          </AccordionTrigger>
          <AccordionContent className="AccordionContent">
            {children}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
