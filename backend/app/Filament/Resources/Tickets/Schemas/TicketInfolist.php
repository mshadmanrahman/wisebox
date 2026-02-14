<?php

namespace App\Filament\Resources\Tickets\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class TicketInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Ticket Overview')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextEntry::make('ticket_number')
                                    ->label('Ticket #')
                                    ->copyable(),

                                TextEntry::make('status')
                                    ->badge()
                                    ->color(fn (string $state): string => match ($state) {
                                        'open' => 'warning',
                                        'assigned' => 'info',
                                        'in_progress' => 'primary',
                                        'awaiting_customer' => 'warning',
                                        'awaiting_consultant' => 'info',
                                        'scheduled' => 'primary',
                                        'completed' => 'success',
                                        'cancelled' => 'danger',
                                        'closed' => 'gray',
                                        default => 'gray',
                                    }),

                                TextEntry::make('priority')
                                    ->badge()
                                    ->color(fn (string $state): string => match ($state) {
                                        'high' => 'danger',
                                        'medium' => 'warning',
                                        'low' => 'success',
                                        default => 'gray',
                                    }),
                            ]),

                        TextEntry::make('title')
                            ->label('Title')
                            ->columnSpanFull(),

                        TextEntry::make('description')
                            ->label('Description')
                            ->columnSpanFull()
                            ->markdown(),
                    ]),

                Section::make('People Involved')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextEntry::make('customer.name')
                                    ->label('Customer'),

                                TextEntry::make('customer.email')
                                    ->label('Customer Email')
                                    ->copyable(),

                                TextEntry::make('consultant.name')
                                    ->label('Assigned Consultant')
                                    ->default('Not assigned yet')
                                    ->badge()
                                    ->color(fn ($state) => $state === 'Not assigned yet' ? 'warning' : 'success'),
                            ]),
                    ]),

                Section::make('Property & Service')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextEntry::make('property.property_name')
                                    ->label('Property'),

                                TextEntry::make('service.name')
                                    ->label('Service'),

                                TextEntry::make('order.order_number')
                                    ->label('Order Number')
                                    ->url(fn ($record) => $record->order ? route('filament.admin.resources.orders.view', $record->order) : null),
                            ]),
                    ]),

                Section::make('Preferred Time Slots')
                    ->schema([
                        TextEntry::make('preferred_time_slots')
                            ->label('Customer\'s Preferred Times')
                            ->formatStateUsing(function ($state) {
                                if (!$state) {
                                    return 'No preferred time slots provided';
                                }

                                return collect($state)
                                    ->map(fn ($slot, $index) => ($index + 1) . '. ' . $slot['display'])
                                    ->join('<br>');
                            })
                            ->html(),
                    ])
                    ->visible(fn ($record) => !empty($record->preferred_time_slots)),

                Section::make('Consultation Details')
                    ->schema([
                        Grid::make(2)
                            ->schema([
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
                                    ->placeholder('No meeting link yet')
                                    ->columnSpanFull(),

                                TextEntry::make('consultation_notes')
                                    ->label('Consultation Notes')
                                    ->markdown()
                                    ->placeholder('No notes yet')
                                    ->columnSpanFull(),
                            ]),
                    ])
                    ->visible(fn ($record) => $record->service &&
                        (str_contains(strtolower($record->service->name), 'consultation') ||
                         str_contains(strtolower($record->service->name), 'consult'))),

                Section::make('Timeline')
                    ->schema([
                        Grid::make(3)
                            ->schema([
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
                            ]),
                    ]),
            ]);
    }
}
