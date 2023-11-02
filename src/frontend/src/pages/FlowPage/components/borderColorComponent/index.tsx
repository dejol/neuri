import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { Radio } from "@mui/material";

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
    <Radio {...controlProps('var(--status-blue)')}
      sx={{
        color: 'var(--status-blue)',
        '&.Mui-checked': {
          color: 'var(--status-blue)',
        },
      }} />
    <Radio {...controlProps('var(--status-green)')} 
      sx={{
        color: 'var(--status-green)',
        '&.Mui-checked': {
          color: 'var(--status-green)',
        },
      }} />
    <Radio {...controlProps('var(--status-yellow)')} 
      sx={{
        color: 'var(--status-yellow)',
        '&.Mui-checked': {
          color: 'var(--status-yellow)',
        },
      }}
      />
    
    <Radio
      {...controlProps('var(--status-red)')}
      sx={{
        color: 'var(--status-red)',
        '&.Mui-checked': {
          color: 'var(--status-red)',
        },
      }}
    />
  </div>  
  );
}
