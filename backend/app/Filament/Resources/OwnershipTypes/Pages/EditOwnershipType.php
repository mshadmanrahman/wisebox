<?php

namespace App\Filament\Resources\OwnershipTypes\Pages;

use App\Filament\Resources\OwnershipTypes\OwnershipTypeResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditOwnershipType extends EditRecord
{
    protected static string $resource = OwnershipTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
