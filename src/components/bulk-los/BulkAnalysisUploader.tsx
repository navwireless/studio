
"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseKmzFile, type KmzPlacemark } from '@/lib/kmz-parser';

interface BulkAnalysisUploaderProps {
  onKmzUploaded: (file: File, placemarks: KmzPlacemark[], fileName: string) => void;
}

const BulkAnalysisUploader: React.FC<BulkAnalysisUploaderProps> = ({ onKmzUploaded }) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedPlacemarkCount, setParsedPlacemarkCount] = useState<number>(0);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (!file.name.toLowerCase().endsWith('.kmz') && file.type !== 'application/vnd.google-earth.kmz') {
        toast({ title: "Invalid File Type", description: "Please select a .kmz file.", variant: "destructive" });
        clearSelection();
        return;
      }
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        toast({ title: "File Too Large", description: "KMZ file size must be 15MB or less.", variant: "destructive" });
        clearSelection();
        return;
      }
      
      setSelectedFile(file);
      setFileName(file.name);
      setIsParsing(true);
      setParsedPlacemarkCount(0);

      try {
        const placemarks = await parseKmzFile(file);
        if (placemarks.length < 2) {
          toast({ title: "KMZ Parsing Issue", description: "Not enough placemarks (need at least 2) found in the KMZ file.", variant: "destructive" });
          onKmzUploaded(file, [], file.name); // Notify parent with empty placemarks
          setParsedPlacemarkCount(0);
        } else {
          onKmzUploaded(file, placemarks, file.name);
          setParsedPlacemarkCount(placemarks.length);
          toast({ title: "KMZ File Loaded", description: `Successfully parsed ${placemarks.length} placemarks from ${file.name}.` });
        }
      } catch (error) {
        console.error("Error parsing KMZ:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not parse the KMZ file. It might be corrupted or malformed.";
        toast({ title: "KMZ Parsing Error", description: errorMessage, variant: "destructive", duration: 7000 });
        clearSelection(false); // Keep file name for context of error, but clear internal state for re-upload
        onKmzUploaded(file, [], file.name); // Notify parent of parsing failure
      } finally {
        setIsParsing(false);
      }
    }
  };

  const clearSelection = (resetFileInput = true) => {
    setSelectedFile(null);
    setFileName(null);
    setParsedPlacemarkCount(0);
    if (fileInputRef.current && resetFileInput) {
      fileInputRef.current.value = ""; // Reset the file input
    }
    if (selectedFile) {
        onKmzUploaded(selectedFile, [], selectedFile.name);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <UploadCloud className="mr-2 h-5 w-5 text-primary" />
          Upload KMZ File
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label htmlFor="kmzFile" className="sr-only">KMZ File</Label>
        <Input
          id="kmzFile"
          ref={fileInputRef}
          type="file"
          accept=".kmz,application/vnd.google-earth.kmz"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500 dark:text-slate-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-primary/10 file:text-primary
                     hover:file:bg-primary/20
                     dark:file:bg-primary/80 dark:file:text-primary-foreground
                     dark:hover:file:bg-primary"
          disabled={isParsing}
        />
        {fileName && (
          <div className="text-sm text-muted-foreground p-2 border border-dashed rounded-md">
            <div className="flex justify-between items-center">
                <span className="truncate">
                    <FileText className="inline mr-2 h-4 w-4" /> {fileName}
                </span>
                <Button variant="ghost" size="sm" onClick={() => clearSelection()} disabled={isParsing} aria-label="Clear file selection">
                    <XCircle className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                </Button>
            </div>
             {isParsing && <p className="text-xs text-primary mt-1">Parsing file...</p>}
             {!isParsing && parsedPlacemarkCount > 0 && <p className="text-xs text-green-600 dark:text-green-500 mt-1">{parsedPlacemarkCount} placemarks found.</p>}
             {!isParsing && selectedFile && parsedPlacemarkCount === 0 && <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">No usable placemarks found or parse error.</p>}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Max file size: 15MB. Ensure the KMZ contains point placemarks.</p>
      </CardContent>
    </Card>
  );
};

export default BulkAnalysisUploader;
