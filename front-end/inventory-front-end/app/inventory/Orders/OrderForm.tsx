'use client';

import {FormDialog} from "@/components/FormDialog";
import { FormInput, FormGrid } from "@/components/FormFields";
import { Order } from "@/lib/api";

interface OrderFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (order: Omit<Order, 'id' | 'order_id' | 'orderDate' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    order?: Order | null;
    mode: 'add' | 'edit';
}

export default function OrderForm({ isOpen, onClose, onSubmit, order, mode }: OrderFormProps) {
    const handleSubmit = async (formData: FormData) => {
        const orderData = {
            supplierId: formData.get('supplierId') as string,
            status: formData.get('status') as string,
            totalAmount: formData.get('totalAmount') as string,
        };
        
        await onSubmit(orderData);
    };

    return (
        <FormDialog
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={mode === 'add' ? 'Add New Order' : 'Edit Order'}
            description={mode === 'add' 
                ? 'Fill in the details below to add a new order.' 
                : 'Update the order information below.'}
            submitButtonText={mode === 'add' ? 'Add Order' : 'Update Order'}
        >
            <FormInput
                label="Supplier ID"
                id="supplierId"
                name="supplierId"
                type="number"
                placeholder="Enter supplier ID"
                defaultValue={order?.supplierId || ''}
                required
            />
            
            <FormGrid>
                <FormInput
                    label="Status"
                    id="status"
                    name="status"
                    placeholder="Enter status"
                    defaultValue={order?.status || ''}
                    required
                />
                
                <FormInput
                    label="Total Amount"
                    id="totalAmount"
                    name="totalAmount"
                    placeholder="Enter total amount"
                    defaultValue={order?.totalAmount || ''}
                    required
                />
            </FormGrid>
        </FormDialog>
    );
}
