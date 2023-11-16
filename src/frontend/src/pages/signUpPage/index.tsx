import * as Form from "@radix-ui/react-form";
import { FormEvent, useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputComponent from "../../components/inputComponent";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  CONTROL_INPUT_STATE,
  SIGN_UP_SUCCESS,
} from "../../constants/constants";
import { alertContext } from "../../contexts/alertContext";
import { addUser } from "../../controllers/API";
import {
  UserInputType,
  inputHandlerEventType,
  signUpInputStateType,
} from "../../types/components";
import { darkContext } from "../../contexts/darkContext";

export default function SignUp(): JSX.Element {
  const [inputState, setInputState] =
    useState<signUpInputStateType>(CONTROL_INPUT_STATE);

  const [isDisabled, setDisableBtn] = useState<boolean>(true);

  const { password, cnfPassword, username } = inputState;
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const navigate = useNavigate();
  const { dark, setDark } = useContext(darkContext);

  function handleInput({
    target: { name, value },
  }: inputHandlerEventType): void {
    setInputState((prev) => ({ ...prev, [name]: value }));
  }

  useEffect(() => {
    if (password !== cnfPassword) return setDisableBtn(true);
    if (password === "" || cnfPassword === "") return setDisableBtn(true);
    if (username === "") return setDisableBtn(true);
    setDisableBtn(false);
  }, [password, cnfPassword, username, handleInput]);

  function handleSignup(): void {
    const { username, password } = inputState;
    const newUser: UserInputType = {
      username: username.trim(),
      password: password.trim(),
    };
    addUser(newUser)
      .then((user) => {
        setSuccessData({
          title: SIGN_UP_SUCCESS,
        });
        navigate("/login");
      })
      .catch((error) => {
        const {
          response: {
            data: { detail },
          },
        } = error;
        setErrorData({
          title: "注册过程出错了",
          list: [detail],
        });
        return;
      });
  }

  return (
    <Form.Root
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        if (password === "") {
          event.preventDefault();
          return;
        }

        const data = Object.fromEntries(new FormData(event.currentTarget));
        event.preventDefault();
      }}
      className="h-full w-full"
    >
      <div className={"flex h-full w-full flex-col items-center justify-center"+(dark?"":" bg-[url('/beams-basic.png')]")}>
        <div className="flex w-72 flex-col items-center justify-center gap-2">
          <span className="mb-4 text-5xl">Neuri</span>
          <span className="mb-6 text-2xl font-semibold text-primary">
            注册账号
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
                  placeholder="名称"
                />
              </Form.Control>

              <Form.Message match="valueMissing" className="field-invalid">
                输入您的用户名称
              </Form.Message>
            </Form.Field>
          </div>
          <div className="mb-3 w-full">
            <Form.Field name="password" serverInvalid={password != cnfPassword}>
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
                className="w-full"
              />

              <Form.Message className="field-invalid" match="valueMissing">
                请输入您的账号密码
              </Form.Message>

              {password != cnfPassword && (
                <Form.Message className="field-invalid">
                  两次密码不一致
                </Form.Message>
              )}
            </Form.Field>
          </div>
          <div className="w-full">
            <Form.Field
              name="confirmpassword"
              serverInvalid={password != cnfPassword}
            >
              <Form.Label className="data-[invalid]:label-invalid">
                密码确认{" "}
                <span className="font-medium text-destructive">*</span>
              </Form.Label>

              <InputComponent
                onChange={(value) => {
                  handleInput({ target: { name: "cnfPassword", value } });
                }}
                value={cnfPassword}
                isForm
                password={true}
                required
                placeholder="重复输入您的密码"
                className="w-full"
              />

              <Form.Message className="field-invalid" match="valueMissing">
                请输入您的密码
              </Form.Message>
            </Form.Field>
          </div>
          <div className="w-full">
            <Form.Submit asChild>
              <Button
                disabled={isDisabled}
                type="submit"
                className="mr-3 mt-6 w-full"
                onClick={() => {
                  handleSignup();
                }}
              >
                注册
              </Button>
            </Form.Submit>
          </div>
          <div className="w-full">
            <Link to="/login">
              <Button className="w-full" variant="outline">
                已经有账号?&nbsp;<b>点击这里</b>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Form.Root>
  );
}
