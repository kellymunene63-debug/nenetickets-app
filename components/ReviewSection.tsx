"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";

export default function ReviewSection() {
  // Mock Data: Initial reviews to make the page look populated
  const [reviews, setReviews] = useState([
    { id: 1, user: "John Doe", rating: 5, comment: "Absolutely insane energy! The sound system was top notch.", date: "2 days ago", likes: 12 },
    { id: 2, user: "Sarah K.", rating: 4, comment: "Great event, but the VIP line was a bit slow.", date: "1 week ago", likes: 5 }
  ]);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check if user is logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("nene_user_profile");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!comment || rating === 0) return;

    setIsSubmitting(true);
    
    // Simulate Network Request
    setTimeout(() => {
        const newReview = {
            id: Date.now(),
            user: user ? user.name : "Guest User",
            rating,
            comment,
            date: "Just now",
            likes: 0
        };
        // Add new review to the top of the list
        setReviews([newReview, ...reviews]);
        
        // Reset form
        setComment("");
        setRating(0);
        setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="mt-16 border-t border-white/10 pt-10">
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-500" /> 
            Reviews & Ratings <span className="text-gray-500 text-lg font-normal">({reviews.length})</span>
        </h3>

        {/* WRITE A REVIEW FORM */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
            <h4 className="font-bold mb-4">Leave a Review</h4>
            
            {/* Star Rating Input */}
            <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                        key={star}
                        onClick={() => setRating(star)}
                        className={`transition hover:scale-110 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                    >
                        <Star className="w-8 h-8" />
                    </button>
                ))}
            </div>
            
            <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..." 
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition h-32 resize-none mb-4"
            />
            
            <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !comment || rating === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2"
            >
                {isSubmitting ? "Posting..." : "Submit Review"}
            </button>
        </div>

        {/* REVIEWS LIST */}
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-4 animate-in fade-in slide-in-from-bottom-4">
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 border border-white/10">
                        {review.user.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h5 className="font-bold text-white">{review.user}</h5>
                                <div className="flex text-yellow-400 text-xs mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400' : 'text-gray-600'}`} />
                                    ))}
                                </div>
                            </div>
                            <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                        
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">{review.comment}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <button className="flex items-center gap-1 hover:text-blue-400 transition group">
                                <ThumbsUp className="w-3 h-3 group-hover:scale-110 transition" /> Helpful ({review.likes})
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}