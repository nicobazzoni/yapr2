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

function App() {

  const [user, setUser] = useState(null);


  return (
    <>
    <AuthProvider>
      <Router>
        <header>
          <Header />
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/form" element={<UploadForm user={user} />} />
          <Route path="*" element={<h1>Not Found</h1>} />

        </Routes>
     
      </Router>
      </AuthProvider>
    
    </>
  )
}

export default App
