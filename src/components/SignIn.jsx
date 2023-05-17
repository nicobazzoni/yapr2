import React, { useState } from 'react';
import { auth } from '../../firebase';
import yicon from '../assets/yicon.jpg';
import {redirect} from 'react-router-dom';
import { useNavigate} from 'react-router-dom';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
const navigation = useNavigate()

  const handleLogin = () => {
    setError(''); // Clear the error state before logging in

    auth
      .signInWithEmailAndPassword(email, password) 
      .then(() => {
        console.log(email);
        navigation('/');
      })
      .catch((error) => setError(error.message));
  };

  const gotoSignUp = () => {
    navigation('/signup');
    };



  return (
    <div className="flex flex-col items-center justify-center bg-white mt-8">
      <img src={yicon} alt="YIcon" className="w-10 h-10 mb-4" />
      <h1 className="text-2xl font-bold mb-8">Log In</h1>
      <input
        className="w-80 p-2 border border-gray-300 mb-4"
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="off"
      />
      <input
        className="w-80 p-2 border border-gray-300 mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="off"
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        className="w-80 h-10 bg-blue-500 text-white font-bold rounded border border-blue-500"
        onClick={handleLogin}
      >
        Log In
      </button >
        <button
      className="w-80 mt-3 h-10 bg-blue-300 text-white font-bold rounded border border-blue-300"
        onClick={gotoSignUp}
        >
        Sign Up

      </button>
    </div>
  );
}