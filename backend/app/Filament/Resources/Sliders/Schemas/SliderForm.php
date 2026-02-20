<?php

namespace App\Filament\Resources\Sliders\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class SliderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->required()
                    ->maxLength(255),
                TextInput::make('subtitle')
                    ->maxLength(500),
                TextInput::make('image_path')
                    ->label('Image URL')
                    ->url()
                    ->required()
                    ->maxLength(500),
                TextInput::make('image_alt')
                    ->label('Image alt text')
                    ->maxLength(255),
                TextInput::make('cta_text')
                    ->label('CTA text')
                    ->maxLength(100),
                TextInput::make('cta_url')
                    ->label('CTA URL')
                    ->url()
                    ->maxLength(500),
                TextInput::make('background_color')
                    ->label('Background color / gradient')
                    ->maxLength(100),
                Toggle::make('is_active')
                    ->label('Active')
                    ->default(true),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
                DateTimePicker::make('starts_at'),
                DateTimePicker::make('ends_at'),
            ]);
    }
}
