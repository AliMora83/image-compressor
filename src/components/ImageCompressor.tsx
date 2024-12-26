/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useCallback } from "react";
import { Upload, CloudDownload, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export default function ImageCompressor() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

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
    <div className="flex justify-center flex-col p-8 h-auto min-h-screen w-[80%] mx-auto">
      <Card className="p-10 shadow-[0px_0px_40px_3px_rgba(59,_130,_246,_0.15)]">
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
                <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
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
              <Alert className="flex flex-col justify-center items-center">
                {/* <ImageIcon className="h-4 w-4" /> */}
                <AlertDescription>
                  Processed {results.totalFiles} files. Total space saved:{" "}
                  {formatBytes(results.totalSaved)}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                {results.files.map((file: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-800 rounded-lg flex justify-between items-center gap-10 text-sm"
                  >
                    <div className="flex items-center space-x-8">
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-slate-300 bg-slate-600 px-2 py-1 rounded">
                        {formatBytes(file.originalSize)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-8">
                      <span className="text-green-600">
                        {formatBytes(file.savedSize)}
                      </span>
                      <p className="text-green-600">
                        Saved:{" "}
                        {(
                          ((file.originalSize - file.savedSize) /
                            file.originalSize) *
                          100
                        ).toFixed(2)}
                        %
                      </p>
                    </div>
                    <a
                      href={file.url}
                      download={file.name}
                      className="px-8 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <CloudDownload className="w-4 h-4 mx-auto" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-center pt-10">
        <a
          href="https://www.openmindi.co.za"
          target="blank"
          rel="noopener noreferrer"
        >
          <p className="text-xs text-slate-400">Developed by Ali Mora</p>
        </a>
      </div>
    </div>
  );
}
