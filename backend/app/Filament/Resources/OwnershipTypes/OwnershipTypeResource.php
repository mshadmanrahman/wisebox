<?php

namespace App\Filament\Resources\OwnershipTypes;

use App\Filament\Resources\OwnershipTypes\Pages\CreateOwnershipType;
use App\Filament\Resources\OwnershipTypes\Pages\EditOwnershipType;
use App\Filament\Resources\OwnershipTypes\Pages\ListOwnershipTypes;
use App\Filament\Resources\OwnershipTypes\Pages\ViewOwnershipType;
use App\Filament\Resources\OwnershipTypes\Schemas\OwnershipTypeForm;
use App\Filament\Resources\OwnershipTypes\Schemas\OwnershipTypeInfolist;
use App\Filament\Resources\OwnershipTypes\Tables\OwnershipTypesTable;
use App\Models\OwnershipType;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class OwnershipTypeResource extends Resource
{
    protected static ?string $model = OwnershipType::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return OwnershipTypeForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return OwnershipTypeInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return OwnershipTypesTable::configure($table);
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
            'index' => ListOwnershipTypes::route('/'),
            'create' => CreateOwnershipType::route('/create'),
            'view' => ViewOwnershipType::route('/{record}'),
            'edit' => EditOwnershipType::route('/{record}/edit'),
        ];
    }
}
