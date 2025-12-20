'use client';

import {FormDialog} from "@/components/FormDialog";
import { FormInput, FormGrid } from "@/components/FormFields";
import { use, useEffect, useState } from "react";

interface Supplier {
    id: string;
    supplier_id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    createdAt?: string;
}

interface SupplierFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (supplier: Omit<Supplier, 'id' | 'supplier_id' | 'createdAt' >) => Promise<void>;
    supplier?: Supplier | null;
    mode: 'add' | 'edit';
}


export default function SupplierForm({ isOpen, onClose, onSubmit, supplier, mode }: SupplierFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const handleSubmit = async (formData: FormData) => {
        const supplierData = {
            name: formData.get('supplierName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
        };
        
        await onSubmit(supplierData);
    };
    
    useEffect(() => {
        if (mode === 'edit' && supplier) {
            setFormData({
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone,
                address: supplier.address,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
            });
        }
    }, [mode, supplier, isOpen]);

    return (
        <FormDialog
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={mode === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
            description={mode === 'add' 
                ? 'Fill in the details below to add a new supplier.' 
                : 'Update the supplier information below.'}
            submitButtonText={mode === 'add' ? 'Add Supplier' : 'Update Supplier'}
        >
            <FormInput
                label="Supplier Name"
                id="supplierName"
                name="supplierName"
                placeholder="Enter supplier name"
                defaultValue={supplier?.name || ''}
                required
            />
            <FormGrid>
                <FormInput
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    defaultValue={supplier?.email || ''}
                />
                
                <FormInput
                    label="Phone"
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    defaultValue={supplier?.phone || ''}
                />
            </FormGrid>
            
            <FormInput
                label="Address"
                id="address"
                name="address"
                placeholder="Enter address"
                defaultValue={supplier?.address || ''}
            />
        </FormDialog>
    );
}
