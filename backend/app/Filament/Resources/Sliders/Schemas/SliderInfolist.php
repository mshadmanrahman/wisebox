<?php

namespace App\Filament\Resources\Sliders\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class SliderInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('title'),
                TextEntry::make('subtitle')
                    ->placeholder('-'),
                TextEntry::make('image_path')
                    ->label('Image URL')
                    ->placeholder('-'),
                TextEntry::make('image_alt')
                    ->label('Image alt text')
                    ->placeholder('-'),
                TextEntry::make('cta_text')
                    ->label('CTA text')
                    ->placeholder('-'),
                TextEntry::make('cta_url')
                    ->label('CTA URL')
                    ->placeholder('-'),
                TextEntry::make('background_color')
                    ->label('Background color / gradient')
                    ->placeholder('-'),
                IconEntry::make('is_active')
                    ->label('Active')
                    ->boolean(),
                TextEntry::make('sort_order'),
                TextEntry::make('starts_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('ends_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
