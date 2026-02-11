<?php

namespace App\Filament\Resources\OwnershipStatuses\Pages;

use App\Filament\Resources\OwnershipStatuses\OwnershipStatusResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditOwnershipStatus extends EditRecord
{
    protected static string $resource = OwnershipStatusResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
