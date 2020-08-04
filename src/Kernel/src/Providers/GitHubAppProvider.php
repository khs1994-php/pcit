<?php

declare(strict_types=1);

namespace PCIT\Providers;

use PCIT\GitHub\Service\GitHubApp\Client;
use PCIT\GitHub\Service\GitHubApp\InstallationsClient;
use Pimple\Container;
use Pimple\ServiceProviderInterface;

class GitHubAppProvider implements ServiceProviderInterface
{
    public function register(Container $pimple): void
    {
        $pimple['github_apps_installations'] = function ($app) {
            return new InstallationsClient($app['curl'], $app['config']['api_url']);
        };

        $pimple['github_apps'] = function ($app) {
            return new Client($app['curl'], $app['config']['api_url']);
        };
    }
}
