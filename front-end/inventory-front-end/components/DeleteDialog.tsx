'use client';

import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    itemName: string;
    description?: string;
}

export function DeleteDialog({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Delete Item",
    itemName,
    description = "This action cannot be undone."
}: DeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="modal-backdrop" onClick={onClose} />
            
            {/* Dialog */}
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md m-4 z-10">
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                        {title}
                    </h2>
                    
                    <p className="text-center text-gray-600 mb-6">
                        Are you sure you want to delete <span className="font-semibold">"{itemName}"</span>? {description}
                    </p>
                    
                    <div className="flex items-center justify-end gap-3">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                            className="px-4 py-2"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button"
                            variant="destructive"
                            onClick={onConfirm}
                            className="px-4 py-2"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
