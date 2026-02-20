'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getDocumentInfo } from '@/lib/document-info';

interface DocumentInfoModalProps {
  slug: string;
  documentTypeName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentInfoModal({
  slug,
  documentTypeName,
  open,
  onOpenChange,
}: DocumentInfoModalProps) {
  const info = getDocumentInfo(slug);

  if (!info) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-wisebox-background-card border-wisebox-border text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{documentTypeName}</DialogTitle>
            <DialogDescription className="text-wisebox-text-secondary">
              No additional guidance available for this document type.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-wisebox-background-card border-wisebox-border text-white max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {info.nameEn}
          </DialogTitle>
          <DialogDescription className="text-wisebox-text-secondary text-base">
            {info.nameBn}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="what" className="w-full">
          <TabsList className="w-full bg-wisebox-background-lighter border border-wisebox-border">
            <TabsTrigger
              value="what"
              className="flex-1 text-xs data-[state=active]:bg-wisebox-background-card data-[state=active]:text-white text-wisebox-text-muted"
            >
              What is this?
            </TabsTrigger>
            <TabsTrigger
              value="where"
              className="flex-1 text-xs data-[state=active]:bg-wisebox-background-card data-[state=active]:text-white text-wisebox-text-muted"
            >
              Where to get it
            </TabsTrigger>
            <TabsTrigger
              value="missing"
              className="flex-1 text-xs data-[state=active]:bg-wisebox-background-card data-[state=active]:text-white text-wisebox-text-muted"
            >
              If missing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="space-y-3 mt-4">
            <p className="text-sm text-wisebox-text-secondary leading-relaxed">
              {info.whatIsIt}
            </p>
            {info.requiredFor.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-wisebox-text-muted uppercase tracking-wide mb-1.5">
                  Required for
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {info.requiredFor.map((type) => (
                    <span
                      key={type}
                      className="inline-block rounded bg-wisebox-background-lighter border border-wisebox-border px-2 py-0.5 text-xs text-wisebox-text-secondary"
                    >
                      {type.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="where" className="space-y-3 mt-4">
            <p className="text-sm text-wisebox-text-secondary leading-relaxed">
              {info.whereToGetIt}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-wisebox-background-lighter border border-wisebox-border p-3">
                <h4 className="text-xs font-medium text-wisebox-text-muted uppercase tracking-wide mb-1">
                  Estimated cost
                </h4>
                <p className="text-sm text-white">{info.estimatedCost}</p>
              </div>
              <div className="rounded-md bg-wisebox-background-lighter border border-wisebox-border p-3">
                <h4 className="text-xs font-medium text-wisebox-text-muted uppercase tracking-wide mb-1">
                  Estimated time
                </h4>
                <p className="text-sm text-white">{info.estimatedTime}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="missing" className="space-y-3 mt-4">
            <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-sm text-amber-300 leading-relaxed">
                {info.ifMissing}
              </p>
            </div>
            {info.tips.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-wisebox-text-muted uppercase tracking-wide mb-1.5">
                  Tips
                </h4>
                <ul className="space-y-1.5">
                  {info.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="text-sm text-wisebox-text-secondary leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-wisebox-primary-400"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
