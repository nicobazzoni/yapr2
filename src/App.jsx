import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router , Routes, Route, Form} from 'react-router-dom'
import Home from './components/Home'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import Header from './components/Header'
import UploadForm from './components/Form'

import { AuthProvider } from './contexts/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import DetailsPage from './pages/DetailsPage'
import ProfilePage from './pages/ProfilePage'
import UsernamePage from './pages/UsernamePage'
import VoiceCallRoom from './components/Chat'
import Room from './components/Room'


function App() {

  const [user, setUser] = useState(null);


  return (
    <>
     <ToastContainer />
    <AuthProvider>
      <Router>
        <header>
          <Header user={user}  />
        </header>
        <Routes>
  <Route path="/" element={<Home  />}/>
  <Route path="/signup" element={<SignUp />} />
  <Route path="/signin" element={<SignIn />} />
  <Route path="/form" element={<UploadForm user={user} />} />
  <Route path="/username" element={<UsernamePage />} />
  <Route path="/details/:itemId" element={<DetailsPage />} />
  <Route path="/profile/:username" element={<ProfilePage />} />
  <Route path="/voicecall" element={<Room />} />



  <Route path="*" element={<h1>Not Found</h1>} />
</Routes>
     
      </Router>
      </AuthProvider>
    
    </>
  )
}

export default App
