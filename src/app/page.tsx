
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, PlusCircle, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, AnalysisFormValues, PointCoordinates } from '@/types';
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

const parseCoordinatesString = (coordsString: string): PointCoordinates | null => {
  if (!coordsString || typeof coordsString !== 'string') return null;
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
  const [displayedError, setDisplayedError] = useState<string | null>(null);
  const [displayedFieldErrors, setDisplayedFieldErrors] = useState<any | null>(null);


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

  const { handleSubmit, control, getValues, setValue, reset, watch } = form;

  useEffect(() => {
    if (selectedLink) {
      const isNewLink = !selectedLink.analysisResult && selectedLink.isDirty;
      
      let pointA_coords_str = '';
      if (selectedLink.pointA.lat !== null && selectedLink.pointA.lng !== null) {
        pointA_coords_str = `${selectedLink.pointA.lat}, ${selectedLink.pointA.lng}`;
      } else {
        pointA_coords_str = ''; 
      }

      let pointB_coords_str = '';
      if (selectedLink.pointB.lat !== null && selectedLink.pointB.lng !== null) {
        pointB_coords_str = `${selectedLink.pointB.lat}, ${selectedLink.pointB.lng}`;
      } else {
        pointB_coords_str = ''; 
      }

      const formVals: AnalysisFormValues = {
        pointA: {
          name: isNewLink ? defaultFormStateValues.pointA.name : (selectedLink.pointA.name || defaultFormStateValues.pointA.name),
          coordinates: pointA_coords_str,
          height: selectedLink.pointA.towerHeight ?? defaultFormStateValues.pointA.height,
        },
        pointB: {
          name: isNewLink ? defaultFormStateValues.pointB.name : (selectedLink.pointB.name || defaultFormStateValues.pointB.name),
          coordinates: pointB_coords_str,
          height: selectedLink.pointB.towerHeight ?? defaultFormStateValues.pointB.height,
        },
        clearanceThreshold: selectedLink.clearanceThreshold?.toString() ?? defaultFormStateValues.clearanceThreshold,
      };
      reset(formVals);
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
    } else {
      reset(defaultFormStateValues);
      setIsAnalysisPanelGloballyOpen(false);
    }
  }, [
    selectedLinkId, 
    selectedLink?.pointA?.name,
    selectedLink?.pointA?.lat,
    selectedLink?.pointA?.lng,
    selectedLink?.pointA?.towerHeight,
    selectedLink?.pointB?.name,
    selectedLink?.pointB?.lat,
    selectedLink?.pointB?.lng,
    selectedLink?.pointB?.towerHeight,
    selectedLink?.clearanceThreshold,
    selectedLink?.isDirty,
    !!selectedLink?.analysisResult, 
    reset 
  ]);

  useEffect(() => {
    if (!selectedLinkId) return;

    const subscription = watch((formValues, { name, type }) => {
      if (type === 'change' && selectedLinkId) {
        const currentLinkInContext = getLinkById(selectedLinkId);
        if (!currentLinkInContext) return;

        const parsedPointA = parseCoordinatesString(formValues.pointA?.coordinates || '');
        const parsedPointB = parseCoordinatesString(formValues.pointB?.coordinates || '');

        const towerAHeight = typeof formValues.pointA?.height === 'number' ? formValues.pointA.height : (parseFloat(String(formValues.pointA?.height)) || 0);
        const towerBHeight = typeof formValues.pointB?.height === 'number' ? formValues.pointB.height : (parseFloat(String(formValues.pointB?.height)) || 0);
        const clearance = parseFloat(formValues.clearanceThreshold || "0") || 0;

        const newDetails = {
          pointA: {
            name: formValues.pointA?.name || currentLinkInContext.pointA.name,
            lat: parsedPointA?.lat ?? currentLinkInContext.pointA.lat,
            lng: parsedPointA?.lng ?? currentLinkInContext.pointA.lng,
            towerHeight: towerAHeight,
          },
          pointB: {
            name: formValues.pointB?.name || currentLinkInContext.pointB.name,
            lat: parsedPointB?.lat ?? currentLinkInContext.pointB.lat,
            lng: parsedPointB?.lng ?? currentLinkInContext.pointB.lng,
            towerHeight: towerBHeight,
          },
          clearanceThreshold: clearance,
        };
        
        const detailsChanged =
            newDetails.pointA.name !== currentLinkInContext.pointA.name ||
            newDetails.pointA.lat !== currentLinkInContext.pointA.lat ||
            newDetails.pointA.lng !== currentLinkInContext.pointA.lng ||
            newDetails.pointA.towerHeight !== currentLinkInContext.pointA.towerHeight ||
            newDetails.pointB.name !== currentLinkInContext.pointB.name ||
            newDetails.pointB.lat !== currentLinkInContext.pointB.lat ||
            newDetails.pointB.lng !== currentLinkInContext.pointB.lng ||
            newDetails.pointB.towerHeight !== currentLinkInContext.pointB.towerHeight ||
            newDetails.clearanceThreshold !== currentLinkInContext.clearanceThreshold;

        if (detailsChanged) {
          updateLinkDetails(selectedLinkId, { ...newDetails, isDirty: true });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, selectedLinkId, updateLinkDetails, getLinkById]);


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
    if (cachedResult && !currentLink.isDirty) { // Only use cache if link is not dirty
      updateLinkAnalysis(selectedLinkId, cachedResult); 
      toast({ title: "Analysis Loaded from Cache", description: cachedResult.message });
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);

      let cached_pointA_coords_str = '';
      if (cachedResult.pointA.lat !== null && cachedResult.pointA.lng !== null) {
         cached_pointA_coords_str = `${cachedResult.pointA.lat}, ${cachedResult.pointA.lng}`;
      }
      let cached_pointB_coords_str = '';
      if (cachedResult.pointB.lat !== null && cachedResult.pointB.lng !== null) {
         cached_pointB_coords_str = `${cachedResult.pointB.lat}, ${cachedResult.pointB.lng}`;
      }
      reset({
        pointA: {
          name: cachedResult.pointA.name || defaultFormStateValues.pointA.name,
          coordinates: cached_pointA_coords_str,
          height: cachedResult.pointA.towerHeight
        },
        pointB: {
          name: cachedResult.pointB.name || defaultFormStateValues.pointB.name,
          coordinates: cached_pointB_coords_str,
          height: cachedResult.pointB.towerHeight
        },
        clearanceThreshold: cachedResult.clearanceThresholdUsed.toString()
      });
      return;
    }

    const parsedPointA = parseCoordinatesString(data.pointA.coordinates);
    const parsedPointB = parseCoordinatesString(data.pointB.coordinates);

    if (!parsedPointA || !parsedPointB) {
      toast({ title: "Invalid Coordinates", description: "Point A or Point B coordinates are missing or invalid. Please enter coordinates in 'lat, lng' format or click on the map.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append('pointA.name', data.pointA.name);
    formData.append('pointA.lat', parsedPointA.lat.toString());
    formData.append('pointA.lng', parsedPointA.lng.toString());
    formData.append('pointA.height', String(data.pointA.height)); 
    formData.append('pointB.name', data.pointB.name);
    formData.append('pointB.lat', parsedPointB.lat.toString());
    formData.append('pointB.lng', parsedPointB.lng.toString());
    formData.append('pointB.height', String(data.pointB.height)); 
    formData.append('clearanceThreshold', data.clearanceThreshold);

    React.startTransition(() => {
      formAction(formData);
    });
  }, [selectedLinkId, getLinkById, formAction, toast, updateLinkAnalysis, getCachedAnalysis, reset]);

  useEffect(() => {
    if (serverState) {
      if (serverState instanceof Error) {
        // Handle direct Error objects thrown by the action
        setDisplayedError(String(serverState.message || "An unexpected server error occurred."));
        setDisplayedFieldErrors(null); // No field errors if it's a generic Error
      } else if (serverState.error) {
        // Handle custom error structure { error: string, fieldErrors?: any }
        setDisplayedError(String(serverState.error));
        setDisplayedFieldErrors(serverState.fieldErrors && typeof serverState.fieldErrors === 'object' ? serverState.fieldErrors : null);
      } else if ('losPossible' in serverState) { 
        // serverState is AnalysisResult (success)
        setDisplayedError(null);
        setDisplayedFieldErrors(null);
        // Success state is handled in the next useEffect that depends on selectedLinkId and serverState
      }
    }
  }, [serverState]);

  useEffect(() => {
    if (!selectedLinkId) return;

    const currentLink = getLinkById(selectedLinkId);
    if (!currentLink) return;

    // Check if serverState indicates an error (either direct Error or our custom structure)
    const isErrorState = serverState instanceof Error || (serverState && serverState.error);

    if (isErrorState) {
        // Error state handled by previous useEffect, just mark link as dirty if needed
        updateLinkDetails(selectedLinkId, { ...currentLink, analysisResult: undefined, isDirty: true });
    } else if (serverState && 'losPossible' in serverState && currentLink.isDirty) { 
        // serverState is a successful AnalysisResult and the link was dirty
        const successfulResult = serverState as Omit<AnalysisResult, 'id' | 'timestamp'>;
        const currentFormData = getValues();
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
  }, [serverState, selectedLinkId, getLinkById, updateLinkDetails, updateLinkAnalysis, getValues, toast]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    const currentSelectedLink = getLinkById(selectedLinkId || '');
    if (!currentSelectedLink) return; 

    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const fieldToUpdate = pointId === 'pointA' ? 'pointA' : 'pointB';
      
      const newPointDetails = {
        ...(currentSelectedLink[fieldToUpdate]),
        lat: lat,
        lng: lng,
      };
      updateLinkDetails(currentSelectedLink.id, { [fieldToUpdate]: newPointDetails, isDirty: true });
    }
  }, [selectedLinkId, updateLinkDetails, getLinkById]);

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
      updateLinkDetails(linkId, { [fieldToUpdate]: newPointDetails, isDirty: true });
    }
  }, [getLinkById, updateLinkDetails]);

  const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
    const currentSelectedLink = getLinkById(selectedLinkId || '');
    if (currentSelectedLink) {
      const fieldToUpdate = siteId;
      const newPointDetails = {
        ...currentSelectedLink[fieldToUpdate],
        towerHeight: Math.round(newHeight),
      };
      updateLinkDetails(currentSelectedLink.id, { [fieldToUpdate]: newPointDetails, isDirty: true });
    }
  }, [selectedLinkId, getLinkById, updateLinkDetails]);

  const toggleGlobalPanelVisibility = useCallback(() => {
     setIsAnalysisPanelGloballyOpen(prev => {
        const newIsOpen = !prev;
        if (!newIsOpen && selectedLinkId) {
             setTimeout(() => selectLink(null), 0);
        }
        return newIsOpen;
     });
  }, [selectedLinkId, selectLink]);

  const toggleBottomPanelContentExpansion = useCallback(() => {
    setIsBottomPanelContentExpanded(prev => !prev);
  }, []);


  const handleAddNewLink = () => {
    const newId = addLink(); 
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
        return calculateDistanceKm(selectedLink.pointA as PointCoordinates, selectedLink.pointB as PointCoordinates);
      }
    }
    return null;
  }, [selectedLink]);


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
        pointA: { ...itemToLoad.pointA, towerHeight: itemToLoad.pointA.towerHeight, name: itemToLoad.pointA.name || defaultFormStateValues.pointA.name },
        pointB: { ...itemToLoad.pointB, towerHeight: itemToLoad.pointB.towerHeight, name: itemToLoad.pointB.name || defaultFormStateValues.pointB.name },
        clearanceThreshold: itemToLoad.clearanceThresholdUsed,
        isDirty: false, 
      });
      updateLinkAnalysis(newLinkId, itemToLoad); 
      
      toast({ title: "History Loaded", description: `Loaded analysis for ${itemToLoad.pointA.name || 'Site A'} - ${itemToLoad.pointB.name || 'Site B'} as a new link.` });
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


  return (
    <>
      <AppHeader
        onToggleHistory={() => setIsHistoryPanelOpen(prev => !prev)}
        onClearMap={handleClearMap}
        isHistoryPanelSupported={true}
      />
      <div className="flex-1 flex flex-col overflow-hidden relative h-full">
        {links.length > 0 && (
           <div className="absolute top-3 left-3 z-40 print:hidden flex items-center gap-2">
            <Button 
                onClick={handleAddNewLink} 
                variant="outline" 
                size="sm"
                className="bg-background/70 backdrop-blur-sm hover:bg-background/90"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Another Link
            </Button>
            {selectedLinkId && (
                <Button 
                    onClick={handleRemoveSelectedLink} 
                    variant="destructive" 
                    size="sm"
                    className="bg-destructive/70 backdrop-blur-sm hover:bg-destructive/90"
                >
                    <Trash2Icon className="mr-2 h-4 w-4" /> Remove Selected Link
                </Button>
            )}
           </div>
        )}

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

        {!isAnalysisPanelGloballyOpen && !selectedLinkId && links.length === 0 && (
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

        {displayedError && !isActionPending && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={() => { setDisplayedError(null); setDisplayedFieldErrors(null); }}>
              <Card className="p-6 shadow-2xl bg-destructive/90 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <CardHeader>
                  <CardTitle className="text-destructive-foreground flex items-center">
                    <AlertTriangle className="mr-2 h-6 w-6"/> Analysis Failed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-destructive-foreground mb-4">{displayedError}</p>
                  {displayedFieldErrors && (
                    <div className="text-xs text-destructive-foreground/80 mb-3 bg-black/20 p-2 rounded custom-scrollbar overflow-auto max-h-32">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(displayedFieldErrors, null, 2)}</pre>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
                    onClick={() => { setDisplayedError(null); setDisplayedFieldErrors(null); }}
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
              isStale={(selectedLink?.isDirty ?? false) || (!selectedLink?.analysisResult && !!selectedLink)}
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

