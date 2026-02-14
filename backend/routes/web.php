<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Temporary: diagnose /admin 500 error (remove after debugging)
Route::get('/debug-admin', function () {
    try {
        $kernel = app(\Illuminate\Contracts\Http\Kernel::class);
        $request = \Illuminate\Http\Request::create('/admin', 'GET');
        $response = $kernel->handle($request);
        return response()->json([
            'status' => $response->getStatusCode(),
            'headers' => $response->headers->all(),
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'file' => $e->getFile() . ':' . $e->getLine(),
            'trace' => collect($e->getTrace())->take(5)->map(fn($t) => ($t['file'] ?? '?') . ':' . ($t['line'] ?? '?'))->all(),
        ], 500);
    }
});
