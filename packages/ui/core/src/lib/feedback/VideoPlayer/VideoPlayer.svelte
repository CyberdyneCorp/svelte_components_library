<svelte:options runes={true} />

<script lang="ts">
  let {
    src = "",
    poster = "",
    autoplay = false,
    loop = false,
    muted = $bindable(false),
    width = "100%",
    height = "auto",
    showControls = true,
    onplay,
    onpause,
    onended,
  }: {
    src?: string;
    poster?: string;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    width?: string;
    height?: string;
    showControls?: boolean;
    onplay?: () => void;
    onpause?: () => void;
    onended?: () => void;
  } = $props();

  let videoEl: HTMLVideoElement | undefined = $state();
  let containerEl: HTMLDivElement | undefined = $state();
  let playing = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);
  let buffered = $state(0);
  let volume = $state(1);
  let playbackRate = $state(1);
  let controlsVisible = $state(true);
  let isFullscreen = $state(false);
  let isBuffering = $state(false);
  let speedMenuOpen = $state(false);
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  const speeds = [0.5, 1, 1.5, 2];

  function togglePlay() {
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play();
    } else {
      videoEl.pause();
    }
  }

  function handlePlay() {
    playing = true;
    onplay?.();
    scheduleHide();
  }

  function handlePause() {
    playing = false;
    onpause?.();
    showControlsNow();
  }

  function handleEnded() {
    playing = false;
    onended?.();
    showControlsNow();
  }

  function handleTimeUpdate() {
    if (!videoEl) return;
    currentTime = videoEl.currentTime;
  }

  function handleLoadedMetadata() {
    if (!videoEl) return;
    duration = videoEl.duration;
  }

  function handleProgress() {
    if (!videoEl || videoEl.buffered.length === 0) return;
    buffered = videoEl.buffered.end(videoEl.buffered.length - 1);
  }

  function handleWaiting() {
    isBuffering = true;
  }

  function handleCanPlay() {
    isBuffering = false;
  }

  function seek(e: MouseEvent) {
    if (!videoEl) return;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoEl.currentTime = pct * duration;
  }

  function setVolume(e: Event) {
    if (!videoEl) return;
    const val = parseFloat((e.target as HTMLInputElement).value);
    volume = val;
    videoEl.volume = val;
    muted = val === 0;
  }

  function toggleMute() {
    if (!videoEl) return;
    muted = !muted;
    videoEl.muted = muted;
  }

  function setSpeed(speed: number) {
    if (!videoEl) return;
    playbackRate = speed;
    videoEl.playbackRate = speed;
    speedMenuOpen = false;
  }

  function toggleFullscreen() {
    if (!containerEl) return;
    if (!document.fullscreenElement) {
      containerEl.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  function handleFullscreenChange() {
    isFullscreen = !!document.fullscreenElement;
  }

  function handleDblClick() {
    toggleFullscreen();
  }

  function showControlsNow() {
    controlsVisible = true;
    clearTimeout(hideTimer);
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    if (playing) {
      hideTimer = setTimeout(() => {
        controlsVisible = false;
      }, 3000);
    }
  }

  function handleMouseMove() {
    showControlsNow();
    scheduleHide();
  }

  function handleMouseLeave() {
    if (playing) {
      hideTimer = setTimeout(() => {
        controlsVisible = false;
      }, 1000);
    }
  }

  function formatTime(seconds: number): string {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  let progressPct = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);
  let bufferedPct = $derived(duration > 0 ? (buffered / duration) * 100 : 0);

  import { onDestroy } from "svelte";

  onDestroy(() => {
    clearTimeout(hideTimer);
  });

  $effect(() => {
    if (videoEl) {
      videoEl.muted = muted;
    }
  });
</script>

<svelte:document onfullscreenchange={handleFullscreenChange} />

<div
  bind:this={containerEl}
  class="cy-video"
  class:cy-video--fullscreen={isFullscreen}
  style:width
  style:height={height === "auto" ? undefined : height}
  onmousemove={handleMouseMove}
  onmouseleave={handleMouseLeave}
  role="region"
  aria-label="Video player"
>
  <!-- svelte-ignore a11y_media_has_caption -->
  <video
    bind:this={videoEl}
    class="cy-video__media"
    {src}
    {poster}
    {autoplay}
    {loop}
    preload="metadata"
    onclick={togglePlay}
    ondblclick={handleDblClick}
    onplay={handlePlay}
    onpause={handlePause}
    onended={handleEnded}
    ontimeupdate={handleTimeUpdate}
    onloadedmetadata={handleLoadedMetadata}
    onprogress={handleProgress}
    onwaiting={handleWaiting}
    oncanplay={handleCanPlay}
  ></video>

  {#if isBuffering}
    <div class="cy-video__spinner">
      <div class="cy-video__spinner-ring"></div>
    </div>
  {/if}

  {#if !playing && !isBuffering}
    <button class="cy-video__play-overlay" onclick={togglePlay} aria-label="Play video">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z"/>
      </svg>
    </button>
  {/if}

  {#if showControls}
    <div
      class="cy-video__controls"
      class:cy-video__controls--visible={controlsVisible}
    >
      <div class="cy-video__gradient"></div>
      <div class="cy-video__controls-inner">
        <div class="cy-video__progress" onclick={seek} role="slider" tabindex="0" aria-label="Seek" aria-valuenow={currentTime} aria-valuemin={0} aria-valuemax={duration}>
          <div class="cy-video__progress-buffered" style:width="{bufferedPct}%"></div>
          <div class="cy-video__progress-played" style:width="{progressPct}%"></div>
        </div>

        <div class="cy-video__bar">
          <div class="cy-video__bar-left">
            <button class="cy-video__ctrl-btn" onclick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
              {#if playing}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                </svg>
              {:else}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              {/if}
            </button>

            <div class="cy-video__volume">
              <button class="cy-video__ctrl-btn" onclick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                {#if muted || volume === 0}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                {:else}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                {/if}
              </button>
              <input
                type="range"
                class="cy-video__volume-slider"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                oninput={setVolume}
                aria-label="Volume"
              />
            </div>

            <span class="cy-video__time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div class="cy-video__bar-right">
            <div class="cy-video__speed">
              <button
                class="cy-video__ctrl-btn cy-video__ctrl-btn--text"
                onclick={() => (speedMenuOpen = !speedMenuOpen)}
                aria-label="Playback speed"
              >
                {playbackRate}x
              </button>
              {#if speedMenuOpen}
                <div class="cy-video__speed-menu">
                  {#each speeds as speed}
                    <button
                      class="cy-video__speed-option"
                      class:cy-video__speed-option--active={playbackRate === speed}
                      onclick={() => setSpeed(speed)}
                    >
                      {speed}x
                    </button>
                  {/each}
                </div>
              {/if}
            </div>

            <button class="cy-video__ctrl-btn" onclick={toggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {#if isFullscreen}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                  <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
                </svg>
              {:else}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                  <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                </svg>
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .cy-video {
    position: relative;
    background: var(--color-surface-inset, #000);
    border-radius: var(--radius-md, 8px);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 16 / 9;
  }

  .cy-video--fullscreen {
    border-radius: 0;
    width: 100% !important;
    height: 100% !important;
    aspect-ratio: auto;
  }

  .cy-video__media {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    cursor: pointer;
  }

  /* Loading spinner */
  .cy-video__spinner {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 2;
  }

  .cy-video__spinner-ring {
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-border-default);
    border-top-color: var(--color-action-brand-default);
    border-radius: var(--radius-full, 50%);
    animation: cy-video-spin 0.8s linear infinite;
  }

  @keyframes cy-video-spin {
    to { transform: rotate(360deg); }
  }

  /* Big play overlay */
  .cy-video__play-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--color-text-on-brand);
    cursor: pointer;
    z-index: 3;
    opacity: 0.85;
    transition: opacity var(--transition-default, 0.2s ease);
  }

  .cy-video__play-overlay:hover {
    opacity: 1;
  }

  .cy-video__play-overlay svg {
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
  }

  /* Controls */
  .cy-video__controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 5;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: none;
  }

  .cy-video__controls--visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .cy-video__gradient {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(transparent, var(--color-surface-inset, rgba(0, 0, 0, 0.85)));
    pointer-events: none;
  }

  .cy-video__controls-inner {
    position: relative;
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem) var(--space-3, 0.75rem);
  }

  /* Progress bar */
  .cy-video__progress {
    position: relative;
    height: 4px;
    background: var(--color-border-default);
    border-radius: 2px;
    cursor: pointer;
    margin-bottom: var(--space-2, 0.5rem);
    transition: height 0.15s ease;
  }

  .cy-video__progress:hover {
    height: 6px;
  }

  .cy-video__progress-buffered {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--color-text-secondary);
    opacity: 0.3;
    border-radius: 2px;
    transition: width 0.1s linear;
  }

  .cy-video__progress-played {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--color-action-brand-default);
    border-radius: 2px;
    transition: width 0.1s linear;
  }

  /* Control bar */
  .cy-video__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cy-video__bar-left {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }

  .cy-video__bar-right {
    display: flex;
    align-items: center;
    gap: var(--space-2, 0.5rem);
  }

  .cy-video__ctrl-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-sm, 4px);
    background: transparent;
    color: var(--color-text-on-brand);
    cursor: pointer;
    transition: background var(--transition-default, 0.15s ease);
  }

  .cy-video__ctrl-btn:hover {
    background: var(--color-surface-hover);
  }

  .cy-video__ctrl-btn--text {
    width: auto;
    padding: 0 var(--space-2, 0.5rem);
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium, 500);
  }

  .cy-video__time {
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    color: var(--color-text-on-brand);
    white-space: nowrap;
    user-select: none;
  }

  /* Volume */
  .cy-video__volume {
    display: flex;
    align-items: center;
    gap: var(--space-1, 0.25rem);
  }

  .cy-video__volume-slider {
    width: 70px;
    height: 4px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--color-border-default);
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  .cy-video__volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: var(--radius-full, 50%);
    background: var(--color-text-on-brand);
    cursor: pointer;
  }

  .cy-video__volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: none;
    border-radius: var(--radius-full, 50%);
    background: var(--color-text-on-brand);
    cursor: pointer;
  }

  /* Speed menu */
  .cy-video__speed {
    position: relative;
  }

  .cy-video__speed-menu {
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: var(--space-2, 0.5rem);
    background: var(--color-surface-default);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md, 8px);
    box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.15));
    overflow: hidden;
    min-width: 80px;
  }

  .cy-video__speed-option {
    display: block;
    width: 100%;
    padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
    border: none;
    background: transparent;
    color: var(--color-text-primary);
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    text-align: center;
    cursor: pointer;
    transition: background var(--transition-default, 0.15s ease);
  }

  .cy-video__speed-option:hover {
    background: var(--color-surface-hover);
  }

  .cy-video__speed-option--active {
    color: var(--color-action-brand-default);
    font-weight: var(--font-weight-bold, 700);
  }
</style>
