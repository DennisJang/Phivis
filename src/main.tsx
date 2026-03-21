
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import './i18n/index';
  // src/main.tsx
import './styles/theme.css';  // 시맨틱 토큰
import './styles/index.css';  // Tailwind + 기타

  createRoot(document.getElementById("root")!).render(<App />);
  