
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, Waypoints } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, AnalysisFormValues, PointInput as PointFormInputType, PointCoordinates } from '@/types';
import { AnalysisFormSchema, defaultFormStateValues } from '@/lib/form-schema';
import { useToast } from '@/hooks/use-toast';
import AppHeader from '@/components/layout/app-header';
import HistoryPanel from '@/components/layout/history-panel';
import { calculateDistanceKm } from '@/lib/los-calculator';
import { generateReportDocx } from '@/lib/report-generator';
import ReportSelectionDialog from '@/components/fso/report-selection-dialog';


const InteractiveMap = dynamic(() => import('@/components/fso/interactive-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-muted-foreground">Loading Map...</p>
    </div>
  ),
});

const BottomPanel = dynamic(() => import('@/components/fso/bottom-panel'), {
  ssr: false,
  loading: () => null, 
});


export default function Home() {
  const { toast } = useToast();
  const [serverState, formAction, isActionPending] = React.useActionState(performLosAnalysis, null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = useState(false);
  const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const [historyList, setHistoryList] = useState<AnalysisResult[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);


  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(AnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onBlur',
  });

  const { register, handleSubmit, control, formState: { errors: clientFormErrors }, getValues, setValue, reset, watch } = form;

  const watchedPointA = watch('pointA');
  const watchedPointB = watch('pointB');
  const watchedClearanceThreshold = watch('clearanceThreshold');

  const formPointAForMap = useWatch({ control, name: 'pointA' });
  const formPointBForMap = useWatch({ control, name: 'pointB' });

  const processSubmit = useCallback((data: AnalysisFormValues) => {
    const formData = new FormData();
    formData.append('pointA.name', data.pointA.name);
    formData.append('pointA.lat', data.pointA.lat);
    formData.append('pointA.lng', data.pointA.lng);
    formData.append('pointA.height', data.pointA.height.toString());
    formData.append('pointB.name', data.pointB.name);
    formData.append('pointB.lat', data.pointB.lat);
    formData.append('pointB.lng', data.pointB.lng);
    formData.append('pointB.height', data.pointB.height.toString());
    formData.append('clearanceThreshold', data.clearanceThreshold);
    
    React.startTransition(() => {
      formAction(formData);
    });
  }, [formAction]);

  useEffect(() => {
    if (serverState) {
      if (serverState.error) {
        setAnalysisResult(null); 
        toast({
          title: "Analysis Error",
          description: serverState.error,
          variant: "destructive",
          duration: 7000,
        });
      } else if ('losPossible' in serverState) {
        const successfulResult = serverState as Omit<AnalysisResult, 'id' | 'timestamp'>; 
        
        const newResultWithId: AnalysisResult = {
          ...successfulResult,
          id: new Date().toISOString() + Math.random().toString(36).substring(2,9), 
          timestamp: Date.now(),
          pointA: { 
            name: getValues('pointA.name'), 
            lat: parseFloat(getValues('pointA.lat')), 
            lng: parseFloat(getValues('pointA.lng')), 
            towerHeight: getValues('pointA.height')
          },
          pointB: { 
            name: getValues('pointB.name'),
            lat: parseFloat(getValues('pointB.lat')),
            lng: parseFloat(getValues('pointB.lng')),
            towerHeight: getValues('pointB.height')
          },
          clearanceThresholdUsed: parseFloat(getValues('clearanceThreshold'))
        };

        setAnalysisResult(newResultWithId);
        setHistoryList(prev => [newResultWithId, ...prev.slice(0, 19)]); 
        setLiveDistanceKm(newResultWithId.distanceKm);
        
        const currentFormValues = getValues(); 
        reset(currentFormValues); 
        setIsStale(false); 

        if (!isAnalysisPanelGloballyOpen) { 
            setIsAnalysisPanelGloballyOpen(true);
            setIsBottomPanelContentExpanded(true);
        }
        
        toast({
          title: "Analysis Complete",
          description: newResultWithId.message || "LOS analysis performed successfully.",
        });
      }
    }
  }, [serverState, toast, reset, getValues, isAnalysisPanelGloballyOpen, setValue]);
  
   useEffect(() => {
    const formValues = getValues();
    const currentPointA = formValues.pointA;
    const currentPointB = formValues.pointB;
    const currentClearanceStr = formValues.clearanceThreshold;

    let stale = false;
    const isValidNumeric = (val: string | number) => val != null && val !== '' && !isNaN(parseFloat(String(val)));
    const isPointDataSufficientForStalenessCheck = (p: PointFormInputType) => 
        isValidNumeric(p.lat) && isValidNumeric(p.lng) && isValidNumeric(p.height);

    if (analysisResult && analysisResult.pointA && analysisResult.pointB) {
        const formLatA = parseFloat(currentPointA.lat);
        const formLngA = parseFloat(currentPointA.lng);
        const formHeightA = currentPointA.height; // Already a number
        const formLatB = parseFloat(currentPointB.lat);
        const formLngB = parseFloat(currentPointB.lng);
        const formHeightB = currentPointB.height; // Already a number
        const formClearanceNum = parseFloat(currentClearanceStr);

        if (
            analysisResult.pointA.lat !== formLatA ||
            analysisResult.pointA.lng !== formLngA ||
            analysisResult.pointA.towerHeight !== formHeightA ||
            analysisResult.pointB.lat !== formLatB ||
            analysisResult.pointB.lng !== formLngB ||
            analysisResult.pointB.towerHeight !== formHeightB ||
            analysisResult.clearanceThresholdUsed !== formClearanceNum
        ) {
            stale = true;
        }
    } else { 
        if (isPointDataSufficientForStalenessCheck(currentPointA) &&
            isPointDataSufficientForStalenessCheck(currentPointB) &&
            isValidNumeric(currentClearanceStr)) {
            stale = true;
        }
    }
    setIsStale(stale);

  }, [getValues, analysisResult, watchedPointA, watchedPointB, watchedClearanceThreshold]);


  const handleMapClick = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });
      
      const currentA = getValues('pointA');
      const currentB = getValues('pointB');
      if (isValidNumericString(currentA.lat) && isValidNumericString(currentA.lng) && isValidNumericString(currentB.lat) && isValidNumericString(currentB.lng)) {
        setLiveDistanceKm(calculateDistanceKm({lat: parseFloat(currentA.lat), lng: parseFloat(currentA.lng)}, {lat: parseFloat(currentB.lat), lng: parseFloat(currentB.lng)}));
      } else {
        setLiveDistanceKm(null);
      }
    }
  }, [setValue, getValues]);

  const handleMarkerDrag = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });

      const currentA = getValues('pointA');
      const currentB = getValues('pointB');
      if (isValidNumericString(currentA.lat) && isValidNumericString(currentA.lng) && isValidNumericString(currentB.lat) && isValidNumericString(currentB.lng)) {
        setLiveDistanceKm(calculateDistanceKm({lat: parseFloat(currentA.lat), lng: parseFloat(currentA.lng)}, {lat: parseFloat(currentB.lat), lng: parseFloat(currentB.lng)}));
      } else {
        setLiveDistanceKm(null);
      }
    }
  }, [setValue, getValues]);
  
  const isValidNumericString = (val: string) => val && !isNaN(parseFloat(val));


  const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
    setValue(`${siteId}.height`, Math.round(newHeight), { shouldDirty: true, shouldValidate: true });
    const currentValues = getValues();
    handleSubmit(processSubmit)(currentValues); 
  }, [setValue, handleSubmit, processSubmit, getValues]);


  const toggleGlobalPanelVisibility = useCallback(() => {
    setIsAnalysisPanelGloballyOpen(prev => !prev);
  }, []);

  const toggleBottomPanelContentExpansion = useCallback(() => {
    setIsBottomPanelContentExpanded(prev => !prev);
  }, []);
  
  const handleStartAnalysisClick = () => {
    setIsAnalysisPanelGloballyOpen(true);
    setIsBottomPanelContentExpanded(true);
    const formValues = getValues();
    const { pointA, pointB, clearanceThreshold } = formValues;
    const isPointDataSufficient = (p: PointFormInputType) => isValidNumericString(p.lat) && isValidNumericString(p.lng);
    
    if (isPointDataSufficient(pointA) && isPointDataSufficient(pointB) && isValidNumericString(clearanceThreshold)) {
        handleSubmit(processSubmit)();
    }
  };

  const dismissErrorModal = useCallback(() => {
    // Visually dismiss by not re-rendering modal, actual serverState.error remains
  }, []);

  const handleToggleHistoryPanel = () => {
    setIsHistoryPanelOpen(prev => !prev);
  };

  const handleClearMap = () => {
    reset(defaultFormStateValues);
    setAnalysisResult(null);
    setLiveDistanceKm(null);
    setIsStale(false); 
    toast({ title: "Map Cleared", description: "Form reset to default values." });
    if (isAnalysisPanelGloballyOpen) {
        setIsAnalysisPanelGloballyOpen(false); 
    }
  };
  
  const handleLoadHistoryItem = (id: string) => {
    const itemToLoad = historyList.find(item => item.id === id);
    if (itemToLoad) {
      setAnalysisResult(itemToLoad);
      
      const formValuesFromHistory: AnalysisFormValues = {
        pointA: {
          name: itemToLoad.pointA.name || 'Site A',
          lat: itemToLoad.pointA.lat.toString(),
          lng: itemToLoad.pointA.lng.toString(),
          height: itemToLoad.pointA.towerHeight,
        },
        pointB: {
          name: itemToLoad.pointB.name || 'Site B',
          lat: itemToLoad.pointB.lat.toString(),
          lng: itemToLoad.pointB.lng.toString(),
          height: itemToLoad.pointB.towerHeight,
        },
        clearanceThreshold: itemToLoad.clearanceThresholdUsed.toString(),
      };
      reset(formValuesFromHistory); 
      setLiveDistanceKm(itemToLoad.distanceKm);
      setIsStale(false); 
      setIsAnalysisPanelGloballyOpen(true); 
      setIsBottomPanelContentExpanded(true);
      toast({ title: "History Loaded", description: `Loaded analysis for ${itemToLoad.pointA.name} - ${itemToLoad.pointB.name}.` });
    }
  };

  const handleClearHistory = () => {
    setHistoryList([]);
    toast({ title: "History Cleared" });
  };

  const handleOpenReportDialog = () => {
    if (historyList.length === 0 && !analysisResult) {
        toast({ title: "No Data for Report", description: "Please perform an analysis or load history first.", variant: "default" });
        return;
    }
    setIsReportDialogOpen(true);
  };

  const handleGenerateSelectedReports = async (selectedIds: string[]) => {
    setIsReportDialogOpen(false);
    if (selectedIds.length === 0) {
      toast({ title: "No Links Selected", description: "Please select at least one link to generate a report.", variant: "default" });
      return;
    }

    const reportsToGenerate = historyList.filter(item => selectedIds.includes(item.id));
    if (reportsToGenerate.length === 0) {
        // If current analysis result should be considered even if not explicitly in history (e.g. first analysis)
        if (analysisResult && !isStale && selectedIds.includes(analysisResult.id)) { // Assuming current analysisResult also has an ID
           reportsToGenerate.push(analysisResult);
        } else if (analysisResult && !isStale && selectedIds.length === 1 && selectedIds[0] === 'current_analysis_placeholder_id') { // Special case if dialog allows current
           reportsToGenerate.push(analysisResult);
        }
    }


    if (reportsToGenerate.length > 0) {
      try {
        toast({ title: "Generating Report...", description: `Processing ${reportsToGenerate.length} link(s). Please wait.` });
        await generateReportDocx(reportsToGenerate); // Pass array of AnalysisResult
        toast({ title: "Report Generated", description: "Your DOCX report has been downloaded." });
      } catch (error) {
        console.error("Error generating report:", error);
        toast({ title: "Report Generation Failed", description: String(error), variant: "destructive" });
      }
    } else {
      toast({ title: "No Valid Links for Report", description: "Could not find selected links for report generation.", variant: "destructive" });
    }
  };


  return (
    <> 
      <AppHeader 
        onToggleHistory={handleToggleHistoryPanel}
        onClearMap={handleClearMap}
        isHistoryPanelSupported={true}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative h-full">
        <div className="flex-1 w-full relative">
          <InteractiveMap
            pointA={formPointAForMap && formPointAForMap.lat && formPointAForMap.lng ? { lat: parseFloat(formPointAForMap.lat), lng: parseFloat(formPointAForMap.lng), name: formPointAForMap.name } : undefined}
            pointB={formPointBForMap && formPointBForMap.lat && formPointBForMap.lng ? { lat: parseFloat(formPointBForMap.lat), lng: parseFloat(formPointBForMap.lng), name: formPointBForMap.name } : undefined}
            onMapClick={handleMapClick}
            onMarkerDrag={handleMarkerDrag}
            mapContainerClassName="w-full h-full"
            analysisResult={analysisResult}
            isStale={isStale}
            currentDistanceKm={liveDistanceKm}
          />
        </div>

        {!isAnalysisPanelGloballyOpen && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 print:hidden">
            <Button
              onClick={handleStartAnalysisClick}
              size="lg"
              className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg rounded-full px-8 py-6 text-base font-semibold backdrop-blur-sm"
              aria-label="Start Link Analysis"
            >
              <Waypoints className="mr-2 h-5 w-5" />
              Start Link Analysis
            </Button>
          </div>
        )}
        
        {isActionPending && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
              <Card className="p-6 shadow-2xl bg-card/90">
                <CardContent className="flex flex-col items-center text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-semibold text-foreground">Analyzing Link...</p>
                  <p className="text-sm text-muted-foreground mt-1">Please wait while we process the elevation data.</p>
                </CardContent>
              </Card>
          </div>
        )}

        {serverState?.error && !isActionPending && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={dismissErrorModal}>
              <Card className="p-6 shadow-2xl bg-destructive/90 max-w-md w-full mx-4">
                <CardHeader>
                  <CardTitle className="text-destructive-foreground flex items-center">
                    <AlertTriangle className="mr-2 h-6 w-6"/> Analysis Failed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-destructive-foreground mb-4">{serverState.error}</p>
                  <Button 
                    variant="outline" 
                    className="w-full bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
                    onClick={(e) => { e.stopPropagation(); /* Clear serverState.error here if needed */ }} 
                  >
                    Dismiss
                  </Button>
                </CardContent>
              </Card>
          </div>
        )}

        <BottomPanel
          analysisResult={analysisResult}
          isPanelGloballyVisible={isAnalysisPanelGloballyOpen}
          onToggleGlobalVisibility={toggleGlobalPanelVisibility}
          isContentExpanded={isBottomPanelContentExpanded}
          onToggleContentExpansion={toggleBottomPanelContentExpansion}
          isStale={isStale}
          control={control}
          register={register}
          handleSubmit={handleSubmit}
          processSubmit={processSubmit}
          clientFormErrors={clientFormErrors}
          serverFormErrors={serverState?.fieldErrors}
          isActionPending={isActionPending}
          getValues={getValues}
          setValue={setValue}
          onTowerHeightChangeFromGraph={handleTowerHeightChangeFromGraph}
          onOpenReportDialog={handleOpenReportDialog}
        />
        <HistoryPanel 
          historyList={historyList}
          onLoadHistoryItem={handleLoadHistoryItem}
          onClearHistory={handleClearHistory}
          isOpen={isHistoryPanelOpen}
          onToggle={handleToggleHistoryPanel}
        />
         <ReportSelectionDialog
            isOpen={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
            historyList={historyList}
            currentAnalysisResult={analysisResult}
            isCurrentAnalysisStale={isStale}
            onGenerateReport={handleGenerateSelectedReports}
        />
      </div>
    </>
  );
}

