'use client';

interface FormInputProps {
    label: string;
    id: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    step?: string;
    defaultValue?: string;
}

interface FormTextareaProps {
    label: string;
    id: string;
    name: string;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    defaultValue?: string;
}

export function FormInput({ 
    label, 
    id, 
    name, 
    type = "text", 
    placeholder = "", 
    required = false,
    step,
    defaultValue = ""
}: FormInputProps) {
    return (
        <div>
            <label className="form-label" htmlFor={id}>
                {label}
            </label>
            <input
                type={type}
                id={id}
                name={name}
                className="form-input"
                placeholder={placeholder}
                required={required}
                step={step}
                defaultValue={defaultValue}
            />
        </div>
    );
}

export function FormTextarea({ 
    label, 
    id, 
    name, 
    placeholder = "", 
    required = false,
    rows = 3,
    defaultValue = ""
}: FormTextareaProps) {
    return (
        <div>
            <label className="form-label" htmlFor={id}>
                {label}
            </label>
            <textarea
                id={id}
                name={name}
                rows={rows}
                className="form-textarea"
                placeholder={placeholder}
                required={required}
                defaultValue={defaultValue}
            />
        </div>
    );
}

interface FormGridProps {
    children: React.ReactNode;
}

export function FormGrid({ children }: FormGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    );
}
