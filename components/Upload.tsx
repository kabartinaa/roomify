import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React from 'react'
import { useOutletContext } from 'react-router';
import {
  PROGRESS_INCREMENT,
  PROGRESS_INTERVAL_MS,
  REDIRECT_DELAY_MS,
} from '../lib/constants';

type UploadProps = {
  onComplete?: (base64Image: string) => void;
};

export const Upload = ({ onComplete = () => {} }: UploadProps) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const uploadIntervalRef = React.useRef<number | null>(null);

  const { isSignedIn } = useOutletContext();

  React.useEffect(() => {
    return () => {
      if (uploadIntervalRef.current !== null) {
        window.clearInterval(uploadIntervalRef.current);
      }
    };
  }, []);

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const base64 = String(reader.result ?? '');

      setFile(selectedFile);
      setProgress(0);
      setIsDragging(false);

      if (uploadIntervalRef.current !== null) {
        window.clearInterval(uploadIntervalRef.current);
      }

      uploadIntervalRef.current = window.setInterval(() => {
        setProgress((currentProgress) => {
          const nextProgress = Math.min(currentProgress + PROGRESS_INCREMENT, 100);

          if (nextProgress >= 100 && uploadIntervalRef.current !== null) {
            window.clearInterval(uploadIntervalRef.current);
            uploadIntervalRef.current = null;

            window.setTimeout(() => {
              onComplete(base64);
            }, REDIRECT_DELAY_MS);
          }

          return nextProgress;
        });
      }, PROGRESS_INTERVAL_MS);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) {
      return;
    }

    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (!isSignedIn) {
      return;
    }

    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isSignedIn) {
      return;
    }
    setIsDragging(false);
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? 'is-dragging' : ''} ${!isSignedIn ? 'disabled' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png"
            disabled={!isSignedIn}
            onChange={handleFileChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={25} />
            </div>

            <p>
              {isSignedIn
                ? 'Drag and drop your floor plan here, or click to select a file'
                : 'Sign in to upload your floor plan'}
            </p>
            <p className="help">Maximum file size: 50MB.</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? 'Analyzing floor plan...' : 'Redirecting to design space...'}   
                {/* redirecting to visualizer page */}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
