'use client';

import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface FormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
    title: string;
    description?: string;
    children: ReactNode;
    submitButtonText?: string;
}

export function FormDialog({ 
    isOpen, 
    onClose, 
    onSubmit, 
    title,
    description = "Fill in the details below.",
    children,
    submitButtonText = "Submit"
}: FormDialogProps) {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="modal-backdrop" onClick={onClose} />
            
            {/* Dialog */}
            <div className="modal-container">
                <div className="modal-header">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="modal-title">{title}</h2>
                            <p className="modal-description">{description}</p>
                        </div>
                        <button onClick={onClose} className="modal-close-button">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {children}
                        
                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onClose}
                                className="px-4 py-2"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit"
                                className="px-4 py-2"
                            >
                                {submitButtonText}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
