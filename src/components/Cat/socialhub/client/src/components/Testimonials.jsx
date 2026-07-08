import React from 'react';
import './Testimonials.css';

const testimonials = [
  {
    quote: "SocialHub has completely transformed how our marketing team operates. We save hours every week.",
    author: "Sarah Jenkins",
    role: "Marketing Director"
  },
  {
    quote: "The ability to publish a video to TikTok, YouTube Shorts, and Instagram Reels simultaneously is a game changer.",
    author: "David Chen",
    role: "Content Creator"
  },
  {
    quote: "Best investment for our agency. Managing 20+ client profiles is now a breeze.",
    author: "Amanda Lewis",
    role: "Agency Owner"
  }
];

const Testimonials = () => {
  return (
    <section className="testimonials container">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Loved by creators and teams</h2>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="testimonial-card">
            <div className="quote-icon">"</div>
            <p className="testimonial-quote">"{testimonial.quote}"</p>
            <div className="testimonial-author mt-4">
              <div className="author-avatar">{testimonial.author[0]}</div>
              <div className="author-info">
                <h4 className="font-semibold">{testimonial.author}</h4>
                <p className="text-sm text-muted">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
