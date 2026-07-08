import React from 'react';
import './Features.css';

const platformFeatures = [
  { name: 'Instagram', description: 'Schedule stories, reels, and carousel posts.' },
  { name: 'Facebook', description: 'Manage pages and groups efficiently.' },
  { name: 'Twitter (X)', description: 'Thread scheduling and engagement tracking.' },
  { name: 'LinkedIn', description: 'B2B content publishing and analytics.' },
  { name: 'TikTok', description: 'Video scheduling and trend analysis.' },
  { name: 'YouTube', description: 'Upload and schedule video content seamlessly.' }
];

const Features = () => {
  return (
    <section className="features container">
      <div className="features-header text-center animate-fade-in-up">
        <h2 className="text-3xl font-bold">Supported Platforms</h2>
        <p className="text-lg text-muted mt-2 max-w-2xl mx-auto">
          SocialHub integrates with all major social networks, giving you the power to reach your audience wherever they are.
        </p>
      </div>
      
      <div className="features-grid mt-8">
        {platformFeatures.map((platform, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon-placeholder">
              {platform.name[0]}
            </div>
            <h3 className="text-xl font-semibold mt-4">{platform.name}</h3>
            <p className="text-muted mt-2">{platform.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
