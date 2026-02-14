<?php

namespace App\Filament\Resources\Tickets\Schemas;

use App\Models\User;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class TicketForm
{
    public static function configure(Schema $schema): Schema
    {
        // Simplified form without Section components (Filament 4 compatibility)
        return $schema
            ->components([
                // Ticket Information
                TextInput::make('ticket_number')
                    ->label('Ticket Number')
                    ->disabled()
                    ->dehydrated(false),

                TextInput::make('title')
                    ->label('Title')
                    ->required()
                    ->maxLength(255),

                Textarea::make('description')
                    ->label('Description')
                    ->rows(3)
                    ->columnSpanFull(),

                Select::make('status')
                    ->label('Status')
                    ->required()
                    ->options([
                        'open' => 'Open (Awaiting Assignment)',
                        'assigned' => 'Assigned to Consultant',
                        'in_progress' => 'In Progress',
                        'awaiting_customer' => 'Awaiting Customer',
                        'awaiting_consultant' => 'Awaiting Consultant',
                        'scheduled' => 'Meeting Scheduled',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                        'closed' => 'Closed',
                    ])
                    ->default('open'),

                Select::make('priority')
                    ->label('Priority')
                    ->required()
                    ->options([
                        'low' => 'Low',
                        'medium' => 'Medium',
                        'high' => 'High',
                    ])
                    ->default('medium'),

                // Assignment
                Select::make('consultant_id')
                    ->label('Assign to Consultant')
                    ->relationship('consultant', 'name')
                    ->searchable()
                    ->preload()
                    ->options(function () {
                        return User::whereIn('role', ['consultant', 'admin', 'super_admin'])
                            ->pluck('name', 'id');
                    })
                    ->placeholder('Select a consultant')
                    ->helperText('Assign this ticket to a consultant for handling'),

                Placeholder::make('customer_name')
                    ->label('Customer')
                    ->content(fn ($record) => $record?->customer?->name ?? 'N/A'),

                Placeholder::make('property_name')
                    ->label('Property')
                    ->content(fn ($record) => $record?->property?->property_name ?? 'N/A'),

                Placeholder::make('service_name')
                    ->label('Service')
                    ->content(fn ($record) => $record?->service?->name ?? 'N/A'),

                // Consultation Details (only for consultation services)
                DateTimePicker::make('scheduled_at')
                    ->label('Scheduled At')
                    ->helperText('When the consultation meeting is scheduled')
                    ->visible(fn ($record) => $record?->service?->name &&
                        (str_contains(strtolower($record->service->name), 'consultation') ||
                         str_contains(strtolower($record->service->name), 'consult'))),

                TextInput::make('meeting_url')
                    ->label('Meeting Link')
                    ->url()
                    ->helperText('Auto-generated after consultant confirms time slot or Calendly booking')
                    ->visible(fn ($record) => $record?->service?->name &&
                        (str_contains(strtolower($record->service->name), 'consultation') ||
                         str_contains(strtolower($record->service->name), 'consult'))),

                DateTimePicker::make('completed_at')
                    ->label('Completed At')
                    ->helperText('When the consultation was completed')
                    ->visible(fn ($record) => $record?->service?->name &&
                        (str_contains(strtolower($record->service->name), 'consultation') ||
                         str_contains(strtolower($record->service->name), 'consult'))),

                Textarea::make('consultation_notes')
                    ->label('Consultation Notes')
                    ->rows(4)
                    ->helperText('Notes from the consultation session')
                    ->columnSpanFull()
                    ->visible(fn ($record) => $record?->service?->name &&
                        (str_contains(strtolower($record->service->name), 'consultation') ||
                         str_contains(strtolower($record->service->name), 'consult'))),

                // Preferred Time Slots
                Placeholder::make('preferred_slots')
                    ->label('Customer\'s Preferred Times')
                    ->content(function ($record) {
                        if (!$record || !$record->preferred_time_slots) {
                            return 'No preferred time slots provided';
                        }

                        $slots = collect($record->preferred_time_slots)
                            ->map(fn ($slot, $index) => ($index + 1) . '. ' . $slot['display'])
                            ->join('<br>');

                        return new \Illuminate\Support\HtmlString($slots);
                    })
                    ->columnSpanFull()
                    ->visible(fn ($record) => $record && !empty($record->preferred_time_slots)),
            ])
            ->columns(2);
    }
}
