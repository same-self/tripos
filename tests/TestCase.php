<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Tests check what the server sends, not the compiled JavaScript, so they must not need `npm run build`
        $this->withoutVite();
    }
}
