'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Upload, File } from 'lucide-react'

interface DocumentsStepProps {
    onNext: (data: any) => void
    initialData?: any
}

export default function DocumentsStep({ onNext, initialData }: DocumentsStepProps) {
    // Mock files for now, as we don't have storage configured for this step yet
    const [files, setFiles] = useState<string[]>([])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onNext(files)
    }

    const handleMockUpload = () => {
        setFiles([...files, `dokument_projektowy_${files.length + 1}.pdf`])
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight">Dokumentacja</h2>
                <p className="text-muted-foreground">Wgraj pliki związane z projektem (rzuty, umowy, inspiracje).</p>
            </div>

            <div className="space-y-4">
                <div
                    className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={handleMockUpload}
                >
                    <div className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-white" />
                    </div>
                    <div className="text-sm font-medium">Kliknij, aby wgrać pliki</div>
                    <div className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG do 10MB</div>
                </div>

                {files.length > 0 && (
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A] border border-white/5">
                                <File className="w-4 h-4 text-white" />
                                <span className="text-sm flex-1">{file}</span>
                                <span className="text-xs text-green-500">Wgrano</span>
                            </div>
                        ))}
                    </div>
                )}

                <Button
                    className="w-full bg-white text-black hover:bg-gray-200 mt-4 h-12"
                    onClick={handleSubmit}
                >
                    {files.length > 0 ? 'Utwórz projekt' : 'Pomiń i utwórz projekt'}
                </Button>
            </div>
        </div>
    )
}
