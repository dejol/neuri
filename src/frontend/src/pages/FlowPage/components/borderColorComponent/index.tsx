import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { Radio } from "@mui/material";
import {BORDER_COLORS} from "../../../../constants/constants"
/**
 * calculate Background colour from borderColour
 * @param borderColor string of border color value ,etc. 'var(--status-blue)'
 * @param isDarkMod 
 */
export function switchToBG(borderColor:string,isDarkMod:any){
  if(!borderColor) return "";
  let colorValue="";
  let lightless=isDarkMod?"10%":"90%";
  if(borderColor.indexOf('red')>=0){
    colorValue="hsl(0, 40%, "+lightless+")";
  }else if( borderColor.indexOf('yellow')>=0){
    colorValue="hsl(49, 89%, "+lightless+")";
  }else if(borderColor.indexOf('green')>=0){
  colorValue="hsl(145, 65%, "+lightless+")";
  }else if( borderColor.indexOf('blue')>=0){
    colorValue="hsl(214, 87%, "+lightless+")";
  }
  return colorValue;
}
export function getNextBG(borderColor:string){
  // console.log("color:",borderColor);
  if(!borderColor||borderColor=="inherit"){
    return BORDER_COLORS[0];
  }
  let index=BORDER_COLORS.findIndex((color)=>color==borderColor);
  if(BORDER_COLORS.length==index+1){
    return "";
  }else{
    index+=1;
  }
  return BORDER_COLORS[index];
}
export default function BorderColorComponent({ 
  data,  
  setBorder,
  dark, 
}:{
  data:{borderColor?:string};
  setBorder:(value: string) => void; //set back string of border colour of CSS style, etc. "var(--status-red)"
  dark:{};
}) {

  const [borderColour,setBorderColour] =useState(data.borderColor??"inherit");
  // const [backgroundColour,setBackgroundColour] =useState("");
  const handleChangeColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBorderColour(event.target.value);
  };

  useEffect(() => {
    setBorder(borderColour);
},[borderColour,dark]);

  const controlProps = (item: string) => ({
    checked: borderColour === item,
    onChange: handleChangeColor,
    value: item,
    name: 'color-note-border',
    inputProps: { 'aria-label': item },
  });

  return (
    <div className="bg-muted fill-foreground stroke-foreground rounded-md shadow-sm border">         
    <Radio {...controlProps('inherit')}                 
      sx={{
        color: 'hsl(var(--background))',
        '&.Mui-checked': {
          color: 'hsl(var(--background))',
        },
      }} />
      {
        BORDER_COLORS.map((color,idx)=>(
          
          <Radio {...controlProps(color)}
          sx={{
            color: color,
            '&.Mui-checked': {
              color: color,
            },
          }} />
          
        
        ))
      }

  </div>  
  );
}
