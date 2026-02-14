<?php

namespace App\Providers;

use App\Contracts\GovernmentGatewayAdapter;
use App\Services\Government\MockGovernmentGatewayAdapter;
use App\Services\Government\NullGovernmentGatewayAdapter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
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
        // Public endpoints: 30 requests/minute per IP
        RateLimiter::for('public', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });

        // Auth endpoints: 5 attempts/minute per IP (brute-force protection)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Authenticated API: 120 requests/minute per user
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        // Webhooks: 60 requests/minute per IP (Stripe/Calendly)
        RateLimiter::for('webhooks', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });
    }
}
