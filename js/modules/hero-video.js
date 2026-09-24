// Autoplay is unreliable on some browsers unless muted playback is kicked
// off explicitly and retried a few times after mount.
export function initHeroVideo() {
  const video = document.querySelector('[data-hero-video]');
  if (!video) return;

  const kick = () => {
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    if (video.paused) {
      const playPromise = video.play();
      if (playPromise && playPromise.catch) playPromise.catch(() => {});
    }
  };

  kick();
  [120, 500, 1500].forEach((delay) => setTimeout(kick, delay));
}
