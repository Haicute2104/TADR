import { ConfigProvider } from "antd"
import viVN from "antd/locale/vi_VN"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider locale={viVN} theme={{ token: { colorPrimary: "#0f3d6e", borderRadius: 8 } }}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)
