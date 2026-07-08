import React from 'react';
import './HowItWorks.css';

const steps = [
  {
    number: '01',
    title: 'Upload Media',
    description: 'Drag and drop your photos, videos, and graphics into our unified media library.'
  },
  {
    number: '02',
    title: 'Craft Content',
    description: 'Write captions, add hashtags, and customize the message for each platform.'
  },
  {
    number: '03',
    title: 'Schedule & Publish',
    description: 'Set a date and time, and we will automatically publish it everywhere for you.'
  }
];

const HowItWorks = () => {
  return (
    <section className="how-it-works container">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">How it Works</h2>
        <p className="text-lg text-muted mt-2">Publishing content has never been easier</p>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step-card">
            <div className="step-number">{step.number}</div>
            <h3 className="text-xl font-semibold mt-4">{step.title}</h3>
            <p className="text-muted mt-2">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
