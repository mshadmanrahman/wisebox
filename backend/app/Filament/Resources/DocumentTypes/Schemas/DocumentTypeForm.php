<?php

namespace App\Filament\Resources\DocumentTypes\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class DocumentTypeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('slug')
                    ->required(),
                Textarea::make('description')
                    ->columnSpanFull(),
                Select::make('category')
                    ->options(['primary' => 'Primary', 'secondary' => 'Secondary'])
                    ->required(),
                Toggle::make('is_required')
                    ->required(),
                Textarea::make('guidance_text')
                    ->columnSpanFull(),
                Textarea::make('missing_guidance')
                    ->columnSpanFull(),
                TextInput::make('accepted_formats'),
                TextInput::make('max_file_size_mb')
                    ->required()
                    ->numeric()
                    ->default(10),
                TextInput::make('score_weight')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('conditional_on_ownership'),
                Toggle::make('is_active')
                    ->required(),
                TextInput::make('sort_order')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('country_code')
                    ->required()
                    ->default('BGD'),
            ]);
    }
}
