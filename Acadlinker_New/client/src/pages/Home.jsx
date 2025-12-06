import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Home Feed
  const fetchHomeFeed = async () => {
    try {
      const res = await api.get("/api/posts/home");
      setPosts(res.data);
    } catch (err) {
      console.error("Error loading feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeFeed();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 py-6">
      <div className="max-w-3xl mx-auto px-4">

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-500 py-20">
            Loading posts...
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow text-center text-gray-600">
            No posts yet. Add friends or create a post!
          </div>
        )}

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200"
            >
              {/* Post Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <img
                  src={post.user?.profile_pic || "/default-profile.png"}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <Link
                    to={`/profile/${post.user.id}`}
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    {post.user.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {new Date(post.date_posted).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Post Body */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {post.title}
                </h3>

                <p className="text-gray-700 mt-1 whitespace-pre-line">
                  {post.description}
                </p>

                {/* FILE HANDLING */}
                {post.file_url && (() => {
                  const url = post.file_url;
                  const ext = url.split(".").pop()?.toLowerCase() || "";
                  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);

                  if (isImage) {
                    return (
                      <img
                        src={url}
                        alt="Post"
                        className="mt-3 rounded-lg w-full max-h-96 object-cover"
                      />
                    );
                  }

                  return (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block bg-gray-200 px-3 py-2 rounded-lg text-indigo-700"
                    >
                      📎 Download File
                    </a>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Home;
