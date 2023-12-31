import { ReactElement, ReactNode } from "react";
import { APIClassType } from "../api";
import { NodeDataType } from "../flow/index";
import { typesContextType } from "../typesContext";
export type InputComponentType = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  password: boolean;
  editNode?: boolean;
  onChangePass?: (value: boolean | boolean) => void;
  showPass?: boolean;
  isForm?:boolean;
  placeholder?:string;
  required?:boolean;
  id?: string;
  blurOnEnter?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  className?: string;

};
export type ToggleComponentType = {
  enabled: boolean;
  setEnabled: (state: boolean) => void;
  disabled: boolean;
  size: "small" | "medium" | "large";
};
export type DropDownComponentType = {
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  editNode?: boolean;
  apiModal?: boolean;
  numberOfOptions?: number;
};
export type ParameterComponentType = {
  data: NodeDataType;
  setData: (value: NodeDataType) => void;
  title: string;
  id: string;
  color: string;
  left: boolean;
  type: string;
  required?: boolean;
  name?: string;
  tooltipTitle: string;
  dataContext?: typesContextType;
  optionalHandle?: Array<String>;
  info?: string;
  nodeSelected?:boolean;
};
export type InputListComponentType = {
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
  editNode?: boolean;
};

export type TextAreaComponentType = {
  field_name?: string;
  nodeClass?: APIClassType;
  setNodeClass?: (value: APIClassType) => void;
  disabled: boolean;
  onChange: (value: string[] | string) => void;
  value: string;
  editNode?: boolean;
};

export type CodeAreaComponentType = {
  disabled: boolean;
  onChange: (value: string[] | string) => void;
  value: string;
  editNode?: boolean;
  nodeClass?: APIClassType;
  setNodeClass?: (value: APIClassType) => void;
  dynamic?: boolean;
};

export type FileComponentType = {
  disabled: boolean;
  onChange: (value: string[] | string) => void;
  value: string;
  suffixes: Array<string>;
  fileTypes: Array<string>;
  onFileChange: (value: string) => void;
  editNode?: boolean;
};

export type DisclosureComponentType = {
  children: ReactNode;
  openDisc: boolean;
  className?:string;
  button: {
    title: string;
    Icon: any;
    buttons?: {
      Icon: ReactElement;
      title: string;
      onClick: (event?: React.MouseEvent) => void;
    }[];
  };
};
export type FloatComponentType = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  editNode?: boolean;
};

export type TooltipComponentType = {
  children: ReactElement;
  title: string | ReactElement;
  placement?:
    | "bottom-end"
    | "bottom-start"
    | "bottom"
    | "left-end"
    | "left-start"
    | "left"
    | "right-end"
    | "right-start"
    | "right"
    | "top-end"
    | "top-start"
    | "top";
};

export type ProgressBarType = {
  children?: ReactElement;
  value?: number;
  max?: number;
};

export type RadialProgressType = {
  value?: number;
  color?: string;
  size?: string;
};

export type AccordionComponentType = {
  children?: ReactElement;
  open?: string[];
  trigger?: string | ReactElement;
  keyValue?: string;
  side?:"right" | "left";
};
export type Side = "top" | "right" | "bottom" | "left";

export type ShadTooltipProps = {
  delayDuration?: number;
  side?: Side;
  content: ReactNode;
  children: ReactNode;
  style?: string;
};
export type ShadToolTipType = {
  content?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  asChild?: boolean;
  children?: ReactElement;
  delayDuration?: number;
  styleClasses?: string;
};

export type TextHighlightType = {
  value?: string;
  side?: "top" | "right" | "bottom" | "left";
  asChild?: boolean;
  children?: ReactElement;
  delayDuration?: number;
};

export interface IVarHighlightType {
  name: string;
}

export type IconComponentProps = {
  name: string;
  className: string;
  iconColor?: string;
};

export interface languageMap {
  [key: string]: string | undefined;
}

export type UserInputType = {
  username: string;
  password: string;
  is_active?: boolean;
  is_superuser?: boolean;
  id?: string;
  create_at?: string;
  update_at?: string;
};
export type loginInputStateType = {
  username: string;
  password: string;
};
export type inputHandlerEventType = {
  target: {
    value: string | boolean;
    name: string;
  };
};
export type UserManagementType = {
  title: string;
  titleHeader: string;
  cancelText: string;
  confirmationText: string;
  children: ReactElement;
  icon: string;
  data?: any;
  index?: number;
  asChild?: boolean;
  onConfirm: (index, data) => void;
};

export type PaginatorComponentType = {
  pageSize: number;
  pageIndex: number;
  rowsCount?: number[];
  totalRowsCount: number;
  paginate: (pageIndex: number, pageSize: number) => void;
};
export type ConfirmationModalType = {
  title: string;
  titleHeader: string;
  asChild?: boolean;
  modalContent: string;
  modalContentTitle: string;
  cancelText: string;
  confirmationText: string;
  children: ReactElement;
  icon: string;
  data: any;
  index: number;
  onConfirm: (index, data) => void;
};
// for wangEditor upload image
// export type InsertFnType = (url: string, alt: string, href: string) => void

export type signUpInputStateType = {
  password: string;
  cnfPassword: string;
  username: string;
};

export type patchUserInputStateType = {
  password: string;
  cnfPassword: string;
  gradient: string;
};