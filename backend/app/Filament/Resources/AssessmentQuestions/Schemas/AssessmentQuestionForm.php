<?php

namespace App\Filament\Resources\AssessmentQuestions\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class AssessmentQuestionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('question')
                    ->required(),
                TextInput::make('weight')
                    ->required()
                    ->numeric(),
                TextInput::make('doc_type'),
                TextInput::make('sort_order')
                    ->required()
                    ->numeric()
                    ->default(1),
                Toggle::make('is_active')
                    ->required(),
            ]);
    }
}
