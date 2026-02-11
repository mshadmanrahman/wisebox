<?php

namespace App\Filament\Resources\DocumentTypes\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class DocumentTypeInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('name'),
                TextEntry::make('slug'),
                TextEntry::make('description')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('category')
                    ->badge(),
                IconEntry::make('is_required')
                    ->boolean(),
                TextEntry::make('guidance_text')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('missing_guidance')
                    ->placeholder('-')
                    ->columnSpanFull(),
                TextEntry::make('max_file_size_mb')
                    ->numeric(),
                TextEntry::make('score_weight')
                    ->numeric(),
                TextEntry::make('conditional_on_ownership')
                    ->placeholder('-'),
                IconEntry::make('is_active')
                    ->boolean(),
                TextEntry::make('sort_order')
                    ->numeric(),
                TextEntry::make('country_code'),
                TextEntry::make('created_at')
                    ->dateTime()
                    ->placeholder('-'),
                TextEntry::make('updated_at')
                    ->dateTime()
                    ->placeholder('-'),
            ]);
    }
}
