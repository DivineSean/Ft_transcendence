import Login from "./pages/authentication/Login";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from "./pages/authentication/Register";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./utils/PrivateRoute";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import ResetPassword from "./pages/authentication/ResetPassword";
import Games from "./pages/Games";
import Menu from "./components/Menu";
import NotFound from "./pages/NotFound";
import TwoFA from "./pages/authentication/TwoFA";
import SetUpUsername from "./pages/authentication/SetUpUsername";
import Rankings from "./pages/Rankings";
import GameManager from "./games/GameManager";
import Header from "./components/Header";
import { UserProvider } from "./context/UserContext";
import PongLocal from "./games/pong/PongLocal/PongLocal";
import { NotifProvider } from "./context/NotifContext";
import Tournaments from "./pages/Tournaments";

function App() {
  return (
    <>
      <div className="backdrop-blur-sm w-full h-full absolute top-0 right-0 z-[-1]"></div>
      <Router>
        <AuthProvider>
          <NotifProvider>
            <UserProvider>
              <Routes>
                <Route path="forgotpassword/" element={<ForgotPassword />} />
                <Route
                  path="forgotpassword/:uid"
                  element={<ForgotPassword />}
                />
                <Route path="setupusername/:uid" element={<SetUpUsername />} />
                <Route path="twofa/:uid" element={<TwoFA />} />
                <Route path="login/" element={<Login />} />
                <Route path="menu/" element={<Menu />} />
                <Route path="profile/" element={<Profile />} />
                <Route path="profile/:section/" element={<Profile />} />
                <Route
                  path="profile/:section/:username"
                  element={<Profile />}
                />
                <Route
                  path="games/:game/local"
                  element={<PongLocal />}
                />
                <Route
                  path="games/:game/:mode/:uuid"
                  element={<GameManager />}
                />
                <Route path="games/*" element={<Games />} />
                <Route path="register/" element={<SignUp />} />
                <Route path="home/" element={<Home />} />
                <Route path="chat/" element={<Chat />} />
                <Route path="chat/:uid" element={<Chat />} />
                <Route path="rankings" element={<Rankings />} />
                <Route path="tournaments/" element={<Tournaments />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </UserProvider>
          </NotifProvider>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
