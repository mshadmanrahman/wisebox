<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /** @var array<int, string> */
    private const SUPPORTED_LOCALES = ['en', 'bn'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->resolveLocale($request);

        App::setLocale($locale);

        return $next($request);
    }

    private function resolveLocale(Request $request): string
    {
        // 1. Authenticated user's preferred language
        $user = $request->user();
        if ($user) {
            $preferred = $user->profile?->preferred_language;
            if ($preferred && in_array($preferred, self::SUPPORTED_LOCALES, true)) {
                return $preferred;
            }
        }

        // 2. Accept-Language header
        $headerLocale = $request->getPreferredLanguage(self::SUPPORTED_LOCALES);
        if ($headerLocale && in_array($headerLocale, self::SUPPORTED_LOCALES, true)) {
            return $headerLocale;
        }

        // 3. Default
        return 'en';
    }
}
