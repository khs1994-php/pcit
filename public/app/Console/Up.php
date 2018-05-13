<?php

declare(strict_types=1);

namespace App\Console;

use App\Build;
use App\GetAccessToken;
use App\Repo;
use Error;
use Exception;
use KhsCI\KhsCI;
use KhsCI\Support\Cache;
use KhsCI\Support\CI;
use KhsCI\Support\DB;
use KhsCI\Support\Env;
use KhsCI\Support\Git;
use KhsCI\Support\HTTP;
use KhsCI\Support\JSON;
use KhsCI\Support\Log;

class Up
{
    /**
     * @throws Exception
     */
    public static function up(): void
    {
        while (1) {
            try {
                if (1 === Cache::connect()->get('khsci_up_status')) {
                    echo "Wait sleep 10s ...\n\n";

                    sleep(10);

                    continue;
                }

                Cache::connect()->set('khsci_up_status', 1);

                // Queue::queue();

                self::updateGitHubStatus();

                self::updateGitHubAppChecks();

                echo "Finished sleep 10s ...\n\n";

                sleep(10);
            } catch (Exception | Error $e) {
                echo $e->getMessage().PHP_EOL;
                echo $e->getCode().PHP_EOL;
            }
        }
    }

    /**
     * @throws Exception
     */
    private static function updateGitHubStatus(): void
    {
        $build_key_id = Cache::connect()->rPop('github_status');

        if (!$build_key_id) {
            return;
        }

        $rid = Build::getRidByBuildKeyId((int) $build_key_id);

        $repo_full_name = Repo::getRepoFullName('github', (int) $rid);

        list($repo_prefix, $repo_name) = explode('/', $repo_full_name);

        $build_output_array = Build::get((int) $build_key_id);

        $khsci = new KhsCI(['github_access_token' => GetAccessToken::byRepoFullName($repo_full_name)]);

        $output = $khsci->repo_status->create(
            $repo_prefix,
            $repo_name,
            $build_output_array['commit_id'],
            'pending',
            Env::get('CI_HOST').'/github/'.$repo_full_name.'/builds/'.$build_key_id,
            'continuous-integration/'.Env::get('CI_NAME').'/'.$build_output_array['event_type']
        );

        Log::connect()->debug($output);

        var_dump($output);

        Cache::connect()->set('khsci_up_status', 0);
    }

    /**
     * @throws Exception
     */
    private static function updateGitHubAppChecks(): void
    {
        $build_key_id = Cache::connect()->rpop('github_app_checks');

        if (!$build_key_id) {
            return;
        }

        $rid = Build::getRidByBuildKeyId((int) $build_key_id);

        $repo_full_name = Repo::getRepoFullName('github_app', (int) $rid);

        $installation_id = Repo::getGitHubInstallationIdByRid((int) $rid);

        $khsci = new KhsCI();

        $access_token = $khsci->github_apps_installations->getAccessToken(
            (int) $installation_id,
            __DIR__.'/../../private_key/'.Env::get('CI_GITHUB_APP_PRIVATE_FILE')
        );

        $khsci = new KhsCI(['github_app_access_token' => $access_token], 'github_app');

        $output_array = Build::get((int) $build_key_id);

        $branch = $output_array['branch'];

        $commit_id = $output_array['commit_id'];

        $details_url = Env::get('CI_HOST').'/github_app/'.$repo_full_name.'/builds/'.$build_key_id;

        $language = 'PHP';

        $os = PHP_OS_FAMILY;

        $config = yaml_parse(
            HTTP::get(Git::getRawUrl('github', $repo_full_name, $commit_id, '.drone.yml'))
        );

        $config = JSON::beautiful(json_encode($config));

        $output = $khsci->check_run->create(
            $repo_full_name,
            'China First Support GitHub Checks API CI/CD System Powered By Docker and Tencent AI',
            $branch,
            $commit_id,
            $details_url,
            $build_key_id,
            CI::GITHUB_CHECK_SUITE_STATUS_IN_PROGRESS,
            time(), null, null,
            Env::get('CI_NAME').' Build is Pending',
            'This Repository Build Powered By [KhsCI](https://github.com/khs1994-php/khsci)',
            <<<EOF
# Try KhsCI ?

Please See [KhsCI Support Docs](https://github.com/khs1994-php/khsci/tree/master/docs)

# Build Configuration

|Build Option      | Setting    |
| --               |   --       |  
| Language         | $language  |
| Operating System | $os        |

<details>
<summary>Build Configuration</summary>

```json
$config
```

</details>
EOF
        );

        Log::connect()->debug($output);

        var_dump($output);

        $sql = 'UPDATE builds SET check_run_id=? WHERE id=?';

        DB::update($sql, [json_decode($output)->id ?? null, $build_key_id]);

        Cache::connect()->set('khsci_up_status', 0);
    }
}
