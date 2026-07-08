import React, { useState } from 'react';
import './Hero.css';

const platformData = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    imageType: 'Post',
    videoType: 'Reel',
    charLimit: 2200,
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" width="18" height="18" style={{borderRadius: '4px'}} />
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    imageType: 'Community Post',
    videoType: 'Short/Video',
    charLimit: 5000,
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube" width="18" height="18" />
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    imageType: 'Post',
    videoType: 'Reel/Video',
    charLimit: 63206,
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="#1877F2"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.15 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.33h3.32l-.53 3.5h-2.8V24C19.62 23.15 24 18.1 24 12.07z"/></svg>
  },
  x: {
    id: 'x',
    name: 'X',
    imageType: 'Tweet',
    videoType: 'Video Tweet',
    charLimit: 280,
    icon: <svg viewBox="0 0 24 24" width="14" height="14" fill="#000"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    imageType: 'Post',
    videoType: 'Video Post',
    charLimit: 3000,
    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="#0a66c2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  }
};

const platforms = ['instagram', 'youtube', 'facebook', 'x', 'linkedin'];

const handleDummyAction = (action) => {
  alert(`Action Triggered: ${action}\n(This is a functional UI prototype! Backend integrations coming soon.)`);
};

const Hero = () => {
  const [activeImgPlat, setActiveImgPlat] = useState('instagram');
  const [activeVidPlat, setActiveVidPlat] = useState('youtube');
  const [postingCard, setPostingCard] = useState(null);
  
  const imgData = platformData[activeImgPlat];
  const vidData = platformData[activeVidPlat];

  const handlePublish = async (platformName, cardType) => {
    setPostingCard(cardType);
    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: platformName,
          content: `Automated test post to ${platformName} from SocialHub`,
          type: 'Post'
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`✅ Success!\nBackend says: ${data.message}`);
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert(`⚠️ Network Error: Make sure the backend server is running on port 5000!`);
    } finally {
      setPostingCard(null);
    }
  };

  return (
    <section className="hero-section">
      {/* Background Grid */}
      <div className="bg-grid"></div>

      {/* Floating Icons & Blobs */}
      <div className="floating-elements">
        <div className="floating-icon icon-x"><svg viewBox="0 0 24 24" fill="#18181b"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg></div>
        <div className="floating-icon icon-youtube"><img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube" /></div>
        <div className="floating-icon icon-linkedin"><svg viewBox="0 0 24 24" fill="#0a66c2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></div>
        <div className="floating-icon icon-bluesky"><svg viewBox="0 0 24 24" fill="#0085ff"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 1.045 1.258.9 1 1.77c-.198.672-.346 3.82-.44 4.88-.302 3.42 1.405 4.342 3.518 4.673l-2.483.606c-2.404.706-3.155 2.37-2.128 4.298 1.488 2.793 4.834 5.253 7.643 6.643 1.545.764 2.502.822 4.89.822 2.388 0 3.345-.058 4.89-.822 2.81-1.39 6.155-3.85 7.643-6.643 1.027-1.928.276-3.592-2.128-4.298l-2.483-.606c2.113-.33 3.82-1.253 3.518-4.673-.094-1.06-.242-4.208-.44-4.88-.258-.87-1.566-.725-4.202 1.035-2.752 1.942-5.711 5.881-6.798 7.995Z"/></svg></div>
        <div className="floating-icon icon-pinterest"><svg viewBox="0 0 24 24" fill="#e60023"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.174 0 7.424 2.967 7.424 6.923 0 4.151-2.615 7.491-6.244 7.491-1.22 0-2.368-.634-2.763-1.385l-.752 2.865c-.272 1.043-.997 2.345-1.487 3.141 1.144.35 2.345.539 3.585.539 6.621 0 11.988-5.368 11.988-11.987C24 5.367 18.638 0 12.017 0z"/></svg></div>
        <div className="floating-icon icon-threads"><svg viewBox="0 0 24 24" fill="#18181b"><path d="M16.594 12.056c0 1.76-1.121 3.23-2.983 3.23-1.614 0-2.628-1.218-2.628-3.05 0-1.898 1.154-3.132 2.774-3.132 1.55 0 2.585 1.042 2.837 2.36h-1.637c-.16-.628-.616-1.018-1.228-1.018-.737 0-1.272.767-1.272 1.83 0 .977.492 1.638 1.255 1.638.718 0 1.254-.53 1.348-1.359h-1.408v-1.028h2.942v.529Zm5.35-6.52c-1.332-1.334-3.1-2.07-4.985-2.07-1.884 0-3.652.736-4.985 2.07-1.334 1.334-2.07 3.102-2.07 4.986 0 1.884.736 3.652 2.07 4.985 1.334 1.334 3.1 2.07 4.985 2.07 1.885 0 3.653-.736 4.986-2.07 1.333-1.334 2.07-3.1 2.07-4.985 0-1.885-.737-3.653-2.07-4.986ZM12.055 2.054C14.73 2.054 17.15 3.1 19.043 4.992c1.892 1.892 2.937 4.312 2.937 6.988 0 2.675-1.045 5.096-2.937 6.988-1.892 1.892-4.312 2.936-6.988 2.936s-5.095-1.044-6.987-2.936C3.176 17.076 2.13 14.655 2.13 11.98c0-2.676 1.045-5.096 2.938-6.988C6.96 3.1 9.38 2.054 12.055 2.054Z"/></svg></div>
        <div className="floating-icon icon-facebook"><svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.15 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.33h3.32l-.53 3.5h-2.8V24C19.62 23.15 24 18.1 24 12.07z"/></svg></div>
        
        {/* Blurred blobs */}
        <div className="blob blob-1 emoji-blur">🍑</div>
        <div className="blob blob-2 emoji-blur">🍕</div>
        <div className="blob blob-3 emoji-blur">✨</div>
        <div className="blob blob-4 emoji-blur">🎨</div>
      </div>

      <div className="hero-text-container">
        <h1 className="hero-title">Your social media<br/>workspace</h1>
        <p className="hero-subtitle">Share consistently without the chaos</p>
      </div>

      <div className="hero-cards-wrapper">
        {/* Main Create Post Card - Image */}
        <div className="app-card main-card">
          <div className="card-top-bar">
            <div className="top-bar-left">
              <span className="create-post-title">Create {imgData.name} {imgData.imageType}</span>
              <button className="tags-btn" onClick={() => handleDummyAction('Tags')}><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> Tags <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            </div>
            <div className="top-bar-right">
              <button className="top-bar-btn" onClick={() => handleDummyAction('Templates')}><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Templates</button>
              <button className="top-bar-btn btn-light" onClick={() => handleDummyAction('Preview')}><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Preview</button>
            </div>
          </div>
          
          <div className="card-body">
            <div className="card-body-left">
              <div className="platform-selector">
                {platforms.map(plat => (
                  <div key={plat} className={`platform-circle ${activeImgPlat === plat ? 'active' : 'inactive'}`} onClick={() => setActiveImgPlat(plat)}>
                    {platformData[plat].icon}
                  </div>
                ))}
                <div className="platform-circle inactive" onClick={() => handleDummyAction('Add Platform')}><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div>
              </div>
              
              <div className="compose-area">
                <div className="drag-drop-container">
                  <div className="drag-drop-area full-width" onClick={() => handleDummyAction('File Picker')}>
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <p>Drag & drop or <span className="text-link">select image</span> for {imgData.imageType}</p>
                  </div>
                </div>
                
                <div className="modern-caption-input">
                  <input type="text" placeholder="Add a caption..." />
                  <span className="char-count-inline">0 / {imgData.charLimit}</span>
                  <button className="emoji-btn" onClick={() => handleDummyAction('Emoji Picker')}>😊</button>
                </div>
                
                <div className="action-tags">
                  <button className="action-tag-btn" onClick={() => handleDummyAction('Add Music')}>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                    Music
                  </button>
                  <button className="action-tag-btn" onClick={() => handleDummyAction('Tag Someone')}>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    Tag
                  </button>
                </div>
              </div>
              
              <div className="compose-footer">
                <button className="start-thread-btn" style={{ marginLeft: 'auto' }} onClick={() => handleDummyAction('Start Thread')}><span className="plus-icon">+</span> Thread</button>
              </div>
            </div>
            
            <div className="card-body-right">
              <div className="preview-header">
                <span>{imgData.name} Preview</span>
                <span className="info-icon">ⓘ</span>
              </div>
              <div className="preview-skeleton-container">
                <div className="preview-skeleton">
                  <div className="skel-header">
                    <div className="skel-avatar"></div>
                    <div className="skel-lines">
                      <div className="skel-line w-long"></div>
                      <div className="skel-line w-short"></div>
                    </div>
                  </div>
                  <div className="skel-image"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card-footer">
            <button className="btn-draft" onClick={() => handleDummyAction('Save Draft')}>Save Draft</button>
            <button className="btn-schedule" disabled={postingCard === 'image'} onClick={() => handlePublish(imgData.name, 'image')}>
              {postingCard === 'image' ? 'Publishing...' : `Publish to ${imgData.name}`}
            </button>
          </div>
        </div>

        {/* Main Create Post Card - Video */}
        <div className="app-card main-card">
          <div className="card-top-bar">
            <div className="top-bar-left">
              <span className="create-post-title">Create {vidData.name} {vidData.videoType}</span>
              <button className="tags-btn" onClick={() => handleDummyAction('Tags')}><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> Tags <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            </div>
            <div className="top-bar-right">
              <button className="top-bar-btn" onClick={() => handleDummyAction('Templates')}><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> Templates</button>
              <button className="top-bar-btn btn-light" onClick={() => handleDummyAction('Preview')}><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Preview</button>
            </div>
          </div>
          
          <div className="card-body">
            <div className="card-body-left">
              <div className="platform-selector">
                {platforms.map(plat => (
                  <div key={plat} className={`platform-circle ${activeVidPlat === plat ? 'active' : 'inactive'}`} onClick={() => setActiveVidPlat(plat)}>
                    {platformData[plat].icon}
                  </div>
                ))}
                <div className="platform-circle inactive" onClick={() => handleDummyAction('Add Platform')}><svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></div>
              </div>
              
              <div className="compose-area">
                <div className="drag-drop-container">
                  <div className="drag-drop-area full-width" onClick={() => handleDummyAction('File Picker')}>
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    <p>Drag & drop or <span className="text-link">select video</span> for {vidData.videoType}</p>
                  </div>
                </div>
                
                <div className="modern-caption-input">
                  <input type="text" placeholder="Add a caption..." />
                  <span className="char-count-inline">0 / {vidData.charLimit}</span>
                  <button className="emoji-btn" onClick={() => handleDummyAction('Emoji Picker')}>😊</button>
                </div>
                
                <div className="action-tags">
                  <button className="action-tag-btn" onClick={() => handleDummyAction('Add Music')}>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                    Music
                  </button>
                  <button className="action-tag-btn" onClick={() => handleDummyAction('Tag Someone')}>
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    Tag
                  </button>
                </div>
              </div>
            </div>
            
            <div className="card-body-right">
              <div className="preview-header">
                <span>{vidData.name} Preview</span>
                <span className="info-icon">ⓘ</span>
              </div>
              <div className="preview-skeleton-container">
                <div className="preview-skeleton">
                  <div className="skel-header">
                    <div className="skel-avatar"></div>
                    <div className="skel-lines">
                      <div className="skel-line w-long"></div>
                      <div className="skel-line w-short"></div>
                    </div>
                  </div>
                  <div className="skel-video">
                    <svg viewBox="0 0 24 24" width="32" height="32" stroke="#a1a1aa" fill="none"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card-footer">
            <button className="btn-draft" onClick={() => handleDummyAction('Save Draft')}>Save Draft</button>
            <button className="btn-schedule" disabled={postingCard === 'video'} onClick={() => handlePublish(vidData.name, 'video')}>
              {postingCard === 'video' ? 'Publishing...' : `Publish to ${vidData.name}`}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
