import { ReactFlowJsonObject, XYPosition } from "reactflow";
import { APIClassType } from "../api/index";

export type FlowType = {
  name: string;
  id: string;
  folder_id?:string;
  user_id?:string;
  data: ReactFlowJsonObject;
  description: string;
  style?: FlowStyleType;
  create_at?:Date;
  update_at?:Date;  
};
export type FolderType = {
  name: string;
  id: string;
  user_id?:string;
  description?: string;
  parent_id?:string;
};
export type NoteType = {
  name: string;
  id: string;
  user_id?:string;
  folder_id?:string;
  content?: {id:string, value:string};
  create_at?:Date;
  update_at?:Date;
};

export type NodeType = {
  id: string;
  type?: string;
  position: XYPosition;
  data: NodeDataType;
};
export type NodeDataType = {
  type: string;
  node?: APIClassType;
  id: string;
  value: any;
  update_at?:Date;
  create_at?:Date;
  borderColor?:string;

};
// FlowStyleType is the type of the style object that is used to style the
// Flow card with an emoji and a color.
export type FlowStyleType = {
  emoji: string;
  color: string;
  flow_id: string;
};

export type TweaksType = Array<
  {
    [key: string]: {
      output_key?: string;
    };
  } & FlowStyleType
>;

export type UserType = {
  name: string;
  id?: string;
  password?: string;
};