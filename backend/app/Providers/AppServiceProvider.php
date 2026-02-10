<?php

namespace App\Providers;

use App\Contracts\GovernmentGatewayAdapter;
use App\Services\Government\MockGovernmentGatewayAdapter;
use App\Services\Government\NullGovernmentGatewayAdapter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(GovernmentGatewayAdapter::class, function () {
            $enabled = (bool) config('services.government.enabled', false);
            $adapter = (string) config('services.government.adapter', 'null');

            if ($enabled && $adapter === 'mock') {
                return new MockGovernmentGatewayAdapter();
            }

            return new NullGovernmentGatewayAdapter();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
