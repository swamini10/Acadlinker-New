import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/friends/list", { withCredentials: true });
        setFriends(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch friends.");
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500">{error}</div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        You have no friends yet.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Your Friends</h2>
      <div className="space-y-4">
        {friends.map((friend) => (
          <Link
            key={friend.id}
            to={`/profile/${friend.id}`}
            className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
          >
            <div className="flex items-center space-x-4">
              <img
                src={friend.profile_image || "/default-profile.png"}
                alt={friend.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{friend.name}</h3>
                <p className="text-gray-600">{friend.email}</p>
                {friend.skills && (
                  <p className="text-gray-500 text-sm mt-1">
                    Skills: {friend.skills.split(",").join(", ")}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
