"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  postedAt: string;
  helpful: number;
}

interface ReviewSectionProps {
  eventId: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              star <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ eventId }: ReviewSectionProps) {
  const storageKey = `nene_reviews_${eventId}`;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setReviews(JSON.parse(stored));
    } catch { /* silent */ }
  }, [storageKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter your name."); return; }
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (!comment.trim()) { setError("Please write a review."); return; }

    const newReview: Review = {
      id: Date.now().toString(),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      postedAt: new Date().toISOString(),
      helpful: 0,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    setName("");
    setComment("");
    setRating(0);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const markHelpful = (id: string) => {
    const updated = reviews.map((r) =>
      r.id === id ? { ...r, helpful: r.helpful + 1 } : r
    );
    setReviews(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" /> Reviews
          {reviews.length > 0 && (
            <span className="text-gray-500 text-base font-normal">({reviews.length})</span>
          )}
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(avgRating)} />
            <span className="text-sm font-bold text-gray-400">{avgRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Submit form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
          Leave a Review
        </h3>

        {submitted ? (
          <div className="flex items-center gap-3 text-green-400 py-4">
            <Star className="w-5 h-5 fill-green-400" />
            <span className="font-bold">Thanks for your review!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Your Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John M."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition placeholder:text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Rating
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition resize-none placeholder:text-gray-700"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4" /> Submit Review
            </button>
          </form>
        )}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
          <div className="text-4xl mb-3">💬</div>
          <h3 className="font-bold text-gray-400 mb-1">No reviews yet</h3>
          <p className="text-gray-600 text-sm">Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                    {review.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{review.name}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(review.postedAt).toLocaleDateString("en-KE", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <StarRating value={review.rating} />
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-3">{review.comment}</p>

              <button
                onClick={() => markHelpful(review.id)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                Helpful ({review.helpful})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
