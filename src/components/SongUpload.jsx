import React, { useState } from 'react';
import { Upload, Music, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadSong, uploadSongImage } from '../lib/storage';
import { createSong } from '../lib/songs';
import './SongUpload.css';

export default function SongUpload({ onSongAdded }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError('Please select an audio file');
        return;
      }
      setAudioFile(file);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !artist || !album || !duration || !audioFile) {
      setError('Please fill in all fields and select an audio file');
      return;
    }

    setLoading(true);

    try {
      const timestamp = Date.now();
      const audioFileName = `${timestamp}-${audioFile.name}`;
      let imageUrl = null;

      let audioUploadResult = await uploadSong(audioFile, audioFileName);
      if (audioUploadResult.error) {
        throw new Error(`Audio upload failed: ${audioUploadResult.error}`);
      }

      if (imageFile) {
        const imageFileName = `${timestamp}-${imageFile.name}`;
        let imageUploadResult = await uploadSongImage(imageFile, imageFileName);
        if (imageUploadResult.error) {
          throw new Error(`Image upload failed: ${imageUploadResult.error}`);
        }
        imageUrl = `public/${imageFileName}`;
      }

      const songData = {
        title,
        artist,
        album,
        duration: parseInt(duration),
        audio_url: `public/${audioFileName}`,
        image_url: imageUrl,
        user_id: user.id,
      };

      const { data: newSong, error: dbError } = await createSong(songData);
      if (dbError) {
        throw new Error(`Database error: ${dbError}`);
      }

      setSuccess('Song uploaded successfully!');
      setTitle('');
      setArtist('');
      setAlbum('');
      setDuration('');
      setAudioFile(null);
      setImageFile(null);

      onSongAdded?.(newSong);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to upload song');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="song-upload">
      <div className="upload-header">
        <Upload size={24} />
        <h3>Upload New Song</h3>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-row">
          <div className="input-group">
            <label>Song Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter song title"
            />
          </div>
          <div className="input-group">
            <label>Artist</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Enter artist name"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label>Album</label>
            <input
              type="text"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Enter album name"
            />
          </div>
          <div className="input-group">
            <label>Duration (seconds)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 240"
              min="1"
            />
          </div>
        </div>

        <div className="file-input-group">
          <label className="file-input-label">
            <Music size={20} />
            <span>
              {audioFile ? audioFile.name : 'Select Audio File'}
            </span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              style={{ display: 'none' }}
            />
          </label>
          {audioFile && (
            <button
              type="button"
              className="file-clear-btn"
              onClick={() => setAudioFile(null)}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="file-input-group">
          <label className="file-input-label">
            <ImageIcon size={20} />
            <span>
              {imageFile ? imageFile.name : 'Select Image (Optional)'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
          {imageFile && (
            <button
              type="button"
              className="file-clear-btn"
              onClick={() => setImageFile(null)}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Uploading...' : 'Upload Song'}
        </button>
      </form>
    </div>
  );
}
