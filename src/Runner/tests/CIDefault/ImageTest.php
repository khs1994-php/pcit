<?php

declare(strict_types=1);

namespace PCIT\Runner\Tests\CIDefault;

use PCIT\Runner\CIDefault\Image;
use Tests\TestCase;

class ImageTest extends TestCase
{
    public function test(): void
    {
        $result = Image::get('php');

        $this->assertEquals('khs1994/php:8.0.5-composer-alpine', $result);
    }
}
