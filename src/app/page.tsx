
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, Waypoints, PlusCircle, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, AnalysisFormValues, PointInput as PointFormInputType, PointCoordinates, LOSLink } from '@/types';
import { AnalysisFormSchema, defaultFormStateValues } from '@/lib/form-schema';
import { useToast } from '@/hooks/use-toast';
import AppHeader from '@/components/layout/app-header';
import HistoryPanel from '@/components/layout/history-panel'; // Existing history panel
import { calculateDistanceKm } from '@/lib/los-calculator';
// import { generateReportDocx } from '@/lib/report-generator'; // Removed static import
import ReportSelectionDialog from '@/components/fso/report-selection-dialog';
import { LinksProvider, useLinks } from '@/context/links-context'; // Import new context

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

  // Local component state for things not directly tied to a single link's data in context
  const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = useState(false); // For bottom panel
  const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = useState(true);
  
  const [historyList, setHistoryList] = useState<AnalysisResult[]>([]); // Old history, may deprecate or merge
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false); // For old history panel
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const selectedLink = React.useMemo(() => {
    if (!selectedLinkId) return null;
    return getLinkById(selectedLinkId);
  }, [selectedLinkId, getLinkById]);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(AnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onBlur', // Or 'onChange' if preferred
  });

  const { register, handleSubmit, control, formState: { errors: clientFormErrors }, getValues, setValue, reset, watch } = form;

  // Effect to populate form when a link is selected or its details change
  useEffect(() => {
    if (selectedLink) {
      const formVals: AnalysisFormValues = {
        pointA: {
          name: selectedLink.pointA.name,
          lat: selectedLink.pointA.lat.toString(),
          lng: selectedLink.pointA.lng.toString(),
          height: selectedLink.pointA.towerHeight,
        },
        pointB: {
          name: selectedLink.pointB.name,
          lat: selectedLink.pointB.lat.toString(),
          lng: selectedLink.pointB.lng.toString(),
          height: selectedLink.pointB.towerHeight,
        },
        clearanceThreshold: selectedLink.clearanceThreshold.toString(),
      };
      reset(formVals); // Reset form with selected link's data
      if (selectedLink.analysisResult) {
        // If a link with existing analysis is selected, open the panel
        setIsAnalysisPanelGloballyOpen(true);
      }
    } else {
      reset(defaultFormStateValues); // Reset to defaults if no link selected
      setIsAnalysisPanelGloballyOpen(false);
    }
  }, [selectedLink, reset]);
  
   // Effect to update link details in context when form changes for the selected link
  useEffect(() => {
    if (!selectedLink) return;

    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && selectedLinkId && value.pointA && value.pointB && value.clearanceThreshold) {
        // Ensure all parts of the form value are defined before trying to update
        const currentFormValues = getValues();
        updateLinkDetails(selectedLinkId, {
          pointA: {
            name: currentFormValues.pointA.name,
            lat: parseFloat(currentFormValues.pointA.lat) || 0,
            lng: parseFloat(currentFormValues.pointA.lng) || 0,
            towerHeight: currentFormValues.pointA.height,
          },
          pointB: {
            name: currentFormValues.pointB.name,
            lat: parseFloat(currentFormValues.pointB.lat) || 0,
            lng: parseFloat(currentFormValues.pointB.lng) || 0,
            towerHeight: currentFormValues.pointB.height,
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

    // Check cache first
    const cachedResult = getCachedAnalysis(selectedLinkId);
    if (cachedResult) {
      updateLinkAnalysis(selectedLinkId, cachedResult); // Update context with cached data
      toast({ title: "Analysis Loaded from Cache", description: cachedResult.message });
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
      // Populate form again in case cache was from a slightly different prior state of form
      reset({ 
        pointA: { name: cachedResult.pointA.name || '', lat: cachedResult.pointA.lat.toString(), lng: cachedResult.pointA.lng.toString(), height: cachedResult.pointA.towerHeight },
        pointB: { name: cachedResult.pointB.name || '', lat: cachedResult.pointB.lat.toString(), lng: cachedResult.pointB.lng.toString(), height: cachedResult.pointB.towerHeight },
        clearanceThreshold: cachedResult.clearanceThresholdUsed.toString()
      });
      return;
    }

    // Construct FormData for the server action
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
      formAction(formData); // This will trigger the serverState useEffect
    });
  }, [selectedLinkId, getLinkById, formAction, toast, updateLinkAnalysis, getCachedAnalysis, reset]);

  // Effect to handle server action response
  useEffect(() => {
    if (serverState && selectedLinkId) {
      if (serverState.error) {
        const currentLink = getLinkById(selectedLinkId);
        if (currentLink) {
           updateLinkDetails(selectedLinkId, { analysisResult: undefined, isDirty: true }); // Clear previous result on error
        }
        toast({
          title: "Analysis Error",
          description: serverState.error,
          variant: "destructive",
          duration: 7000,
        });
      } else if ('losPossible' in serverState) { // Indicates a successful AnalysisResult structure
        const successfulResult = serverState as Omit<AnalysisResult, 'id' | 'timestamp'>;
        
        const newAnalysisResult: AnalysisResult = {
          ...successfulResult,
          // The server action's result structure might not have id/timestamp for THIS specific analysis instance
          // We ensure the points data in the result matches what was submitted for THIS link.
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
          clearanceThresholdUsed: parseFloat(getValues('clearanceThreshold')),
          id: selectedLinkId + '_analysis_' + Date.now(), // Make a unique ID for this specific analysis run
          timestamp: Date.now(),
        };

        updateLinkAnalysis(selectedLinkId, newAnalysisResult);
        
        // Add to old history panel for now (can be refactored later)
        setHistoryList(prev => [newAnalysisResult, ...prev.slice(0, 19)]); 
        
        if (!isAnalysisPanelGloballyOpen) {
            setIsAnalysisPanelGloballyOpen(true);
            setIsBottomPanelContentExpanded(true);
        }
        
        toast({
          title: "Analysis Complete",
          description: newAnalysisResult.message || "LOS analysis performed successfully.",
        });
      }
    }
  }, [serverState, toast, selectedLinkId, updateLinkAnalysis, updateLinkDetails, getLinkById, getValues, isAnalysisPanelGloballyOpen]);
  
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    // This logic needs to be adapted for multi-link.
    // For now, if a link is selected, it updates that link's point.
    // Otherwise, it could potentially start a new link.
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
      // Form will auto-update via useEffect on selectedLink change
    } else if (event.latLng && !selectedLink) {
        // No link selected, create a new one with this as point A
        const newId = addLink({lat: event.latLng.lat(), lng: event.latLng.lng()});
        // The form will reset to this new link's defaults. User can then click for point B.
    }
  }, [selectedLink, updateLinkDetails, addLink]);

  const handleMarkerDrag = useCallback((event: google.maps.MapMouseEvent, linkId: string, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const draggedLink = getLinkById(linkId);
      if (!draggedLink) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const fieldToUpdate = pointId; // Already 'pointA' or 'pointB'

      const newPointDetails = {
        ...draggedLink[fieldToUpdate],
        lat: lat,
        lng: lng,
      };
      updateLinkDetails(linkId, { [fieldToUpdate]: newPointDetails });
      if(selectedLinkId === linkId){ // if dragged marker is of selected link, update form
        setValue(`${fieldToUpdate}.lat`, lat.toFixed(6));
        setValue(`${fieldToUpdate}.lng`, lng.toFixed(6));
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
      // Trigger re-analysis for the current link
      const currentFormValues = getValues(); // Get potentially updated name/lat/lng from form
      handleSubmit(processSubmit)({
          ...currentFormValues, // Use current form state
          [siteId]: { ...currentFormValues[siteId], height: Math.round(newHeight)}
      });
    }
  }, [selectedLink, updateLinkDetails, handleSubmit, processSubmit, getValues]);

  const toggleGlobalPanelVisibility = useCallback(() => {
    // This will now effectively be controlled by whether a link is selected
    // If a link is selected, panel opens. If deselected, panel closes.
    // This function might not be needed if panel visibility is tied to selectedLinkId
     setIsAnalysisPanelGloballyOpen(prev => !prev);
  }, []);

  const toggleBottomPanelContentExpansion = useCallback(() => {
    setIsBottomPanelContentExpanded(prev => !prev);
  }, []);
  
  const handleStartAnalysisClick = () => { // This button might be repurposed to "Analyze Selected Link"
    if (selectedLink) {
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
      const formValues = getValues();
      handleSubmit(processSubmit)(formValues);
    } else {
      toast({title: "No Link Selected", description: "Please add or select a link first."});
    }
  };

  const handleClearMap = () => { // This will now clear all links from context
    links.forEach(link => removeLink(link.id)); // remove all links
    selectLink(null); // Deselect
    reset(defaultFormStateValues);
    setHistoryList([]); // Clear old history as well
    toast({ title: "Map Cleared", description: "All links removed and form reset." });
    setIsAnalysisPanelGloballyOpen(false);
  };
  
  // Old history load, adapt or remove later
  const handleLoadHistoryItem = (id: string) => {
    const itemToLoad = historyList.find(item => item.id === id);
    if (itemToLoad) {
      // This needs to be integrated with the new multi-link system
      // Potentially, load this into a NEW link, or replace selected?
      // For now, it just populates the form as before.
      const newLinkId = addLink(itemToLoad.pointA, itemToLoad.pointB);
      updateLinkDetails(newLinkId, {
        pointA: { ...itemToLoad.pointA, towerHeight: itemToLoad.pointA.towerHeight },
        pointB: { ...itemToLoad.pointB, towerHeight: itemToLoad.pointB.towerHeight },
        clearanceThreshold: itemToLoad.clearanceThresholdUsed,
      });
      updateLinkAnalysis(newLinkId, itemToLoad); // Treat as a freshly "analyzed" link from history
      selectLink(newLinkId);
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
      toast({ title: "History Loaded", description: `Loaded analysis for ${itemToLoad.pointA.name} - ${itemToLoad.pointB.name} as a new link.` });
    }
  };

  const handleClearHistory = () => { // Clears old history panel
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
        // Dynamically import here
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
    const newId = addLink(); // Creates a link with default points, auto-selects
    setIsAnalysisPanelGloballyOpen(true); // Open panel for the new link
    setIsBottomPanelContentExpanded(true);
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
      // Calculate live distance if points are valid
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
        <Button onClick={handleAddNewLink} variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Link
        </Button>
        {selectedLinkId && (
            <Button onClick={handleRemoveSelectedLink} variant="destructive" size="sm">
                <Trash2Icon className="mr-2 h-4 w-4" /> Remove Selected Link
            </Button>
        )}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden relative h-full">
        <div className="flex-1 w-full relative">
          <InteractiveMap
            links={links}
            selectedLinkId={selectedLinkId}
            onMapClick={handleMapClick} // Adapting this for multi-link point placement
            onMarkerDrag={handleMarkerDrag} // Passes linkId and pointId
            onLinkSelect={selectLink} // New prop for map to tell page a link was clicked
            mapContainerClassName="w-full h-full"
          />
        </div>

        {!isAnalysisPanelGloballyOpen && !selectedLinkId && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 print:hidden">
            <Button
              onClick={handleAddNewLink} // Changed from handleStartAnalysisClick
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={() => { /* Consider clearing serverState.error */}}>
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
                    onClick={(e) => { e.stopPropagation(); /* Clear serverState.error */ }}
                  >
                    Dismiss
                  </Button>
                </CardContent>
              </Card>
          </div>
        )}
        
        {/* FormProvider wraps BottomPanel for RHF context */}
        <FormProvider {...form}>
            <BottomPanel
              // Pass selectedLink's data if available
              analysisResult={selectedLink?.analysisResult ?? null}
              isPanelGloballyVisible={isAnalysisPanelGloballyOpen && !!selectedLink}
              onToggleGlobalVisibility={toggleGlobalPanelVisibility}
              isContentExpanded={isBottomPanelContentExpanded}
              onToggleContentExpansion={toggleBottomPanelContentExpansion}
              isStale={selectedLink?.isDirty ?? !selectedLink?.analysisResult} // A link is stale if dirty or no analysis
              
              // RHF props are now implicitly available via FormProvider context within BottomPanel
              // control, register, handleSubmit, clientFormErrors, serverFormErrors, getValues, setValue
              // processSubmit needs to be adapted or called directly
              onAnalyzeSubmit={handleSubmit(processSubmit)} // Pass the bound submit handler
              
              isActionPending={isActionPending}
              onTowerHeightChangeFromGraph={handleTowerHeightChangeFromGraph}
              onOpenReportDialog={handleOpenReportDialog}
              currentDistanceKm={liveDistanceKm}
              selectedLinkClearanceThreshold={selectedLink?.clearanceThreshold}
              selectedLinkPointA={selectedLink?.pointA}
              selectedLinkPointB={selectedLink?.pointB}
            />
        </FormProvider>

        <HistoryPanel // Old history panel
          historyList={historyList}
          onLoadHistoryItem={handleLoadHistoryItem}
          onClearHistory={handleClearHistory}
          isOpen={isHistoryPanelOpen}
          onToggle={() => setIsHistoryPanelOpen(prev => !prev)}
        />
         <ReportSelectionDialog
            isOpen={isReportDialogOpen}
            onOpenChange={setIsReportDialogOpen}
            // Pass all analyzed links from context for report selection
            linksForReport={links.filter(l => l.analysisResult && !l.isDirty).map(l => ({
                id: l.id, // Use LOSLink id
                name: `${l.pointA.name} - ${l.pointB.name}`,
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

    