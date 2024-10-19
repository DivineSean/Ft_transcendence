import Login from './pages/authentication/Login'
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'
import SignUp from './pages/authentication/Register'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './utils/PrivateRoute'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import ForgotPassword from './pages/authentication/ForgotPassword'
import ResetPassword from './pages/authentication/ResetPassword'
import Menu from './components/Menu'
import NotFound from './pages/NotFound'
import TwoFA from './pages/authentication/TwoFA'

function App() {
  return (
    <>
			<Router>
				<AuthProvider>
					<Routes>
						<Route path='forgot_password' element={<ForgotPassword />} />
						<Route path='reset/' element={<ResetPassword />} />
						<Route path='Twofa/:uid' element={<TwoFA />} />
						<Route path='login/' element={<Login />} />
						<Route path='menu/' element={<Menu />} />
						<Route path='profile/' element={<Profile />} />
						<Route path='register/' element={<SignUp />} />
						<Route path='home/' element={<Home />} />
						<Route path='chat/' element={<Chat />} />
						<Route path='*' element={<NotFound />} />
					</Routes>
				</AuthProvider>
			</Router>
    </>
  )
}

export default App
