import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the 'q' parameter from the URL (e.g., /search?q=John)
  const query = searchParams.get("q");

  useEffect(() => {
    // If there's no query, don't search
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        // --- This is the backend call you need to create ---
        // It's expecting an array of user objects in response
        const res = await axios.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setResults([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); // This effect re-runs every time the 'query' in the URL changes

  // 1. Show a loading spinner
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // 2. Show the results (or no results message)
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Search Results for: <span className="text-indigo-600">"{query}"</span>
      </h1>

      {results.length > 0 ? (
        <div className="space-y-4">
          {/* Here we map over the results and show a "profile card" for each */}
          {results.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`}
              className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.profile_pic_url || "/default-profile.png"}
                  alt={user.full_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{user.full_name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  {user.location && (
                    <p className="text-gray-500 text-sm mt-1">{user.location}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        // 3. Show this if no results were found
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No results found for "{query}".</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;