useEffect(() => {
  const container = containerRef.current;

  if (!container || !activeVideoId) return;

  const videosInFeed = container.querySelectorAll("video");

  videosInFeed.forEach((video) => {
    const reel = video.closest(".reel");

    if (reel?.dataset.videoId === activeVideoId) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, [activeVideoId]);