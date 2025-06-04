
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, Waypoints, PlusCircle, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, AnalysisFormValues, PointCoordinates, LOSLink } from '@/types';
import { AnalysisFormSchema, defaultFormStateValues } from '@/lib/form-schema';
import { useToast } from '@/hooks/use-toast';
import AppHeader from '@/components/layout/app-header';
import HistoryPanel from '@/components/layout/history-panel'; 
import { calculateDistanceKm } from '@/lib/los-calculator';
import ReportSelectionDialog from '@/components/fso/report-selection-dialog';
import { LinksProvider, useLinks } from '@/context/links-context'; 

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

// Helper to parse 'lat,lng' string
const parseCoordinatesString = (coordsString: string): PointCoordinates | null => {
  if (!coordsString || !coordsString.includes(',')) return null;
  const parts = coordsString.split(',').map(part => part.trim());
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
    return null;
  }
  return { lat, lng };
};


function HomePageContent() {
  const { toast } = useToast();
  const { 
    links, 
    selectedLinkId, 
    addLink, 
    removeLink, 
    selectLink, 
    updateLinkDetails, 
    updateLinkAnalysis, 
    getLinkById,
    getCachedAnalysis 
  } = useLinks();
  
  const [serverState, formAction, isActionPending] = React.useActionState(performLosAnalysis, null);

  const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = useState(false); 
  const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = useState(true);
  
  const [historyList, setHistoryList] = useState<AnalysisResult[]>([]); 
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false); 
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const selectedLink = React.useMemo(() => {
    if (!selectedLinkId) return null;
    return getLinkById(selectedLinkId);
  }, [selectedLinkId, getLinkById, links]); 

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(AnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onBlur', 
  });

  const { register, handleSubmit, control, formState: { errors: clientFormErrors }, getValues, setValue, reset, watch } = form;

  useEffect(() => {
    if (selectedLink) {
      const isNewLink = !selectedLink.analysisResult && selectedLink.isDirty;
      const formVals: AnalysisFormValues = {
        pointA: {
          name: isNewLink ? defaultFormStateValues.pointA.name : selectedLink.pointA.name,
          coordinates: `${selectedLink.pointA.lat.toString()}, ${selectedLink.pointA.lng.toString()}`,
          height: selectedLink.pointA.towerHeight,
        },
        pointB: {
          name: isNewLink ? defaultFormStateValues.pointB.name : selectedLink.pointB.name,
          coordinates: `${selectedLink.pointB.lat.toString()}, ${selectedLink.pointB.lng.toString()}`,
          height: selectedLink.pointB.towerHeight,
        },
        clearanceThreshold: selectedLink.clearanceThreshold.toString(),
      };
      reset(formVals); 
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
    } else {
      reset(defaultFormStateValues); 
      setIsAnalysisPanelGloballyOpen(false);
    }
  }, [selectedLink, reset]);
  
  useEffect(() => {
    if (!selectedLink) return;

    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && selectedLinkId && value.pointA && value.pointB && value.clearanceThreshold) {
        const currentFormValues = getValues();
        const parsedPointA = parseCoordinatesString(currentFormValues.pointA.coordinates);
        const parsedPointB = parseCoordinatesString(currentFormValues.pointB.coordinates);

        updateLinkDetails(selectedLinkId, {
          pointA: {
            name: currentFormValues.pointA.name,
            lat: parsedPointA?.lat ?? selectedLink.pointA.lat, // Fallback to existing if parse fails
            lng: parsedPointA?.lng ?? selectedLink.pointA.lng,
            towerHeight: parseFloat(currentFormValues.pointA.height.toString()) || 0,
          },
          pointB: {
            name: currentFormValues.pointB.name,
            lat: parsedPointB?.lat ?? selectedLink.pointB.lat, // Fallback to existing
            lng: parsedPointB?.lng ?? selectedLink.pointB.lng,
            towerHeight: parseFloat(currentFormValues.pointB.height.toString()) || 0,
          },
          clearanceThreshold: parseFloat(currentFormValues.clearanceThreshold) || 0,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, selectedLinkId, updateLinkDetails, selectedLink, getValues]);


  const processSubmit = useCallback(async (data: AnalysisFormValues) => {
    if (!selectedLinkId) {
      toast({ title: "No Link Selected", description: "Please select or add a link to analyze.", variant: "destructive" });
      return;
    }
    const currentLink = getLinkById(selectedLinkId);
    if (!currentLink) {
       toast({ title: "Error", description: "Selected link not found.", variant: "destructive" });
       return;
    }

    const cachedResult = getCachedAnalysis(selectedLinkId);
    if (cachedResult) {
      updateLinkAnalysis(selectedLinkId, cachedResult); 
      toast({ title: "Analysis Loaded from Cache", description: cachedResult.message });
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
      const isNewCachedLink = !cachedResult.pointA.name && !cachedResult.pointB.name;
      reset({ 
        pointA: { 
          name: isNewCachedLink ? defaultFormStateValues.pointA.name : (cachedResult.pointA.name || ''), 
          coordinates: `${cachedResult.pointA.lat.toString()}, ${cachedResult.pointA.lng.toString()}`, 
          height: cachedResult.pointA.towerHeight 
        },
        pointB: { 
          name: isNewCachedLink ? defaultFormStateValues.pointB.name : (cachedResult.pointB.name || ''), 
          coordinates: `${cachedResult.pointB.lat.toString()}, ${cachedResult.pointB.lng.toString()}`, 
          height: cachedResult.pointB.towerHeight 
        },
        clearanceThreshold: cachedResult.clearanceThresholdUsed.toString()
      });
      return;
    }
    
    const parsedPointA = parseCoordinatesString(data.pointA.coordinates);
    const parsedPointB = parseCoordinatesString(data.pointB.coordinates);

    if (!parsedPointA || !parsedPointB) {
      toast({ title: "Invalid Coordinates", description: "Please ensure coordinates are in 'lat, lng' format.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append('pointA.name', data.pointA.name);
    formData.append('pointA.lat', parsedPointA.lat.toString());
    formData.append('pointA.lng', parsedPointA.lng.toString());
    formData.append('pointA.height', data.pointA.height.toString());
    formData.append('pointB.name', data.pointB.name);
    formData.append('pointB.lat', parsedPointB.lat.toString());
    formData.append('pointB.lng', parsedPointB.lng.toString());
    formData.append('pointB.height', data.pointB.height.toString());
    formData.append('clearanceThreshold', data.clearanceThreshold);
    
    React.startTransition(() => {
      formAction(formData); 
    });
  }, [selectedLinkId, getLinkById, formAction, toast, updateLinkAnalysis, getCachedAnalysis, reset]);

  useEffect(() => {
    if (serverState && selectedLinkId) {
      if (serverState.error) {
        const currentLink = getLinkById(selectedLinkId);
        if (currentLink) {
           updateLinkDetails(selectedLinkId, { analysisResult: undefined, isDirty: true }); 
        }
        toast({
          title: "Analysis Error",
          description: serverState.error,
          variant: "destructive",
          duration: 7000,
        });
      } else if ('losPossible' in serverState) { 
        const successfulResult = serverState as Omit<AnalysisResult, 'id' | 'timestamp'>;
        
        const currentFormData = getValues();
        const isNewServerResultLink = !currentFormData.pointA.name && !currentFormData.pointB.name;


        const newAnalysisResult: AnalysisResult = {
          ...successfulResult,
          pointA: { 
            name: currentFormData.pointA.name || defaultFormStateValues.pointA.name, 
            lat: successfulResult.pointA.lat, 
            lng: successfulResult.pointA.lng, 
            towerHeight: successfulResult.pointA.towerHeight
          },
          pointB: { 
            name: currentFormData.pointB.name || defaultFormStateValues.pointB.name,
            lat: successfulResult.pointB.lat,
            lng: successfulResult.pointB.lng,
            towerHeight: successfulResult.pointB.towerHeight
          },
          clearanceThresholdUsed: parseFloat(currentFormData.clearanceThreshold),
          id: selectedLinkId + '_analysis_' + Date.now(), 
          timestamp: Date.now(),
        };

        updateLinkAnalysis(selectedLinkId, newAnalysisResult);
        setHistoryList(prev => [newAnalysisResult, ...prev.slice(0, 19)]); 
        
        setIsAnalysisPanelGloballyOpen(true);
        setIsBottomPanelContentExpanded(true);
        
        toast({
          title: "Analysis Complete",
          description: newAnalysisResult.message || "LOS analysis performed successfully.",
        });
      }
    }
  }, [serverState, toast, selectedLinkId, updateLinkAnalysis, updateLinkDetails, getLinkById, getValues]); 
  
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng && selectedLink) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const fieldToUpdate = pointId === 'pointA' ? 'pointA' : 'pointB';
      
      const newPointDetails = {
        ...selectedLink[fieldToUpdate],
        lat: lat,
        lng: lng,
      };
      
      updateLinkDetails(selectedLink.id, { [fieldToUpdate]: newPointDetails });
      // setValue is handled by the useEffect that watches selectedLink
    } else if (event.latLng && !selectedLink) {
        const newId = addLink({lat: event.latLng.lat(), lng: event.latLng.lng()});
        // Form resets via useEffect on selectedLink change
    }
  }, [selectedLink, updateLinkDetails, addLink]);

  const handleMarkerDrag = useCallback((event: google.maps.MapMouseEvent, linkId: string, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const draggedLink = getLinkById(linkId);
      if (!draggedLink) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const fieldToUpdate = pointId; 

      const newPointDetails = {
        ...draggedLink[fieldToUpdate],
        lat: lat,
        lng: lng,
      };
      updateLinkDetails(linkId, { [fieldToUpdate]: newPointDetails });
      if(selectedLinkId === linkId){ 
        setValue(`${fieldToUpdate}.coordinates`, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    }
  }, [getLinkById, updateLinkDetails, setValue, selectedLinkId]);
  
  const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
    if (selectedLink) {
      const fieldToUpdate = siteId;
      const newPointDetails = {
        ...selectedLink[fieldToUpdate],
        towerHeight: Math.round(newHeight),
      };
      updateLinkDetails(selectedLink.id, { [fieldToUpdate]: newPointDetails });
      setValue(`${fieldToUpdate}.height`, Math.round(newHeight)); // RHF height is a number

      const currentFormValues = getValues(); 
      handleSubmit(processSubmit)({ // processSubmit now expects AnalysisFormValues with string coordinates
          ...currentFormValues, 
          [siteId]: { ...currentFormValues[siteId], height: Math.round(newHeight)}
      });
    }
  }, [selectedLink, updateLinkDetails, handleSubmit, processSubmit, getValues, setValue]);

  const toggleGlobalPanelVisibility = useCallback(() => {
     setIsAnalysisPanelGloballyOpen(prev => !prev);
     if (isAnalysisPanelGloballyOpen && selectedLinkId) { 
        selectLink(null); 
     }
  }, [isAnalysisPanelGloballyOpen, selectedLinkId, selectLink]);

  const toggleBottomPanelContentExpansion = useCallback(() => {
    setIsBottomPanelContentExpanded(prev => !prev);
  }, []);
  
  const handleStartAnalysisClick = () => { 
    if (selectedLink) {
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
      const formValues = getValues();
      handleSubmit(processSubmit)(formValues);
    } else {
      handleAddNewLink();
    }
  };

  const handleClearMap = () => { 
    links.forEach(link => removeLink(link.id)); 
    selectLink(null); 
    reset(defaultFormStateValues);
    setHistoryList([]); 
    toast({ title: "Map Cleared", description: "All links removed and form reset." });
    setIsAnalysisPanelGloballyOpen(false);
  };
  
  const handleLoadHistoryItem = (id: string) => {
    const itemToLoad = historyList.find(item => item.id === id);
    if (itemToLoad) {
      const newLinkId = addLink(itemToLoad.pointA, itemToLoad.pointB);
      updateLinkDetails(newLinkId, {
        pointA: { ...itemToLoad.pointA, towerHeight: itemToLoad.pointA.towerHeight },
        pointB: { ...itemToLoad.pointB, towerHeight: itemToLoad.pointB.towerHeight },
        clearanceThreshold: itemToLoad.clearanceThresholdUsed,
      });
      updateLinkAnalysis(newLinkId, itemToLoad); 
      selectLink(newLinkId);
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
      toast({ title: "History Loaded", description: `Loaded analysis for ${itemToLoad.pointA.name} - ${itemToLoad.pointB.name} as a new link.` });
    }
  };

  const handleClearHistory = () => { 
    setHistoryList([]);
    toast({ title: "History Cleared" });
  };

  const handleOpenReportDialog = () => {
    if (links.filter(l => l.analysisResult && !l.isDirty).length === 0) {
        toast({ title: "No Analyzed Links for Report", description: "Please analyze at least one link.", variant: "default" });
        return;
    }
    setIsReportDialogOpen(true);
  };

  const handleGenerateSelectedReports = async (selectedReportIds: string[]) => {
    setIsReportDialogOpen(false);
    if (selectedReportIds.length === 0) {
      toast({ title: "No Links Selected", description: "Please select at least one analyzed link.", variant: "default" });
      return;
    }

    const reportsToGenerate: AnalysisResult[] = [];
    selectedReportIds.forEach(id => {
      const link = links.find(l => l.id === id);
      if (link?.analysisResult && !link.isDirty) {
        reportsToGenerate.push(link.analysisResult);
      }
    });

    if (reportsToGenerate.length > 0) {
      try {
        toast({ title: "Generating Report...", description: `Processing ${reportsToGenerate.length} link(s).` });
        const { generateReportDocx } = await import('@/lib/report-generator');
        await generateReportDocx(reportsToGenerate);
        toast({ title: "Report Generated", description: "Your DOCX report has been downloaded." });
      } catch (error) {
        console.error("Error generating report:", error);
        toast({ title: "Report Generation Failed", description: String(error), variant: "destructive" });
      }
    } else {
      toast({ title: "No Valid Links for Report", description: "Selected links must be analyzed and up-to-date.", variant: "destructive" });
    }
  };

  const handleAddNewLink = () => {
    const newId = addLink(); 
    // Panel opening is handled by useEffect on selectedLink change
  };

  const handleRemoveSelectedLink = () => {
    if (selectedLinkId) {
      removeLink(selectedLinkId);
    }
  };

  const liveDistanceKm = React.useMemo(() => {
    if (selectedLink) {
      if (selectedLink.analysisResult && !selectedLink.isDirty) {
        return selectedLink.analysisResult.distanceKm;
      }
      if (selectedLink.pointA.lat && selectedLink.pointA.lng && selectedLink.pointB.lat && selectedLink.pointB.lng) {
        return calculateDistanceKm(selectedLink.pointA, selectedLink.pointB);
      }
    }
    return null;
  }, [selectedLink]);


  return (
    <>
      <AppHeader
        onToggleHistory={() => setIsHistoryPanelOpen(prev => !prev)}
        onClearMap={handleClearMap}
        isHistoryPanelSupported={true} 
      />
      <div className="p-2 space-x-2 print:hidden">
        {!selectedLinkId && (
            <Button onClick={handleAddNewLink} variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Add New Link
            </Button>
        )}
        {selectedLinkId && (
          <>
            <Button onClick={handleAddNewLink} variant="outline" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Add Another Link
            </Button>
            <Button onClick={handleRemoveSelectedLink} variant="destructive" size="sm">
                <Trash2Icon className="mr-2 h-4 w-4" /> Remove Selected Link
            </Button>
          </>
        )}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden relative h-full">
        <div className="flex-1 w-full relative">
          <InteractiveMap
            links={links}
            selectedLinkId={selectedLinkId}
            onMapClick={handleMapClick} 
            onMarkerDrag={handleMarkerDrag} 
            onLinkSelect={selectLink} 
            mapContainerClassName="w-full h-full"
          />
        </div>

        {!isAnalysisPanelGloballyOpen && !selectedLinkId && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 print:hidden">
            <Button
              onClick={handleAddNewLink} 
              size="lg"
              className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg rounded-full px-8 py-6 text-base font-semibold backdrop-blur-sm"
              aria-label="Add New Link"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Link
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={() => { /* Consider clearing serverState.error by setting it to null */ }}>
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
                    onClick={(e) => { e.stopPropagation(); /* Clear serverState.error by setting it to null */ }}
                  >
                    Dismiss
                  </Button>
                </CardContent>
              </Card>
          </div>
        )}
        
        <FormProvider {...form}>
            <BottomPanel
              analysisResult={selectedLink?.analysisResult ?? null}
              isPanelGloballyVisible={isAnalysisPanelGloballyOpen && !!selectedLink}
              onToggleGlobalVisibility={toggleGlobalPanelVisibility}
              isContentExpanded={isBottomPanelContentExpanded}
              onToggleContentExpansion={toggleBottomPanelContentExpansion}
              isStale={selectedLink?.isDirty ?? !selectedLink?.analysisResult} 
              onAnalyzeSubmit={handleSubmit(processSubmit)} 
              isActionPending={isActionPending}
              onTowerHeightChangeFromGraph={handleTowerHeightChangeFromGraph}
              onOpenReportDialog={handleOpenReportDialog}
              onAddNewLink={handleAddNewLink} 
              currentDistanceKm={liveDistanceKm}
              selectedLinkClearanceThreshold={selectedLink?.clearanceThreshold}
              selectedLinkPointA={selectedLink?.pointA}
              selectedLinkPointB={selectedLink?.pointB}
            />
        </FormProvider>

        <HistoryPanel 
          historyList={historyList}
          onLoadHistoryItem={handleLoadHistoryItem}
          onClearHistory={handleClearHistory}
          isOpen={isHistoryPanelOpen}
          onToggle={() => setIsHistoryPanelOpen(prev => !prev)}
        />
         <ReportSelectionDialog
            isOpen={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
            linksForReport={links.filter(l => l.analysisResult && !l.isDirty).map(l => ({
                id: l.id, 
                name: `${l.pointA.name || 'Site A'} - ${l.pointB.name || 'Site B'}`,
                analysis: l.analysisResult!
            }))}
            onGenerateReport={handleGenerateSelectedReports}
        />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <LinksProvider>
      <HomePageContent />
    </LinksProvider>
  );
}
