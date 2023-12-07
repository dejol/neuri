import { useContext, useEffect, useRef, useState } from "react";
import { alertContext } from "../../contexts/alertContext";
import { typesContext } from "../../contexts/typesContext";
import { sendAllProps } from "../../types/api";
import { ChatMessageType } from "../../types/chat";
import { FlowType } from "../../types/flow";
import { classNames } from "../../utils/utils";
import ChatMessage from "./chatMessage";
import _ from "lodash";
import { TabsContext } from "../../contexts/tabsContext";
import { validateNodes } from "../../utils/reactflowUtils";
import { NodeDataType } from "../../types/flow/index";
import { cloneDeep } from "lodash";
import  {
  addEdge,
  Position,
  useEdgesState,
  XYPosition,
} from "reactflow";
import { getNextBG } from "../../pages/FlowPage/components/borderColorComponent";
import { undoRedoContext } from "../../contexts/undoRedoContext";

export default function EmbeddedModal({
  name="",
  sourceData,
  setSourceData,
  flow,
}: {
  name:string;
  sourceData:NodeDataType;
  setSourceData: (value: NodeDataType) => void;
  flow: FlowType;
}) {
  const { tabsState, setTabsState,tabId,setIsEMBuilt,getNodeId,getNewEdgeId } = useContext(TabsContext);
  const [responseId,setResponseId] = useState(flow.id+"-"+sourceData.id);
  const [chatValue, setChatValue] = useState(() => {
    try {
      const { formKeysData } = tabsState[responseId];
      if (!formKeysData) {
        throw new Error("formKeysData is undefined");
      }
      const inputKeys = formKeysData.input_keys;
      const handleKeys = formKeysData.handle_keys;

      const keyToUse = Object.keys(inputKeys).find(
        (key) => !handleKeys.some((j) => j === key) && inputKeys[key] === ""
      );

      return inputKeys[keyToUse];
    } catch (error) {
      console.error(error);
      // return a sensible default or `undefined` if no default is possible
      return undefined;
    }
  });

  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const { reactFlowInstances } = useContext(typesContext);
  const { setErrorData } = useContext(alertContext);
  const ws = useRef<WebSocket | null>(null);
  const [lockChat, setLockChat] = useState(false);
  const isOpen = useRef(open);
  const messagesRef = useRef(null);
  const id = useRef(responseId);
  const tabsStateFlowId = tabsState[responseId];
  const tabsStateFlowIdFormKeysData = tabsStateFlowId.formKeysData;
  const [edges, setEdges] = useEdgesState(
    flow.data?.edges ?? []
  );
  const [chatKey, setChatKey] = useState(() => {
    if (tabsState[responseId]?.formKeysData?.input_keys) {
      return Object.keys(tabsState[responseId].formKeysData.input_keys).find(
        (key) =>
          !tabsState[responseId].formKeysData.handle_keys.some((j) => j === key) &&
          tabsState[responseId].formKeysData.input_keys[key] === ""
      );
    }
    // TODO: return a sensible default
    return "";
  });
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    isOpen.current = open;
  }, [open]);
  useEffect(() => {
    id.current = responseId;
  }, [flow.id, tabsStateFlowId, tabsStateFlowIdFormKeysData]);

  var isStream = false;

  const addChatHistory = (
    message: string | Object,
    isSend: boolean,
    chatKey: string,
    template?: string,
    thought?: string,
    files?: Array<any>
  ) => {
    setChatHistory((old) => {
      let newChat = _.cloneDeep(old);
      if (files) {
        newChat.push({ message, isSend, files, thought, chatKey });
      } else if (thought) {
        newChat.push({ message, isSend, thought, chatKey });
      } else if (template) {
        newChat.push({ message, isSend, chatKey, template });
      } else {
        newChat.push({ message, isSend, chatKey });
      }
      return newChat;
    });
  };
  //add proper type signature for function

  function updateLastMessage({
    str,
    thought,
    end = false,
    files,
  }: {
    str?: string;
    thought?: string;
    // end param default is false
    end?: boolean;
    files?: Array<any>;
  }) {
    setChatHistory((old) => {
      let newChat = [...old];
      if (str) {
        if (end) {
          newChat[newChat.length - 1].message = str;
        } else {
          newChat[newChat.length - 1].message =
            newChat[newChat.length - 1].message + str;
        }
      }
      if (thought) {
        newChat[newChat.length - 1].thought = thought;
      }
      if (files) {
        newChat[newChat.length - 1].files = files;
      }
      return newChat;
    });
  }

  function handleOnClose(event: CloseEvent) {
    if (isOpen.current) {
      setErrorData({ title: event.reason });
      setTimeout(() => {
        connectWS();
        setLockChat(false);
      }, 1000);
    }
  }

  function getWebSocketUrl(chatId, isDevelopment = false) {
    const isSecureProtocol = window.location.protocol === "https:" || window.location.port === "443";
    const webSocketProtocol = isSecureProtocol ? "wss" : "ws";
    // const host = isDevelopment ? "localhost:7860" : window.location.host;
    const host =  window.location.host;

    const chatEndpoint = `/api/v1/chat/${chatId}`;

    return `${
       webSocketProtocol
    }://${host}${chatEndpoint}`;
  }

  function handleWsMessage(data: any) {
    if (Array.isArray(data)) {
      //set chat history
      setChatHistory((_) => {
        let newChatHistory: ChatMessageType[] = [];
        data.forEach(
          (chatItem: {
            intermediate_steps?: string;
            is_bot: boolean;
            message: string;
            template: string;
            type: string;
            chatKey: string;
            files?: Array<any>;
          }) => {
            if (chatItem.message) {
              newChatHistory.push(
                chatItem.files
                  ? {
                      isSend: !chatItem.is_bot,
                      message: chatItem.message,
                      template: chatItem.template,
                      thought: chatItem.intermediate_steps,
                      files: chatItem.files,
                      chatKey: chatItem.chatKey,
                    }
                  : {
                      isSend: !chatItem.is_bot,
                      message: chatItem.message,
                      template: chatItem.template,
                      thought: chatItem.intermediate_steps,
                      chatKey: chatItem.chatKey,
                    }
              );
            }
          }
        );
        return newChatHistory;
      });
    }
    if (data.type === "start") {
      addChatHistory("", false, chatKey);
      isStream = true;

    }
    if (data.type === "end") {
      if (data.message) {
        updateLastMessage({ str: data.message, end: true });
        let newData = cloneDeep(sourceData);
        newData.node!.template[name].value = data.message;
        
        setSourceData(newData);
        setIsEMBuilt(false);
        if (ws.current) {
          try{
            // clearChat();
            console.log("close connection");
            ws.current.close(1000,"User closed the connection");
          }catch (error) {

          }
          //isOpen.current=null;
          ws.current=null;
        }

      }
      if (data.intermediate_steps) {
        updateLastMessage({
          str: data.message,
          thought: data.intermediate_steps,
          end: true,
        });
      }
      if (data.files) {
        updateLastMessage({
          end: true,
          files: data.files,
        });
      }

      setLockChat(false);
      isStream = false;
    }
    if (data.type === "stream" && isStream) {
      updateLastMessage({ str: data.message });
    }
  }

  function connectWS() {
    try {
      const urlWs = getWebSocketUrl(
        id.current,
        process.env.NODE_ENV === "development"
      );
      const newWs = new WebSocket(urlWs);
      newWs.onopen = () => {
        console.log("WebSocket connection established!");
        if(!lockChat){
          sendMessage();  
        }
      };
      newWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        //console.log("Received data:", data);
        handleWsMessage(data);
        //get chat history
      };
      newWs.onclose = (event) => {
        // handleOnClose(event);
      };
      
      newWs.onerror = (ev) => {
        console.log(ev, "error");
        if (flow.id === "") {
          // connectWS();
        } else {
          // setErrorData({
          //   title: "There was an error on web connection, please: ",
          //   list: [
          //     "Refresh the page",
          //     "Use a new flow tab",
          //     "Check if the backend is up",
          //   ],
          // });
        }
      };
      ws.current = newWs;
    } catch (error) {
      if (flow.id === "") {
        // connectWS();
      }
      console.log(error);
    }
  }

  useEffect(() => {
    connectWS();
    return () => {
      console.log("unmount");
      // console.log(ws);
      if (ws.current) {
        console.log("close connection");
        ws.current.close();
      }
    };
    // do not add connectWS on dependencies array
  }, []);

  useEffect(() => {
    if (
      ws.current &&
      (ws.current.readyState === ws.current.CLOSED ||
        ws.current.readyState === ws.current.CLOSING)
    ) {
      connectWS();
      setLockChat(false);
    }
    // do not add connectWS on dependencies array
  }, [lockChat]);

  async function sendAll(data: sendAllProps) {
    try {
      if (ws) {
        ws.current.send(JSON.stringify(data));
      }
    } catch (error) {
      setErrorData({
        title: "There was an error sending the message",
        list: [error.message],
      });
      setChatValue(data.inputs);
      connectWS();
    }
  }

  // useEffect(() => {
  //   if (ref.current) ref.current.scrollIntoView({ behavior: "smooth" });
  // }, [chatHistory]);//这里的ref会根据chatHistory的值变化，触动scroll，导致reactflow整个页面溢出

  // const ref = useRef(null); 

  // useEffect(() => {
  //   if (open && ref.current) {
  //     ref.current.focus();
  //   }
  // }, [open]);

  function sendMessage() {
    let nodeValidationErrors = validateNodes(reactFlowInstances.get(tabId));
    if (nodeValidationErrors.length === 0) {
      setLockChat(true);

      let inputs = tabsState[id.current].formKeysData.input_keys;
      setChatValue("");
      const message = inputs;
      addChatHistory(
        message,
        true,
        chatKey,
        tabsState[responseId].formKeysData.template
      );
      sendAll({
        ...reactFlowInstances.get(tabId).toObject(),
        inputs: inputs,
        chatHistory,
        name: flow.name,
        description: flow.description,
      });
      setTabsState((old) => {
        if (!chatKey) return old;
        let newTabsState = _.cloneDeep(old);
        newTabsState[id.current].formKeysData.input_keys[chatKey] = "";
        return newTabsState;
      });
    } else {
      setErrorData({
        title: "Oops! Looks like you missed some required information:",
        list: nodeValidationErrors,
      });
    }
  }
  function clearChat() {
    setChatHistory([]);
    ws.current.send(JSON.stringify({ clear_history: true }));
    if (lockChat) setLockChat(false);
  }

  function handleOnCheckedChange(checked: boolean, i: string) {
    if (checked === true) {
      setChatKey(i);
      setChatValue(tabsState[responseId].formKeysData.input_keys[i]);
    } else {
      setChatKey(null);
      setChatValue("");
    }
  }
  return (
       tabsState[responseId].formKeysData && (
          <div className="left-form-modal-iv-box ">
            <div className="eraser-column-arrangement">
              <div className="eraser-size-embedded">
                <div ref={messagesRef} className="chat-message-div">
                  {chatHistory.length > 0 && (
                    chatHistory.map((chat, index) => (
                      <ChatMessage
                        lockChat={lockChat}
                        chat={chat}
                        lastMessage={
                          chatHistory.length - 1 === index ? true : false
                        }
                        key={index}
                      />
                    ))
                  )}
                  {/* <div ref={ref}></div> */}
                </div>
              </div>
            </div>
          </div>
      )

  );
}
