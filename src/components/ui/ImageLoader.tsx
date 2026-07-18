"use client";

import { useState, useRef } from "react";
import { Button } from "./button";

interface ImageLoaderProps {
    name: string;
    initialImage?: string | null | undefined;
}

export default function ImageLoader({ name, initialImage }: ImageLoaderProps) {
    const [preview, setPreview] = useState<string | null>(initialImage || null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
            <input
                type="file"
                name={name}
                ref={inputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            
            {preview ? (
                <div className="space-y-4">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-white">
                        <img 
                            src={preview} 
                            alt="Vista previa" 
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="blanco"
                        onClick={() => inputRef.current?.click()}
                        className="w-full"
                    >
                        Reemplazar Imagen
                    </Button>
                </div>
            ) : (
                <div className="space-y-4 py-6 flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="text-sm text-gray-500">
                        No hay imagen seleccionada
                    </p>
                    <Button
                        type="button"
                        variant="celeste"
                        onClick={() => inputRef.current?.click()}
                    >
                        Subir Imagen
                    </Button>
                </div>
            )}
        </div>
    );
}