"use client";

import React, { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const onDrop = useCallback(
    async (
      e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>
    ) => {
      e.preventDefault();

      const droppedFiles =
        "dataTransfer" in e ? e.dataTransfer?.files : e.target.files;

      if (!droppedFiles) return;

      const imageFiles = Array.from(droppedFiles).filter((file) =>
        file.type.startsWith("image/")
      );

      setFiles(imageFiles);
      if (imageFiles.length > 0) {
        await processImages(imageFiles);
      }
    },
    []
  );

  const processImages = async (imageFiles: File[]) => {
    setProcessing(true);
    setProgress(0);

    const totalFiles = imageFiles.length;
    let totalSaved = 0;
    const processedResults = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const originalSize = file.size;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/compress", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Compression failed");

        const blob = await response.blob();
        const compressedSize = blob.size;

        totalSaved += originalSize - compressedSize;

        processedResults.push({
          name: file.name,
          originalSize,
          compressedSize,
          savedSize: originalSize - compressedSize,
          url: URL.createObjectURL(blob),
        });
      } catch (error) {
        console.error("Error processing file:", file.name, error);
      }

      setProgress(((i + 1) / totalFiles) * 100);
    }

    setResults({
      totalFiles,
      totalSaved,
      files: processedResults,
    });

    setProcessing(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className=" bg-gray-800 p-8 h-auto">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            NAMKA Image Compressor
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            {processing ? (
              <div className="space-y-4">
                <Loader className="w-12 h-12 animate-spin mx-auto text-blue-500" />
                <p>Processing images...</p>
                <Progress value={progress} className="w-full" />
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  Drop your images here or click to select
                </p>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={onDrop}
                />
              </>
            )}
          </div>

          {results && (
            <div className="mt-8 space-y-8">
              <Alert>
                <ImageIcon className="h-4 w-4" />
                <AlertDescription>
                  Processed {results.totalFiles} files. Total space saved:{" "}
                  {formatBytes(results.totalSaved)}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                {results.files.map((file: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-800 rounded-lg flex justify-between items-center"
                  >
                    <span className="font-medium truncate">{file.name}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-green-600">
                        {formatBytes(file.savedSize)} saved
                      </span>
                      <a
                        href={file.url}
                        download={file.name}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-center pt-10">
        <a href="https://www.openmindi.co.za" target="blank" rel="noopener noreferrer">
          <p className="text-sm text-slate-400">Developed by: Ali Mora</p>
        </a>
      </div>
    </div>
  );
}
