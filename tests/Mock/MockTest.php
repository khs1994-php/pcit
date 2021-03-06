<?php

declare(strict_types=1);

namespace Tests\Mock;

use PCIT\Runner\Agent\Docker\Log;
use Tests\TestCase;

class MockTest extends TestCase
{
    /**
     * 请注意，final、private 和 static 方法无法对其进行上桩(stub)或模仿(mock).
     */
    public function testStub(): void
    {
        $stub = $this->createMock(Log::class);

        $stub->method('handle')->willReturn([1, 100]);

        $this->assertEquals([1, 100], $stub->handle());
    }
}
