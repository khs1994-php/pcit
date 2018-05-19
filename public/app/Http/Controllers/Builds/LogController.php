<?php

declare(strict_types=1);

namespace App\Http\Controllers\Builds;

use App\Build;
use Exception;

class LogController
{
    /**
     * Returns a single log.
     *
     * /builds/{build_id}/log
     *
     * @param $build_id
     *
     * @throws Exception
     */
    public function __invoke($build_id)
    {
        Build::getLog((int) $build_id);
    }

    /**
     * Removes the contents of a log. It gets replace with the message: Log removed by XXX at 2017-02-13 16:00:00 UTC.
     *
     * delete
     *
     * /builds/{build_id}/log
     *
     * @param $build_id
     */
    public function delete($build_id): void
    {
    }
}
