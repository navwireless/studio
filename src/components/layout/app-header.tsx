
"use client";

import React from 'react';
import { Shield, Search, MessageSquare, LayoutGrid, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AppHeader() {
  return (
    <header className="bg-card text-card-foreground p-3 flex items-center justify-between border-b border-border shadow-md">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">UISP Design Center</h1>
      </div>
      <div className="flex-1 max-w-xl px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for devices, sites or an address"
            className="pl-10 w-full bg-background border-border focus:ring-primary"
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
              <span className="mr-2">CURRENT PROJECT:</span> Untitled Project
              <LayoutGrid className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Project 1</DropdownMenuItem>
            <DropdownMenuItem>Project 2</DropdownMenuItem>
            <DropdownMenuItem>+ New Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserCircle className="h-8 w-8 text-muted-foreground cursor-pointer hover:text-primary" />
      </div>
    </header>
  );
}
