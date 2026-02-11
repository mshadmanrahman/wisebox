<?php

namespace App\Filament\Resources\OwnershipStatuses;

use App\Filament\Resources\OwnershipStatuses\Pages\CreateOwnershipStatus;
use App\Filament\Resources\OwnershipStatuses\Pages\EditOwnershipStatus;
use App\Filament\Resources\OwnershipStatuses\Pages\ListOwnershipStatuses;
use App\Filament\Resources\OwnershipStatuses\Pages\ViewOwnershipStatus;
use App\Filament\Resources\OwnershipStatuses\Schemas\OwnershipStatusForm;
use App\Filament\Resources\OwnershipStatuses\Schemas\OwnershipStatusInfolist;
use App\Filament\Resources\OwnershipStatuses\Tables\OwnershipStatusesTable;
use App\Models\OwnershipStatus;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class OwnershipStatusResource extends Resource
{
    protected static ?string $model = OwnershipStatus::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return OwnershipStatusForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return OwnershipStatusInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return OwnershipStatusesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListOwnershipStatuses::route('/'),
            'create' => CreateOwnershipStatus::route('/create'),
            'view' => ViewOwnershipStatus::route('/{record}'),
            'edit' => EditOwnershipStatus::route('/{record}/edit'),
        ];
    }
}
