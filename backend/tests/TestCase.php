<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Prevent tests from hitting external APIs (Resend, Calendly, etc.).
        // Individual tests can override with their own Http::fake() calls.
        Http::fake();
    }
}
