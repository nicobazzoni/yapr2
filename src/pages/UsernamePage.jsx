import React, { useEffect, useState } from 'react';
import { firestore } from '../../firebase';
import { Link } from 'react-router-dom';
import FollowButton from '../components/FollowButton';

const UsernamePage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = firestore.collection('users');
        const usersSnapshot = await usersRef.get();

        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="bg-white shadow-md justify-between items-center rounded-md p-6">
      
      <ul className="space-y-4">
        {users.map((user) => (
          <li key={user.id} className="flex items-center">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.username}
                className="w-10 h-10 rounded-full mr-4"
              />
            )}
            <Link
              to={`/profile/${user.username}`}
              className="text-blue-500 font-bold hover:underline"
            >
              {user.username}
            </Link>
            <h1 className=' ml-2 p-2 font-mono text-xs'style={{ fontSize: '8px' }}>
                 {user.email}
            </h1>
            <FollowButton className='absolute right-1' userId={user.id} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsernamePage;
