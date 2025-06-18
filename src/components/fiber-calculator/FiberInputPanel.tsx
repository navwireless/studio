
"use client";

import type { Control, UseFormRegister, UseFormHandleSubmit, FieldErrors } from 'react-hook-form';
import type { FiberCalculatorFormValues } from '@/lib/fiber-calculator-form-schema';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Cable, Route, AlertTriangle, CheckCircle, XCircle, Trash2, HelpCircle, Sparkles, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
  register: UseFormRegister<FiberCalculatorFormValues>;
  handleSubmit: UseFormHandleSubmit<FiberCalculatorFormValues>;
  onSubmit: (data: FiberCalculatorFormValues) => void;
  onClear: () => void;
  clientFormErrors: FieldErrors<FiberCalculatorFormValues>;
  isCalculating: boolean;
  fiberPathResult: FiberPathResult | null;
  calculationError: string | null; 
}

export default function FiberInputPanel({
  control,
  register,
  handleSubmit,
  onSubmit,
  onClear,
  clientFormErrors,
  isCalculating,
  fiberPathResult,
  calculationError,
}: FiberInputPanelProps) {
  
  const getCombinedError = (clientFieldError?: { message?: string }) => {
    return clientFieldError?.message;
  };

  const formatFiberStatus = (status?: FiberPathResult['status']): string => {
    if (!status) return 'N/A';
    switch (status) {
      case 'success': return 'Success';
      case 'los_not_feasible': return 'LOS Not Feasible (Not applicable here)'; // Should not occur on this page
      case 'no_road_for_a': return 'No Road Near Site A';
      case 'no_road_for_b': return 'No Road Near Site B';
      case 'no_route_between_roads': return 'No Road Route Between Snapped Points';
      case 'radius_too_small': return 'Snap Radius Too Small';
      case 'api_error': return 'API Error';
      case 'input_error': return 'Input Error';
      default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatusIcon = (status?: FiberPathResult['status']) => {
    if (!status) return null;
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 mr-2 text-green-500" />;
      case 'no_road_for_a': 
      case 'no_road_for_b': 
      case 'no_route_between_roads':
      case 'radius_too_small': return <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />;
      default: return <XCircle className="h-4 w-4 mr-2 text-red-500" />;
    }
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="h-full flex flex-col">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="fiberSnapRadius" className="text-sm font-medium text-muted-foreground">
                  Snap to Road Radius (meters)
                </Label>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 p-0 m-0" onClick={(e) => e.preventDefault()} aria-label="Snap radius info">
                            <HelpCircle className="h-4 w-4 text-muted-foreground/70 cursor-help" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs p-2">
                        Max distance from each site (A or B) to search for a road.
                        If a road is found further than this radius, calculation for that point might fail.
                        (e.g., 500 for 500m)
                    </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="fiberSnapRadius"
                type="number"
                {...register("fiberSnapRadius")}
                placeholder="e.g., 500"
                min={1}
                className="mt-1 bg-input/70 h-9"
              />
              {clientFormErrors.fiberSnapRadius &&
                <p className="text-xs text-destructive mt-1">{getCombinedError(clientFormErrors.fiberSnapRadius)}</p>}
            </div>

            <div className="pt-2 space-y-2">
               <Button type="submit" className="w-full" disabled={isCalculating}>
                <Route className="mr-2 h-4 w-4" />
                {isCalculating ? 'Calculating...' : 'Calculate Fiber Path'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={onClear} disabled={isCalculating}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear & Reset
              </Button>
            </div>

            {/* Results Area */}
            {(fiberPathResult || calculationError) && !isCalculating && (
              <div className="mt-4 p-3 border rounded-md bg-muted/30 space-y-1.5 text-xs">
                <h4 className="font-semibold text-sm mb-2 flex items-center">
                  {fiberPathResult ? getStatusIcon(fiberPathResult.status) : <XCircle className="h-4 w-4 mr-2 text-red-500" /> }
                  Calculation Result:
                </h4>
                {fiberPathResult && (
                  <>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={cn(
                        fiberPathResult.status === 'success' ? 'text-green-400' : 
                        (fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'no_route_between_roads' || fiberPathResult.status === 'radius_too_small') ? 'text-amber-400' :
                        'text-red-400',
                        "font-semibold"
                      )}>
                        {formatFiberStatus(fiberPathResult.status)}
                      </span>
                    </p>
                    {fiberPathResult.status === 'success' && fiberPathResult.totalDistanceMeters !== undefined && (
                      <>
                        <p><span className="font-medium">Total Fiber Distance:</span> {fiberPathResult.totalDistanceMeters.toFixed(1)} m</p>
                        <p><span className="font-medium">Offset A (Site to Road):</span> {fiberPathResult.offsetDistanceA_meters?.toFixed(1)} m</p>
                        <p><span className="font-medium">Road Route Distance:</span> {fiberPathResult.roadRouteDistanceMeters?.toFixed(1)} m</p>
                        <p><span className="font-medium">Offset B (Road to Site):</span> {fiberPathResult.offsetDistanceB_meters?.toFixed(1)} m</p>
                      </>
                    )}
                    {fiberPathResult.errorMessage && (
                      <p className={cn(
                         "italic mt-1",
                         (fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'radius_too_small' || fiberPathResult.status === 'no_route_between_roads') ? 'text-amber-400' : 'text-red-400'
                      )}>
                        <span className="font-medium">Note:</span> {fiberPathResult.errorMessage}
                        {(fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'radius_too_small') && " Consider increasing the Snap Radius."}
                      </p>
                    )}
                  </>
                )}
                {calculationError && !fiberPathResult && (
                     <p className="text-red-400"><span className="font-semibold">Error:</span> {calculationError}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </TooltipProvider>
  );
}

    