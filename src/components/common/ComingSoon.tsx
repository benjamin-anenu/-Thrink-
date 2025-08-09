import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComingSoonProps {
  title: string;
  description: string;
  features?: string[];
  // Pass a Lucide icon element, e.g. <BarChart3 className="h-6 w-6" />
  icon?: React.ReactNode;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description, features = [], icon }) => {
  return (
    <div className="animate-enter">
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Subtle decorative background */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/15 to-muted/30 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-primary/10 to-muted/20 blur-3xl" />
          </div>
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  {icon}
                </div>
              )}
              <div className="flex items-center gap-2">
                <CardTitle>{title}</CardTitle>
                <Badge variant="secondary">Coming soon</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-3">
              <p className="text-muted-foreground">{description}</p>
              {features.length > 0 && (
                <ul className="grid sm:grid-cols-2 gap-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center justify-center">
              <div className="h-28 w-full max-w-[220px] rounded-2xl border border-border/60 bg-gradient-to-b from-muted/40 to-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">Preview placeholder</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default ComingSoon;
