import * as Form from "@radix-ui/react-form";
import { cloneDeep } from "lodash";
import { useContext, useEffect, useState } from "react";
import IconComponent from "../../components/genericIconComponent";
import GradientChooserComponent from "../../components/gradientChooserComponent";
import Header from "../../components/headerComponent";
import InputComponent from "../../components/inputComponent";
import { Button } from "../../components/ui/button";
import { CONTROL_PATCH_USER_STATE } from "../../constants/constants";
import { alertContext } from "../../contexts/alertContext";
import { AuthContext } from "../../contexts/authContext";
import { resetPassword, updateUser } from "../../controllers/API";
import {
  inputHandlerEventType,
  patchUserInputStateType,
} from "../../types/components";
import { gradients } from "../../utils/styleUtils";
import { TabsContext } from "../../contexts/tabsContext";
import ToggleShadComponent from "../../components/toggleShadComponent";
import { locationContext } from "../../contexts/locationContext";
export default function ProfileSettingsPage(): JSX.Element {
  const { setTabId } = useContext(TabsContext);

  const [inputState, setInputState] = useState<patchUserInputStateType>(
    CONTROL_PATCH_USER_STATE
  );
  const {setNoteOnly,noteOnly} =useContext(locationContext);
  // set null id
  useEffect(() => {
    setTabId("");
  }, []);
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const { userData, setUserData } = useContext(AuthContext);
  const { password, cnfPassword, gradient } = inputState;

  async function handlePatchUser() {
    if (password !== cnfPassword) {
      setErrorData({
        title: "Error changing password",
        list: ["Passwords do not match"],
      });
      return;
    }
    try {
      if (password !== "") await resetPassword(userData!.id, { password });
      if (gradient !== "")
        await updateUser(userData!.id, { profile_image: gradient });
      if (gradient !== "") {
        let newUserData = cloneDeep(userData);
        newUserData!.profile_image = gradient;
        setUserData(newUserData);
      }
      handleInput({ target: { name: "password", value: "" } });
      handleInput({ target: { name: "cnfPassword", value: "" } });
      setSuccessData({ title: "Changes saved successfully!" });
    } catch (error) {
      setErrorData({
        title: "Error saving changes",
        list: [(error as any).response.data.detail],
      });
    }
  }

  function handleInput({
    target: { name, value },
  }: inputHandlerEventType): void {
    setInputState((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <>
      <div className="community-page-arrangement">
        <div className="community-page-nav-arrangement">
          <span className="community-page-nav-title">
            <IconComponent name="User" className="w-6" />
            个人偏好
          </span>
        </div>
        <span className="community-page-description-text">
          在这里可以修改您的个人喜好，密码等信息。
        </span>
        <Form.Root
          onSubmit={(event) => {
            handlePatchUser();
            const data = Object.fromEntries(new FormData(event.currentTarget));
            event.preventDefault();
          }}
          className="flex h-full flex-col px-6 pb-16"
        >
          <div className="flex h-full flex-col gap-4">
            <div className="flex gap-4">
              <div className="mb-3 w-96">
                <Form.Field name="password">
                  <Form.Label className="data-[invalid]:label-invalid">
                    密码{" "}
                  </Form.Label>
                  <InputComponent
                    onChange={(value) => {
                      handleInput({ target: { name: "password", value } });
                    }}
                    value={password}
                    isForm
                    password={true}
                    placeholder="新的密码"
                    className="w-full"
                  />
                  <Form.Message match="valueMissing" className="field-invalid">
                    请输入您的登陆密码
                  </Form.Message>
                </Form.Field>
              </div>
              <div className="mb-3 w-96">
                <Form.Field name="cnfPassword">
                  <Form.Label className="data-[invalid]:label-invalid">
                    确认密码{" "}
                  </Form.Label>

                  <InputComponent
                    onChange={(value) => {
                      handleInput({ target: { name: "cnfPassword", value } });
                    }}
                    value={cnfPassword}
                    isForm
                    password={true}
                    placeholder="再次输入新的密码"
                    className="w-full"
                  />

                  <Form.Message className="field-invalid" match="valueMissing">
                    Please confirm your password
                  </Form.Message>
                </Form.Field>
              </div>
            </div>
            <Form.Field name="gradient">
              <Form.Label className="data-[invalid]:label-invalid">
                个人偏好样式{" "}
              </Form.Label>

              <div className="mt-4 w-full">
                <GradientChooserComponent
                  value={
                    gradient == ""
                      ? (userData!=null&&userData!.profile_image) ??
                        gradients[
                          parseInt(userData!.id ?? "", 30) % gradients.length
                        ]
                      : gradient
                  }
                  onChange={(value) => {
                    handleInput({ target: { name: "gradient", value } });
                  }}
                />
              </div>
            </Form.Field>
          </div>
          <div className="ml-0 mt-4">
            <div className="flex">
            <ToggleShadComponent
                disabled={false}
                enabled={noteOnly}
                setEnabled={setNoteOnly}
                size="small"
              />
                仅查看笔记    
            </div>            
          <span className="community-page-description-text w-full">
            选择是否仅修改和查看笔记，白板内容将隐藏，但不会删除；该项不需要保存，效果是及时生效的。
          </span>
        </div>
          <div className="flex w-full justify-end">
            <div className="w-32">
              <Form.Submit asChild>
                <Button className="mr-3 mt-6 w-full" type="submit">
                  保存
                </Button>
              </Form.Submit>
            </div>
          </div>
        </Form.Root>
      </div>
    </>
  );
}
