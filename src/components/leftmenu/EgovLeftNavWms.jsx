import { NavLink } from "react-router-dom";
import URL from "@/constants/url";

function EgovLeftNavWms() {
  return (
    <div className="nav">
      <div className="inner">
        <h2>WMS</h2>
        <ul className="menu4">
          <li>
            <NavLink
              to={URL.WMS_INVENTORY}
              className={({ isActive }) => (isActive ? "cur" : "")}
            >
              재고조회
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default EgovLeftNavWms;
