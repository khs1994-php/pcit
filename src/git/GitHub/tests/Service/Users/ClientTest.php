<?php

declare(strict_types=1);

namespace PCIT\GitHub\Tests\Service\Users;

use PCIT\Framework\Support\Env;
use Tests\TestCase;

class ClientTest extends TestCase
{
    /**
     * @group dont-test
     *
     * @throws \Exception
     */
    public function testAuthorizations(): void
    {
        $pcit = self::getTest();

        $username = env('CI_GITHUB_TEST_USERNAME');

        $password = env('CI_GITHUB_TEST_PASSWORD');

        $result = $pcit->user_basic_info->getUserInfo();
    }
}