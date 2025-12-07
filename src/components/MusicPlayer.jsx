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
import './MusicPlayer.css';

const SONGS = [
  {
    id: 1,
    title: 'Kannalane',
    artist: 'A.R. Rahman',
    album: 'Bombay',
    duration: 240,
  },
  {
    id: 2,
    title: 'Munbe Vaa',
    artist: 'A.R. Rahman',
    album: 'Sillunu Oru Kaadhal',
    duration: 265,
  },
  {
    id: 3,
    title: 'Kadhal Rojave',
    artist: 'A.R. Rahman',
    album: 'Roja',
    duration: 280,
  },
  {
    id: 4,
    title: 'Vennilave',
    artist: 'Ilaiyaraaja',
    album: 'Minsara Kanavu',
    duration: 255,
  },
  {
    id: 5,
    title: 'Uyire',
    artist: 'A.R. Rahman',
    album: 'Bombay',
    duration: 295,
  },
  {
    id: 6,
    title: 'Why This Kolaveri Di',
    artist: 'Anirudh Ravichander',
    album: '3',
    duration: 195,
  },
  {
    id: 7,
    title: 'Thalli Pogathey',
    artist: 'A.R. Rahman',
    album: 'Achcham Yenbadhu Madamaiyada',
    duration: 240,
  },
  {
    id: 8,
    title: 'Rowdy Baby',
    artist: 'Yuvan Shankar Raja',
    album: 'Maari 2',
    duration: 215,
  },
  {
    id: 9,
    title: 'Nenjukkul Peidhidum',
    artist: 'Yuvan Shankar Raja',
    album: 'Vaaranam Aayiram',
    duration: 305,
  },
  {
    id: 10,
    title: 'Vaseegara',
    artist: 'Harris Jayaraj',
    album: 'Minnale',
    duration: 230,
  },
];

export default function MusicPlayer() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const currentSong = SONGS[currentSongIndex];

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
    setCurrentSongIndex((prev) => (prev - 1 + SONGS.length) % SONGS.length);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleNext = () => {
    setCurrentSongIndex((prev) => (prev + 1) % SONGS.length);
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

  const progress = (currentTime / currentSong.duration) * 100;

  return (
    <div className="music-player-container">
      <audio
        ref={audioRef}
        volume={isMuted ? 0 : volume / 100}
        src={`data:audio/mpeg;base64,`}
      />

      <div className="player-main">
        <div className="album-art">
          <Music size={80} />
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
        <h3>Playlist</h3>
        <div className="playlist-items">
          {SONGS.map((song, index) => (
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
