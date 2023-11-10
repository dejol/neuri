import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CardComponent } from "../../components/cardComponent";
import IconComponent from "../../components/genericIconComponent";
import { USER_PROJECTS_HEADER } from "../../constants/constants";
import { TabsContext } from "../../contexts/tabsContext";

import { Button } from "../../components/ui/button";
import { AuthContext } from "../../contexts/authContext";


export default function HomePage() {
  const { login,flows, setTabId, downloadFlows, uploadFlows, removeFlow,folders,addFolder,removeFolder } =
    useContext(TabsContext);
  const {userData} =  useContext(AuthContext);
  // Set a null id
  useEffect(() => {
    setTabId("");
    // if(userData&&userData.id){
    //   setLoginUserId(userData.id);
    // }
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
      {/* {(!localStorage.getItem('login'))&&(
        <LoginModal>
        </LoginModal>
     )} */}
    <div className="main-page-nav-arrangement justify-center align-middle w-full">
      <div 
      // className="main-page-flows-display "
      >
        {flows.length>0?(
          
          <CardComponent
            key={0}
            flow={flows[0]}
            id={flows[0].id}
            button={
              <Link to={"/app"}>
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
            <Link to={"/app"}>
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
