import React, { useContext, useEffect, useRef, useState } from 'react';
import { auth, firestore, storageRef, db, timestamp } from '../../firebase';
import { AuthContext } from '../contexts/AuthContext';
import firebase from 'firebase/compat/app';
import { format } from 'date-fns';
import ReactAudioPlayer from 'react-audio-player';
import { v4 as uuid } from 'uuid';
import ReplyComponent from './ReplyComponent';
import { MdDelete } from 'react-icons/md';
import RandomImageGenerator from './RandomImageGenerator';
import axios from 'axios';
import yicon from '../assets/yicon.jpg';
import { toast } from 'react-toastify';
import './styles.css';
import kick from '../assets/kick.wav';


const Chat = () => {
  const [audioRecording, setAudioRecording] = useState(null);
  const audioRecorderRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const [tag, setTag] = useState('');
  const [user, setUser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);
  const [showReply, setShowReply] = useState(false);
  const [replyRecordingId, setReplyRecordingId] = useState('');
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [formVisible, setFormVisible] = useState(false); 

const { currentUser } = useContext(AuthContext);



const playKick= () => {
  const audio = new Audio(kick);
  audio.play();
};

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUser(user.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUser = async (userId) => {
    try {
      const userRef = firestore.collection('users').doc(userId);
      const userSnapshot = await userRef.get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        setUser({ id: userSnapshot.id, ...userData });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = firestore
      .collection('audioFiles')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const files = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAudioFiles(files);
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioRecorder = new MediaRecorder(stream);
        audioRecorderRef.current = audioRecorder;
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });

    return () => {
      if (audioRecorderRef.current) {
        audioRecorderRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPlaying(true);
    const audioRecorder = audioRecorderRef.current;
    if (audioRecorder) {
      const chunks = [];
      audioRecorder.addEventListener('dataavailable', (event) => {
        chunks.push(event.data);
      });
      audioRecorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const recordingId = uuid(); // Generate unique ID using uuid()
        setAudioRecording({ id: recordingId, blob });
      });
      audioRecorder.start();
    }
    
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPlaying(false);
    const audioRecorder = audioRecorderRef.current;
    if (audioRecorder) {
      audioRecorder.stop();
    }
  };

   const handlePlayback = () => {
    const audioPlayer = audioPlayerRef.current;
    if (audioPlayer) {
      audioPlayer.play();
    }
  };
  

  const handleReplyButtonClick = (recordingId) => {
    setShowReply(true);
    setReplyRecordingId(recordingId);
  
  };



  const handleSave = async (recording, tag, user) => {
    if (user && user.username && user.photoURL && recording && tag && selectedImage) {
      const filename = `${uuid()}.m4a`; // Generate a unique filename using uuid()
      const username = user.username;
      const photo = user.photoURL;
      const uid = currentUser.uid;
  
      try {
        const audioFileRef = storageRef.child(`audio/${username}/${filename}`);
        await audioFileRef.put(recording.blob, { contentType: 'audio/mp4' }); // Specify the content type as MP4 (AAC format)
        const audioFileUrl = await audioFileRef.getDownloadURL();
  
        const imageRef = storageRef.child(`images/${selectedImage.name}`);
        await imageRef.put(selectedImage);
        const imageURL = await imageRef.getDownloadURL();
  
        const audioFileDoc = db.collection('audioFiles').doc();
        const docId = audioFileDoc.id;
        await audioFileDoc.set({
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          photoURL: photo,
          username: username,
          uid: uid,
          tag: tag,
          url: audioFileUrl,
          replyTo: replyRecordingId,
          image: imageURL,
        });
  
        toast(<CustomToast />, {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 3000,
          hideProgressBar: true,
          closeButton: false,
          draggable: false,
        });
  
        setTag('');
        setSelectedImage(null); // Reset selected image state
        handleReplyButtonClick(''); 
       
        toast.success('Yap shared successfully!');
      } catch (error) {
        console.error('Error saving audio file:', error);
      }
    } else {
      console.log('Missing user, audio recording, tag, or image');
    }
  };
  
  
  
  
  

  const fetchReplies = async (audioFileId) => {
    try {
      const repliesSnapshot = await firestore
        .collection('audioReplies')
        .where('parentPostId', '==', audioFileId || '') // Provide a fallback value if audioFileId is undefined
        .orderBy('createdAt', 'asc')
        .get();
  
      const repliesData = repliesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return repliesData;
    } catch (error) {
      console.error('Error fetching replies:', error);
      return [];
    }
  };
  
  

  const fetchAudioFilesAndReplies = async () => {
    try {
      const audioFilesSnapshot = await firestore
        .collection('audioFiles')
        .orderBy('createdAt', 'desc')
        .get();
  
      const audioFilesData = audioFilesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      const audioFilesWithReplies = await Promise.all(
        audioFilesData.map(async (audioFile) => {
          const repliesData = await fetchReplies(audioFile.id); // Pass audioFile.id as the parameter
          return { ...audioFile, replies: repliesData };
        })
      );
  
      setAudioFiles(audioFilesWithReplies);
      console.log('audioFilesWithReplies', audioFilesWithReplies);
    } catch (error) {
      console.error('Error fetching audio files and replies:', error);
    }
  };
  
  useEffect(() => {
    fetchAudioFilesAndReplies();
  }, []);
  
  
  

  const handlePlayAudio = (url, file) => {
    setAudioPlaying(true);
    setIsPlaying(true);
    
  
    const { username, tag } = file;
    const audioPlayer = new Audio(url);
    audioPlayer.play();
    audioPlayer.volume = 1;
    audioPlayer.ignoreMobileRestrictions = true;
    
  
    // Display a toast message
    toast(`Playing audio by ${username}. Tag: ${tag}`);
  };

  const handlePlayReply = (url, file, reply) => {
   
    setIsPlaying(true);
  
    const { username, tag } = reply;
    const Myusername = reply.username;
    const Mytag = reply.tag;
  
    const audioPlayer = new Audio(url);
    audioPlayer.play();
    audioPlayer.volume = 1;
    audioPlayer.ignoreMobileRestrictions = true;
    // Display a toast message with the reply and file data
    toast(`Playing audio by ${Myusername}. Tag: ${Mytag}`);
  
    // You can also use the file data for other purposes within this function if needed
    console.log('File:', file);
  };
 
  


  const handleDelete = async (id, username) => {
    if (user && user.username === username) {
      try {
        await firestore.collection('audioFiles').doc(id).delete();
        console.log('Document successfully deleted!');
  
        // Filter out the deleted audio file from audioFiles state
        const updatedAudioFiles = audioFiles.filter((file) => file.id !== id);
        setAudioFiles(updatedAudioFiles);
  
        // Filter out the replies associated with the deleted audio file from replies state
        const updatedReplies = replies.filter((reply) => reply.parentPostId !== id);
        setReplies(updatedReplies);
      } catch (error) {
        console.error('Error removing document: ', error);
        // Handle the error
      }
    } else {
      console.log('You are not authorized to delete this document.');
      // Handle the error
    }
  };
  
  
  const handleReplyDelete = async (id, username) => {
    if (user && user.username === username) {
      try {
        await firestore.collection('audioReplies').doc(id).delete();
        console.log('Document successfully deleted!');
  
        // Update the state by removing the deleted reply from the replies array
        setReplies((prevReplies) => prevReplies.filter((reply) => reply.id !== id));
  
        // Fetch the updated audio files and replies
        fetchAudioFilesAndReplies();
        toast.success('Reply deleted successfully!');
      } catch (error) {
        console.error('Error removing document: ', error);
        // Handle the error
      }
    } else {
      console.log('You are not authorized to delete this document.');
      // Handle the error
    }
  };
  
  
  
  
  
  
  
  

  const CustomToast = ({ closeToast }) => (
    <div className="flex items-center bg-blue-600 text-white text-sm font-medium px-4 py-3" role="alert">
      <div className="w-4 h-4 mr-2">
        <img src={yicon} alt="MyIcon" />
      </div>
      <div>
        <p>Your yap was shared!</p>
      </div>
      <div className="ml-auto pl-3">
        <svg className="h-6 w-6" role="button" onClick={closeToast} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zM10 11a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1zM6 9a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zM6 11a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );


  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };
  
  const handleFormToggle = () => {
    setFormVisible(!formVisible);
  };


  
 
  

  return (
    <div className="mt-8">
      <img src={yicon} className="w-12 h-12 border  rounded-full mx-auto" />
      <h2 className="text-sm bg-yellow-300 flex max-w-fit font-bold p-1 font-mono tracking-widest mb-4">voice</h2>
      <button onClick={playKick} className="bg-red-500 mb-2 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none">
      Test Sound
    </button>
      {/* FORM */}
      {currentUser && user && user.username && user.photo && (
        <h3 className="text-lg font-semibold mb-2">Logged in as:{user && user.username}</h3>
      )}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-2">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-2">
          <button
            className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none ${isPlaying ? 'animate-pulse' : ''}`}
            onClick={handleStartRecording}
          >
            Talk
          </button>
          <button
            className="bg-rose-500 hover:bg-rose-600 text-black py-2 px-4 rounded focus:outline-none"
            onClick={handleStopRecording}
          >
            Stop
          </button>
          <button
          
            className="bg-black hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none"
            onClick={handlePlayback}
          >
            Listen
          </button>
        </div>
        <div className="flex mb-1 flex-col md:flex-row lg:flex-row md:space-x-3 lg:space-x-4 items-center">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="write here..."
            className="px-3 py-1 border mb-2 rounded focus:outline-none"
            maxLength={120}
          />
     
          <input
        className="bg-blue-500 hover:bg-blue-600 w-72 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="file"
        onChange={handlePhotoChange}
        accept="image/*"
      />

        <button
          className="bg-slate-200 mt-2 hover:bg-rose-600 text-black py-2 px-4 rounded focus:outline-none"
          onClick={() => handleSave(audioRecording, tag, user)}
        >
          Save
        </button>
        </div>
      
      </div>


{/* yaps */}
      {audioRecording && (
        <audio ref={audioPlayerRef} src={URL.createObjectURL(audioRecording.blob)} />
      )}
       
      <div className="container mx-auto mt-8">
        <h2 className="text-2xl text-blue-200 p-1 font-mono font-bold mb-1">yaps</h2>

        <div className="">


  {audioFiles.map((file) => (
   <div key={file.id} className="bg-white space-y-2 border-black border-t-4 mt-8 p-1">

    <div className='flex justify-between items-center bg-stone-50 p-2'>
  <img src={file.photoURL} alt={file.username} className="w-10 h-10 shadow-md border border-slate-300 rounded-full mt-2 ml-2" />
  {file.createdAt && (
          <p style={{ fontSize: '10px' }} className="text-gray-600  font-mono">
            {format(file.createdAt.toDate(), 'MM·dd·yy - h:mm a')}
          </p>
        )}
  <a href={`/profile/${file.username}`} className="text-gray-600 text-xs bg-slate-50 hover:bg-rose-500 font-mono shadow-md rounded-full max-w-fit p-2">
    {file.username}
  </a>

</div>
<div className={  audioPlaying ? 'animation-ping 1s  ' : ''}>{file.tag}</div>
      <div className="flex justify-center ">
        <button
          className=" bg-cover mb-3 bg-center mt-2 shadow-slate-400 shadow-lg  w-full h-72 rounded-sm"
          style={{
            backgroundImage: `url(${file.image})`,
          }}
          onClick={() => handlePlayAudio(file.url, file)}
        >

        </button>
      </div>
      <div className="flex justify-between  items-center bg-white">

        
        {user && user.username === file.username && (
          <MdDelete
            className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 text-xs rounded focus:outline-none mt-2 -translate-y-4 translate-x-1"
            onClick={() => handleDelete(file.id, file.username)}
          />
        )}
      </div>
      <div
  className={`w-full bg-gray-100 p-2 rounded-md shadow-md mb-3 outline-none hover:bg-blue-200 cursor-pointer `}

  onClick={() => handlePlayAudio(file.url, file)}
>
  <h1 className="text-xs font-bold text-stone-500 font-mono">Listen</h1>
        </div>
              {/* Reply component */}
  <div className="border lg:w-1/2 border-spacing-14" />

      <button
        className="bg-blue-200 hover:bg-blue-400 text-white py-1 px-2 rounded focus:outline-none mt-2"
        onClick={() => handleReplyButtonClick(file.id)}
      >
        Reply
      </button>
      {showReply && file.id === replyRecordingId && (
        <ReplyComponent
          recordingId={replyRecordingId}
          handleReplyButtonClick={handleReplyButtonClick}
          fetchReplies={fetchReplies}
          audioFiles={audioFiles}
        />
      )}

      <h1 className="font-mono text-xs text-stone-500 border-t   text-bold">Replies</h1>
      {file.replies &&
  file.replies.map((reply) => (
    <div
      key={reply.id}
      className="mt-4 relative bg-slate-50 p-4 rounded-md shadow-md hover:bg-yellow-200 cursor-pointer flex justify-between items-center"
      
    >
      <div  style={{ width: '80%' }} className="relative">
        <div
          className="bg-cover bg-center mt-2 shadow-slate-400 shadow-lg w-10 h-10 rounded-full"
          style={{ backgroundImage: `url(${reply.photo})` }}
        ></div>
        <div onClick={() => handlePlayReply(reply.url, file, reply)} className="absolute inset-0 flex items-center justify-center">
          {reply.tag && (
            <div className="bg-white text-gray-800 hover:bg-blue-400 py-1 px-2 rounded">
              {reply.tag}
            </div>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-xs font-mono mt-1">
        {format(reply.createdAt.toDate(), 'MM·dd·yy - h:mm a')}
      </p>
      <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 ">
        <a
          href={`/profile/${reply.username}`}
          className="bg-blue-500 text-white px-2 py-1 rounded font-medium"
        >
          {reply.username}
        </a>
      </div>
      {user && user.username === reply.username && (
        <div className="mt-4 absolute top-0 right-0 transform translate-x-1 translate-y-1">
          <div className="delete-button-container" style={{ position: 'relative', zIndex: '10', marginTop: '10px', textAlign: 'right' }}>
            <div style={{ display: 'inline-block' }}>
              <MdDelete
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 text-xs rounded focus:outline-none"
                onClick={() => handleReplyDelete(reply.id, reply.username, file)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
    
  ))}
</div>
))}
</div>
</div>
</div>
  
  
   
  );
};

export default Chat;
