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
          <Button variant="outline" className="w-full border-2 border-wisebox-primary-500 text-wisebox-primary-400 hover:bg-wisebox-primary-900/20 hover:text-wisebox-primary-300 h-14 text-lg font-semibold">
            <Calendar className="h-5 w-5 mr-2" />
            {t('freeConsultation.triggerButton')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-wisebox-background-card border-wisebox-border text-white max-w-2xl max-h-[85vh] overflow-y-auto">
        {success ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">{t('freeConsultation.successTitle')}</h3>
            <p className="text-wisebox-text-secondary">
              {t('freeConsultation.successDescription')}
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {t('freeConsultation.dialogTitle')}
              </DialogTitle>
              <DialogDescription className="text-wisebox-text-secondary">
                {t('freeConsultation.dialogDescription', { name: propertyName, defaultValue: `Get expert guidance on your property: ${propertyName}` })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* Description */}
              <div className="space-y-2">
                <Label className="text-white text-sm font-medium">
                  {t('freeConsultation.whatHelpNeeded')}
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('freeConsultation.descriptionPlaceholder')}
                  className="bg-wisebox-background-lighter border-wisebox-border text-white placeholder:text-wisebox-text-muted min-h-[100px]"
                  maxLength={2000}
                />
                <p className="text-xs text-wisebox-text-muted">{t('freeConsultation.charCount', { current: description.length, max: 2000 })}</p>
              </div>

              {/* Time Slot Picker */}
              <TimeSlotPicker onSlotsChange={setSelectedSlots} minSlots={1} maxSlots={5} />

              {/* Info */}
              <div className="bg-wisebox-background/50 rounded-lg p-3 text-xs text-wisebox-text-muted space-y-1">
                <p>{t('freeConsultation.infoFree')}</p>
                <p>{t('freeConsultation.infoReview')}</p>
                <p>{t('freeConsultation.infoCalendar')}</p>
              </div>

              {/* Submit */}
              <Button
                onClick={() => mutation.mutate()}
                disabled={!canSubmit || mutation.isPending}
                className="w-full bg-wisebox-primary hover:bg-wisebox-primary-hover text-white h-12 font-semibold"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('freeConsultation.submitting')}
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('freeConsultation.submitButton')}
                  </>
                )}
              </Button>

              {mutation.isError && (
                <p className="text-sm text-red-400 text-center">
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
