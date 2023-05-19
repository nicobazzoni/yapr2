import React, { useState, useContext, useEffect } from 'react';
import { storage, db } from '../../firebase';
import firebase from 'firebase/compat/app';
import { AuthContext } from '../contexts/AuthContext';  // Update with your path
import { auth , firestore} from '../../firebase';
import { useNavigate } from 'react-router-dom';
import yicon from '../assets/yicon.jpg';



const UploadForm = () => {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [tag, setTag] = useState("");
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);


  const navigate = useNavigate();


  const fetchUserData = async (uid) => {
    try {
      const userRef = firestore.collection('users').doc(uid);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        console.log('User Data:', userData); // Log user data to the console
        setUser({ id: userSnapshot.id, ...userData });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = e => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };
  
 

  const handleUpload = () => {
    if (user && user.username && user.photoURL) {
      const username = user.username;
      const photo = user.photoURL;
      const uploadTask = storage.ref(`images/${image.name}`).put(image);
  
      uploadTask.on(
        "state_changed",
        snapshot => {},
        error => {
          console.log(error);
        },
        () => {
          storage
            .ref("images")
            .child(image.name)
            .getDownloadURL()
            .then(url => {
              db.collection("uploads").add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                photoUrl: photo,
                message: message,
                tag: tag,
                username: username,
                imageUrl: url, // Save the imageUrl here
              });
            });
        }
      );
  
      navigate('/');
    } else {
      console.log("User not logged in, username not available, or photoURL not available!");
    }
  };
  
  
  


  return (
    <div className="flex flex-col justify-center items-center h-screen bg-blur" 
     style={{
      backgroundImage: `url(${yicon})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      }}>
     
      
  
      <div className=" grid">
        <input 
          id="fileInput"
          className="hidden " 
          type="file" 
          onChange={handleChange} 
        />
        <label 
          htmlFor="fileInput"
          className="m-2 p-2 bg-blue-500 text-white cursor-pointer hover:bg-blue-700"
        >
          Photo
        </label>
        <textarea 
          className="m-2 p-2 border border-blue-400 outline-none rounded-md" 
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Message"
          maxLength="200" // Limit to 200 characters
        />
        <input 
          className="m-2 p-2 border  border-blue-400 rounded-full" 
          type="text"
          value={tag}
          onChange={e => setTag(e.target.value)}
          placeholder="Tag"
          maxLength="10" // Limit to 10 characters
        />
        <button 
          className="m-2 p-2 bg-blue-300 text-white hover:bg-blue-700 rounded-full" 
          onClick={handleUpload}
        >
          Upload
        </button>
        {preview && <img src={preview} alt="preview" />}
      </div>
    </div>
  );
  
  


};

export default UploadForm;
