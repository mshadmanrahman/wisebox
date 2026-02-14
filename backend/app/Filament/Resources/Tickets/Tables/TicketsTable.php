<?php

namespace App\Filament\Resources\Tickets\Tables;

use Filament\Actions\ViewAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class TicketsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('ticket_number')
                    ->label('Ticket #')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                TextColumn::make('customer.name')
                    ->label('Customer')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('property.property_name')
                    ->label('Property')
                    ->searchable()
                    ->limit(30),

                TextColumn::make('service.name')
                    ->label('Service')
                    ->searchable()
                    ->limit(30),

                BadgeColumn::make('status')
                    ->label('Status')
                    ->colors([
                        'warning' => fn ($state) => in_array($state, ['open', 'awaiting_customer']),
                        'info' => fn ($state) => in_array($state, ['assigned', 'awaiting_consultant']),
                        'primary' => fn ($state) => in_array($state, ['in_progress', 'scheduled']),
                        'success' => 'completed',
                        'danger' => 'cancelled',
                        'gray' => 'closed',
                    ])
                    ->icons([
                        'heroicon-o-clock' => 'open',
                        'heroicon-o-user' => 'assigned',
                        'heroicon-o-play' => 'in_progress',
                        'heroicon-o-chat-bubble-left-ellipsis' => 'awaiting_customer',
                        'heroicon-o-chat-bubble-left' => 'awaiting_consultant',
                        'heroicon-o-calendar' => 'scheduled',
                        'heroicon-o-check-circle' => 'completed',
                        'heroicon-o-no-symbol' => 'cancelled',
                        'heroicon-o-x-circle' => 'closed',
                    ]),

                TextColumn::make('consultant.name')
                    ->label('Consultant')
                    ->default('Unassigned')
                    ->searchable(),

                BadgeColumn::make('priority')
                    ->label('Priority')
                    ->colors([
                        'danger' => 'high',
                        'warning' => 'medium',
                        'success' => 'low',
                    ]),

                TextColumn::make('scheduled_at')
                    ->label('Scheduled')
                    ->dateTime('M j, Y g:i A')
                    ->sortable()
                    ->toggleable(),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->dateTime('M j, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'open' => 'Open',
                        'assigned' => 'Assigned',
                        'in_progress' => 'In Progress',
                        'awaiting_customer' => 'Awaiting Customer',
                        'awaiting_consultant' => 'Awaiting Consultant',
                        'scheduled' => 'Scheduled',
                        'completed' => 'Completed',
                        'cancelled' => 'Cancelled',
                        'closed' => 'Closed',
                    ]),

                SelectFilter::make('priority')
                    ->options([
                        'high' => 'High',
                        'medium' => 'Medium',
                        'low' => 'Low',
                    ]),

                SelectFilter::make('consultant_id')
                    ->label('Consultant')
                    ->relationship('consultant', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->defaultSort('created_at', 'desc');
    }
}
