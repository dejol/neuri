import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ADJECTIVES, DESCRIPTIONS, NOUNS } from "../flow_constants";
import { IVarHighlightType } from "../types/components";
import { FlowType, NodeType } from "../types/flow";
import { TabsState } from "../types/tabs";
import { buildTweaks } from "./reactflowUtils";

export function classNames(...classes: Array<string>) {
  return classes.filter(Boolean).join(" ");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toNormalCase(str: string) {
  let result = str
    .split("_")
    .map((word, index) => {
      if (index === 0) {
        return word[0].toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    })
    .join(" ");

  return result
    .split("-")
    .map((word, index) => {
      if (index === 0) {
        return word[0].toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    })
    .join(" ");
}

export function normalCaseToSnakeCase(str: string) {
  return str
    .split(" ")
    .map((word, index) => {
      if (index === 0) {
        return word[0].toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    })
    .join("_");
}

export function toTitleCase(str: string) {
  let result = str
    .split("_")
    .map((word, index) => {
      if (index === 0) {
        return checkUpperWords(
          word[0].toUpperCase() + word.slice(1).toLowerCase()
        );
      }
      return checkUpperWords(word.toLowerCase());
    })
    .join(" ");

  return result
    .split("-")
    .map((word, index) => {
      if (index === 0) {
        return checkUpperWords(
          word[0].toUpperCase() + word.slice(1).toLowerCase()
        );
      }
      return checkUpperWords(word.toLowerCase());
    })
    .join(" ");
}

export const upperCaseWords: string[] = ["llm", "uri"];
export function checkUpperWords(str: string) {
  const words = str.split(" ").map((word) => {
    return upperCaseWords.includes(word.toLowerCase())
      ? word.toUpperCase()
      : word[0].toUpperCase() + word.slice(1).toLowerCase();
  });

  return words.join(" ");
}

export const isWrappedWithClass = (event: any, className: string | undefined) =>
  event.target.closest(`.${className}`);

export function groupByFamily(data, baseClasses, left, flow?: NodeType[]) {
  const baseClassesSet = new Set(baseClasses.split("\n"));
  let arrOfPossibleInputs = [];
  let arrOfPossibleOutputs = [];
  let checkedNodes = new Map();
  const excludeTypes = new Set([
    "str",
    "bool",
    "float",
    "code",
    "prompt",
    "file",
    "int",
  ]);

  const checkBaseClass = (template: any) =>
    template.type &&
    template.show &&
    ((!excludeTypes.has(template.type) && baseClassesSet.has(template.type)) ||
      (template.input_types &&
        template.input_types.some((inputType) =>
          baseClassesSet.has(inputType)
        )));

  if (flow) {
    for (const node of flow) {
      if (node.type!=="genericNode") continue;
      const nodeData = node.data;
      const foundNode = checkedNodes.get(nodeData.type);
      checkedNodes.set(nodeData.type, {
        hasBaseClassInTemplate:
          foundNode?.hasBaseClassInTemplate ||
          Object.values(nodeData.node?.template).some(checkBaseClass),
        hasBaseClassInBaseClasses:
          foundNode?.hasBaseClassInBaseClasses ||
          nodeData.node.base_classes.some((baseClass) =>
            baseClassesSet.has(baseClass)
          ),
      });
    }
  }

  for (const [d, nodes] of Object.entries(data)) {
    let tempInputs = [],
      tempOutputs = [];

    for (const [n, node] of Object.entries(nodes)) {
      let foundNode = checkedNodes.get(n);
      if (!foundNode) {
        foundNode = {
          hasBaseClassInTemplate: Object.values(node.template).some(
            checkBaseClass
          ),
          hasBaseClassInBaseClasses: node.base_classes.some((baseClass) =>
            baseClassesSet.has(baseClass)
          ),
        };
        checkedNodes.set(n, foundNode);
      }

      if (foundNode.hasBaseClassInTemplate) tempInputs.push(n);
      if (foundNode.hasBaseClassInBaseClasses) tempOutputs.push(n);
    }

    const totalNodes = Object.keys(nodes).length;
    if (tempInputs.length)
      arrOfPossibleInputs.push({
        category: d,
        nodes: tempInputs,
        full: tempInputs.length === totalNodes,
      });
    if (tempOutputs.length)
      arrOfPossibleOutputs.push({
        category: d,
        nodes: tempOutputs,
        full: tempOutputs.length === totalNodes,
      });
  }

  return left
    ? arrOfPossibleOutputs.map((output) => ({
        family: output.category,
        type: output.full ? "" : output.nodes.join(", "),
      }))
    : arrOfPossibleInputs.map((input) => ({
        family: input.category,
        type: input.full ? "" : input.nodes.join(", "),
      }));
}

export function buildInputs(tabsState, id) {
  return tabsState &&
    tabsState[id] &&
    tabsState[id].formKeysData &&
    tabsState[id].formKeysData.input_keys &&
    Object.keys(tabsState[id].formKeysData.input_keys).length > 0
    ? JSON.stringify(tabsState[id].formKeysData.input_keys)
    : '{"input": "message"}';
}

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
export function getRandomDescription(): string {
  return getRandomElement(DESCRIPTIONS);
}

export function getRandomName(
  retry: number = 0,
  noSpace: boolean = false,
  maxRetries: number = 3
): string {
  const left: string[] = ADJECTIVES;
  const right: string[] = NOUNS;

  const lv = getRandomElement(left);
  const rv = getRandomElement(right);

  // Condition to avoid "boring wozniak"
  if (lv === "boring" && rv === "wozniak") {
    if (retry < maxRetries) {
      return getRandomName(retry + 1, noSpace, maxRetries);
    } else {
      console.warn("Max retries reached, returning as is");
    }
  }

  // Append a suffix if retrying and noSpace is true
  if (retry > 0 && noSpace) {
    const retrySuffix = Math.floor(Math.random() * 10);
    return `${lv}_${rv}${retrySuffix}`;
  }

  // Construct the final name
  let final_name = noSpace ? `${lv}_${rv}` : `${lv} ${rv}`;
  // Return title case final name
  return toTitleCase(final_name);
}

export function getRandomKeyByssmm(): string {
  const now = new Date();
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
  return seconds + milliseconds + Math.abs(Math.floor(Math.random() * 10001));
}

export function varHighlightHTML({ name }: IVarHighlightType): string {
  const html = `<span className="font-semibold chat-message-highlight">{${name}}</span>`;
  return html;
}

export function buildTweakObject(tweak) {
  tweak.forEach((el) => {
    Object.keys(el).forEach((key) => {
      for (let kp in el[key]) {
        try {
          el[key][kp] = JSON.parse(el[key][kp]);
        } catch {}
      }
    });
  });

  const tweakString = JSON.stringify(tweak.at(-1), null, 2);
  return tweakString;
}

/**
 * Function to get Chat Input Field
 * @param {FlowType} flow - The current flow.
 * @param {TabsState} tabsState - The current tabs state.
 * @returns {string} - The chat input field
 */
export function getChatInputField(flow: FlowType, tabsState?: TabsState) {
  let chat_input_field = "text";

  if (
    tabsState[flow.id] &&
    tabsState[flow.id].formKeysData &&
    tabsState[flow.id].formKeysData.input_keys
  ) {
    chat_input_field = Object.keys(
      tabsState[flow.id].formKeysData.input_keys
    )[0];
  }
  return chat_input_field;
}

/**
 * Function to get the python code for the API
 * @param {string} flowId - The id of the flow
 * @returns {string} - The python code
 */
export function getPythonApiCode(
  flow: FlowType,
  tweak?: any[],
  tabsState?: TabsState
): string {
  const flowId = flow.id;

  // create a dictionary of node ids and the values is an empty dictionary
  // flow.data.nodes.forEach((node) => {
  //   node.data.id
  // }
  const tweaks = buildTweaks(flow);
  const inputs = buildInputs(tabsState, flow.id);
  return `import requests
from typing import Optional

BASE_API_URL = "${window.location.protocol}//${
    window.location.host
  }/api/v1/process"
FLOW_ID = "${flowId}"
# You can tweak the flow by adding a tweaks dictionary
# e.g {"OpenAI-XXXXX": {"model_name": "gpt-4"}}
TWEAKS = ${
    tweak && tweak.length > 0
      ? buildTweakObject(tweak)
      : JSON.stringify(tweaks, null, 2)
  }

def run_flow(inputs: dict, flow_id: str, tweaks: Optional[dict] = None) -> dict:
    """
    Run a flow with a given message and optional tweaks.

    :param message: The message to send to the flow
    :param flow_id: The ID of the flow to run
    :param tweaks: Optional tweaks to customize the flow
    :return: The JSON response from the flow
    """
    api_url = f"{BASE_API_URL}/{flow_id}"

    payload = {"inputs": inputs}

    if tweaks:
        payload["tweaks"] = tweaks

    response = requests.post(api_url, json=payload)
    return response.json()

# Setup any tweaks you want to apply to the flow
inputs = ${inputs}
print(run_flow(inputs, flow_id=FLOW_ID, tweaks=TWEAKS))`;
}

/**
 * Function to get the curl code for the API
 * @param {string} flowId - The id of the flow
 * @returns {string} - The curl code
 */
export function getCurlCode(
  flow: FlowType,
  tweak?: any[],
  tabsState?: TabsState
): string {
  const flowId = flow.id;
  const tweaks = buildTweaks(flow);
  const inputs = buildInputs(tabsState, flow.id);

  return `curl -X POST \\
  ${window.location.protocol}//${
    window.location.host
  }/api/v1/process/${flowId} \\
  -H 'Content-Type: application/json' \\
  -d '{"inputs": ${inputs}, "tweaks": ${
    tweak && tweak.length > 0
      ? buildTweakObject(tweak)
      : JSON.stringify(tweaks, null, 2)
  }}'`;
}

/**
 * Function to get the python code for the API
 * @param {string} flow - The current flow
 * @returns {string} - The python code
 */
export function getPythonCode(
  flow: FlowType,
  tweak?: any[],
  tabsState?: TabsState
): string {
  const flowName = flow.name;
  const tweaks = buildTweaks(flow);
  const inputs = buildInputs(tabsState, flow.id);
  return `from langflow import load_flow_from_json
TWEAKS = ${
    tweak && tweak.length > 0
      ? buildTweakObject(tweak)
      : JSON.stringify(tweaks, null, 2)
  }
flow = load_flow_from_json("${flowName}.json", tweaks=TWEAKS)
# Now you can use it like any chain
inputs = ${inputs}
flow(inputs)`;
}

/**
 * Function to get the widget code for the API
 * @param {string} flow - The current flow.
 * @returns {string} - The widget code
 */
export function getWidgetCode(flow: FlowType, tabsState?: TabsState): string {
  const flowId = flow.id;
  const flowName = flow.name;
  const inputs = buildInputs(tabsState, flow.id);
  let chat_input_field = getChatInputField(flow, tabsState);

  return `<script src="https://cdn.jsdelivr.net/gh/logspace-ai/langflow-embedded-chat@main/dist/build/static/js/bundle.min.js"></script>

<!-- chat_inputs: Stringified JSON with all the input keys and its values. The value of the key that is defined
as chat_input_field will be overwritten by the chat message.
chat_input_field: Input key that you want the chat to send the user message with. -->
<langflow-chat
  window_title="${flowName}"
  flow_id="${flowId}"
  ${
    tabsState[flow.id] && tabsState[flow.id].formKeysData
      ? `chat_inputs='${inputs}'
  chat_input_field="${chat_input_field}"
  `
      : ""
  }host_url="http://localhost:7860"
></langflow-chat>`;
}

export function tabsArray(codes: string[], method: number) {
  if (!method) return;
  if (method === 0) {
    return [
      {
        name: "cURL",
        mode: "bash",
        image: "https://curl.se/logo/curl-symbol-transparent.png",
        language: "sh",
        code: codes[0],
      },
      {
        name: "Python API",
        mode: "python",
        image:
          "https://images.squarespace-cdn.com/content/v1/5df3d8c5d2be5962e4f87890/1628015119369-OY4TV3XJJ53ECO0W2OLQ/Python+API+Training+Logo.png?format=1000w",
        language: "py",
        code: codes[1],
      },
      {
        name: "Python Code",
        mode: "python",
        image: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png",
        language: "py",
        code: codes[2],
      },
      {
        name: "Chat Widget HTML",
        description:
          "Insert this code anywhere in your &lt;body&gt; tag. To use with react and other libs, check our <a class='link-color' href='https://langflow.org/guidelines/widget'>documentation</a>.",
        mode: "html",
        image: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png",
        language: "py",
        code: codes[3],
      },
    ];
  }
  return [
    {
      name: "cURL",
      mode: "bash",
      image: "https://curl.se/logo/curl-symbol-transparent.png",
      language: "sh",
      code: codes[0],
    },
    {
      name: "Python API",
      mode: "python",
      image:
        "https://images.squarespace-cdn.com/content/v1/5df3d8c5d2be5962e4f87890/1628015119369-OY4TV3XJJ53ECO0W2OLQ/Python+API+Training+Logo.png?format=1000w",
      language: "py",
      code: codes[1],
    },
    {
      name: "Python Code",
      mode: "python",
      language: "py",
      image: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png",
      code: codes[2],
    },
    {
      name: "Chat Widget HTML",
      description:
        "Insert this code anywhere in your &lt;body&gt; tag. To use with react and other libs, check our <a class='link-color' href='https://langflow.org/guidelines/widget'>documentation</a>.",
      mode: "html",
      image: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png",
      language: "py",
      code: codes[3],
    },
    {
      name: "Tweaks",
      mode: "python",
      image: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png",
      language: "py",
      code: codes[4],
    },
  ];
}

export function filterHTML(content:string){
  if(typeof content !== "string"){
    return "Object";
  }
  // console.log("content:",content);

  content=content.replace(/(<([^>]+)>)/ig,"");
  content=content.replace(/&amp;/ig,"").replace(/&lt;/ig,"").replace( /&gt;/ig,"")
  .replace( /&quot;/ig,"").replace(/&#x27;/ig,"").replace(/&#x2F;/ig,"")
  .replace(/&nbsp;/ig,"");
  return content;  
}

export function isValidImageUrl(url: string): boolean { 
   if (url.startsWith('http://') || url.startsWith('https://')) { 
      const fileExtension = /\.(jpg|jpeg|png|gif|webp|svg|tif|tiff)$/; 
       return fileExtension.test(url); 
    } 
    return false;
}

export function getAssistantFlow(flowId:string,topic:string):FlowType{
  return {
    "folder_id": "",
    "user_id": "94229a6a-4d5c-4cfd-8e40-32c12ce8da15",
    "name": "助手Flow",
    "description": "写作助手",
    "data": {
        "nodes": [
            {
                "width": 384,
                "height": 221,
                "id": "ChatPromptTemplate-0J2IE",
                "type": "genericNode",
                "position": {
                    "x": -1960.568880120281,
                    "y": -1071.2489311705751
                },
                "data": {
                    "type": "ChatPromptTemplate",
                    "node": {
                        "template": {
                            "messages": {
                                "required": true,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "messages",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "BaseMessagePromptTemplate",
                                "list": true
                            },
                            "output_parser": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "output_parser",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "BaseOutputParser",
                                "list": false
                            },
                            "input_variables": {
                                "required": true,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "input_variables",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": true
                            },
                            "partial_variables": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "partial_variables",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "code",
                                "list": false
                            },
                            "_type": "ChatPromptTemplate"
                        },
                        "description": "A prompt template for chat models.",
                        "base_classes": [
                            "BaseChatPromptTemplate",
                            "ChatPromptTemplate",
                            "BasePromptTemplate"
                        ],
                        "display_name": "ChatPromptTemplate",
                        "custom_fields": {},
                        "output_types": [],
                        "documentation": "https://python.langchain.com/docs/modules/model_io/models/chat/how_to/prompts",
                        "mini_size": false,
                        "runnable": true
                    },
                    "id": "ChatPromptTemplate-0J2IE",
                    "value": null,
                    "update_at": "2023-10-30T07:47:44.712Z"
                },
                "selected": false,
                "positionAbsolute": {
                    "x": -1960.568880120281,
                    "y": -1071.2489311705751
                }
            },
            {
                "width": 384,
                "height": 301,
                "id": "LLMChain-5879c",
                "type": "genericNode",
                "position": {
                    "x": -1460.4956676282122,
                    "y": -1162.6416217294704
                },
                "data": {
                    "type": "LLMChain",
                    "node": {
                        "template": {
                            "callbacks": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "callbacks",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "langchain.callbacks.base.BaseCallbackHandler",
                                "list": true
                            },
                            "llm": {
                                "required": true,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "llm",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "BaseLanguageModel",
                                "list": false
                            },
                            "memory": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "memory",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "BaseMemory",
                                "list": false
                            },
                            "output_parser": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "output_parser",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "BaseLLMOutputParser",
                                "list": false
                            },
                            "prompt": {
                                "required": true,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "prompt",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "BasePromptTemplate",
                                "list": false
                            },
                            "llm_kwargs": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "llm_kwargs",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "code",
                                "list": false
                            },
                            "metadata": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "metadata",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "code",
                                "list": false
                            },
                            "output_key": {
                                "required": true,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": "text",
                                "password": false,
                                "name": "output_key",
                                "advanced": true,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": false
                            },
                            "return_final_only": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": true,
                                "password": false,
                                "name": "return_final_only",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "bool",
                                "list": false
                            },
                            "tags": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "tags",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": true
                            },
                            "verbose": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": false,
                                "password": false,
                                "name": "verbose",
                                "advanced": true,
                                "dynamic": false,
                                "info": "",
                                "type": "bool",
                                "list": false
                            },
                            "_type": "LLMChain"
                        },
                        "description": "Chain to run queries against LLMs.",
                        "base_classes": [
                            "Chain",
                            "LLMChain",
                            "function"
                        ],
                        "display_name": "LLMChain",
                        "custom_fields": {},
                        "output_types": [],
                        "documentation": "https://python.langchain.com/docs/modules/chains/foundational/llm_chain",
                        "mini_size": false,
                        "runnable": true
                    },
                    "id": "LLMChain-5879c",
                    "value": null,
                    "update_at": "2023-10-30T07:47:44.713Z"
                },
                "selected": false,
                "positionAbsolute": {
                    "x": -1460.4956676282122,
                    "y": -1162.6416217294704
                }
            },
            {
                "width": 384,
                "height": 635,
                "id": "ChatOpenAI-3DbNV",
                "type": "genericNode",
                "position": {
                    "x": -1987.1317559297595,
                    "y": -447.51462663329227
                },
                "data": {
                    "type": "ChatOpenAI",
                    "node": {
                        "template": {
                            "callbacks": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "callbacks",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "langchain.callbacks.base.BaseCallbackHandler",
                                "list": true
                            },
                            "cache": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "cache",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "bool",
                                "list": false
                            },
                            "client": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "client",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "Any",
                                "list": false
                            },
                            "max_retries": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": 6,
                                "password": false,
                                "name": "max_retries",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "int",
                                "list": false
                            },
                            "max_tokens": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": true,
                                "name": "max_tokens",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "int",
                                "list": false
                            },
                            "metadata": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "metadata",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "code",
                                "list": false
                            },
                            "model_kwargs": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "model_kwargs",
                                "advanced": true,
                                "dynamic": false,
                                "info": "",
                                "type": "code",
                                "list": false
                            },
                            "model_name": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": "gpt-3.5-turbo-0613",
                                "password": false,
                                "options": [
                                    "gpt-3.5-turbo-0613",
                                    "gpt-3.5-turbo",
                                    "gpt-3.5-turbo-16k-0613",
                                    "gpt-3.5-turbo-16k",
                                    "gpt-4-0613",
                                    "gpt-4-32k-0613",
                                    "gpt-4",
                                    "gpt-4-32k"
                                ],
                                "name": "model_name",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": true
                            },
                            "n": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": 1,
                                "password": false,
                                "name": "n",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "int",
                                "list": false
                            },
                            "openai_api_base": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "openai_api_base",
                                "display_name": "OpenAI API Base",
                                "advanced": false,
                                "dynamic": false,
                                "info": "\nThe base URL of the OpenAI API. Defaults to https://api.openai.com/v1.\n\nYou can change this to use other APIs like JinaChat, LocalAI and Prem.\n",
                                "type": "str",
                                "list": false,
                                "value": "https://api.chatanywhere.com.cn/v1"
                            },
                            "openai_api_key": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": "sk-K1tkfGAv3q8CjUK7XjRyugfYxRGKYSaflMCFEWhwolB7YxgW",
                                "password": true,
                                "name": "openai_api_key",
                                "display_name": "OpenAI API Key",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": false
                            },
                            "openai_organization": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "openai_organization",
                                "display_name": "OpenAI Organization",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": false
                            },
                            "openai_proxy": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "openai_proxy",
                                "display_name": "OpenAI Proxy",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": false
                            },
                            "request_timeout": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "request_timeout",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "float",
                                "list": false
                            },
                            "streaming": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": false,
                                "password": false,
                                "name": "streaming",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "bool",
                                "list": false
                            },
                            "tags": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "tags",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": true
                            },
                            "temperature": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": 0.7,
                                "password": false,
                                "name": "temperature",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "float",
                                "list": false
                            },
                            "tiktoken_model_name": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "tiktoken_model_name",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": false
                            },
                            "verbose": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": false,
                                "password": false,
                                "name": "verbose",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "bool",
                                "list": false
                            },
                            "_type": "ChatOpenAI"
                        },
                        "description": "Wrapper around OpenAI Chat large language models.",
                        "base_classes": [
                            "ChatOpenAI",
                            "BaseChatModel",
                            "BaseLanguageModel",
                            "BaseLLM"
                        ],
                        "display_name": "ChatOpenAI",
                        "custom_fields": {},
                        "output_types": [],
                        "documentation": "",
                        "mini_size": false,
                        "runnable": true
                    },
                    "id": "ChatOpenAI-3DbNV",
                    "value": null,
                    "update_at": "2023-10-30T07:47:44.713Z"
                },
                "selected": false,
                "positionAbsolute": {
                    "x": -1987.1317559297595,
                    "y": -447.51462663329227
                }
            },
            {
                "width": 384,
                "height": 353,
                "id": "SystemMessagePromptTemplate-Q1QGM",
                "type": "genericNode",
                "position": {
                    "x": -2650,
                    "y": -1300
                },
                "data": {
                    "type": "SystemMessagePromptTemplate",
                    "node": {
                        "template": {
                            "additional_kwargs": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "additional_kwargs",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "code",
                                "list": false
                            },
                            "prompt": {
                                "required": true,
                                "placeholder": "",
                                "show": true,
                                "multiline": true,
                                "fulline": false,
                                "chat_view": false,
                                "value": "你是一个非常优秀的工作助手，你是一个{type_of_assistant}\n现在我要完成研究的主题是 :"+topic+" \n \n",
                                "password": false,
                                "name": "prompt",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "prompt",
                                "list": false
                            },
                            "_type": "SystemMessagePromptTemplate",
                            "type_of_assistant": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": true,
                                "fulline": false,
                                "chat_view": false,
                                "value": "专家",
                                "password": false,
                                "name": "type_of_assistant",
                                "display_name": "type_of_assistant",
                                "advanced": false,
                                "input_types": [
                                    "Document",
                                    "BaseOutputParser"
                                ],
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": false
                            }
                        },
                        "description": "System message prompt template.",
                        "base_classes": [
                            "BaseStringMessagePromptTemplate",
                            "BaseMessagePromptTemplate",
                            "SystemMessagePromptTemplate"
                        ],
                        "name": "",
                        "display_name": "SystemMessagePromptTemplate",
                        "documentation": "",
                        "custom_fields": {
                            "": [
                                "type_of_assistant"
                            ]
                        },
                        "output_types": [],
                        "field_formatters": {
                            "formatters": {
                                "openai_api_key": {}
                            },
                            "base_formatters": {
                                "kwargs": {},
                                "optional": {},
                                "list": {},
                                "dict": {},
                                "union": {},
                                "multiline": {},
                                "show": {},
                                "password": {},
                                "default": {},
                                "headers": {},
                                "dict_code_file": {},
                                "model_fields": {
                                    "MODEL_DICT": {
                                        "OpenAI": [
                                            "text-davinci-003",
                                            "text-davinci-002",
                                            "text-curie-001",
                                            "text-babbage-001",
                                            "text-ada-001"
                                        ],
                                        "ChatOpenAI": [
                                            "gpt-3.5-turbo-0613",
                                            "gpt-3.5-turbo",
                                            "gpt-3.5-turbo-16k-0613",
                                            "gpt-3.5-turbo-16k",
                                            "gpt-4-0613",
                                            "gpt-4-32k-0613",
                                            "gpt-4",
                                            "gpt-4-32k"
                                        ],
                                        "Anthropic": [
                                            "claude-v1",
                                            "claude-v1-100k",
                                            "claude-instant-v1",
                                            "claude-instant-v1-100k",
                                            "claude-v1.3",
                                            "claude-v1.3-100k",
                                            "claude-v1.2",
                                            "claude-v1.0",
                                            "claude-instant-v1.1",
                                            "claude-instant-v1.1-100k",
                                            "claude-instant-v1.0"
                                        ],
                                        "ChatAnthropic": [
                                            "claude-v1",
                                            "claude-v1-100k",
                                            "claude-instant-v1",
                                            "claude-instant-v1-100k",
                                            "claude-v1.3",
                                            "claude-v1.3-100k",
                                            "claude-v1.2",
                                            "claude-v1.0",
                                            "claude-instant-v1.1",
                                            "claude-instant-v1.1-100k",
                                            "claude-instant-v1.0"
                                        ]
                                    }
                                }
                            }
                        },
                        "beta": false,
                        "error": null,
                        "runnable": true,
                        "mini_size": false
                    },
                    "id": "SystemMessagePromptTemplate-Q1QGM",
                    "value": null,
                    "update_at": "2023-10-30T08:02:54.360Z"
                },
                "positionAbsolute": {
                    "x": -2650,
                    "y": -1300
                },
                "selected": false,
                "dragging": false
            },
            {
                "width": 384,
                "height": 555,
                "id": "ConversationBufferMemory-nsf70",
                "type": "genericNode",
                "position": {
                    "x": -2650,
                    "y": -700
                },
                "data": {
                    "type": "ConversationBufferMemory",
                    "node": {
                        "template": {
                            "chat_memory": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "chat_memory",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "BaseChatMessageHistory",
                                "list": false
                            },
                            "ai_prefix": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": "AI",
                                "password": false,
                                "name": "ai_prefix",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": false
                            },
                            "human_prefix": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": "Human",
                                "password": false,
                                "name": "human_prefix",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": false
                            },
                            "input_key": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": "",
                                "password": false,
                                "name": "input_key",
                                "advanced": false,
                                "dynamic": false,
                                "info": "The variable to be used as Chat Input when more than one variable is available.",
                                "type": "str",
                                "list": false
                            },
                            "memory_key": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": "chat_history",
                                "password": false,
                                "name": "memory_key",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": false
                            },
                            "output_key": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "value": "",
                                "password": false,
                                "name": "output_key",
                                "advanced": false,
                                "dynamic": false,
                                "info": "The variable to be used as Chat Output (e.g. answer in a ConversationalRetrievalChain)",
                                "type": "str",
                                "list": false
                            },
                            "return_messages": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "return_messages",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "bool",
                                "list": false
                            },
                            "_type": "ConversationBufferMemory"
                        },
                        "description": "Buffer for storing conversation memory.",
                        "base_classes": [
                            "BaseChatMemory",
                            "ConversationBufferMemory",
                            "BaseMemory"
                        ],
                        "display_name": "ConversationBufferMemory",
                        "custom_fields": {},
                        "output_types": [],
                        "documentation": "",
                        "beta": false,
                        "error": null,
                        "runnable": true,
                        "mini_size": false
                    },
                    "id": "ConversationBufferMemory-nsf70",
                    "value": null,
                    "update_at": "2023-10-30T07:47:44.714Z"
                },
                "positionAbsolute": {
                    "x": -2650,
                    "y": -700
                }
            },
            {
                "width": 384,
                "height": 373,
                "id": "HumanMessagePromptTemplate-lRrjt",
                "type": "genericNode",
                "position": {
                    "x": -2200,
                    "y": -1450
                },
                "data": {
                    "type": "HumanMessagePromptTemplate",
                    "node": {
                        "template": {
                            "additional_kwargs": {
                                "required": false,
                                "placeholder": "",
                                "show": false,
                                "multiline": false,
                                "fulline": false,
                                "chat_view": false,
                                "password": false,
                                "name": "additional_kwargs",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "code",
                                "list": false
                            },
                            "prompt": {
                                "required": true,
                                "placeholder": "",
                                "show": true,
                                "multiline": true,
                                "fulline": false,
                                "chat_view": false,
                                // "value": "\nYou are a helpful assistant that talks casually about life in general.\nYou are a good listener and you can talk about anything.\nHumen:{humen-input}",
                                "value": "\n你是一个乐于助人的助手，对生活侃侃而谈。\n你是一个很好的倾听者，你可以谈论任何事情。\n人类:{humen-input}",
                                "password": false,
                                "name": "prompt",
                                "advanced": false,
                                "dynamic": false,
                                "info": "",
                                "type": "prompt",
                                "list": false
                            },
                            "_type": "HumanMessagePromptTemplate",
                            "humen-input": {
                                "required": false,
                                "placeholder": "",
                                "show": true,
                                "multiline": true,
                                "fulline": false,
                                "chat_view": false,
                                "value": "",
                                "password": false,
                                "name": "humen-input",
                                "display_name": "humen-input",
                                "advanced": false,
                                "input_types": [
                                    "Document",
                                    "BaseOutputParser"
                                ],
                                "dynamic": false,
                                "info": "",
                                "type": "str",
                                "list": false
                            }
                        },
                        "description": "Human message prompt template. This is a message that is sent to the user.",
                        "base_classes": [
                            "BaseStringMessagePromptTemplate",
                            "BaseMessagePromptTemplate",
                            "HumanMessagePromptTemplate"
                        ],
                        "name": "",
                        "display_name": "HumanMessagePromptTemplate",
                        "documentation": "https://python.langchain.com/docs/modules/model_io/models/chat/how_to/prompts",
                        "custom_fields": {
                            "": [
                                "humen-input"
                            ]
                        },
                        "output_types": [],
                        "field_formatters": {
                            "formatters": {
                                "openai_api_key": {}
                            },
                            "base_formatters": {
                                "kwargs": {},
                                "optional": {},
                                "list": {},
                                "dict": {},
                                "union": {},
                                "multiline": {},
                                "show": {},
                                "password": {},
                                "default": {},
                                "headers": {},
                                "dict_code_file": {},
                                "model_fields": {
                                    "MODEL_DICT": {
                                        "OpenAI": [
                                            "text-davinci-003",
                                            "text-davinci-002",
                                            "text-curie-001",
                                            "text-babbage-001",
                                            "text-ada-001"
                                        ],
                                        "ChatOpenAI": [
                                            "gpt-3.5-turbo-0613",
                                            "gpt-3.5-turbo",
                                            "gpt-3.5-turbo-16k-0613",
                                            "gpt-3.5-turbo-16k",
                                            "gpt-4-0613",
                                            "gpt-4-32k-0613",
                                            "gpt-4",
                                            "gpt-4-32k"
                                        ],
                                        "Anthropic": [
                                            "claude-v1",
                                            "claude-v1-100k",
                                            "claude-instant-v1",
                                            "claude-instant-v1-100k",
                                            "claude-v1.3",
                                            "claude-v1.3-100k",
                                            "claude-v1.2",
                                            "claude-v1.0",
                                            "claude-instant-v1.1",
                                            "claude-instant-v1.1-100k",
                                            "claude-instant-v1.0"
                                        ],
                                        "ChatAnthropic": [
                                            "claude-v1",
                                            "claude-v1-100k",
                                            "claude-instant-v1",
                                            "claude-instant-v1-100k",
                                            "claude-v1.3",
                                            "claude-v1.3-100k",
                                            "claude-v1.2",
                                            "claude-v1.0",
                                            "claude-instant-v1.1",
                                            "claude-instant-v1.1-100k",
                                            "claude-instant-v1.0"
                                        ]
                                    }
                                }
                            }
                        },
                        "beta": false,
                        "error": null,
                        "runnable": true,
                        "mini_size": false
                    },
                    "id": "HumanMessagePromptTemplate-lRrjt",
                    "value": null,
                    "update_at": "2023-10-30T08:02:44.140Z"
                },
                "positionAbsolute": {
                    "x": -2200,
                    "y": -1450
                },
                "selected": false,
                "dragging": false
            }
        ],
        "edges": [
            {
                "source": "ChatPromptTemplate-0J2IE",
                "target": "LLMChain-5879c",
                "sourceHandle": "ChatPromptTemplate|ChatPromptTemplate-0J2IE|BaseChatPromptTemplate|ChatPromptTemplate|BasePromptTemplate",
                "targetHandle": "BasePromptTemplate|prompt|LLMChain-5879c",
                "id": "reactflow__edge-ChatPromptTemplate-0J2IEChatPromptTemplate|ChatPromptTemplate-0J2IE|BasePromptTemplate|ChatPromptTemplate|BaseChatPromptTemplate-LLMChain-5879cBasePromptTemplate|prompt|LLMChain-5879c",
                "style": {
                    "strokeWidth": 6
                },
                "className": "",
                "animated": false,
                "selected": false
            },
            {
                "source": "ChatOpenAI-3DbNV",
                "target": "LLMChain-5879c",
                "sourceHandle": "ChatOpenAI|ChatOpenAI-3DbNV|ChatOpenAI|BaseChatModel|BaseLanguageModel|BaseLLM",
                "targetHandle": "BaseLanguageModel|llm|LLMChain-5879c",
                "id": "reactflow__edge-ChatOpenAI-3DbNVChatOpenAI|ChatOpenAI-3DbNV|BaseChatModel|BaseLanguageModel|ChatOpenAI|BaseLLM-LLMChain-5879cBaseLanguageModel|llm|LLMChain-5879c",
                "style": {
                    "strokeWidth": 6
                },
                "className": "",
                "animated": false,
                "selected": false
            },
            {
                "source": "SystemMessagePromptTemplate-Q1QGM",
                "sourceHandle": "SystemMessagePromptTemplate|SystemMessagePromptTemplate-Q1QGM|BaseStringMessagePromptTemplate|BaseMessagePromptTemplate|SystemMessagePromptTemplate",
                "target": "ChatPromptTemplate-0J2IE",
                "targetHandle": "BaseMessagePromptTemplate|messages|ChatPromptTemplate-0J2IE",
                "style": {
                    "strokeWidth": 6
                },
                "className": "",
                "animated": false,
                "id": "reactflow__edge-SystemMessagePromptTemplate-Q1QGMSystemMessagePromptTemplate|SystemMessagePromptTemplate-Q1QGM|BaseMessagePromptTemplate|BaseStringMessagePromptTemplate|SystemMessagePromptTemplate-ChatPromptTemplate-0J2IEBaseMessagePromptTemplate|messages|ChatPromptTemplate-0J2IE",
                "selected": false
            },
            {
                "source": "ConversationBufferMemory-nsf70",
                "sourceHandle": "ConversationBufferMemory|ConversationBufferMemory-nsf70|BaseChatMemory|ConversationBufferMemory|BaseMemory",
                "target": "LLMChain-5879c",
                "targetHandle": "BaseMemory|memory|LLMChain-5879c",
                "style": {
                    "strokeWidth": 6
                },
                "className": "",
                "animated": false,
                "id": "reactflow__edge-ConversationBufferMemory-nsf70ConversationBufferMemory|ConversationBufferMemory-nsf70|BaseChatMemory|ConversationBufferMemory|BaseMemory-LLMChain-5879cBaseMemory|memory|LLMChain-5879c"
            },
            {
                "source": "HumanMessagePromptTemplate-lRrjt",
                "sourceHandle": "HumanMessagePromptTemplate|HumanMessagePromptTemplate-lRrjt|BaseStringMessagePromptTemplate|BaseMessagePromptTemplate|HumanMessagePromptTemplate",
                "target": "ChatPromptTemplate-0J2IE",
                "targetHandle": "BaseMessagePromptTemplate|messages|ChatPromptTemplate-0J2IE",
                "style": {
                    "strokeWidth": 6
                },
                "className": "stroke-foreground  stroke-connection",
                "animated": false,
                "id": "reactflow__edge-HumanMessagePromptTemplate-lRrjtHumanMessagePromptTemplate|HumanMessagePromptTemplate-lRrjt|BaseStringMessagePromptTemplate|BaseMessagePromptTemplate|HumanMessagePromptTemplate-ChatPromptTemplate-0J2IEBaseMessagePromptTemplate|messages|ChatPromptTemplate-0J2IE"
            }
        ],
        "viewport": {
            "x": 2338.56672464023,
            "y": 1101.503755992307,
            "zoom": 0.7991590670704326
        }
    },
    "id": flowId,
    "create_at": "2023-10-30T13:46:52.759665",
    "update_at": "2023-10-30T15:48:24.698245"
  }

}

export async function enforceMinimumLoadingTime(
  startTime: number,
  minimumLoadingTime: number
) {
  const elapsedTime = Date.now() - startTime;
  const remainingTime = minimumLoadingTime - elapsedTime;

  if (remainingTime > 0) {
    return new Promise((resolve) => setTimeout(resolve, remainingTime));
  }
}

export function getAllRelatedNode(flow,rootId:string,returnEdgeIds,returnNodeIds){
  let edges=flow.data?.edges.filter((edge)=>(edge.source===rootId));
  edges.forEach((edge)=>{
    returnEdgeIds.push(edge.id);
    if(edge.type!="floating"){
      returnNodeIds.push(edge.target);
      getAllRelatedNode(flow,edge.target,returnEdgeIds,returnNodeIds);
    }
  })
}
/**
 * check object whether is Array 
 * @param arr 
 * @returns true is diect the object is Array and not object value  (only  string and number) type inside
 */
export function checkArray(arr){
  if(Array.isArray(arr)){
    for (let i = 0; i < arr.length; i++) {  
      if(typeof arr[i]==="object"){
        return false;
      }
    }
    return true;
  }
}