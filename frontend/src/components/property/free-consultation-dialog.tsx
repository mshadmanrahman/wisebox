'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TimeSlotPicker } from '@/components/consultation/time-slot-picker';
import { trackConsultationBooked } from '@/lib/analytics';

interface FreeConsultationDialogProps {
  propertyId: number;
  propertyName: string;
  trigger?: React.ReactNode;
}

interface SelectedSlot {
  date: string;
  time: string;
  display: string;
}

export function FreeConsultationDialog({ propertyId, propertyName, trigger }: FreeConsultationDialogProps) {
  const { t } = useTranslation('properties');
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post('/free-consultations', {
        property_id: propertyId,
        description,
        preferred_slots: selectedSlots.map(s => ({ date: s.date, time: s.time })),
      });
    },
    onSuccess: () => {
      trackConsultationBooked('free_consultation');
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['property', propertyId, 'consultations'] });
      queryClient.invalidateQueries({ queryKey: ['free-consultations'] });
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setDescription('');
        setSelectedSlots([]);
      }, 3000);
    },
  });

  const canSubmit = selectedSlots.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary/10 hover:text-primary h-14 text-base font-medium transition-all duration-200">
            <Calendar className="h-5 w-5 mr-2" strokeWidth={1.5} />
            {t('freeConsultation.triggerButton')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[85vh] overflow-y-auto">
        {success ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-wisebox-status-success mx-auto" strokeWidth={1.5} />
            <h3 className="text-xl font-medium text-foreground">{t('freeConsultation.successTitle')}</h3>
            <p className="text-muted-foreground">
              {t('freeConsultation.successDescription')}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground text-xl">
                {t('freeConsultation.dialogTitle')}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t('freeConsultation.dialogDescription', { name: propertyName, defaultValue: `Get expert guidance on your property: ${propertyName}` })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* Description */}
              <div className="space-y-2">
                <Label className="text-foreground text-sm font-medium">
                  {t('freeConsultation.whatHelpNeeded')}
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('freeConsultation.descriptionPlaceholder')}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">{t('freeConsultation.charCount', { current: description.length, max: 2000 })}</p>
              </div>

              {/* Time Slot Picker */}
              <TimeSlotPicker onSlotsChange={setSelectedSlots} minSlots={1} maxSlots={5} />

              {/* Info */}
              <div className="bg-background/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                <p>{t('freeConsultation.infoFree')}</p>
                <p>{t('freeConsultation.infoReview')}</p>
                <p>{t('freeConsultation.infoCalendar')}</p>
              </div>

              {/* Submit */}
              <Button
                onClick={() => mutation.mutate()}
                disabled={!canSubmit || mutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 h-12 font-medium transition-all duration-200"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} />
                    {t('freeConsultation.submitting')}
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" strokeWidth={1.5} />
                    {t('freeConsultation.submitButton')}
                  </>
                )}
              </Button>

              {mutation.isError && (
                <p className="text-sm text-wisebox-status-danger text-center">
                  {(mutation.error as Error)?.message || t('freeConsultation.submitFailed')}
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
