import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CardComponent } from "../../components/cardComponent";
import IconComponent from "../../components/genericIconComponent";
import { USER_PROJECTS_HEADER } from "../../constants/constants";
import { TabsContext } from "../../contexts/tabsContext";

import LoginModal from "../../modals/loginModal";
import { Button } from "../../components/ui/button";


export default function HomePage() {
  const { login, isLogin,setIsLogin,flows,loginUserId, setTabId, downloadFlows, uploadFlows, setLoginUserId, removeFlow,folders,addFolder,removeFolder } =
    useContext(TabsContext);

  // Set a null id
  useEffect(() => {
    setTabId("");
    if(localStorage.getItem('login')){
      setIsLogin(true);
      setLoginUserId(localStorage.getItem('login'));
    }
  }, []);


  // Personal flows display
  return (
    <div className="main-page-panel ">
      <div className="main-page-nav-arrangement justify-center">
        <span className="main-page-nav-title">
          <IconComponent name="Home" className="w-6" />
          {USER_PROJECTS_HEADER}
        </span>
      </div>
      {/* <span className="main-page-description-text">
        Manage your NoteBooks. 
      </span> */}
      {(!localStorage.getItem('login'))&&(
        <LoginModal>
        </LoginModal>
     )}
    <div className="main-page-nav-arrangement justify-center">
      <div className="main-page-flows-display">
        {flows.length>0?(
          
          <CardComponent
            key={0}
            flow={flows[0]}
            id={flows[0].id}
            button={
              <Link to={"/flow/" + flows[0].id}>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap "
                >
                  开启您的梦想之旅
                </Button>
              </Link>
            }
          />
          ):(
            <Link to={"/flow/"+loginUserId}>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap "
                >
                  开启您的梦想之旅
                </Button>
              </Link>
          )
        }
      </div>
    </div>    

    </div>
    
  );
}
