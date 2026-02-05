import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

const DragDropUpload = ({ onFileSelect, selectedFile, onClear, className }) => {
    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles?.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        multiple: false
    });

    if (selectedFile) {
        return (
            <div className={cn("relative rounded-2xl overflow-hidden border border-slate-200 group", className)}>
                <div className="absolute top-2 right-2 z-10">
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); onClear(); }}
                        className="h-8 w-8 rounded-full shadow-md bg-white/90 hover:bg-red-50 hover:text-red-600"
                    >
                        <X size={16} />
                    </Button>
                </div>
                <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                />
            </div>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer",
                isDragActive
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-300 hover:border-primary-400 hover:bg-slate-50",
                className
            )}
        >
            <input {...getInputProps()} />
            <div className="bg-primary-100 p-4 rounded-full text-primary-600 mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud size={32} />
            </div>
            <p className="text-lg font-semibold text-slate-700">Click or Drag image here</p>
            <p className="text-sm text-slate-400 mt-2">Supports JPG, PNG (Max 10MB)</p>
        </div>
    );
};

export default DragDropUpload;
