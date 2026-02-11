<?php

namespace App\Filament\Resources\OwnershipTypes\Pages;

use App\Filament\Resources\OwnershipTypes\OwnershipTypeResource;
use Filament\Resources\Pages\CreateRecord;

class CreateOwnershipType extends CreateRecord
{
    protected static string $resource = OwnershipTypeResource::class;
}
