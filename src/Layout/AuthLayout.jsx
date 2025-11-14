import { Outlet } from "react-router-dom";
import "./AuthLayout.css";
 function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        {/* child routes (เช่น Login, Register) จะโผล่ตรงนี้ */}
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;