import { FormDialog } from "@/components/FormDialog";
import { FormInput, FormGrid } from "@/components/FormFields";

interface OrderItemFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
    orderItem: OrderItem | null;
    mode: 'add' | 'edit';
}

interface OrderItem {
    id: string;
    order_item_id: number;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    createdAt?: string;
}

export function OrderItemForm({ isOpen, onClose, onSubmit, orderItem, mode }: OrderItemFormProps) {
    return (
        <FormDialog
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmit}
            title={mode === 'add' ? 'Add Order Item' : 'Edit Order Item'}
            description={mode === 'add' ? 'Add a new order item to your system.' : 'Update the order item information.'}
            submitButtonText={mode === 'add' ? 'Add Item' : 'Save Changes'}
        >
            <FormGrid>
                <FormInput
                    label="Order ID"
                    id="orderId"
                    name="orderId"
                    required
                    defaultValue={orderItem?.orderId}
                />

                <FormInput
                    label="Product ID"
                    id="productId"
                    name="productId"
                    required
                    defaultValue={orderItem?.productId}
                />
            </FormGrid>

            <FormGrid>
                <FormInput
                    label="Quantity"
                    id="quantity"
                    name="quantity"
                    type="number"
                    required
                    defaultValue={orderItem?.quantity?.toString()}
                />

                <FormInput
                    label="Unit Price"
                    id="unitPrice"
                    name="unitPrice"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={orderItem?.unitPrice}
                />
            </FormGrid>
        </FormDialog>
    );
}
