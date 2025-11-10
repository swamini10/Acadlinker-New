import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const { currentUser } = useAuth();
  const { userId } = useParams();
  console.log(userId);
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isCurrentUser = currentUser && currentUser.id === parseInt(userId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

  const isFriend = user?.is_friend;
  const requestSent = user?.request_sent;
  const requestReceived = user?.request_received;

  // ✅ Send Friend Request + Create Notification
  const handleSendRequest = async () => {
    try {
      await axios.post(`/api/friends/send/${user.id}`);
      await axios.post(`/api/notifications/send`, {
        user_id: user.id,
        message: `${currentUser.full_name} sent you a friend request.`,
        link: `/profile/${currentUser.id}`,
      });
      alert("Friend request sent and notification delivered!");
      setUser((prev) => ({ ...prev, request_sent: true }));
    } catch (err) {
      console.error(err);
      alert("Error sending request.");
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

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* === LEFT SECTION: PROFILE INFO === */}
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

                <h2 className="text-3xl font-bold text-gray-900 mt-4">
                  {user.full_name}
                </h2>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {user.location || "Location not set"}
                </p>

                {/* === FRIEND / MESSAGE BUTTONS === */}
                <div className="mt-6 w-full flex justify-center">
                  {!isCurrentUser && (
                    <>
                      {isFriend ? (
                        <Link
                          to={`/messages/${user.id}`}
                          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 shadow-md transition"
                        >
                          💬 Message
                        </Link>
                      ) : requestSent || requestReceived ? (
                        <button
                          className="bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg"
                          disabled
                        >
                          ✅ Request Pending
                        </button>
                      ) : (
                        <button
                          onClick={handleSendRequest}
                          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 shadow-md transition"
                        >
                          ➕ Add Friend
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* === EDIT PROFILE BUTTON === */}
              {isCurrentUser && (
                <Link
                  to="/edit-profile"
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-indigo-700 font-medium px-4 py-2 rounded-lg hover:bg-white transition shadow-md z-30"
                >
                  ✏️ Edit Profile
                </Link>
              )}
            </div>

            {/* === BIO === */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bio</h3>
              <p className="text-gray-600 leading-relaxed">
                {user.description || "This user hasn't added a bio yet."}
              </p>
            </div>

            {/* === CONTACT === */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Contact & Education
              </h3>
              <div className="space-y-3 text-gray-700">
                <p>{user.education || "No education listed"}</p>
                <p>{user.mobile_no || "No mobile listed"}</p>
                <p>{user.email}</p>
              </div>
            </div>

            {/* === SKILLS === */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills ? (
                  user.skills.split(",").map((skill, i) => (
                    <span
                      key={i}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* === RIGHT SECTION: POSTS === */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Recent Posts
              </h3>
            </div>

            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden"
                >
                  <div className="p-4">
                    <h5 className="text-lg font-semibold text-gray-800">
                      {post.title}
                    </h5>
                    <p className="text-gray-700 mt-1 mb-3">
                      {post.description}
                    </p>
                  </div>

                  {post.file_name && (
                    <>
                      {["jpg", "jpeg", "png", "gif"].includes(
                        post.file_name.split(".").pop().toLowerCase()
                      ) ? (
                        <img
                          src={`/uploads/${post.file_name}`}
                          alt="Post"
                          className="w-full h-auto max-h-96 object-cover"
                        />
                      ) : (
                        <div className="px-4 pb-4">
                          <a
                            href={`/uploads/${post.file_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-indigo-600 hover:bg-indigo-100 transition"
                          >
                            📎 <span className="font-medium">Download File</span>
                          </a>
                        </div>
                      )}
                    </>
                  )}

                  <div className="border-t border-gray-100 px-4 py-2">
                    <small className="text-gray-500">
                      {new Date(post.timestamp).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-500 text-center py-10">No posts yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
