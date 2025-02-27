import { message } from "antd";
import "./App.css";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { Home } from "./Home";
function App() {
  // Use the message hook from Ant Design to display messages.
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {/* Use HashRouter for routing in the application. */}
      <Router>
        <div className="mainWrapper">
          <main>
            {/* Define the routes for the application. */}
            <Routes>
              {/* Route for the home page, rendering the Home component. */}
              <Route path="/" element={<Home messageApi={messageApi} />} />
              
            </Routes>
          </main>
          {/* Context holder for displaying Ant Design messages. */}
          {contextHolder}
        </div>
      </Router>
    </>
  );
}

export default App;
