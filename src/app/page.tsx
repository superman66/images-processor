'use client';

import { useState } from "react";
import { Toast } from "@/components/Toast";

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const processImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileCount = files.length;
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("处理图片时出错");
      }

      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("image/")) {
        // Single image case
        const blob = await response.blob();
        const contentDisposition = response.headers.get("content-disposition");
        const filename = contentDisposition?.split("filename=")[1]?.replace(/"/g, "") || "processed-image.png";
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Multiple images case
        const imagesData = await response.json();
        
        // Download each image
        for (const img of imagesData) {
          const byteCharacters = atob(img.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = img.name;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }

      // 显示成功消息
      const successMessage = fileCount === 1 
        ? "图片处理成功，已开始下载" 
        : `${fileCount} 个图片处理成功，正在下载`;
      showToast(successMessage, 'success');
    } catch (error) {
      console.error("Error:", error);
      showToast("处理图片时出错，请重试", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    await processImages(files);
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    await processImages(files);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">PNG 图片透明区域裁剪工具</h1>
          <p className="text-lg text-gray-400">
            自动移除 PNG 图片中多余的透明区域，支持批量处理
          </p>
        </div>
        
        <div 
          className={`
            relative rounded-xl p-12 transition-all duration-200 backdrop-blur-sm
            ${dragActive 
              ? "border-2 border-purple-500 bg-purple-500/10" 
              : "border-2 border-dashed border-gray-600 hover:border-gray-500 bg-gray-800/50"
            }
            ${isProcessing ? "opacity-50" : ""}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".png"
            onChange={handleChange}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          <label 
            htmlFor="file-upload"
            className={`block text-center ${isProcessing ? "cursor-wait" : "cursor-pointer"}`}
          >
            {isProcessing ? (
              <div className="space-y-3">
                <div className="animate-spin mx-auto w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                <p className="text-gray-400">正在处理图片...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-purple-500/10">
                  <svg 
                    className="w-8 h-8 text-purple-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-200 mb-1">
                    拖放文件到这里，或点击选择文件
                  </p>
                  <p className="text-sm text-gray-400">
                    支持上传多个 PNG 文件，处理完成后自动下载
                  </p>
                </div>
              </div>
            )}
          </label>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>处理完成后将自动下载文件，多个文件会打包成 ZIP</p>
        </div>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
