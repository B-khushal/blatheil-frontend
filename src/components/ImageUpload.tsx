import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  onError: (error: string) => void;
  multiple?: boolean;
  maxImages?: number;
  existingImages?: string[];
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesUploaded,
  onError,
  multiple = true,
  maxImages = 10,
  existingImages = [],
}) => {
  const { token } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [allImages, setAllImages] = useState<string[]>([]);
  const isInitialized = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  // Initialize with existing images (only once)
  useEffect(() => {
    if (!isInitialized.current) {
      const filtered = existingImages.filter((img) => img && img.trim() !== "");
      setAllImages(filtered);
      isInitialized.current = true;
    }
  }, []);

  // Update callback when all images change (but not on initial render)
  useEffect(() => {
    if (isInitialized.current) {
      onImagesUploaded(allImages);
    }
  }, [allImages]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadFiles = async (files: FileList) => {
    const fileArray = Array.from(files);

    // Validate files
    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        onError("All files must be images");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        onError("Each file must be less than 5MB");
        return;
      }
    }

    if (multiple && fileArray.length + allImages.length > maxImages) {
      onError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      if (multiple) {
        fileArray.forEach((file) => {
          formData.append("images", file);
        });
      } else {
        formData.append("image", fileArray[0]);
      }

      const endpoint = multiple ? "/upload/multiple" : "/upload";
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const data = await response.json();
      const newUrls = multiple
        ? data.data.map((item: { url: string }) => item.url)
        : [data.data.url];

      // Add new previews and URLs
      const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
      setUploadedUrls((prev) => [...prev, ...newUrls]);
      setAllImages((prev) => [...prev, ...newUrls]);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
      uploadFiles(e.currentTarget.files);
      e.currentTarget.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newAllImages = allImages.filter((_, i) => i !== index);
    setAllImages(newAllImages);
    
    // If it's a newly uploaded image (not from existing), also remove from previews
    const existingCount = existingImages.filter((img) => img && img.trim() !== "").length;
    if (index >= existingCount) {
      const previewIndex = index - existingCount;
      setPreviews((prev) => prev.filter((_, i) => i !== previewIndex));
    }
  };

  const canAddMore = allImages.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Image Previews Grid */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <span className="absolute top-1 right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canAddMore ? (
        <Card
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-slate-600 bg-slate-800 hover:border-slate-500"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            multiple={multiple}
          />

          <div className="flex flex-col items-center gap-3">
            {uploading ? (
              <>
                <div className="animate-spin">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-slate-400">Uploading...</p>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="text-white font-medium">
                    Drag & drop {multiple ? "images" : "an image"} here
                  </p>
                  <p className="text-slate-400 text-sm">or click to browse</p>
                  <p className="text-slate-500 text-xs mt-2">
                    Max file size: 5MB
                    {multiple && ` • Max ${maxImages} images`}
                    {multiple && allImages.length > 0 && ` • ${allImages.length} total`}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      ) : (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
          <p className="text-sm text-green-400">
            ✓ Maximum {maxImages} images reached
          </p>
        </div>
      )}
    </div>
  );
};
