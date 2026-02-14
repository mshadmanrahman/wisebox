<?php

namespace App\Console\Commands;

use App\Services\GoogleCalendarService;
use Illuminate\Console\Command;

class GoogleAuthCommand extends Command
{
    protected $signature = 'google:auth';
    protected $description = 'Authenticate with Google Calendar API and generate access token';

    public function handle(GoogleCalendarService $service): int
    {
        $this->info('Google Calendar API Authentication');
        $this->newLine();

        // Step 1: Get auth URL
        $authUrl = $service->getAuthUrl();

        $this->line('Step 1: Visit this URL in your browser:');
        $this->line($authUrl);
        $this->newLine();

        $this->line('Step 2: After authorizing, Google will show you an authorization code.');
        $this->line('Copy that code and paste it here:');
        $this->newLine();

        // Step 2: Get code from user
        $code = $this->ask('Enter the authorization code');

        if (empty($code)) {
            $this->error('Authorization code is required');
            return self::FAILURE;
        }

        try {
            // Step 3: Exchange code for token
            $token = $service->handleCallback($code);

            $this->newLine();
            $this->info('✓ Successfully authenticated with Google!');
            $this->newLine();

            $this->line('Add this to your .env file:');
            $this->line('GOOGLE_ACCESS_TOKEN=\'' . json_encode($token) . '\'');
            $this->newLine();

            $this->comment('For production, store this token in the database instead of .env');

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Authentication failed: ' . $e->getMessage());
            return self::FAILURE;
        }
    }
}
