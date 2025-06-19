
"use client";

import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import type { Control, UseFormRegister, UseFormHandleSubmit, FieldErrors, UseFormSetValue } from 'react-hook-form';
import type { FiberCalculatorFormValues } from '@/lib/fiber-calculator-form-schema';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Cable, Route, AlertTriangle, CheckCircle, XCircle, Trash2, HelpCircle, Sparkles, MapPin, Download, Loader2, FileArchive, Check } from 'lucide-react'; // Added Check
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast'; // Added useToast

interface SiteInputGroupFCProps {
  id: 'pointA' | 'pointB';
  title: string;
  control: Control<FiberCalculatorFormValues>;
  register: UseFormRegister<FiberCalculatorFormValues>;
  clientFormErrors: FieldErrors<FiberCalculatorFormValues>;
  getCombinedError: (clientError: any) => string | undefined;
}

const SiteInputGroupFC: React.FC<SiteInputGroupFCProps> = ({
  id,
  title,
  register,
  clientFormErrors,
  getCombinedError,
}) => (
  <div className="space-y-3">
    <h3 className="text-sm font-medium text-muted-foreground flex items-center">
      <MapPin className="mr-2 h-4 w-4 text-primary/80" /> {title}
    </h3>
    <div>
      <Label htmlFor={`${id}.name`} className="text-xs">Name</Label>
      <Input
        id={`${id}.name`}
        {...register(`${id}.name`)}
        placeholder="e.g. Building Alpha"
        className="mt-1 bg-input/70 h-9"
      />
      {clientFormErrors[id]?.name &&
        <p className="text-xs text-destructive mt-1">{getCombinedError(clientFormErrors[id]?.name)}</p>}
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label htmlFor={`${id}.lat`} className="text-xs">Latitude</Label>
        <Input
          id={`${id}.lat`}
          {...register(`${id}.lat`)}
          placeholder="e.g. 28.6139"
          className="mt-1 bg-input/70 h-9"
        />
        {clientFormErrors[id]?.lat &&
          <p className="text-xs text-destructive mt-1">{getCombinedError(clientFormErrors[id]?.lat)}</p>}
      </div>
      <div>
        <Label htmlFor={`${id}.lng`} className="text-xs">Longitude</Label>
        <Input
          id={`${id}.lng`}
          {...register(`${id}.lng`)}
          placeholder="e.g. 77.2090"
          className="mt-1 bg-input/70 h-9"
        />
        {clientFormErrors[id]?.lng &&
          <p className="text-xs text-destructive mt-1">{getCombinedError(clientFormErrors[id]?.lng)}</p>}
      </div>
    </div>
  </div>
);


interface FiberInputPanelProps {
  control: Control<FiberCalculatorFormValues>;
  register: UseFormRegister<FiberCalculatorFormValues>; // Still used for Point A/B
  handleSubmit: UseFormHandleSubmit<FiberCalculatorFormValues>;
  onSubmit: (data: FiberCalculatorFormValues) => void; // Main calculation trigger
  setValue: UseFormSetValue<FiberCalculatorFormValues>; // For updating RHF state
  formSnapRadius: number; // Current snap radius from RHF state
  onClear: () => void;
  onGeneratePdfReport: () => void;
  onGenerateKmzReport: () => void;
  clientFormErrors: FieldErrors<FiberCalculatorFormValues>;
  isCalculating: boolean;
  isGeneratingPdf: boolean;
  isGeneratingKmz: boolean;
  fiberPathResult: FiberPathResult | null;
  calculationError: string | null;
}

export default function FiberInputPanel({
  control,
  register,
  handleSubmit,
  onSubmit,
  setValue, // New prop
  formSnapRadius, // New prop
  onClear,
  onGeneratePdfReport,
  onGenerateKmzReport,
  clientFormErrors,
  isCalculating,
  isGeneratingPdf,
  isGeneratingKmz,
  fiberPathResult,
  calculationError,
}: FiberInputPanelProps) {
  const { toast } = useToast();
  // Local state for the snap radius input field
  const [localSnapRadiusInput, setLocalSnapRadiusInput] = useState<string>(() => formSnapRadius.toString());

  // Effect to sync local input state if the formSnapRadius prop changes from parent
  useEffect(() => {
    // Only update if the string representation is different, to avoid loops
    // and to handle cases where formSnapRadius might be NaN initially if not properly defaulted
    if (formSnapRadius !== undefined && localSnapRadiusInput !== formSnapRadius.toString()) {
      setLocalSnapRadiusInput(formSnapRadius.toString());
    }
  }, [formSnapRadius, localSnapRadiusInput]);


  const getCombinedError = (clientFieldError?: { message?: string }) => {
    return clientFieldError?.message;
  };

  // Handler for the "Apply" button next to the snap radius input
  const handleApplySnapRadiusAndRecalculate = () => {
    const newRadiusNum = parseInt(localSnapRadiusInput, 10);
    // Validate the locally entered radius
    if (!isNaN(newRadiusNum) && newRadiusNum >= 1 && newRadiusNum <= 10000) { // Basic validation matching schema
      setValue('fiberSnapRadius', newRadiusNum, { shouldValidate: true, shouldDirty: true });
      // Programmatically trigger the main form submission to recalculate
      handleSubmit(onSubmit)();
    } else {
      toast({ 
        title: "Invalid Snap Radius", 
        description: "Please enter a whole number between 1 and 10000 for the snap radius.", 
        variant: "destructive" 
      });
      // Optionally, revert local input to last valid RHF value or show error near input
      // For now, toast is the primary feedback. RHF validation will also catch it on submit.
    }
  };


  const formatFiberStatus = (status?: FiberPathResult['status']): string => {
    if (!status) return 'N/A';
    switch (status) {
      case 'success': return 'Calculation Successful';
      case 'los_not_feasible': return 'LOS Not Feasible (N/A for this tool)';
      case 'no_road_for_a': return 'No Road Found Near Site A';
      case 'no_road_for_b': return 'No Road Found Near Site B';
      case 'no_route_between_roads': return 'No Road Route Between Snapped Points';
      case 'radius_too_small': return 'Snap Radius Too Small For One or Both Points';
      case 'api_error': return 'API Communication Error';
      case 'input_error': return 'Invalid Input Provided';
      default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusIcon = (status?: FiberPathResult['status']) => {
    if (isCalculating) return <Loader2 className="h-5 w-5 mr-2 animate-spin text-primary" />;
    if (!status && !calculationError) return null; 
    if (calculationError && !fiberPathResult) return <XCircle className="h-5 w-5 mr-2 text-red-500" />; 
    if (!status) return <XCircle className="h-5 w-5 mr-2 text-red-500" />; 
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 mr-2 text-green-500" />;
      case 'no_road_for_a':
      case 'no_road_for_b':
      case 'no_route_between_roads':
      case 'radius_too_small': return <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />;
      default: return <XCircle className="h-5 w-5 mr-2 text-red-500" />;
    }
  };

  const getStatusColorClass = (status?: FiberPathResult['status']): string => {
     if (!status) return 'text-red-400';
     switch (status) {
      case 'success': return 'text-green-400';
      case 'no_road_for_a':
      case 'no_road_for_b':
      case 'no_route_between_roads':
      case 'radius_too_small': return 'text-amber-400';
      default: return 'text-red-400';
    }
  }
  
  const canExport = fiberPathResult?.status === 'success';
  const anyOperationPending = isCalculating || isGeneratingPdf || isGeneratingKmz;

  return (
    <TooltipProvider>
      {/* The main form submission is handled by the parent page via handleSubmit(onSubmit) */}
      {/* This form tag is primarily for structure and accessibility if needed, but not strictly for submission here */}
      <div className="h-full flex flex-col">
        <Card className="flex-1 flex flex-col border-0 shadow-none bg-transparent rounded-none p-0">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              Fiber Path Calculator
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Define two points and a snap radius to estimate the fiber optic path length using road networks.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 p-3 md:p-4 overflow-y-auto custom-scrollbar">
            <SiteInputGroupFC
              id="pointA"
              title="Start Point (Site A)"
              control={control}
              register={register}
              clientFormErrors={clientFormErrors}
              getCombinedError={getCombinedError}
            />
            <Separator />
            <SiteInputGroupFC
              id="pointB"
              title="End Point (Site B)"
              control={control}
              register={register}
              clientFormErrors={clientFormErrors}
              getCombinedError={getCombinedError}
            />
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor="fiberSnapRadiusInput" className="text-sm font-medium text-muted-foreground">
                  Snap to Road Radius (meters)
                </Label>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 p-0 m-0" onClick={(e) => e.preventDefault()} aria-label="Snap radius info">
                            <HelpCircle className="h-4 w-4 text-muted-foreground/70 cursor-help" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs p-2 bg-popover text-popover-foreground border border-border shadow-lg">
                        Max distance from each site (A or B) to search for a road.
                        If a road is found further than this radius, calculation for that point might fail.
                        (e.g., 500 for 500m). Click "Apply" to use the new radius for calculation.
                    </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-start gap-2"> {/* Use items-start for error message alignment */}
                <Input
                  id="fiberSnapRadiusInput" // Changed ID to avoid conflict if RHF still holds old one internally
                  type="number"
                  value={localSnapRadiusInput}
                  onChange={(e) => setLocalSnapRadiusInput(e.target.value)}
                  placeholder="e.g., 500"
                  min={1}
                  className="bg-input/70 h-9 flex-grow"
                  disabled={anyOperationPending}
                />
                <Button
                  type="button"
                  onClick={handleApplySnapRadiusAndRecalculate}
                  disabled={anyOperationPending || localSnapRadiusInput === formSnapRadius.toString()} // Disable if no change or processing
                  size="sm"
                  className="h-9 px-3" // Adjusted padding for "Apply"
                  variant="outline"
                >
                  <Check className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">Apply</span>
                </Button>
              </div>
              {/* Display validation error for fiberSnapRadius from RHF state */}
              {clientFormErrors.fiberSnapRadius &&
                <p className="text-xs text-destructive mt-1">{getCombinedError(clientFormErrors.fiberSnapRadius)}</p>}
            </div>

            <div className="pt-2 space-y-2">
               <Button type="button" onClick={handleSubmit(onSubmit)} className="w-full" disabled={anyOperationPending}>
                {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Route className="mr-2 h-4 w-4" />}
                {isCalculating ? 'Calculating...' : 'Calculate Fiber Path'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={onClear} disabled={anyOperationPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear & Reset
              </Button>
            </div>

            {(fiberPathResult || calculationError || isCalculating) && (
              <div className="mt-4 p-3 border rounded-md bg-muted/30 space-y-1.5 text-xs">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm flex items-center">
                    {getStatusIcon(fiberPathResult?.status)}
                    Calculation Result
                    </h4>
                    {canExport && (
                        <div className="flex items-center gap-2">
                             <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onGenerateKmzReport}
                                disabled={!canExport || anyOperationPending}
                                className="h-7 text-xs px-2 py-1"
                            >
                                {isGeneratingKmz ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <FileArchive className="mr-1.5 h-3.5 w-3.5" />}
                                KMZ
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onGeneratePdfReport}
                                disabled={!canExport || anyOperationPending}
                                className="h-7 text-xs px-2 py-1"
                            >
                                {isGeneratingPdf ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
                                PDF
                            </Button>
                        </div>
                    )}
                </div>

                {isCalculating && !fiberPathResult && (
                    <p className="text-primary text-sm">Calculating, please wait...</p>
                )}

                {fiberPathResult && !isCalculating && (
                  <>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={cn(getStatusColorClass(fiberPathResult.status), "font-semibold")}>
                        {formatFiberStatus(fiberPathResult.status)}
                      </span>
                    </p>
                    {fiberPathResult.status === 'success' && fiberPathResult.totalDistanceMeters !== undefined && (
                      <>
                        <p className="text-base font-bold text-primary my-1.5">
                          Total Fiber Distance: {fiberPathResult.totalDistanceMeters.toFixed(1)} m
                        </p>
                        <div className="pl-2 border-l-2 border-primary/30 space-y-0.5 text-muted-foreground">
                            <p><span className="font-medium">Offset A (Site to Road):</span> {fiberPathResult.offsetDistanceA_meters?.toFixed(1) ?? 'N/A'} m</p>
                            <p><span className="font-medium">Road Route Distance:</span> {fiberPathResult.roadRouteDistanceMeters?.toFixed(1) ?? 'N/A'} m</p>
                            <p><span className="font-medium">Offset B (Road to Site):</span> {fiberPathResult.offsetDistanceB_meters?.toFixed(1) ?? 'N/A'} m</p>
                        </div>
                      </>
                    )}
                    {fiberPathResult.errorMessage && (
                      <p className={cn(
                         "italic mt-1.5 text-sm",
                         getStatusColorClass(fiberPathResult.status)
                       )}>
                        {fiberPathResult.errorMessage}
                        {(fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'radius_too_small') &&
                         <span className="block text-xs text-amber-300/80 mt-0.5"> Consider increasing the Snap Radius and clicking "Apply".</span>
                        }
                         {fiberPathResult.status === 'no_route_between_roads' &&
                             <span className="block text-xs text-amber-300/80 mt-0.5"> The snapped road points for Site A and Site B may be on disconnected road networks.</span>
                         }
                      </p>
                    )}
                  </>
                )}
                {calculationError && !fiberPathResult && !isCalculating && (
                     <p className="text-red-400 text-sm"><span className="font-semibold">Error:</span> {calculationError}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

