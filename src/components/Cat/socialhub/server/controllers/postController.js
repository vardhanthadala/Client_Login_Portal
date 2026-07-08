// This is currently a MOCK controller for the prototype phase.
// It simulates connecting to various social media APIs.

exports.createPost = async (req, res) => {
  try {
    const { platform, content, type } = req.body;

    if (!platform || !content) {
      return res.status(400).json({ error: 'Platform and content are required' });
    }

    console.log(`📡 [Mock API] Sending ${type || 'post'} to ${platform}...`);
    console.log(`📝 Content: "${content}"`);

    // Simulate network delay to make it feel real (1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock successful response
    res.status(200).json({
      success: true,
      message: `Successfully posted to ${platform}!`,
      data: {
        platform,
        postId: `mock_${platform}_${Date.now()}`,
        status: 'published',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};
