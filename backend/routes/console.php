<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Process queued jobs (emails, notifications) every minute.
// --stop-when-empty: exits after clearing the queue so the scheduler isn't blocked.
// --tries=3: retry failed jobs up to 3 times.
// --timeout=30: kill any single job that runs longer than 30 seconds.
Schedule::command('queue:work --stop-when-empty --tries=3 --timeout=30')
    ->everyMinute()
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/queue-worker.log'));
