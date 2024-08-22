import Login from './components/Login'
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom'
import SignUp from './components/SignUp'

function App() {
  return (
    <>
			<BrowserRouter>
				<Routes>
					<Route path='login/' element={<Login />} />
					<Route path='register/' element={<SignUp />} />
				</Routes>
			</BrowserRouter>
    </>
  )
}

export default App
