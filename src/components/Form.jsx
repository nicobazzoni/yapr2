import React, { useState, useContext, useEffect } from 'react';
import { storage, db } from '../../firebase';
import firebase from 'firebase/compat/app';
import { AuthContext } from '../contexts/AuthContext';  // Update with your path
import { auth , firestore} from '../../firebase';
import { useNavigate } from 'react-router-dom';
import yicon from '../assets/yicon.jpg';
import { toast } from 'react-toastify';



const UploadForm = () => {
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [tag, setTag] = useState("");
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();


  const { currentUser } = useContext(AuthContext);  // Update with your path

   // Add this state

  // In fetchUserData()
  const fetchUserData = async (uid) => {
    try {
      const userRef = firestore.collection('users').doc(uid);
      const userSnapshot = await userRef.get();
  
      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        setUser({ id: userSnapshot.id, ...userData });
        setLoading(false); // Set loading to false here
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  // In the useEffect()
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUser(null);
        setLoading(false); // Set loading to false here too
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

  const CustomToast = ({ closeToast }) => (
    <div className="flex items-center bg-blue-600 text-white text-sm font-medium px-4 py-3" role="alert">
      <div className="w-4 h-4 mr-2">
        <img src={yicon} alt="MyIcon" />
      </div>
      <div>
        <p>Your message was uploaded successfully!</p>
      </div>
      <div className="ml-auto pl-3">
        <svg className="h-6 w-6" role="button" onClick={closeToast} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zM10 11a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zM6 9a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zM6 11a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
  
  
  
 

  const handleUpload = () => {
    
    if (user && user.username && user.photoURL) {
      const username = user.username;
      const photo = user.photoURL;
      const uploadTask = storage.ref(`images/${image.name}`).put(image);
      const uid = currentUser.uid; 
     
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
                imageUrl: url,
                uid: uid, 
              }).then(() => {
                // The upload has been successful, show a toast:
                toast(<CustomToast />, {
                  position: "bottom-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                });
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
        <div>
        <h1 className="text-xs font-bold text-start font-mono text-blue-200">create yap</h1>
      </div>
     
      
  
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
          disabled={!user || loading}  
        >
          Upload
        </button>
        {preview && <img src={preview} alt="preview" />}
      </div>
    </div>
  );
  
  


};

export default UploadForm;
