import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
} from 'lucide-react';
import { getAllSongs } from '../lib/songs';
import { getSongUrl, getImageUrl } from '../lib/storage';
import './MusicPlayer.css';

export default function MusicPlayer() {
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllSongs();
      if (error) throw new Error(error);
      setSongs(data || []);
    } catch (err) {
      console.error('Error loading songs:', err);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSongIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * currentSong.duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="music-player-container">
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div className="music-player-container">
        <div className="no-songs">
          <Music size={64} />
          <h3>No Songs Yet</h3>
          <p>Upload songs from the profile tab to get started</p>
        </div>
      </div>
    );
  }

  const audioUrl = getSongUrl(currentSong.audio_url);
  const imageUrl = currentSong.image_url ? getImageUrl(currentSong.image_url) : null;
  const progress = (currentTime / currentSong.duration) * 100;

  return (
    <div className="music-player-container">
      <audio
        ref={audioRef}
        volume={isMuted ? 0 : volume / 100}
        src={audioUrl}
        crossOrigin="anonymous"
      />

      <div className="player-main">
        <div className="album-art">
          {imageUrl ? (
            <img src={imageUrl} alt={currentSong.title} />
          ) : (
            <Music size={80} />
          )}
        </div>

        <div className="song-info">
          <h2>{currentSong.title}</h2>
          <p className="artist">{currentSong.artist}</p>
          <p className="album">{currentSong.album}</p>
        </div>

        <div className="progress-section">
          <div className="progress-bar" onClick={handleSeek}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentSong.duration)}</span>
          </div>
        </div>

        <div className="controls">
          <button className="control-btn" onClick={handlePrevious}>
            <SkipBack size={24} />
          </button>
          <button
            className="control-btn play-btn"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button className="control-btn" onClick={handleNext}>
            <SkipForward size={24} />
          </button>
        </div>

        <div className="volume-control">
          <button className="volume-btn" onClick={toggleMute}>
            {isMuted || volume === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>

      <div className="playlist">
        <h3>Playlist ({songs.length})</h3>
        <div className="playlist-items">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className={`playlist-item ${
                index === currentSongIndex ? 'active' : ''
              }`}
              onClick={() => {
                setCurrentSongIndex(index);
                setCurrentTime(0);
                setIsPlaying(true);
              }}
            >
              <div className="playlist-item-number">{index + 1}</div>
              <div className="playlist-item-info">
                <p className="playlist-item-title">{song.title}</p>
                <p className="playlist-item-artist">{song.artist}</p>
              </div>
              <span className="playlist-item-duration">
                {formatTime(song.duration)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
