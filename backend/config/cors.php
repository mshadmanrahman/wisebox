<?php

return [
    // Removed 'sanctum/csrf-cookie' since we're using token-based auth
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_unique(array_filter(array_map(
        'trim',
        array_merge(
            explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,https://wisebox-mvp.vercel.app,https://wisebox-v2.vercel.app,https://wisebox-fork.vercel.app')),
            ['http://localhost', 'http://127.0.0.1']
        )
    )))),
    // Allow local frontend ports used during local-first dev (3000/3010/3011/etc).
    'allowed_origins_patterns' => [
        '#^https?://localhost(:\d+)?$#',
        '#^https?://127\.0\.0\.1(:\d+)?$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    // Changed to false for token-based auth (no cookies needed)
    'supports_credentials' => false,
];
