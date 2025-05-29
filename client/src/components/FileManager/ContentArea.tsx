import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../ui/button';

interface ContentAreaProps {
    organisation: string
}

const ContentArea: React.FC<ContentAreaProps> = ({organisation}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                const fileItem = {
                    id: `file_${Date.now()}_${Math.random()}`,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    uploadDate: new Date().toISOString()
                };
                
            });
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{organisation ?? 'No lecture selected'}</h1>
                        
                    </div>
                    <div className="flex gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                        />
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Lectures
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 bg-gray-50">
                
            </div>
        </div>
    );
};

export default ContentArea;