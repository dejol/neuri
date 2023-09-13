import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CardComponent } from "../../components/cardComponent";
import IconComponent from "../../components/genericIconComponent";
import { Button } from "../../components/ui/button";
import { USER_PROJECTS_HEADER } from "../../constants/constants";
import { TabsContext } from "../../contexts/tabsContext";
import ShadTooltip from "../../components/ShadTooltipComponent";
import FlowSettingsModal from "../../modals/flowSettingsModal";
export default function HomePage() {
  const { flows, setTabId, downloadFlows, uploadFlows, addFlow, removeFlow,folders,addFolder } =
    useContext(TabsContext);

  // Set a null id
  useEffect(() => {
    setTabId("");
  }, []);
  // const navigate = useNavigate();
  const [open,setOpen]=useState(false);

  const [newFolderId,setNewFolderId]=useState("");

  // Personal flows display
  return (
    <div className="main-page-panel">
      <div className="main-page-nav-arrangement">
        <span className="main-page-nav-title">
          <IconComponent name="Home" className="w-6" />
          {USER_PROJECTS_HEADER}
        </span>
        <div className="button-div-style">
          <Button
            variant="primary"
            onClick={() => {
              downloadFlows();
            }}
          >
            <IconComponent name="Download" className="main-page-nav-button" />
            Backup NoteBooks
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              uploadFlows();
            }}
          >
            <IconComponent name="Upload" className="main-page-nav-button" />
            Restore NoteBooks
          </Button>
          {/* <Button
            variant="primary"
            onClick={() => {
              addFlow(null, true).then((id) => {
                navigate("/flow/" + id);
              });
            }}
          >
            <IconComponent name="Plus" className="main-page-nav-button" />
            New NoteBook
          </Button> */}
        </div>
      </div>
      <span className="main-page-description-text">
        Manage your NoteBooks. 
      </span>

    {folders.map((folder, idx) => (
      <>
      <div className="header-menu-bar">
        {folder.name}
        <ShadTooltip content="New notebook" side="bottom">
        <Button
            size="sm"
            variant="link"
            onClick={() => {
              setNewFolderId(folder.id);
              // console.log("folder id is :",folder.id)
              setOpen(true)
            }}
          >
            <IconComponent name="Plus" className="main-page-nav-button" />
          </Button>
          </ShadTooltip>
      </div>      
      <div className="main-page-flows-display">
        {flows.map((flow, idx) => (
          (flow.folder_id && flow.folder_id==folder.id)&&(
          <CardComponent
            key={idx}
            flow={flow}
            id={flow.id}
            button={
              <Link to={"/flow/" + flow.id}>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap "
                >
                  <IconComponent
                    name="ExternalLink"
                    className="main-page-nav-button"
                  />
                  Edit
                </Button>
              </Link>
            }
            onDelete={() => {
              removeFlow(flow.id);
            }}
          />
          )
        ))}
        </div>
        </>
    ))}
      <div className="header-menu-bar">Other</div>      
      <div className="main-page-flows-display">
        {flows.map((flow, idx) => (
          !flow.folder_id&&(
          <CardComponent
            key={idx}
            flow={flow}
            id={flow.id}
            button={
              <Link to={"/flow/" + flow.id}>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap "
                >
                  <IconComponent
                    name="ExternalLink"
                    className="main-page-nav-button"
                  />
                  Edit
                </Button>
              </Link>
            }
            onDelete={() => {
              removeFlow(flow.id);
            }}
          />
          )
        ))}
        </div>
        <FlowSettingsModal
        open={open}
        setOpen={setOpen}
        isNew={true}
        newFolderId={newFolderId}
      ></FlowSettingsModal>
    </div>
    
  );
}
