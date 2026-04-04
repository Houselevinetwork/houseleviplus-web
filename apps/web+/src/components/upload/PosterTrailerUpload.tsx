// src/components/upload/PosterTrailerUpload.tsx
import { useState } from 'react';
import { Upload, Image, Film, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';

interface PosterTrailerUploadProps {
  uploadId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export default function PosterTrailerUpload({ 
  uploadId, 
  onComplete, 
  onSkip 
}: PosterTrailerUploadProps) {
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [posterProgress, setPosterProgress] = useState(0);
  const [posterUploading, setPosterUploading] = useState(false);
  const [posterUploaded, setPosterUploaded] = useState(false);

  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [trailerProgress, setTrailerProgress] = useState(0);
  const [trailerUploading, setTrailerUploading] = useState(false);
  const [trailerUploaded, setTrailerUploaded] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // Handle poster file selection
  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle trailer file selection
  const handleTrailerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTrailerFile(file);
    }
  };

  // Upload poster
  const handlePosterUpload = async () => {
    if (!posterFile) return;

    setPosterUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', posterFile);

      const token = localStorage.getItem('admin_token');
      
      await axios.post(
        `${API_URL}/api/uploads/${uploadId}/images/poster`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (e) => {
            if (e.total) {
              setPosterProgress((e.loaded / e.total) * 100);
            }
          },
        }
      );

      setPosterUploaded(true);
      setPosterProgress(100);
    } catch (error) {
      console.error('Poster upload failed:', error);
      alert('Failed to upload poster');
    } finally {
      setPosterUploading(false);
    }
  };

  // Upload trailer
  const handleTrailerUpload = async () => {
    if (!trailerFile) return;

    setTrailerUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', trailerFile);

      const token = localStorage.getItem('admin_token');
      
      await axios.post(
        `${API_URL}/api/uploads/${uploadId}/trailer`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (e) => {
            if (e.total) {
              setTrailerProgress((e.loaded / e.total) * 100);
            }
          },
        }
      );

      setTrailerUploaded(true);
      setTrailerProgress(100);
    } catch (error) {
      console.error('Trailer upload failed:', error);
      alert('Failed to upload trailer');
    } finally {
      setTrailerUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white">Add Poster & Trailer (Optional)</h3>
        <p className="text-sm text-gray-400 mt-1">
          Upload a custom poster and trailer to make your content stand out
        </p>
      </div>

      {/* Poster Upload */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white flex items-center gap-2">
              <Image className="w-4 h-4" />
              Custom Poster Image
            </Label>
            {posterUploaded && (
              <Check className="w-5 h-5 text-green-500" />
            )}
          </div>

          {posterPreview && (
            <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
              <img 
                src={posterPreview} 
                alt="Poster preview" 
                className="w-full h-full object-cover"
              />
              {!posterUploaded && (
                <button
                  onClick={() => {
                    setPosterFile(null);
                    setPosterPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          )}

          {!posterFile && (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">Click to upload poster</span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG (Max 5MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePosterSelect}
                className="hidden"
              />
            </label>
          )}

          {posterFile && !posterUploaded && (
            <>
              {posterProgress > 0 && (
                <Progress value={posterProgress} className="w-full" />
              )}
              <Button
                onClick={handlePosterUpload}
                disabled={posterUploading}
                className="w-full"
              >
                {posterUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading... {Math.round(posterProgress)}%
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Poster
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Trailer Upload */}
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white flex items-center gap-2">
              <Film className="w-4 h-4" />
              Trailer Video
            </Label>
            {trailerUploaded && (
              <Check className="w-5 h-5 text-green-500" />
            )}
          </div>

          {trailerFile && (
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-white">{trailerFile.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {(trailerFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {!trailerFile && (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-400">Click to upload trailer</span>
              <span className="text-xs text-gray-500 mt-1">MP4, MOV (Max 100MB)</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleTrailerSelect}
                className="hidden"
              />
            </label>
          )}

          {trailerFile && !trailerUploaded && (
            <>
              {trailerProgress > 0 && (
                <Progress value={trailerProgress} className="w-full" />
              )}
              <Button
                onClick={handleTrailerUpload}
                disabled={trailerUploading}
                className="w-full"
              >
                {trailerUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading... {Math.round(trailerProgress)}%
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Trailer
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onSkip}
          variant="outline"
          className="flex-1"
        >
          Skip for Now
        </Button>
        <Button
          onClick={onComplete}
          disabled={(!!posterFile && !posterUploaded) || (!!trailerFile && !trailerUploaded)}
          className="flex-1"
        >
          Complete Upload
        </Button>
      </div>
    </div>
  );
}