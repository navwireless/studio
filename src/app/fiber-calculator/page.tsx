"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, type UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AppHeader from '@/components/layout/app-header';
import InteractiveMap from '@/components/fso/interactive-map';
import type { PlacementMode } from '@/types';
import { FiberCalculatorFormSchema, type FiberCalculatorFormValues, defaultFiberCalculatorFormValues } from '@/lib/fiber-calculator-form-schema';
import { useToast } from '@/hooks/use-toast';
import FiberInputPanel from '@/components/fiber-calculator/FiberInputPanel';
import { ErrorBoundary } from '@/components/error-boundary';
import { MapErrorBoundary } from '@/components/map-error-boundary';
import { performFiberPathAnalysisAction } from '@/tools/fiberPathCalculator';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import { generateFiberReportAction, generateSingleFiberPathKmzAction } from '@/app/actions';
import { saveAs } from 'file-saver';
import { useCredits } from '@/hooks/use-credits';
import CreditWarning from '@/components/credit-warning';
import ProUpsellModal from '@/components/pro-upsell-modal';

const FC_LOCAL_STORAGE_KEYS = {
  SNAP_RADIUS: 'fiberCalculatorSnapRadius',
};

export default function FiberCalculatorPage() {
  const { toast } = useToast();
  const { refreshCredits } = useCredits();
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingKmz, setIsGeneratingKmz] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [fiberPathResult, setFiberPathResult] = useState<FiberPathResult | null>(null);
  const [placementMode, setPlacementMode] = useState<PlacementMode>('A');

  // Credit management
  const [creditWarningTrigger, setCreditWarningTrigger] = useState(false);
  const [latestCredits, setLatestCredits] = useState<number>(999);
  const [showZeroCreditModal, setShowZeroCreditModal] = useState(false);

  const form = useForm<FiberCalculatorFormValues>({
    resolver: zodResolver(FiberCalculatorFormSchema),
    defaultValues: defaultFiberCalculatorFormValues,
    mode: 'onBlur',
  });

  const { register, handleSubmit, control, formState: { errors: clientFormErrors }, getValues, setValue, reset, watch } = form;

  useEffect(() => {
    const storedRadius = localStorage.getItem(FC_LOCAL_STORAGE_KEYS.SNAP_RADIUS);
    if (storedRadius) {
      setValue('fiberSnapRadius', parseInt(storedRadius, 10), { shouldValidate: true });
    }
  }, [setValue]);

  const watchedSnapRadius = watch('fiberSnapRadius');

  useEffect(() => {
    if (typeof watchedSnapRadius === 'number' && !isNaN(watchedSnapRadius)) {
      localStorage.setItem(FC_LOCAL_STORAGE_KEYS.SNAP_RADIUS, watchedSnapRadius.toString());
    }
  }, [watchedSnapRadius]);

  const handleCalculateSubmit = async (data: FiberCalculatorFormValues) => {
    setIsCalculating(true);
    setCalculationError(null);
    setFiberPathResult(null);
    setCreditWarningTrigger(false);

    try {
      const pointA_lat_num = parseFloat(data.pointA.lat);
      const pointA_lng_num = parseFloat(data.pointA.lng);
      const pointB_lat_num = parseFloat(data.pointB.lat);
      const pointB_lng_num = parseFloat(data.pointB.lng);

      if (isNaN(pointA_lat_num) || isNaN(pointA_lng_num) || isNaN(pointB_lat_num) || isNaN(pointB_lng_num)) {
        setCalculationError("Invalid coordinates provided for Point A or Point B.");
        toast({ title: "Input Error", description: "Please provide valid numeric coordinates for both points.", variant: "destructive" });
        setIsCalculating(false);
        return;
      }

      // ── Credit deduction via server action ──
      const creditResponse = await fetch('/api/auth/refresh');
      const creditData = await creditResponse.json();

      if (creditData.plan !== 'pro') {
        // Deduct credit for non-pro users
        const deductResponse = await fetch('/api/credits/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisType: 'fiber_path' }),
        });
        const deductData = await deductResponse.json();

        if (!deductResponse.ok || !deductData.success) {
          const errorMsg = deductData.error || 'Credit check failed.';
          if (errorMsg.includes('Not enough credits') || errorMsg.includes('Credit check failed')) {
            setShowZeroCreditModal(true);
          }
          setCalculationError(errorMsg);
          toast({ title: "Credit Error", description: errorMsg, variant: "destructive" });
          setIsCalculating(false);
          return;
        }

        // Update credit display
        if (typeof deductData.creditsRemaining === 'number') {
          setLatestCredits(deductData.creditsRemaining);
          setCreditWarningTrigger(true);
          if (deductData.creditsRemaining <= 0) {
            setShowZeroCreditModal(true);
          }
          refreshCredits();
        }
      }

      const result = await performFiberPathAnalysisAction(
        pointA_lat_num,
        pointA_lng_num,
        pointB_lat_num,
        pointB_lng_num,
        data.fiberSnapRadius,
        true
      );

      setFiberPathResult(result);

      if (result.status !== 'success') {
        setCalculationError(result.errorMessage || 'Fiber path calculation failed.');
        toast({
          title: result.status === 'api_error' ? "API Error" : "Calculation Info",
          description: result.errorMessage || 'Could not calculate fiber path.',
          variant: result.status === 'api_error' ? "destructive" : "default",
          duration: 7000
        });
      } else {
        toast({ title: "Fiber Path Calculated", description: `Total distance: ${result.totalDistanceMeters?.toFixed(0)}m` });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred.";
      setCalculationError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGeneratePdfReport = async () => {
    if (!fiberPathResult || fiberPathResult.status !== 'success') {
      toast({ title: "Error", description: "No successful fiber path data available to generate PDF.", variant: "destructive" });
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const currentFormValues = getValues();
      const snapRadius = currentFormValues.fiberSnapRadius;

      const reportParams = {
        fiberPathResult: fiberPathResult,
        pointA_form: {
          name: currentFormValues.pointA.name,
          lat: currentFormValues.pointA.lat,
          lng: currentFormValues.pointA.lng,
        },
        pointB_form: {
          name: currentFormValues.pointB.name,
          lat: currentFormValues.pointB.lat,
          lng: currentFormValues.pointB.lng,
        },
        snapRadiusUsed_form: snapRadius,
      };

      const response = await generateFiberReportAction(reportParams);

      if (response.success) {
        const { base64Pdf, fileName } = response.data;
        const byteCharacters = atob(base64Pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        saveAs(blob, fileName);
        toast({ title: "Success", description: "PDF report downloaded." });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error generating PDF.";
      console.error("PDF Generation Error:", error);
      toast({ title: "PDF Generation Failed", description: errorMessage, variant: "destructive", duration: 7000 });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleGenerateKmzReport = async () => {
    if (!fiberPathResult || fiberPathResult.status !== 'success') {
      toast({ title: "Error", description: "No successful fiber path data available to generate KMZ.", variant: "destructive" });
      return;
    }
    setIsGeneratingKmz(true);
    try {
      const currentFormValues = getValues();
      const kmzParams = {
        fiberPathResult: fiberPathResult,
        pointA_name: currentFormValues.pointA.name || "Site A",
        pointB_name: currentFormValues.pointB.name || "Site B",
      };

      const response = await generateSingleFiberPathKmzAction(kmzParams);

      if (response.success && response.data) {
        const { base64Kmz, fileName } = response.data;
        const byteCharacters = atob(base64Kmz);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.google-earth.kmz' });
        saveAs(blob, fileName);
        toast({ title: "Success", description: "KMZ file downloaded." });
      } else {
        throw new Error(!response.success ? response.error : "KMZ generation failed without specific error message.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error generating KMZ.";
      console.error("KMZ Generation Error:", error);
      toast({ title: "KMZ Generation Failed", description: errorMessage, variant: "destructive", duration: 7000 });
    } finally {
      setIsGeneratingKmz(false);
    }
  };

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });
      setFiberPathResult(null);
      setCalculationError(null);
      setPlacementMode(pointId === 'pointA' ? 'B' : 'A');
    }
  }, [setValue]);

  const handleMarkerDrag = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });
      setFiberPathResult(null);
      setCalculationError(null);
    }
  }, [setValue]);

  const handleClearForm = () => {
    reset(defaultFiberCalculatorFormValues);
    const storedRadius = localStorage.getItem(FC_LOCAL_STORAGE_KEYS.SNAP_RADIUS);
    setValue('fiberSnapRadius', storedRadius ? parseInt(storedRadius, 10) : defaultFiberCalculatorFormValues.fiberSnapRadius);

    setFiberPathResult(null);
    setCalculationError(null);
    toast({ title: "Form Cleared", description: "Inputs reset to default values." });
  };

  const formPointAForMap = watch('pointA');
  const formPointBForMap = watch('pointB');

  const mapPointA = formPointAForMap.lat && formPointAForMap.lng && !isNaN(parseFloat(formPointAForMap.lat)) && !isNaN(parseFloat(formPointAForMap.lng))
    ? { lat: parseFloat(formPointAForMap.lat), lng: parseFloat(formPointAForMap.lng), name: formPointAForMap.name }
    : undefined;
  const mapPointB = formPointBForMap.lat && formPointBForMap.lng && !isNaN(parseFloat(formPointBForMap.lat)) && !isNaN(parseFloat(formPointBForMap.lng))
    ? { lat: parseFloat(formPointBForMap.lat), lng: parseFloat(formPointBForMap.lng), name: formPointBForMap.name }
    : undefined;

  const anyOperationPending = isCalculating || isGeneratingPdf || isGeneratingKmz;
  const currentFormSnapRadius = watch('fiberSnapRadius');

  return (
    <>
      <AppHeader />

      {/* Credit warning toasts */}
      <CreditWarning credits={latestCredits} trigger={creditWarningTrigger} />

      {/* Zero-credit blocking modal */}
      <ProUpsellModal
        open={showZeroCreditModal}
        onOpenChange={setShowZeroCreditModal}
        blocking={latestCredits <= 0}
        trigger="zero_credits"
      />

      <div className="flex-1 flex flex-col-reverse md:flex-row overflow-hidden h-[calc(100vh-theme(spacing.11))]">
        <div className="w-full md:w-[380px] lg:w-[420px] xl:w-[450px] h-auto md:h-full overflow-y-auto custom-scrollbar bg-card/80 backdrop-blur-sm shadow-lg border-t md:border-t-0 md:border-r border-border p-1 print:hidden">
          <ErrorBoundary>
            <FiberInputPanel
              control={control}
              register={register}
              handleSubmit={handleSubmit}
              onSubmit={handleCalculateSubmit}
              setValue={setValue as UseFormSetValue<FiberCalculatorFormValues>}
              formSnapRadius={currentFormSnapRadius}
              onClear={handleClearForm}
              onGeneratePdfReport={handleGeneratePdfReport}
              onGenerateKmzReport={handleGenerateKmzReport}
              clientFormErrors={clientFormErrors}
              isCalculating={isCalculating}
              isGeneratingPdf={isGeneratingPdf}
              isGeneratingKmz={isGeneratingKmz}
              fiberPathResult={fiberPathResult}
              calculationError={calculationError}
            />
          </ErrorBoundary>
        </div>
        <div className="flex-1 w-full relative min-h-[250px] md:min-h-0">
          <MapErrorBoundary>
            <InteractiveMap
              pointA={mapPointA}
              pointB={mapPointB}
              placementMode={placementMode}
              onMapClick={handleMapClick}
              onMarkerDrag={handleMarkerDrag}
              mapContainerClassName="w-full h-full"
              analysisResult={null}
              isStale={false}
              fiberPathResult={fiberPathResult}
            />
          </MapErrorBoundary>
        </div>

        {anyOperationPending && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <Card className="p-6 shadow-2xl bg-card/90">
              <CardContent className="flex flex-col items-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold text-foreground">
                  {isCalculating ? "Calculating Fiber Path..." :
                    isGeneratingPdf ? "Generating PDF Report..." :
                      isGeneratingKmz ? "Generating KMZ File..." : "Processing..."}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isCalculating ? "Accessing road network data..." : "Please wait..."}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}