    'use client';
    import Link from "next/link";
    import { usePathname } from "next/navigation";

    interface NavLinkProps {
    href: string;
    icon: string;
    label: string;
    }

    export function NavLink({ href, icon, label }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href}>
            <div className={`flex items-center gap-2 lg:gap-4 p-2 pl-4 pr-8 rounded-l-full cursor-pointer transition-colors ${
                isActive 
                ? 'bg-[#0B2B1A] text-white -ml-2 lg:-ml-2 -mr-2 lg:-mr-4' 
                : 'hover:bg-white hover:text-black text-white group text-white -ml-2 lg:-ml-2 -mr-2 lg:-mr-4'
            }`}>
                <img 
                src={icon} 
                alt="#" 
                className={`w-5 h-5 lg:w-6 lg:h-6 ${
                isActive 
                ? 'brightness-0 invert' 
                : 'position-center brightness-0 invert group-hover:invert-0'
                }`} 
                />
                <h3 className={`text-xs lg:text-sm font-bold uppercase hidden lg:block ${
                isActive 
                ? 'text-white' 
                : 'group-hover:text-black'
                }`}>
                {label}
                </h3>
            </div>
            </Link>
    );
    }
