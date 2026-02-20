<?php

namespace App\Filament\Resources\Tickets\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

// Simplified infolist without Section/Grid components (Filament 4 compatibility)
class TicketInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                // Ticket Overview
                TextEntry::make('ticket_number')
                    ->label('Ticket #')
                    ->copyable(),

                TextEntry::make('status')
                    ->badge()
                    ->color(fn ($state): string => match ($state) {
                        'open' => 'warning',
                        'assigned' => 'info',
                        'in_progress' => 'primary',
                        'awaiting_customer' => 'warning',
                        'awaiting_consultant' => 'info',
                        'scheduled' => 'primary',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'gray',
                    }),

                TextEntry::make('priority')
                    ->badge()
                    ->color(fn ($state): string => match ($state) {
                        'high' => 'danger',
                        'medium' => 'warning',
                        'low' => 'success',
                        default => 'gray',
                    }),

                TextEntry::make('title')
                    ->label('Title'),

                TextEntry::make('description')
                    ->label('Description')
                    ->markdown()
                    ->placeholder('-'),

                // People
                TextEntry::make('customer.name')
                    ->label('Customer')
                    ->placeholder('-'),

                TextEntry::make('customer.email')
                    ->label('Customer Email')
                    ->copyable()
                    ->placeholder('-'),

                TextEntry::make('consultant.name')
                    ->label('Assigned Consultant')
                    ->placeholder('Not assigned yet'),

                // Property & Service
                TextEntry::make('property.property_name')
                    ->label('Property')
                    ->placeholder('-'),

                TextEntry::make('service.name')
                    ->label('Service')
                    ->placeholder('-'),

                TextEntry::make('order.order_number')
                    ->label('Order Number')
                    ->placeholder('No order')
                    ->copyable(),

                // Scheduling
                TextEntry::make('scheduled_at')
                    ->label('Scheduled At')
                    ->dateTime('F j, Y g:i A')
                    ->placeholder('Not scheduled yet'),

                TextEntry::make('completed_at')
                    ->label('Completed At')
                    ->dateTime('F j, Y g:i A')
                    ->placeholder('Not completed yet'),

                TextEntry::make('meeting_url')
                    ->label('Meeting Link')
                    ->url(fn ($state) => $state)
                    ->openUrlInNewTab()
                    ->placeholder('No meeting link yet'),

                TextEntry::make('consultation_notes')
                    ->label('Consultation Notes')
                    ->markdown()
                    ->placeholder('No notes yet'),

                // Timeline
                TextEntry::make('created_at')
                    ->label('Created')
                    ->dateTime('M j, Y g:i A'),

                TextEntry::make('updated_at')
                    ->label('Last Updated')
                    ->dateTime('M j, Y g:i A'),

                TextEntry::make('resolved_at')
                    ->label('Resolved At')
                    ->dateTime('M j, Y g:i A')
                    ->placeholder('Not resolved yet'),
            ]);
    }
}
