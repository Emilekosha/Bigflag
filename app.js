document.addEventListener('DOMContentLoaded', () => {
  // Gestion du lecteur vidéo principal
  const mainVideoPlayer = document.querySelector('.custom-video-player');
  if (mainVideoPlayer) {
    initializeVideoPlayer(mainVideoPlayer);
  }

  // Gestion de la galerie vidéo
  const videoGallery = document.querySelector('.video-gallery .video-container');
  const videoCards = videoGallery ? videoGallery.querySelectorAll('.video-card') : [];
  const videoOverlay = document.querySelector('.video-overlay');
  const overlayVideo = videoOverlay ? videoOverlay.querySelector('video') : null;
  const overlayCloseBtn = videoOverlay ? videoOverlay.querySelector('.close-btn') : null;

  // Fonction générique pour initialiser les contrôles vidéo
  function initializeVideoPlayer(playerContainer) {
    const video = playerContainer.querySelector('video');
    const playBtn = playerContainer.querySelector('.play-btn');
    const volumeBtn = playerContainer.querySelector('.volume-btn');
    const volumeSlider = playerContainer.querySelector('.volume-slider');
    const volumeFeedback = playerContainer.querySelector('.volume-feedback');
    const fullscreenBtn = playerContainer.querySelector('.fullscreen-btn');
    const progressBar = playerContainer.querySelector('.video-progress');
    const progressFilled = playerContainer.querySelector('.video-progress-filled');

    // Contrôle Play/Pause
    playBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);

    function togglePlay() {
      if (video.paused) {
        video.play();
        playBtn.textContent = '❚❚';
      } else {
        video.pause();
        playBtn.textContent = '►';
      }
    }

    // Contrôle du Volume
    volumeBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', updateVolume);

    function toggleMute() {
      video.muted = !video.muted;
      volumeBtn.textContent = video.muted ? '🔇' : '🔊';
    }

    function updateVolume() {
      video.volume = volumeSlider.value;
      volumeBtn.textContent = video.volume === 0 ? '🔇' : '🔊';
      
      if (volumeFeedback) {
        volumeFeedback.textContent = `Volume: ${Math.round(video.volume * 100)}%`;
        volumeFeedback.classList.add('visible');
        setTimeout(() => {
          volumeFeedback.classList.remove('visible');
        }, 1000);
      }
    }

    // Barre de progression
    video.addEventListener('timeupdate', updateProgress);
    progressBar.addEventListener('click', scrub);

    function updateProgress() {
      const percentage = (video.currentTime / video.duration) * 100;
      progressFilled.style.width = `${percentage}%`;
    }

    function scrub(e) {
      const scrubTime = (e.offsetX / progressBar.offsetWidth) * video.duration;
      video.currentTime = scrubTime;
    }

    // Plein écran
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }

    // Configuration initiale
    volumeSlider.value = video.volume;
  }

  // Gestion de l'overlay pour la galerie vidéo
  videoCards.forEach(card => {
    const cardVideo = card.querySelector('video');
    
    card.addEventListener('click', () => {
      if (videoOverlay && overlayVideo) {
        // Cloner la source de la vidéo cliquée
        overlayVideo.src = cardVideo.src;
        
        // Afficher l'overlay
        videoOverlay.style.display = 'flex';
        
        // Jouer la vidéo
        overlayVideo.play();
        
        // Initialiser les contrôles pour la vidéo en overlay
        initializeVideoPlayer(videoOverlay);
      }
    });
  });

  // Fermeture de l'overlay
  if (overlayCloseBtn) {
    overlayCloseBtn.addEventListener('click', () => {
      if (videoOverlay && overlayVideo) {
        // Arrêter et masquer la vidéo
        overlayVideo.pause();
        overlayVideo.currentTime = 0;
        videoOverlay.style.display = 'none';
      }
    });
  }

  // Fermer l'overlay si on clique en dehors de la vidéo
  if (videoOverlay) {
    videoOverlay.addEventListener('click', (event) => {
      if (event.target === videoOverlay) {
        overlayVideo.pause();
        overlayVideo.currentTime = 0;
        videoOverlay.style.display = 'none';
      }
    });
  }
});

function copyIban() {
  const ibanText = document.getElementById("iban").textContent;
  navigator.clipboard.writeText(ibanText).then(() => {
    alert("IBAN copié : " + ibanText);
  }).catch(err => {
    alert("Erreur lors de la copie : " + err);
  });
}
