
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioTower, Wifi, ArrowRightLeft } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  range: string;
  bandwidth: string;
  icon?: React.ElementType;
}

const products: Product[] = [
  {
    id: 'optic1g',
    name: 'OpticSpectra 1G',
    range: '10KM',
    bandwidth: '1 Gbps',
    icon: RadioTower,
  },
  {
    id: 'optic10g-sr',
    name: 'OpticSpectra 10G (Short Range)',
    range: 'Up to 3KM',
    bandwidth: '10 Gbps',
    icon: Wifi,
  },
  {
    id: 'optic10g-er',
    name: 'OpticSpectra 10G (Extended Range)',
    range: 'Up to 5KM',
    bandwidth: '10 Gbps',
    icon: Wifi,
  },
];

export default function ProductCatalog() {
  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <React.Fragment key={product.id}>
          <div className="p-1 rounded-md hover:bg-muted/50 transition-colors">
            <h4 className="font-semibold text-sm flex items-center">
              {product.icon && <product.icon className="mr-2 h-4 w-4 text-primary" />}
              {product.name}
            </h4>
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <p className="flex items-center">
                <ArrowRightLeft className="mr-1.5 h-3 w-3" /> Range: {product.range}
              </p>
              <p className="flex items-center">
                <Wifi className="mr-1.5 h-3 w-3" /> Bandwidth: {product.bandwidth}
              </p>
            </div>
          </div>
          {index < products.length - 1 && <Separator />}
        </React.Fragment>
      ))}
      <div className="mt-4 p-2 text-xs text-center text-muted-foreground border-t border-dashed">
        Product recommendations will appear here based on analysis.
      </div>
    </div>
  );
}
