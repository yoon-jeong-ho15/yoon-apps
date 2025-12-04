import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import LoginPage from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/route/AdminRoute";
import HomePage from "./pages/Home";
import Header from "./components/header/Header";
import ProtectedRoute from "./components/route/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col w-full h-screen bg-gray-200">
          <Header />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            {/* Admin-only routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
