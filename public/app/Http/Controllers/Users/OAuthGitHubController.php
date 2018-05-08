<?php

declare(strict_types=1);

namespace App\Http\Controllers\Users;

use Exception;
use KhsCI\KhsCI;
use KhsCI\Support\Response;
use KhsCI\Support\Session;

class OAuthGitHubController
{
    protected static $oauth;

    protected static $git_type = 'github';

    use OAuthTrait;

    public function __construct()
    {
        $khsci = new KhsCI();

        static::$oauth = $khsci->oauth_github;
    }

    public function getLoginUrl(): void
    {
        $state = session_create_id();

        Session::put(static::$git_type.'.state', $state);

        $url = static::$oauth->getLoginUrl($state);

        Response::redirect($url);
    }

    /**
     * @throws Exception
     */
    public function getAccessToken(): void
    {
        $state = Session::pull(static::$git_type.'.state');

        $this->getAccessTokenCommon($state);
    }
}
