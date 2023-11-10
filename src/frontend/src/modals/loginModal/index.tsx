import { ReactNode, forwardRef, useContext, useState } from "react";
import IconComponent from "../../components/genericIconComponent";
import { Button } from "../../components/ui/button";
import { TabsContext } from "../../contexts/tabsContext";
import BaseModal from "../baseModal";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { alertContext } from "../../contexts/alertContext";
import { useNavigate } from "react-router-dom";
// 本组件由 AdminPage/LoginPage替换，不再使用本组件
const LoginModal = forwardRef((props: { children: ReactNode }, ref) => {
  const {login } =useContext(TabsContext);
  const { setErrorData } = useContext(alertContext);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate =useNavigate();
    const handleSubmit = async (event) => {
      event.preventDefault();
      try {
        login({username:username, password:password }).then((response)=>{
          // console.log("return response:",response);
          // setLoginUserId(response['id']);
          localStorage.setItem('login',response['id']);
          localStorage.setItem('userName',response['username']);
          if(response!=""){
            let url="/flow/"; //+response['id'];
            navigate(url);
          }
          if(response==""){
            setErrorData({
              title: "User Name or password is incorrect, please try again",
              
            })
          }
        }
        )  
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <BaseModal open={!isLogin} setOpen={setIsLogin} size="small">
    <BaseModal.Header description="Login system with your name and password first.">
        <span className="pr-2">Login</span>
      <IconComponent name="User" className="mr-2 h-4 w-4 " />
    </BaseModal.Header>
    <BaseModal.Content>
    <form onSubmit={handleSubmit}>
        <Label>
        <Input
          className="nopan nodrag noundo nocopy mt-2 font-normal"
          onChange={event => setUsername(event.target.value)}
          type="text"
          name="name"
          value={username}
          placeholder="User name"
          id="name"
        />
      </Label>
      <Label>
      <Input
          className="nopan nodrag noundo nocopy mt-2 font-normal"
          onChange={event => setPassword(event.target.value)}
          type="password"
          name="name"
          value={password}
          placeholder="Passowrd"
          id="pass"
        />
      </Label>
      <div className="flex m-2 justify-end">
      <Button type="submit">Login</Button>
      </div>
    </form>
        </BaseModal.Content>
  </BaseModal>

  );
});
export default LoginModal;
