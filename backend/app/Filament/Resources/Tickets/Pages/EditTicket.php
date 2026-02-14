<?php

namespace App\Filament\Resources\Tickets\Pages;

use App\Filament\Resources\Tickets\TicketResource;
use App\Services\TransactionalEmailService;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EditTicket extends EditRecord
{
    protected static string $resource = TicketResource::class;

    protected array $previousData = [];

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }

    protected function getSavedNotification(): ?Notification
    {
        return Notification::make()
            ->success()
            ->title('Ticket updated')
            ->body('The ticket has been updated successfully.');
    }

    protected function beforeSave(): void
    {
        $this->previousData = [
            'consultant_id' => $this->record->consultant_id,
            'status' => $this->record->status,
        ];
    }

    protected function afterSave(): void
    {
        // If consultant was just assigned and status is still 'open', change to 'assigned'
        if ($this->record->consultant_id && $this->record->status === 'open') {
            $this->record->update(['status' => 'assigned']);
        }

        $emailService = app(TransactionalEmailService::class);
        $previousConsultantId = $this->previousData['consultant_id'] ?? null;

        // --- Consultant assignment notifications ---
        if ($this->record->consultant_id && $this->record->consultant_id !== $previousConsultantId) {
            $this->record->load(['consultant', 'customer']);

            // Notify the new consultant
            if ($this->record->consultant) {
                $this->createNotification(
                    (int) $this->record->consultant_id,
                    'ticket.assigned',
                    'New ticket assigned',
                    "You have been assigned to ticket {$this->record->ticket_number}.",
                    [
                        'ticket_id' => $this->record->id,
                        'ticket_number' => $this->record->ticket_number,
                    ]
                );

                $emailService->sendTicketAssigned($this->record->consultant, $this->record);
            }

            // Notify the customer about the assignment
            if ($this->record->customer) {
                $this->createNotification(
                    (int) $this->record->customer_id,
                    'ticket.consultant.assigned',
                    'Consultant assigned',
                    "A consultant has been assigned to ticket {$this->record->ticket_number}.",
                    [
                        'ticket_id' => $this->record->id,
                        'ticket_number' => $this->record->ticket_number,
                        'consultant_id' => $this->record->consultant_id,
                    ]
                );

                $emailService->sendTicketAssigned($this->record->customer, $this->record);
            }
        }

        // --- Status change notifications ---
        $previousStatus = $this->previousData['status'] ?? null;
        $currentStatus = $this->record->status;

        // Skip if the status change was only the auto-transition (open → assigned) from consultant assignment
        $wasAutoTransition = $previousStatus === 'open'
            && $currentStatus === 'assigned'
            && $this->record->consultant_id
            && $this->record->consultant_id !== $previousConsultantId;

        if ($previousStatus !== $currentStatus && !$wasAutoTransition) {
            $this->record->load(['customer']);

            if ($this->record->customer) {
                $this->createNotification(
                    (int) $this->record->customer_id,
                    'ticket.status.updated',
                    'Ticket status updated',
                    "Ticket {$this->record->ticket_number} is now {$currentStatus}.",
                    [
                        'ticket_id' => $this->record->id,
                        'ticket_number' => $this->record->ticket_number,
                        'from_status' => $previousStatus,
                        'to_status' => $currentStatus,
                    ]
                );

                $emailService->sendTicketStatusUpdated($this->record->customer, $this->record, $previousStatus);
            }
        }

        // Sync resolved_at: set when completed, clear when moving away from completed
        if ($currentStatus === 'completed' && !$this->record->resolved_at) {
            $this->record->update(['resolved_at' => now()]);
        } elseif ($currentStatus !== 'completed' && $previousStatus === 'completed') {
            $this->record->update(['resolved_at' => null]);
        }
    }

    private function createNotification(
        int $userId,
        string $type,
        string $title,
        ?string $body = null,
        array $data = []
    ): void {
        DB::table('notifications')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => !empty($data) ? json_encode($data, JSON_UNESCAPED_SLASHES) : null,
            'created_at' => now(),
        ]);
    }
}
