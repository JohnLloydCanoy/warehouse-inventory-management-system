    'use client';
    import { useState } from "react";
    import { Button } from "@/components/ui/button";

    export function SearchBar() {
    const [searchExpanded, setSearchExpanded] = useState(false);

    return (
        <>
        {/* Desktop search - always visible */}
        <div className="hidden sm:block">
            <input 
            type="search" 
            placeholder="Search..." 
            className="px-3 py-2 border rounded-md w-48 md:w-64 border-black text-black placeholder:text-gray-500"
            />
        </div>
        
        {/* Mobile search - expandable */}
        <div className="sm:hidden flex items-center gap-2">
            {searchExpanded && (
                        <input 
                            type="search" 
                            placeholder="Search..." 
                            autoFocus
                            onBlur={() => setSearchExpanded(false)}
                            className="px-3 py-2 border rounded-md w-40 border-black text-black placeholder:text-gray-500 animate-in slide-in-from-right"
                        />
                        )}
                        <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setSearchExpanded(!searchExpanded)}
                                    className="hover:bg-[#0B2B1A] group"
                                    >
                                    <img 
                                        src="/Search_Icon.png" 
                                        alt="Search" 
                                        width={20} 
                                        height={20}
                                        className="group-hover:invert"
                                    />
                                    </Button>    </div>
                    </>
                );
    }
