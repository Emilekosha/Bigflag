const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };
  
  const loginForm = document.getElementById('loginForm');
  const adminForm = document.getElementById('adminForm');
  const errorMessage = document.getElementById('errorMessage');
  const videoGallery = document.getElementById('videos');
  let isAdminLoggedIn = false;
  
  const adminButtons = document.querySelector('.admin-buttons');
  
  let videos = [];
  
  function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
  
  const videoType = document.getElementById('videoType');
  const youtubeUrl = document.getElementById('youtubeUrl');
  const videoUpload = document.getElementById('videoUpload');
  
  videoType.addEventListener('change', function() {
    if (this.value === 'youtube') {
      youtubeUrl.style.display = 'block';
      youtubeUrl.required = true;
      videoUpload.style.display = 'none';
      videoUpload.required = false;
    } else {
      youtubeUrl.style.display = 'none';
      youtubeUrl.required = false;
      videoUpload.style.display = 'block';
      videoUpload.required = true;
    }
  });
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      loginForm.style.display = 'none';
      adminForm.classList.add('visible');
      adminButtons.classList.add('visible'); // Add this line
      errorMessage.style.display = 'none';
      isAdminLoggedIn = true;
    } else {
      errorMessage.style.display = 'block';
    }
  });
  
  document.getElementById('adminForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const videoTitle = document.getElementById('videoTitle').value;
    const selectedType = videoType.value;
    
    if (selectedType === 'youtube') {
      const ytUrl = youtubeUrl.value;
      const videoId = getYouTubeId(ytUrl);
      if (videoId) {
        addVideoToGallery(videoTitle, null, 'youtube', videoId);
        videos.push({ title: videoTitle, type: 'youtube', videoId: videoId });
        this.reset();
        alert('Vidéo YouTube ajoutée avec succès !');
      } else {
        alert('URL YouTube invalide');
      }
    } else {
      const videoFile = videoUpload.files[0];
      if (videoFile) {
        if (!videoFile.type.startsWith('video/')) {
          alert('Veuillez sélectionner un fichier vidéo valide');
          return;
        }
        
        if (videoFile.size > 100 * 1024 * 1024) {
          alert('La taille du fichier ne doit pas dépasser 100MB');
          return;
        }
        
        const videoUrl = URL.createObjectURL(videoFile);
        addVideoToGallery(videoTitle, videoUrl, 'file');
        videos.push({ 
          title: videoTitle, 
          type: 'file', 
          url: videoUrl,
          fileName: videoFile.name 
        });
        this.reset();
        alert('Vidéo ajoutée avec succès !');
      } else {
        alert('Veuillez sélectionner un fichier vidéo');
      }
    }
  });
  
  function addVideoToGallery(title, videoUrl, type, videoId = null) {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-gallery-item';
    
    if (type === 'file' && videoUrl) {
      videoItem.classList.add('loading');
    }
    
    let videoContent = '';
    if (type === 'youtube') {
      videoContent = `
        <div class="youtube-container">
          <iframe src="https://www.youtube.com/embed/${videoId}" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen></iframe>
        </div>
      `;
    } else {
      videoContent = `
        <div class="custom-video-player">
          <video>
            <source src="${videoUrl}" type="video/mp4">
            <source src="${videoUrl}" type="video/webm">
            <source src="${videoUrl}" type="video/ogg">
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
          <div class="video-controls">
            <button class="play-btn">►</button>
            <button class="volume-btn">🔊</button>
            <div class="volume-slider-container">
              <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="1">
              <div class="volume-feedback"></div>
            </div>
            <button class="fullscreen-btn">⛶</button>
            <div class="video-progress">
              <div class="video-progress-filled"></div>
            </div>
          </div>
        </div>
      `;
    }
    
    videoItem.innerHTML = `
      ${videoContent}
      <h3 class="video-title">${title}</h3>
      ${isAdminLoggedIn ? '<button class="video-delete-btn">Supprimer</button>' : ''}
    `;
    
    videoGallery.appendChild(videoItem);
    
    if (type !== 'youtube') {
      const volumeSlider = videoItem.querySelector('.volume-slider');
      if (volumeSlider) {
        volumeSlider.value = "1"; // Set initial value
      }
      setupVideoPlayer(videoItem);
      
      const video = videoItem.querySelector('video');
      video.addEventListener('loadeddata', () => {
        videoItem.classList.remove('loading');
        video.volume = volumeSlider ? parseFloat(volumeSlider.value) : 1;
      });
    }
    
    if (isAdminLoggedIn) {
      const deleteBtn = videoItem.querySelector('.video-delete-btn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Voulez-vous vraiment supprimer cette vidéo ?')) {
          videoItem.classList.add('removing');
          setTimeout(() => {
            videoGallery.removeChild(videoItem);
            videos = videos.filter(v => v.title !== title);
            if (type === 'file' && videoUrl) {
              URL.revokeObjectURL(videoUrl);
            }
          }, 300);
        }
      });
    }
  }
  
  function setupVideoPlayer(playerContainer) {
    const video = playerContainer.querySelector('video');
    const playBtn = playerContainer.querySelector('.play-btn');
    const volumeBtn = playerContainer.querySelector('.volume-btn');
    const volumeSlider = playerContainer.querySelector('.volume-slider');
    const progress = playerContainer.querySelector('.video-progress');
    const progressBar = playerContainer.querySelector('.video-progress-filled');
    const fullscreenBtn = playerContainer.querySelector('.fullscreen-btn'); // Add this line
  
    // Add fullscreen functionality
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        if (playerContainer.requestFullscreen) {
          playerContainer.requestFullscreen();
        } else if (playerContainer.webkitRequestFullscreen) {
          playerContainer.webkitRequestFullscreen();
        } else if (playerContainer.msRequestFullscreen) {
          playerContainer.msRequestFullscreen();
        }
        fullscreenBtn.textContent = '⤧';
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
        fullscreenBtn.textContent = '⛶';
      }
    });
  
    // Listen for fullscreen change
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        fullscreenBtn.textContent = '⛶';
      }
    });
  
    // Set initial volume
    video.volume = volumeSlider ? parseFloat(volumeSlider.value) : 1;
  
    // Volume controls
    if (volumeBtn && volumeSlider) {
      // Add volume feedback element
      const volumeSliderContainer = document.createElement('div');
      volumeSliderContainer.className = 'volume-slider-container';
      
      const volumeFeedback = document.createElement('div');
      volumeFeedback.className = 'volume-feedback';
      volumeSliderContainer.appendChild(volumeFeedback);
      
      // Wrap volume slider in container
      volumeSlider.parentNode.insertBefore(volumeSliderContainer, volumeSlider);
      volumeSliderContainer.appendChild(volumeSlider);
  
      // Volume slider input handler with feedback
      volumeSlider.addEventListener('input', (e) => {
        const newVolume = parseFloat(e.target.value);
        video.volume = newVolume;
        video.muted = newVolume === 0;
        volumeBtn.textContent = newVolume === 0 ? '🔇' : '🔊';
        
        // Show volume feedback
        volumeFeedback.textContent = `Volume: ${Math.round(newVolume * 100)}%`;
        volumeFeedback.classList.add('visible');
        
        // Hide feedback after delay
        clearTimeout(volumeFeedback.timeout);
        volumeFeedback.timeout = setTimeout(() => {
          volumeFeedback.classList.remove('visible');
        }, 1000);
      });
  
      // Volume button click handler
      volumeBtn.addEventListener('click', () => {
        video.muted = !video.muted;
        volumeBtn.textContent = video.muted ? '🔇' : '🔊';
        if (video.muted) {
          volumeSlider.value = 0;
          volumeFeedback.textContent = 'Muet';
        } else {
          volumeSlider.value = video.volume;
          volumeFeedback.textContent = `Volume: ${Math.round(video.volume * 100)}%`;
        }
        
        // Show feedback
        volumeFeedback.classList.add('visible');
        clearTimeout(volumeFeedback.timeout);
        volumeFeedback.timeout = setTimeout(() => {
          volumeFeedback.classList.remove('visible');
        }, 1000);
      });
    }
  
    playBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playBtn.textContent = '⏸';
      } else {
        video.pause();
        playBtn.textContent = '►';
      }
    });
  
    video.addEventListener('timeupdate', () => {
      const percentage = (video.currentTime / video.duration) * 100;
      progressBar.style.width = percentage + '%';
    });
  
    progress.addEventListener('click', (e) => {
      const progressTime = (e.offsetX / progress.offsetWidth) * video.duration;
      video.currentTime = progressTime;
    });
  
    video.addEventListener('ended', () => {
      playBtn.textContent = '►';
      video.currentTime = 0;
    });
  }
  
  // Setup the featured video player
  document.addEventListener('DOMContentLoaded', () => {
    const featuredPlayer = document.querySelector('#featured-player .custom-video-player');
    if (featuredPlayer) {
      setupVideoPlayer(featuredPlayer);
    }
  });
  
  // Add smooth scrolling for navigation
  document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      
      document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
      });
      
      document.getElementById('videos').style.display = 
        targetId === 'videos' ? 'grid' : 'none';
      
      const targetElement = document.getElementById(targetId);
      targetElement.style.display = 'block';
      
      const featuredPlayer = document.getElementById('featured-player');
      if (targetId === 'home') {
        featuredPlayer.style.display = 'block';
      }
      
      document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
      
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });
  
  // Modify the DOMContentLoaded handler
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('section').forEach(section => {
      section.style.display = 
        (section.id === 'home' || section.id === 'featured-player') 
          ? 'block' 
          : 'none';
    });
    document.getElementById('videos').style.display = 'none';
  });
  
  // Add event listeners for the new buttons
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('returnBtn').addEventListener('click', handleReturn);
  
  function handleLogout() {
    isAdminLoggedIn = false;
    loginForm.style.display = 'grid';
    adminForm.classList.remove('visible');
    adminButtons.classList.remove('visible');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    errorMessage.style.display = 'none';
    
    document.querySelectorAll('.video-delete-btn').forEach(btn => {
      btn.remove();
    });
  }
  
  function handleReturn() {
    document.querySelectorAll('section').forEach(section => {
      section.style.display = 
        (section.id === 'home' || section.id === 'featured-player') 
          ? 'block' 
          : 'none';
    });
    document.getElementById('videos').style.display = 'none';
    
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    document.querySelector('.nav-links a[href="#home"]').classList.add('active');
  }