import * as Form from "@radix-ui/react-form";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputComponent from "../../components/inputComponent";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { CONTROL_LOGIN_STATE } from "../../constants/constants";
import { alertContext } from "../../contexts/alertContext";
import { AuthContext } from "../../contexts/authContext";
import { getLoggedUser, onLogin } from "../../controllers/API";
import { LoginType } from "../../types/api";
import {
  inputHandlerEventType,
  loginInputStateType,
} from "../../types/components";
import { darkContext } from "../../contexts/darkContext";

export default function LoginPage(): JSX.Element {
  const [inputState, setInputState] =
    useState<loginInputStateType>(CONTROL_LOGIN_STATE);

  const { password, username } = inputState;
  const { login, getAuthentication, setUserData, setIsAdmin } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const { setErrorData } = useContext(alertContext);
  // const { setLoginUserId } = useContext(TabsContext);
  const { dark, setDark } = useContext(darkContext);


  function handleInput({
    target: { name, value },
  }: inputHandlerEventType): void {
    setInputState((prev) => ({ ...prev, [name]: value }));
  }

  function signIn() {
    const user: LoginType = {
      username: username.trim(),
      password: password.trim(),
    };
    onLogin(user)
      .then((user) => { 
        login(user.access_token, user.refresh_token);
        getUser();
        navigate("/app");
      })
      .catch((error) => {
        setErrorData({
          title: "Error signing in",
          list: [error["response"]["data"]["detail"]],
        });
      });
  }

  function getUser() {
    if (getAuthentication()) {
      setTimeout(() => {
        getLoggedUser()
          .then((user) => {
            const isSuperUser = user!.is_superuser;
            setIsAdmin(isSuperUser);
            setUserData(user);
          })
          .catch((error) => {
            console.log("login page", error);
          });
      }, 500);
    }
  }

  return (
    <Form.Root
      onSubmit={(event) => {
        if (password === "") {
          event.preventDefault();
          return;
        }
        signIn();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        event.preventDefault();
      }}
      className="h-full w-full"
    >
      <div className={"flex h-full w-full flex-col items-center justify-center"+(dark?"":" bg-[url('/beams-basic.png')]")}>
        <div className="flex w-72 flex-col items-center justify-center gap-2">
          <span className="mb-4 text-5xl">Neuri</span>
          <span className="mb-6 text-2xl font-semibold text-primary">
            登陆您的账号
          </span>
          <div className="mb-3 w-full">
            <Form.Field name="username">
              <Form.Label className="data-[invalid]:label-invalid">
              用户名 <span className="font-medium text-destructive">*</span>
              </Form.Label>

              <Form.Control asChild>
                <Input
                  type="username"
                  onChange={({ target: { value } }) => {
                    handleInput({ target: { name: "username", value } });
                  }}
                  value={username}
                  className="w-full"
                  required
                  placeholder="用户名"
                />
              </Form.Control>

              <Form.Message match="valueMissing" className="field-invalid">
                请输入您的用户名称
              </Form.Message>
            </Form.Field>
          </div>
          <div className="mb-3 w-full">
            <Form.Field name="password">
              <Form.Label className="data-[invalid]:label-invalid">
                密码 <span className="font-medium text-destructive">*</span>
              </Form.Label>

              <InputComponent
                onChange={(value) => {
                  handleInput({ target: { name: "password", value } });
                }}
                value={password}
                isForm
                password={true}
                required
                placeholder="密码"
                // blurOnEnter={true}
                className="w-full"
              />

              <Form.Message className="field-invalid" match="valueMissing">
                请输入您的密码
              </Form.Message>
            </Form.Field>
          </div>
          <div className="w-full">
            <Form.Submit asChild>
              <Button className="mr-3 mt-6 w-full" type="submit">
                登陆
              </Button>
            </Form.Submit>
          </div>
          <div className="w-full">
            <Link to="/signup">
              <Button className="w-full" variant="outline" type="button">
                您没有账号？&nbsp;<b>点击这里</b>
              </Button>
            </Link>
          </div>

        </div>
        <div className=" flex justify-center w-full absolute inset-x-0 bottom-0 h-16">
          <div className="text-xs text-slate-400">
          <Link to={"https://beian.miit.gov.cn"}>备案/许可证编号：粤ICP备2023138014号</Link>
          </div>
        </div>
      </div>
      
    </Form.Root>
  );
}
