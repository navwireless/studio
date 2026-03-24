
"use client";

import React from 'react';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { AnalysisFormValues } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TowerHeightControl from './tower-height-control';
import { Target, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SiteInputCardProps {
  id: 'pointA' | 'pointB';
  title: string;
  control: Control<AnalysisFormValues>;
  register: UseFormRegister<AnalysisFormValues>;
  clientFormErrors: FieldErrors<AnalysisFormValues>;
  serverFormErrors?: Record<string, string[] | undefined>;
  getCombinedError: (clientError: { message?: string } | undefined, serverError?: string[]) => string | undefined;
  onLocate?: () => void;
}

const SiteInputCard: React.FC<SiteInputCardProps> = ({
  id,
  title,
  control,
  register,
  clientFormErrors,
  serverFormErrors,
  getCombinedError,
  onLocate,
}) => (
  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 space-y-2 border border-slate-700/40">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Target className="h-3.5 w-3.5 text-primary/70" />
        <span className="text-xs font-semibold text-slate-100/90 uppercase tracking-wider">{title}</span>
      </div>
      {onLocate && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onLocate}
          className="h-6 px-2 text-[0.65rem] text-muted-foreground hover:text-foreground"
          aria-label={`Center map on ${title}`}
        >
          <MapPin className="h-3 w-3 mr-1" />
          Locate
        </Button>
      )}
    </div>

    <div>
      <Label htmlFor={`${id}.name`} className="text-[0.65rem] uppercase tracking-wider text-muted-foreground/80 font-normal">Name</Label>
      <Input
        id={`${id}.name`}
        aria-label={`${title} Name`}
        {...register(`${id}.name`)}
        placeholder="e.g. Main Site"
        className="mt-0.5 bg-transparent border-b border-border/50 focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
      />
      {(clientFormErrors[id]?.name || serverFormErrors?.[`${id}.name`]) &&
        <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.name, serverFormErrors?.[`${id}.name`])}</p>}
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label htmlFor={`${id}.lat`} className="text-[0.65rem] uppercase tracking-wider text-muted-foreground/80 font-normal">Lat</Label>
        <Input
          id={`${id}.lat`}
          aria-label={`${title} Latitude`}
          {...register(`${id}.lat`)}
          placeholder="-90 to 90"
          className="mt-0.5 bg-transparent border-b border-border/50 focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
        />
        {(clientFormErrors[id]?.lat || serverFormErrors?.[`${id}.lat`]) &&
          <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.lat, serverFormErrors?.[`${id}.lat`])}</p>}
      </div>
      <div>
        <Label htmlFor={`${id}.lng`} className="text-[0.65rem] uppercase tracking-wider text-muted-foreground/80 font-normal">Lng</Label>
        <Input
          id={`${id}.lng`}
          aria-label={`${title} Longitude`}
          {...register(`${id}.lng`)}
          placeholder="-180 to 180"
          className="mt-0.5 bg-transparent border-b border-border/50 focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
        />
        {(clientFormErrors[id]?.lng || serverFormErrors?.[`${id}.lng`]) &&
          <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.lng, serverFormErrors?.[`${id}.lng`])}</p>}
      </div>
    </div>

    <Controller
      name={`${id}.height`}
      control={control}
      defaultValue={20}
      render={({ field }) => (
        <TowerHeightControl
          label="Tower Height"
          height={field.value}
          onChange={field.onChange}
          min={0}
          max={100}
          idSuffix={id}
        />
      )}
    />
    {(clientFormErrors[id]?.height || serverFormErrors?.[`${id}.height`]) &&
      <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.height, serverFormErrors?.[`${id}.height`])}</p>}
  </div>
);

SiteInputCard.displayName = "SiteInputCard";
export default SiteInputCard;
