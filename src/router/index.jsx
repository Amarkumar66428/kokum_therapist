import React, { memo } from "react";
import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import ProtectedRoute from "./ProtectedRoutes";
import AppLayout from "../layout";
import NotFoundPage from "../components/pageNotFound";
import { authRouters, appRouters } from "./router.config";

const AppRouter = () => {
  return (
    <Routes>
      {authRouters.map(({ path, component }) => (
        <Route
          key={path}
          path={path}
          element={React.createElement(component)}
        />
      ))}
      {appRouters.map(
        ({
          path,
          component,
          title = "",
          isLayout = true,
          inSideMenu = false,
          showSideMenu = false,
          role,
          isSearch = false,
          isPatientView = false,
        }) => {
          const content = React.createElement(component);
          const wrappedContent = isLayout ? (
            <AppLayout
              title={title}
              inSideMenu={inSideMenu}
              showSideMenu={showSideMenu}
              isSearch={isSearch}
              isPatientView={isPatientView}
            >
              {content}
            </AppLayout>
          ) : (
            content
          );

          return (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute role={role}>{wrappedContent}</ProtectedRoute>
              }
            />
          );
        }
      )}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default memo(AppRouter);
