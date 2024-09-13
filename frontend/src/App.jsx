import Login from './pages/Login'
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'
import SignUp from './pages/Register'
import { AuthProvider } from './context/AuthContext'

const Home = () => {
	return (
		<div>
			hello	khouna
		</div>
	)
}
function App() {
  return (
    <>
			<Router>
				<AuthProvider>
					<Routes>
						<Route path='login/' element={<Login />} />
						<Route path='register/' element={<SignUp />} />
						<Route path='home/' element={<Home />} />
					</Routes>
				</AuthProvider>
			</Router>
    </>
  )
}

export default App
