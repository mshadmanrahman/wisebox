<?php

namespace App\Filament\Resources\OwnershipTypes\Pages;

use App\Filament\Resources\OwnershipTypes\OwnershipTypeResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListOwnershipTypes extends ListRecords
{
    protected static string $resource = OwnershipTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
