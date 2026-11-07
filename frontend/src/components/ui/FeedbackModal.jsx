import React, { useState } from "react";
import { MessageSquare, Bug, Sparkles, Star, CheckCircle, X, Loader2 } from "lucide-react";
import { api } from "../../api/client";
import { Button } from "./Button";

export function FeedbackModal({ isOpen, onClose }) {
  const [category, setCategory] = useState("general");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim().length < 3) {
      setError("Please provide at least a few words of feedback.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.submitFeedback({
        category,
        comment: comment.trim(),
        rating: rating > 0 ? rating : null,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setComment("");
        setRating(0);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md rounded-[8px] bg-surface border border-border shadow-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" />
            <h2 id="feedback-modal-title" className="text-sm font-semibold text-content-primary">
              Share Feedback or Report an Issue
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="Close feedback modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-semantic-success-text mx-auto" />
            <h3 className="text-sm font-semibold text-content-primary">
              Thank you for your feedback
            </h3>
            <p className="text-xs text-content-secondary">
              Your submission has been recorded and will help improve DocuMind AI.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Category Selection */}
            <div>
              <label className="text-xs font-medium text-content-secondary block mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "general", label: "General", icon: MessageSquare },
                  { id: "bug", label: "Bug Report", icon: Bug },
                  { id: "feature", label: "Feature", icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = category === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-[5px] text-xs font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-accent-subtle text-accent border-accent/40 font-semibold"
                          : "bg-surface-subtle text-content-secondary border-border hover:bg-surface"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Rating */}
            <div>
              <label className="text-xs font-medium text-content-secondary block mb-1.5">
                Experience Rating (Optional)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-content-muted hover:text-accent transition-colors cursor-pointer"
                    aria-label={`Rate ${star} out of 5 stars`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        (hoverRating || rating) >= star
                          ? "fill-accent text-accent"
                          : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="feedback-comment" className="text-xs font-medium text-content-secondary block mb-1.5">
                Your Thoughts or Issue Details
              </label>
              <textarea
                id="feedback-comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What worked well? What broke or could be improved?"
                className="w-full text-xs p-2.5 rounded-[5px] bg-canvas border border-border text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
                maxLength={2000}
                required
              />
              <div className="flex justify-between items-center text-[10px] text-content-muted mt-1 font-mono">
                <span>Minimum 3 characters</span>
                <span>{comment.length} / 2000</span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-semantic-error-text bg-semantic-error-surface border border-semantic-error-border p-2 rounded-[4px]">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="secondary" size="xs" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="xs" loading={submitting} disabled={submitting}>
                Send Feedback
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
