<?php

namespace App\Filament\Resources\AssessmentQuestions\Pages;

use App\Filament\Resources\AssessmentQuestions\AssessmentQuestionResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewAssessmentQuestion extends ViewRecord
{
    protected static string $resource = AssessmentQuestionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
