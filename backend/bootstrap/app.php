<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust Railway's reverse proxy (Caddy + LB) so Laravel
        // correctly reads X-Forwarded-Proto/Host/Port headers
        $middleware->trustProxies(at: '*');

        // Security headers for all API responses
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // Set application locale from user profile or Accept-Language header
        $middleware->append(\App\Http\Middleware\SetLocale::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
