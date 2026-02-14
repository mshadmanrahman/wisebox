<?php

namespace App\Filament\Resources\Tickets\Pages;

use App\Filament\Resources\Tickets\TicketResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListTickets extends ListRecords
{
    protected static string $resource = TicketResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Tickets are created from orders, so no create action needed
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('All')
                ->badge(fn () => static::getModel()::count()),

            'open' => Tab::make('Open')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'open'))
                ->badge(fn () => static::getModel()::where('status', 'open')->count())
                ->badgeColor('warning')
                ->icon('heroicon-o-clock'),

            'assigned' => Tab::make('Assigned')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'assigned'))
                ->badge(fn () => static::getModel()::where('status', 'assigned')->count())
                ->badgeColor('info')
                ->icon('heroicon-o-user'),

            'in_progress' => Tab::make('In Progress')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'in_progress'))
                ->badge(fn () => static::getModel()::where('status', 'in_progress')->count())
                ->badgeColor('primary')
                ->icon('heroicon-o-arrow-path'),

            'scheduled' => Tab::make('Scheduled')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'scheduled'))
                ->badge(fn () => static::getModel()::where('status', 'scheduled')->count())
                ->badgeColor('primary')
                ->icon('heroicon-o-calendar'),

            'completed' => Tab::make('Completed')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'completed'))
                ->badge(fn () => static::getModel()::where('status', 'completed')->count())
                ->badgeColor('success')
                ->icon('heroicon-o-check-circle'),

            'closed' => Tab::make('Closed')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('status', 'closed'))
                ->badge(fn () => static::getModel()::where('status', 'closed')->count())
                ->badgeColor('gray')
                ->icon('heroicon-o-x-circle'),
        ];
    }
}
