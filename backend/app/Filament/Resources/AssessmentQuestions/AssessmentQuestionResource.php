<?php

namespace App\Filament\Resources\AssessmentQuestions;

use App\Filament\Resources\AssessmentQuestions\Pages\CreateAssessmentQuestion;
use App\Filament\Resources\AssessmentQuestions\Pages\EditAssessmentQuestion;
use App\Filament\Resources\AssessmentQuestions\Pages\ListAssessmentQuestions;
use App\Filament\Resources\AssessmentQuestions\Pages\ViewAssessmentQuestion;
use App\Filament\Resources\AssessmentQuestions\Schemas\AssessmentQuestionForm;
use App\Filament\Resources\AssessmentQuestions\Schemas\AssessmentQuestionInfolist;
use App\Filament\Resources\AssessmentQuestions\Tables\AssessmentQuestionsTable;
use App\Models\AssessmentQuestion;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AssessmentQuestionResource extends Resource
{
    protected static ?string $model = AssessmentQuestion::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return AssessmentQuestionForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return AssessmentQuestionInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AssessmentQuestionsTable::configure($table);
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
            'index' => ListAssessmentQuestions::route('/'),
            'create' => CreateAssessmentQuestion::route('/create'),
            'view' => ViewAssessmentQuestion::route('/{record}'),
            'edit' => EditAssessmentQuestion::route('/{record}/edit'),
        ];
    }
}
