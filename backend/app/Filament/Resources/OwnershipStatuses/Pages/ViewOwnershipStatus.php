<?php

namespace App\Filament\Resources\OwnershipStatuses\Pages;

use App\Filament\Resources\OwnershipStatuses\OwnershipStatusResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewOwnershipStatus extends ViewRecord
{
    protected static string $resource = OwnershipStatusResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
