import { ReactNode } from "react";
import { ReactFlowProvider } from "reactflow";
import { TooltipProvider } from "../components/ui/tooltip";
import { SSEProvider } from "./SSEContext";
import { AlertProvider } from "./alertContext";
import { DarkProvider } from "./darkContext";
import { LocationProvider } from "./locationContext";
import { TabsProvider } from "./tabsContext";
import { TypesProvider } from "./typesContext";
import { UndoRedoProvider } from "./undoRedoContext";
import { ApiInterceptorV2 } from "../controllers/API/api";
import { AuthProvider } from "./authContext";
import { BrowserRouter } from "react-router-dom";

export default function ContextWrapper({ children }: { children: ReactNode }) {
  //element to wrap all context
  return (
    <>
    <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <ReactFlowProvider>
          <DarkProvider>
            <TypesProvider>
              <LocationProvider>
                <AlertProvider>
                <ApiInterceptorV2 />
                  <SSEProvider>
                    <TabsProvider>
                      <UndoRedoProvider>{children}</UndoRedoProvider>
                    </TabsProvider>
                  </SSEProvider>
                </AlertProvider>
              </LocationProvider>
            </TypesProvider>
          </DarkProvider>
        </ReactFlowProvider>
      </TooltipProvider>
    </AuthProvider>  
    </BrowserRouter>
    </>
  );
}
