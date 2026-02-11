<?php

namespace App\Filament\Resources\OwnershipTypes\Pages;

use App\Filament\Resources\OwnershipTypes\OwnershipTypeResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewOwnershipType extends ViewRecord
{
    protected static string $resource = OwnershipTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
