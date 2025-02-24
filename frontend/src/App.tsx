import { message } from "antd";
import "./App.css";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Home } from "./Home";
function App() {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      <Router>
        <div className="mainWrapper">
          <main>
            <Routes>
              <Route path="/" element={<Home messageApi={messageApi} />} />
              
            </Routes>
          </main>
          {contextHolder}
        </div>
      </Router>
    </>
  );
}

export default App;
