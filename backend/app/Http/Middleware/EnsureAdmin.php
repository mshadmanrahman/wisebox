<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * WB-229: Restrict routes to admin/super_admin roles only.
 * Applied to admin API route groups as defense-in-depth
 * alongside controller-level checks.
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            abort(403, __('messages.admin_required', [], 'en'));
        }

        return $next($request);
    }
}
