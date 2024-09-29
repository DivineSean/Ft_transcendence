import Login from './pages/Login'
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'
import SignUp from './pages/Register'
import AuthContext, { AuthProvider } from './context/AuthContext'
import PrivateRoute from './utils/PrivateRoute'
import Home from './pages/Home'
import Chat from './pages/Chat'

// const Home = () => {
// 	const {user} = useContext(AuthContext);
// 	console.log('hello user: ', user);
// 	return (
// 		<div>
// 			<Header link='home' />
// 			hello	khouna
// 		</div>
// 	)
// }
function App() {
  return (
    <>
			<Router>
				<AuthProvider>
					<Routes>
						<Route path='login/' element={<Login />} />
						<Route path='register/' element={<SignUp />} />
						<Route path='home/' element={<PrivateRoute><Home /></PrivateRoute>} />
						<Route path='chat/' element={<PrivateRoute><Chat /></PrivateRoute>} />
					</Routes>
				</AuthProvider>
			</Router>
    </>
  )
}

export default App
