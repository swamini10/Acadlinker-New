import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const [errorFriends, setErrorFriends] = useState(null);
  const [errorSuggestions, setErrorSuggestions] = useState(null);

  // -----------------------------  
  // Fetch Friends  
  // -----------------------------
  useEffect(() => {
    axios
      .get("/api/friends/list", { withCredentials: true })
      .then((res) => setFriends(res.data))
      .catch(() => setErrorFriends("Failed to fetch friends."))
      .finally(() => setLoadingFriends(false));
  }, []);

  // -----------------------------  
  // Fetch Suggestions  
  // -----------------------------
  useEffect(() => {
    axios
      .get("/api/suggestions/", { withCredentials: true })
      .then((res) => setSuggestions(res.data.data || []))
      .catch(() => setErrorSuggestions("Failed to fetch suggestions."))
      .finally(() => setLoadingSuggestions(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* ---------------- FRIENDS SECTION ---------------- */}
      <h2 className="text-3xl font-bold mb-6">Your Friends</h2>

      {loadingFriends ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : errorFriends ? (
        <p className="text-red-500 py-10">{errorFriends}</p>
      ) : friends.length === 0 ? (
        <p className="text-gray-500 py-10">You have no friends yet.</p>
      ) : (
        <div className="space-y-4 mb-10">
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
                  <h3 className="text-xl font-semibold text-gray-900">
                    {friend.name}
                  </h3>
                  <p className="text-gray-600">{friend.email}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ---------------- SUGGESTIONS SECTION ---------------- */}
      {/* ---------------- SUGGESTIONS SECTION ---------------- */}
<h2 className="text-3xl font-bold mb-6 mt-10">Suggestions for You</h2>

{loadingSuggestions ? (
  <div className="flex justify-center py-10">
    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
) : errorSuggestions ? (
  <p className="text-red-500 py-10">{errorSuggestions}</p>
) : suggestions.length === 0 ? (
  <p className="text-gray-500 py-10">No suggestions available.</p>
) : (
  <div className="space-y-4">
    {suggestions.map((user) => (
      /* CHANGE 1: Change <div> to <Link> and add 'to' prop */
      <Link
        key={user.id}
        to={`/profile/${user.id}`} 
        className="block bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
      >
        <div className="flex items-center space-x-4">
          <img
            /* CHANGE 2: Ensure this matches what your backend sends (profile_image or profile_pic) */
            src={user.profile_image || "/default-profile.png"}
            alt={user.name} /* Note: Backend sends 'name', not 'full_name' in suggestions */
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {user.name}
            </h3>
            <p className="text-gray-600 text-sm">{user.email}</p>

            {user.skills && (
              <p className="text-gray-500 text-sm mt-1">
                Skills: {user.skills.split(",").join(", ")}
              </p>
            )}
          </div>
        </div>
      </Link>
    ))}
  </div>
)}
    </div>
  );
};

export default FriendsList;
