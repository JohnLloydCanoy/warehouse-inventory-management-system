'use client';

import { FormDialog } from "@/components/FormDialog";
import { FormInput, FormGrid } from "@/components/FormFields";

interface User {
    id: string;
    user_id: number;
    username: string;
    email: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}

interface UserFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (user: Omit<User, 'id' | 'user_id' | 'createdAt' | 'updatedAt'>) => void;
    user?: User | null;
    mode: 'add' | 'edit';
}

export default function UserForm({ isOpen, onClose, onSubmit, user, mode }: UserFormProps) {
    const handleSubmit = (formData: FormData) => {
        const userData = {
            username: formData.get('username') as string,
            email: formData.get('email') as string,
            role: formData.get('role') as string,
        };
        
        onSubmit(userData);
    };

    return (
        <FormDialog
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={mode === 'add' ? 'Add New User' : 'Edit User'}
            description={mode === 'add' 
                ? 'Fill in the details below to add a new user.' 
                : 'Update the user information below.'}
            submitButtonText={mode === 'add' ? 'Add User' : 'Update User'}
        >
            <FormInput
                label="Username"
                id="username"
                name="username"
                placeholder="Enter username"
                defaultValue={user?.username || ''}
                required
            />
            
            <FormGrid>
                <FormInput
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    defaultValue={user?.email || ''}
                    required
                />
                
                <FormInput
                    label="Role"
                    id="role"
                    name="role"
                    placeholder="Enter role (e.g., Admin, User)"
                    defaultValue={user?.role || ''}
                    required
                />
            </FormGrid>
        </FormDialog>
    );
}
