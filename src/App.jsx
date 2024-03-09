import { Route, Routes, Navigate } from "react-router-dom";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import NavBar from "./components/Navbar";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { ChatContextProvider } from "./context/ChatContext";
import { io } from "socket.io-client";
var socket = io('http://localhost:5002');
function App() {
  const { user } = useContext(AuthContext);
  const Disconnect = (second) => {
    console.log("ishaldi")
    socket.disconnect();


  }
  useEffect(() => {
    socket.on('getOnlineUsers', () => {
      console.log("connected")
    });
  }, [socket])
  return (
    <ChatContextProvider user={user}>
      <NavBar />
      <button onClick={Disconnect}>Dis Connect</button>
      <Container className="">
        <Routes>
          <Route path="/" element={user ? <Chat /> : <Login />} />
          <Route
            path="/register"
            element={user ? <Chat /> : <Register />}
          />
          <Route
            path="/login"
            element={user ? <Chat /> : <Login />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </ChatContextProvider>
  );
}

export default App;
