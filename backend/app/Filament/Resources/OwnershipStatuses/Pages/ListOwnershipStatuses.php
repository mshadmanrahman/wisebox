<?php

namespace App\Filament\Resources\OwnershipStatuses\Pages;

use App\Filament\Resources\OwnershipStatuses\OwnershipStatusResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListOwnershipStatuses extends ListRecords
{
    protected static string $resource = OwnershipStatusResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
