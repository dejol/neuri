import { Route, Routes } from "react-router-dom";
import CommunityPage from "./pages/CommunityPage";
import FlowPage from "./pages/FlowPage";
import HomePage from "./pages/MainPage";
import { ProtectedLoginRoute } from "./components/authLoginGuard";
import LoginAdminPage from "./pages/AdminPage/LoginPage";
import { ProtectedRoute } from "./components/authGuard";
import LoginPage from "./pages/loginPage";
import { CatchAllRoute } from "./components/catchAllRoutes";
import { ProtectedAdminRoute } from "./components/authAdminGuard";
import AdminPage from "./pages/AdminPage";
import SignUp from "./pages/signUpPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";

const Router = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          // <ProtectedRoute>
            <HomePage />
          // </ProtectedRoute>
        }
      />
      {/* <Route path="/community" element={<CommunityPage />} /> */}
      {/* <Route path="/flow/:id/">
        <Route path="" element={<FlowPage />} />
      </Route> */}

      <Route
        path="*"
        element={
          <ProtectedRoute>
            <CatchAllRoute />
          </ProtectedRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <ProtectedLoginRoute>
            <SignUp />
          </ProtectedLoginRoute>
        }
      />
      <Route
        path="/login/admin"
        element={
          <ProtectedLoginRoute>
            <LoginAdminPage />
          </ProtectedLoginRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminPage />
          </ProtectedAdminRoute>
        }
      />
      <Route path="/app/"
      element={
          <ProtectedRoute>
            <FlowPage />
          </ProtectedRoute>
        }
        />

      <Route
        path="/login"
        element={
          <ProtectedLoginRoute>
            <LoginPage />
          </ProtectedLoginRoute>
        }
      />
      <Route path="/account">
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <ProfileSettingsPage />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="delete"
          element={
            <ProtectedRoute>
              <DeleteAccountPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="api-keys"
          element={
            <ProtectedRoute>
              <ApiKeysPage />
            </ProtectedRoute>
          }
        ></Route> */}
      </Route>            
    </Routes>
  );
};

export default Router;
