<?php

declare(strict_types=1);

namespace PCIT\Gitee\Service\OAuth;

use Curl\Curl;
use PCIT\GitHub\Service\OAuth\Client as GitHubClient;
use PCIT\GPI\Service\OAuth\OAuthInterface;

class Client extends GitHubClient implements OAuthInterface
{
    public const TYPE = 'gitee';

    public const API_URL = 'https://gitee.com/api/v5';

    public const URL = 'https://gitee.com/oauth/authorize?';

    public const POST_URL = 'https://gitee.com/oauth/token?';

    public $clientId;

    public $clientSecret;

    public $callbackUrl;

    public $curl;

    public function __construct($config, Curl $curl)
    {
        $this->clientId = $config['client_id'];
        $this->clientSecret = $config['client_secret'];
        $this->callbackUrl = $config['callback_url'];
        $this->curl = $curl;
    }

    public function getLoginUrl(?string $state): string
    {
        if (!($this->clientId && $this->clientSecret && $this->callbackUrl)) {
            return '';
        }

        $url = static::URL.http_build_query([
            'client_id' => $this->clientId,
            'redirect_uri' => $this->callbackUrl,
            'response_type' => 'code',
        ]);

        return $url;
    }

    public function getAccessToken(string $code, ?string $state, bool $raw = false)
    {
        $url = static::POST_URL.http_build_query([
            'code' => $code,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri' => $this->callbackUrl,
            'grant_type' => 'authorization_code',
        ]);

        return $this->requestAccessToken($url, $raw);
        // {
        //    "access_token":"52b","token_type":"bearer","expires_in":86400,
        //    "refresh_token":"c31e9",
        //    "scope":"user_info projects pull_requests issues notes keys
        //             hook groups gists","created_at":1523757514
        // }
    }

    public function getAccessTokenByRefreshToken(string $refreshToken, bool $raw = false)
    {
        // grant_type=refresh_token&refresh_token={refresh_token}
        $url = static::POST_URL.http_build_query([
            'grant_type' => 'refresh_token',
            'refresh_token' => $refreshToken,
        ]);

        return $this->requestAccessToken($url, $raw);
    }

    public function requestAccessToken(string $url, bool $raw = false)
    {
        $json = $this->curl->post($url);

        if (true === $raw) {
            return $json;
        }

        \Log::debug('Gitee AccessToken Raw '.$json);

        return $this->parseTokenResult($json);
    }

    /**
     * 解析服务器返回的结果.
     *
     * @param mixed $json
     */
    public function parseTokenResult($json): array
    {
        $resultObject = json_decode($json);

        $accessToken = $resultObject->access_token;
        $refreshToken = $resultObject->refresh_token;

        return [$accessToken, $refreshToken];
    }
}
