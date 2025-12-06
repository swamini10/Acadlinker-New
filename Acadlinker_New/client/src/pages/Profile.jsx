import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import UserPosts from "../components/UserPosts";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { currentUser } = useAuth();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isCurrentUser = currentUser && currentUser.id === parseInt(userId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch profile and posts
        const [userRes, postsRes] = await Promise.all([
          axios.get(`/api/profile/${userId}`),
          axios.get(`/api/profile/${userId}/posts`),
        ]);

        setUser(userRes.data);
        setUserPosts(postsRes.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // ---------------------------
  // Friend Request Handlers
  // ---------------------------
  const sendFriendRequest = async () => {
    try {
      await axios.post(`/api/friends/send/${user.id}`, {}, { withCredentials: true });
      setUser((prev) => ({ ...prev, request_sent: true }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send friend request");
    }
  };

  const acceptFriendRequest = async () => {
    try {
      const res = await axios.post(`/api/friends/accept/${user.request_id}`, {}, { withCredentials: true });
      setUser((prev) => ({
        ...prev,
        request_received: false,
        is_friend: true,
      }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to accept friend request");
    }
  };

  const rejectFriendRequest = async () => {
    try {
      await axios.post(`/api/friends/reject/${user.request_id}`, {}, { withCredentials: true });
      setUser((prev) => ({
        ...prev,
        request_received: false,
      }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to reject friend request");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-40 text-gray-500 text-lg">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-40 text-red-500 text-lg">
        User not found!
      </div>
    );
  }

  // ---------------------------
  // Determine button state
  // ---------------------------
  const renderFriendButton = () => {
    if (isCurrentUser) return null;

    if (user.is_friend) {
      return (
        <Link
          to={`/messages/${user.id}`}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 shadow-md transition"
        >
          💬 Message
        </Link>
      );
    } else if (user.request_sent) {
      return (
        <button className="bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg" disabled>
          ✅ Request Sent
        </button>
      );
    } else if (user.request_received) {
      return (
        <div className="flex gap-2">
          <button
            onClick={acceptFriendRequest}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 shadow-md transition"
          >
            ✅ Accept
          </button>
          <button
            onClick={rejectFriendRequest}
            className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 shadow-md transition"
          >
            ❌ Reject
          </button>
        </div>
      );
    } else {
      return (
        <button
          onClick={sendFriendRequest}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md transition"
        >
          ➕ Add Friend
        </button>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LEFT: Profile Info */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden relative">
              <div className="relative h-48 bg-gray-200">
                {user.cover_photo_url ? (
                  <img
                    src={user.cover_photo_url}
                    alt="Cover"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full"></div>
                )}
                <div className="absolute inset-0 bg-black/10"></div>
              </div>

              <div className="relative z-10 p-6 flex flex-col items-center text-center -mt-20 sm:-mt-24">
                <img
                  src={user.profile_pic_url || "/default-profile.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg relative z-20"
                />

                <h2 className="text-3xl font-bold text-gray-900 mt-4">{user.full_name}</h2>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {user.location || "Location not set"}
                </p>

                <div className="mt-6 w-full flex justify-center">{renderFriendButton()}</div>
              </div>

              {isCurrentUser && (
                <Link
                  to="/edit-profile"
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-indigo-700 font-medium px-4 py-2 rounded-lg hover:bg-white transition shadow-md z-30"
                >
                  ✏️ Edit Profile
                </Link>
              )}
            </div>

            {/* BIO */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bio</h3>
              <p className="text-gray-600 leading-relaxed">{user.description || "This user hasn't added a bio yet."}</p>
            </div>

            {/* Contact & Education */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact & Education</h3>
              <div className="space-y-3 text-gray-700">
                <p>{user.education || "No education listed"}</p>
                <p>{user.mobile_no || "No mobile listed"}</p>
                <p>{user.email}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills
                  ? user.skills.split(",").map((skill, i) => (
                      <span key={i} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                        {skill.trim()}
                      </span>
                    ))
                  : <p className="text-gray-500">No skills listed.</p>}
              </div>
            </div>
          </div>

          {/* RIGHT: Posts */}
          <div className="md:col-span-1 space-y-6">
            <div className="md:col-span-1">
  <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
    <h3 className="text-xl font-bold text-gray-900">Recent Posts</h3>
  </div>

  <UserPosts userId={userId} isCurrentUser={isCurrentUser} />
</div>
</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
