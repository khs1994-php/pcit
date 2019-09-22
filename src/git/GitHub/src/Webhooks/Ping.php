<?php

declare(strict_types=1);

namespace PCIT\GitHub\Webhooks;

use App\Build;

class Ping
{
    /**
     * @param $json_content
     *
     * @return string
     *
     * @throws \Exception
     */
    public static function handle($json_content)
    {
        [
            'rid' => $rid,
            'created_at' => $created_at
        ] = \PCIT\GitHub\WebhooksParse\Ping::handle($json_content);

        return Build::insertPing('github', $rid, $created_at);
    }
}
