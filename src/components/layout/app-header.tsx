
"use client";

import React from 'react';
import { Search, MessageSquare, LayoutGrid, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';

export default function AppHeader() {
  return (
    <header className="bg-card text-card-foreground p-3 flex items-center justify-between border-b border-border shadow-md">
      <div className="flex items-center gap-3">
        {/* Placeholder for the logo */}
        <Image 
            src="https://placehold.co/150x40.png?text=Logo" // Replace with your actual logo URL
            alt="Nav Wireless Logo" 
            width={120} // Adjust as needed
            height={32} // Adjust as needed
            className="object-contain"
            data-ai-hint="logo nav wireless"
        />
        <div>
          <h1 className="text-xl font-semibold text-foreground">LiFi Feasibility Checker</h1>
          <p className="text-xs text-muted-foreground">by Nav Wireless Technologies Pvt. Ltd.</p>
        </div>
      </div>
      <div className="flex-1 max-w-xl px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search (not implemented)"
            className="pl-10 w-full bg-background border-border focus:ring-primary"
            disabled
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
          <MessageSquare className="mr-2 h-4 w-4" />
          Feedback
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border-border hover:bg-primary/10">
              <span className="mr-2">PROJECT:</span> Default
              <LayoutGrid className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Default Project</DropdownMenuItem>
            {/* <DropdownMenuItem>+ New Project</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
        <UserCircle className="h-8 w-8 text-muted-foreground cursor-pointer hover:text-primary" />
      </div>
    </header>
  );
}
