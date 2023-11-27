import { useContext, useEffect, useRef, useState } from "react";
import { alertContext } from "../../contexts/alertContext";
import { typesContext } from "../../contexts/typesContext";
import { sendAllProps } from "../../types/api";
import { ChatMessageType } from "../../types/chat";
import { FlowType } from "../../types/flow";
import { classNames } from "../../utils/utils";
import ChatInput from "./chatInput";
import ChatMessage from "./chatMessage";
// import {
//   Popover,
//   PopoverContent,
// } from "../../components/ui/popover";
import _ from "lodash";
import IconComponent from "../../components/genericIconComponent";
import { TabsContext } from "../../contexts/tabsContext";
import { validateNodes } from "../../utils/reactflowUtils";

export default function LeftFormModal({
  flow,
  open,
  setOpen,
  needCheckFlow=true,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  flow: FlowType;
  needCheckFlow?:boolean;
}) {
  const { tabsState, setTabsState,tabId } = useContext(TabsContext);
  const [chatValue, setChatValue] = useState(() => {
    try {
      const { formKeysData } = tabsState[flow.id];
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
  const id = useRef(flow.id);
  const tabsStateFlowId = tabsState[flow.id];
  const tabsStateFlowIdFormKeysData = tabsStateFlowId.formKeysData;
  const [chatKey, setChatKey] = useState(() => {
    if (tabsState[flow.id]?.formKeysData?.input_keys) {
      return Object.keys(tabsState[flow.id].formKeysData.input_keys).find(
        (key) =>
          !tabsState[flow.id].formKeysData.handle_keys.some((j) => j === key) &&
          tabsState[flow.id].formKeysData.input_keys[key] === ""
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
    id.current = flow.id;
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
        // console.log("lkjkjkjkjkjkjkjkjk-----lock2:"+lockChat);
        // console.log("lkjkjkjkjkjkjkjkjk-----:"+isOpen.current);
        // console.log("lkjkjkjkjkjkjkjkjk-----1:"+open);
      };
      newWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // console.log("Received data:", data);
        handleWsMessage(data);
        //get chat history
      };
      newWs.onclose = (event) => {
        handleOnClose(event);
      };
            newWs.onerror = (ev) => {
        console.log(ev, "error");
        if (flow.id === "") {
          connectWS();
        } else {
          setErrorData({
            title: "There was an error on web connection, please: ",
            list: [
              "Refresh the page",
              "Use a new flow tab",
              "Check if the backend is up",
            ],
          });
        }
      };
      ws.current = newWs;
    } catch (error) {
      if (flow.id === "") {
        connectWS();
      }
      console.log(error);
    }
  }

  useEffect(() => {
    connectWS();
    return () => {
      // console.log("unmount");
      // console.log(ws);
      if (ws.current) {
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

  useEffect(() => {
    if (ref.current) ref.current.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const ref = useRef(null);

  useEffect(() => {
    if (open && ref.current) {
      ref.current.focus();
    }
  }, [open]);

  function sendMessage() {
    let nodeValidationErrors = needCheckFlow?validateNodes(reactFlowInstances.get(tabId)):[];
    if (nodeValidationErrors.length === 0) {
      setLockChat(true);
      let inputs = tabsState[id.current].formKeysData.input_keys;
      setChatValue("");
      const message = inputs;
      addChatHistory(
        message,
        true,
        chatKey,
        tabsState[flow.id].formKeysData.template
      );
      if(needCheckFlow){
        sendAll({
          ...reactFlowInstances.get(tabId).toObject(),
          nodes:[],
          edges:[],
          viewport:null,
          inputs: inputs,
          chatHistory,
          name: flow.name,
          description: flow.description,
        });
      }else{
        sendAll({
          nodes:[],
          edges:[],
          viewport:null,
          inputs: inputs,
          chatHistory,
          name: flow.name,
          description: flow.description,
        });
      }

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
      setChatValue(tabsState[flow.id].formKeysData.input_keys[i]);
    } else {
      setChatKey(null);
      setChatValue("");
    }
  }
  return (

       tabsState[flow.id].formKeysData && (

          <div className="form-modal-iv-box">
            <div className="eraser-column-arrangement">
              <div className="eraser-size">
                <div className="eraser-position mb-1">
                  <button disabled={lockChat} onClick={() => clearChat()}>
                    <IconComponent
                      name="Eraser"
                      className={classNames(
                        "h-5 w-5",
                        lockChat
                          ? "animate-pulse text-primary"
                          : "text-primary hover:text-gray-600"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {/* <button disabled={lockChat} onClick={() => {
                    // clearChat();
                    setOpen(false);
                    }}>
                    <IconComponent
                      name="X"
                      className="h-5 w-5 text-primary hover:text-gray-600"
                      aria-hidden="true"
                    />
                  </button> */}
                </div>
                <div ref={messagesRef} className="chat-message-div mt-4">
                  {chatHistory.length > 0 ? (
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
                  ) : (
                    <div className="chat-alert-box">
                      <div className="langflow-chat-desc">
                        <span className="langflow-chat-desc-span">
                          从点击下面的按钮开始{" "}
                          <span>
                            <IconComponent
                              name="MessageSquare"
                              className="mx-1 inline h-5 w-5 animate-bounce "
                            />
                          </span>{" "}
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={ref}></div>
                </div>
                <div className="neuri-chat-input-div">
                  <div className="langflow-chat-input">
                    <ChatInput
                      chatValue={chatValue}
                      noInput={!chatKey}
                      lockChat={lockChat}
                      sendMessage={sendMessage}
                      setChatValue={(value) => {
                        setChatValue(value);
                        setTabsState((old) => {
                          let newTabsState = _.cloneDeep(old);
                          newTabsState[id.current].formKeysData.input_keys[
                            chatKey
                          ] = value;
                          return newTabsState;
                        });
                      }}
                      inputRef={ref}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

      )

  );
}
