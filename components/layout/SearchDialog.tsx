'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { sidebarItems } from '@/lib/sidebar-items';

const searchItems = sidebarItems.flatMap((group) =>
    group.items.map((item) => ({
        id: item.id,
        group: group.label || 'General',
        label: item.title,
        url: item.url,
        icon: item.icon,
        disabled: item.disabled,
    }))
);

export function SearchDialog() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const handleSelect = (url: string) => {
        setOpen(false);
        router.push(url);
    };

    const filteredItems = query
        ? searchItems.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase())
        )
        : searchItems;

    const groupedItems = filteredItems.reduce((acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
        return acc;
    }, {} as Record<string, typeof searchItems>);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="ghost"
                className="px-2 text-muted-foreground hover:bg-transparent hover:text-foreground flex items-center gap-2"
            >
                <Search className="h-4 w-4" />
                <span className="hidden md:inline-flex">Buscar...</span>
                <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium text-[10px]">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command>
                    <CommandInput
                        placeholder="Buscar servicios, clientes, tickets..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        {Object.entries(groupedItems).map(([group, items], index) => (
                            <React.Fragment key={group}>
                                {index > 0 && <CommandSeparator />}
                                <CommandGroup heading={group}>
                                    {items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <CommandItem
                                                key={item.id}
                                                onSelect={() => handleSelect(item.url)}
                                                disabled={item.disabled}
                                                className="flex items-center gap-2"
                                            >
                                                {Icon && <Icon className="h-4 w-4" />}
                                                <span>{item.label}</span>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </React.Fragment>
                        ))}
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    );
}