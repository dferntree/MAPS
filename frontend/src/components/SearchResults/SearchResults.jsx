import { useState, useEffect } from "react";
import ProfileFrame from "../../assets/ProfileFrame.png";
import BannerRed from "../../assets/BannerRed.png";
import { fetchReviews, fetchCourses, postReview } from "../../api/api";

// Accept 'searchedProfessor' as a prop
function SearchResults({ searchedProfessor, user }) {
  // State for fetched data
  const [professorReviews, setProfessorReviews] = useState([]);
  const [coursesTaught, setCoursesTaught] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the prop for the display name and API lookup
  const professorName = searchedProfessor || "Professor Not Found"; 

  // START: DATA FETCHING LOGIC

  // useEffect now depends on 'searchedProfessor'
  useEffect(() => {
    // Skip fetch if the prop is empty or null
    if (!searchedProfessor) {
        setIsLoading(false);
        setError("No professor name provided for search.");
        return;
    }

    // 1. Fetching Professor Reviews from Backend
    const fetchProfessorData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchReviews(searchedProfessor);
        setProfessorReviews(data); 

        // Fetch courses taught by this instructor
        const coursesData = await fetchCourses({ instructor: searchedProfessor });
        setCoursesTaught(coursesData);

      } catch (e) {
        console.error("Error fetching professor data:", e);
        setError("Failed to load professor data. Check server status or API route.");
        setProfessorReviews([]);
        setCoursesTaught([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessorData();

    // 2. TEMPORARY POKEMON IMAGE FETCH (This remains static for now)
    const randomId = Math.floor(Math.random() * 151) + 1;
    fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
      .then((res) => res.json())
      .then((data) => setTempImg(data))
      .catch((err) => console.error("Error fetching Pokémon:", err));
      
  }, [searchedProfessor]); // Reruns if the searchedProfessor prop changes

  // END: DATA FETCHING LOGIC 


  // State for the temporary Pokemon image
  const [tempImg, setTempImg] = useState(null);

  // START: DATA PROCESSING LOGIC

  // 1. Calculate distinct course names from reviews
  const distinctCourseNames = new Set(
    professorReviews.map(review => review.courseName)
  );

  // 2. Calculate Totals and Average
  const totalRatingsCount = professorReviews.length;
  const totalStarSum = professorReviews.reduce((sum, review) => sum + review.rating, 0);

  const averageStarRating =
    totalRatingsCount > 0
      ? (totalStarSum / totalRatingsCount).toFixed(1)
      : 0;

  // END: DATA PROCESSING LOGIC 

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("You must be logged in to post a review");
      return;
    }
    
    if (!reviewComment.trim()) {
      alert("Please enter a comment");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await postReview({
        instructor: searchedProfessor,
        userId: user.uid,
        rating: reviewRating,
        comment: reviewComment
      });
      
      // Refresh reviews
      const data = await fetchReviews(searchedProfessor);
      setProfessorReviews(data);
      
      // Reset form
      setReviewRating(5);
      setReviewComment("");
      
      alert("Review posted successfully!");
    } catch (err) {
      console.error("Failed to post review:", err);
      alert("Failed to post review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // START: RENDERING LOGIC

  // Handle Loading and Error States
  if (isLoading) {
    return <div className="text-center p-8">Loading data for {professorName}...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 font-bold">{error}</div>;
  }
  
  // Remove the early return - let the page render even with no reviews
  // Users can still see professor info and post the first review

  return (
    <>
      {/* background */}
      <div className="min-h-screen bg-amber-50 p-8 font-press">
        {/* Professor Header Section */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Professor Info Card */}
            <div className="bg-[rgb(224,202,148)] rounded-lg border-4 border-amber-800 p-8 shadow-lg">
              {/* Professor Name */}
              <h2 className="text-4xl font-bold text-amber-900 text-center mb-8 border-b-4 border-amber-800 pb-4">~{professorName}~</h2>

              {/* Centered Image */}
              <div className="relative mb-8 flex justify-center">
                <img
                  className="w-56 h-auto relative z-0"
                  src={tempImg ? tempImg.sprites.front_default : null}
                  alt={tempImg ? `Sprite of ${tempImg.name}` : "Overlay Content"}
                />
                <img
                  className="w-56 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  src={ProfileFrame}
                  alt="Profile Frame"
                />
              </div>

              {/* Rating Display */}
              <div className="flex flex-col items-center justify-center bg-white rounded-lg p-4 border-2 border-amber-800">
                <div className="text-3xl text-yellow-500 mb-2">
                  {"⭐".repeat(Math.floor(averageStarRating))}
                  {"☆".repeat(5 - Math.floor(averageStarRating))}
                </div>
                <h3 className="text-2xl font-bold text-amber-900">
                  {averageStarRating} / 5.0
                </h3>
                <p className="text-sm text-gray-600">
                  Based on {totalRatingsCount} reviews
                </p>
              </div>
            </div>

            {/* Courses Taught Card */}
            <div className="bg-[rgb(224,202,148)] rounded-lg border-4 border-amber-800 p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-amber-900 mb-4">Courses Taught</h3>
              <div className="bg-white rounded-lg p-4 h-[450px] overflow-y-auto border-2 border-amber-800 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-amber-200 [&::-webkit-scrollbar-thumb]:bg-amber-700 [&::-webkit-scrollbar-thumb]:rounded">
                <div className="space-y-3">
                  {coursesTaught.length > 0 ? (
                    coursesTaught.map((course, index) => (
                      <div key={index} className="bg-amber-50 rounded p-4 border-2 border-amber-600">
                        <div className="font-bold text-amber-900 text-lg mb-2">{course.courseTitle}</div>
                        <div className="space-y-1 text-sm text-amber-800">
                          <div><span className="font-semibold">Course Topic:</span> {course.courseTopic}</div>
                          <div><span className="font-semibold">Section:</span> {course.section}</div>
                          <div><span className="font-semibold">Room:</span> {course.room}</div>
                          <div><span className="font-semibold">Times:</span> {course.daysAndTimes}</div>
                          <div><span className="font-semibold">Mode:</span> {course.instructionMode}</div>
                          <div><span className="font-semibold">Dates:</span> {course.meetingDates}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-8">No courses found</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8 bg-[rgb(224,202,148)] rounded-lg border-4 border-amber-800 p-6 shadow-lg">
            <h2 className="text-3xl font-bold text-amber-900 mb-6">Ratings & Reviews</h2>
            
            {/* Add Review Form */}
            {user && (
              <div className="bg-white rounded-lg p-6 border-2 border-amber-600 mb-6">
                <h3 className="text-xl font-bold text-amber-900 mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label className="block text-amber-900 font-semibold mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-3xl transition-colors"
                        >
                          {star <= reviewRating ? "⭐" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-amber-900 font-semibold mb-2">Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full p-3 border-2 border-amber-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-800"
                      rows="4"
                      placeholder="Share your experience with this professor..."
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-amber-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-amber-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Posting..." : "Post Review"}
                  </button>
                </form>
              </div>
            )}
            
            {/* Existing Reviews */}
            <div className="space-y-4">
              {professorReviews.length > 0 ? (
                professorReviews.map((review, rIndex) => (
                  <div key={rIndex} className="bg-white rounded-lg p-6 border-2 border-amber-600">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-bold text-amber-900">{review.courseName}</h3>
                        </div>
                        <div className="text-sm text-gray-600">
                          {review.createdAt.slice(0, 10)}
                        </div>
                      </div>
                      <div className="text-yellow-500">
                        {"⭐".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-800">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg p-8 border-2 border-amber-600 text-center">
                  <p className="text-gray-600 text-lg">No reviews yet for this professor.</p>
                  <p className="text-gray-500 mt-2">Be the first to leave a review!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchResults;