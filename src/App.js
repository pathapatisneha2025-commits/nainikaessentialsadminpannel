import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/LoginPage";
import ResetPassword from "./pages/ResetPassword";
import AdminLayout from "./components/Layout";
import ProductInventory from "./pages/ProductPage";
import OrdersPage from "./pages/Orders";
import ResetPasswordPage from "./pages/ResetPassword";
import ForgotPasswordPage from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminCoupons from "./pages/coupons";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage/>} />

        {/* Admin section with layout */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Redirect /admin to /admin/products */}
          <Route index element={<Navigate to="products" replace />} />

          {/* Admin child pages */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductInventory />} />
          <Route path="orders" element={<OrdersPage />} />
            <Route path="coupons" element={<AdminCoupons />} />

          {/* <Route path="sales" element={<CategoryOrdersPage />} /> */}
        </Route>

        {/* Catch-all 404 page */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
