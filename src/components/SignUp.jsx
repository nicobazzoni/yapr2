import React, { useState } from 'react';
import { useRef } from 'react';
import yicon from '../assets/yicon.jpg';
import { auth, firestore } from '../../firebase';
import { useNavigate} from 'react-router-dom';

const SignUp = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState(null); // New state for photo URL
  const [error, setError] = useState(null);

const navigation = useNavigate()

  const handleSignUp = async () => {
    try {
      const { user } = await auth.createUserWithEmailAndPassword(email, password);
      await firestore.collection('users').doc(user.uid).set({
        email,
        username,
        photoURL, // Save photo URL in the user document
      });
      navigation('signin'); // Navigate to home screen
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      setPhotoURL(event.target.result); // Set the photo URL in state
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto text-center">
      <img src={yicon} className="mb-4" alt="Logo" />
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
      <input
        className="border border-gray-400 rounded px-3 py-2 mb-2 w-64"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        autoCapitalize="none"
      />
      <input
        className="border border-gray-400 rounded px-3 py-2 mb-2 w-64"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />
      <input
        className="border border-gray-400 rounded px-3 py-2 mb-2 w-64"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoCapitalize="none"
      />
      <input type="file" accept="image/*" onChange={handlePhotoUpload} />
      {photoURL && <img src={photoURL} alt="Profile" className=" rounded-full mt-4" />}
      <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={handleSignUp}>
        Sign Up
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default SignUp;
