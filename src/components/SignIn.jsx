import React, { useState } from 'react';
import { auth } from '../../firebase';
import yicon from '../assets/yicon.jpg';
import { useNavigate } from 'react-router-dom';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent the default form submission

    setError(''); // Clear the error state before logging in

    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log(email);
        navigate('/');
      })
      .catch((error) => setError(error.message));
  };

  const gotoSignUp = () => {
    navigate('/signup');
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white mt-8">
      <img src={yicon} alt="YIcon" className="w-10 h-10 mb-4" />
      <h1 className="text-2xl font-bold mb-8">Log In</h1>
      <form onSubmit={handleLogin}>
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
          type="submit"
        >
          Log In
        </button>
      </form>
      <button
        className="w-80 mt-3 h-10 bg-blue-300 text-white font-bold rounded border border-blue-300"
        onClick={gotoSignUp}
      >
        Sign Up
      </button>
    </div>
  );
}
