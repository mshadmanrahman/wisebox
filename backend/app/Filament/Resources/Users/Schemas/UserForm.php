<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                DateTimePicker::make('email_verified_at'),
                TextInput::make('password')
                    ->password(),
                TextInput::make('phone')
                    ->tel(),
                DateTimePicker::make('phone_verified_at'),
                TextInput::make('country_of_residence'),
                TextInput::make('avatar_url')
                    ->url(),
                Select::make('role')
                    ->options([
            'customer' => 'Customer',
            'consultant' => 'Consultant',
            'admin' => 'Admin',
            'super_admin' => 'Super admin',
        ])
                    ->default('customer')
                    ->required(),
                TextInput::make('google_id'),
                Select::make('status')
                    ->options(['active' => 'Active', 'inactive' => 'Inactive', 'suspended' => 'Suspended'])
                    ->default('active')
                    ->required(),
                DateTimePicker::make('last_login_at'),
            ]);
    }
}
