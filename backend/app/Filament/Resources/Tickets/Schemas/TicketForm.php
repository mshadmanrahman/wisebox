<?php

namespace App\Filament\Resources\Tickets\Schemas;

use App\Models\User;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

// Simplified form: no Placeholder, no ->visible(), no ->relationship()+->options() combo
// (Filament 4 compatibility)
class TicketForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
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

                Select::make('consultant_id')
                    ->label('Assign to Consultant')
                    ->options(function () {
                        return User::whereIn('role', ['consultant', 'admin', 'super_admin'])
                            ->pluck('name', 'id');
                    })
                    ->searchable()
                    ->placeholder('Select a consultant'),

                // Consultation fields (always visible; empty when not applicable)
                DateTimePicker::make('scheduled_at')
                    ->label('Scheduled At'),

                TextInput::make('meeting_url')
                    ->label('Meeting Link')
                    ->url(),

                DateTimePicker::make('completed_at')
                    ->label('Completed At'),

                Textarea::make('consultation_notes')
                    ->label('Consultation Notes')
                    ->rows(4)
                    ->columnSpanFull(),
            ]);
    }
}
