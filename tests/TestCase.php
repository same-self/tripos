<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Page tests only look at the data a page receives. Without this, a test fails with
        // "Unable to locate file in Vite manifest" whenever `npm run build` has not been run
        // since a page was added, which says nothing about whether the code is right.
        $this->withoutVite();
    }
}
