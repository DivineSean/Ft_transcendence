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
import Header from "./components/Header";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
					<Routes>
						<Route path="forgotpassword/" element={<ForgotPassword />} />
						<Route path="forgotpassword/:uid" element={<ForgotPassword />} />
						<Route path="setupusername/:uid" element={<SetUpUsername />} />
						<Route path="twofa/:uid" element={<TwoFA />} />
						<Route path="login/" element={<Login />} />
						<Route path="menu/" element={<Menu />} />
						<Route path="profile/" element={<Profile />} />
						<Route path="profile/:section/" element={<Profile />} />
						<Route path="profile/:section/:username" element={<Profile />} />
						<Route path="games/" element={<Games />} />
						{/* <Route path='play/:game/:room_id' element={<Game />} /> */}
						<Route path="register/" element={<SignUp />} />
						<Route path="home/" element={<Home />} />
						<Route path="chat/" element={<Chat />} />
						<Route path="chat/:uid" element={<Chat />} />
						<Route path="rankings" element={<Rankings />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
