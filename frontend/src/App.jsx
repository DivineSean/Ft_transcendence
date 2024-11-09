import Login from './pages/Login'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import SignUp from './pages/Register'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './utils/PrivateRoute'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Games from './pages/Games'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Menu from './components/Menu'
import NotFound from './pages/NotFound'

const Reset = () => {
	return (
		<div>
			reset password here
		</div>
	)
}

function App() {
	return (
		<>
			<Router>
				<AuthProvider>
					<Routes>
						<Route path='forgot_password' element={<ForgotPassword />} />
						<Route path='api/reset/:uid/:token' element={<ResetPassword />} />
						<Route path='login/' element={<Login />} />
						<Route path='menu/' element={<Menu />} />
						<Route path='profile/' element={<Profile />} />
						<Route path='games/' element={<Games />} />
						{/* <Route path='play/:game/:room_id' element={<Game />} /> */}
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
