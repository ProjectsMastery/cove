"use client";

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/lib/types';
import { Search, ShoppingCart } from 'lucide-react';


// --- A New Search and Filter Component ---
// This is a Client Component because it needs to interact with the user.

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function StorefrontSearch({ categories }: { categories: Category[] }) {
    const searchParams = useSearchParams();
    const { replace } = useRouter();
    const pathname = usePathname();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) params.set('q', term);
        else params.delete('q');
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleCategoryChange = (categoryId: string) => {
        const params = new URLSearchParams(searchParams);
        if (categoryId && categoryId !== 'all') params.set('category', categoryId);
        else params.delete('category');
        replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search products..."
                className="pl-10"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('q')?.toString()}
                />
            </div>
            <div className="md:w-1/4">
                <Select
                    onValueChange={handleCategoryChange}
                    defaultValue={searchParams.get('category')?.toString() || 'all'}
                >
                    <SelectTrigger><SelectValue placeholder="Filter by category" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
// --- END of Client Component ---