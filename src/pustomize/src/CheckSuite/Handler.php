<?php

declare(strict_types=1);

namespace PCIT\Pustomize\CheckSuite;

use App\Build;
use PCIT\GetConfig;
use PCIT\GPI\Webhooks\Context\CheckSuiteContext;
use PCIT\Skip;
use PCIT\Subject;
use PCIT\UpdateUserInfo;
use Symfony\Component\Yaml\Exception\ParseException;

class Handler
{
    public function handle(CheckSuiteContext $context): void
    {
        $git_type = $context->git_type;

        if (!\in_array($context->action, ['requested'])) {
            return;
        }

        if ('requested' === $context->action) {
            if ($context->check_suite->pull_requests) {
                return;
            }
        }

        $installation_id = $context->installation_id;
        $rid = $context->rid;
        $repo_full_name = $context->repo_full_name;
        $branch = $context->branch;
        $commit_id = $context->commit_id;
        $commit_message = $context->commit_message;
        $committer = $context->committer;
        $author = $context->author;
        $compare = $context->compare;
        $event_time = $context->event_time;
        $owner = $context->owner;
        $sender = $context->sender;
        $private = $context->private;
        $default_branch = $context->repository->default_branch;

        // user table not include user info
        $subject = new Subject();

        $subject->register(
            new UpdateUserInfo(
                $owner,
                (int) $installation_id,
                (int) $rid,
                $repo_full_name,
                $default_branch,
                $sender,
                $git_type
            )
        );

        try {
            $config_array = $subject->register(
                new GetConfig((int) $rid, $commit_id, $git_type)
            )->handle()->config_array;

            $config = json_encode($config_array);
        } catch (ParseException $e) {
            $config = $e->getMessage();
            $build_status = 'misconfigured';
        }

        $last_insert_id = Build::insert(
            'push',
            $branch,
            $compare,
            $commit_id,
            $commit_message,
            $committer->name,
            $committer->email,
            $committer->username,
            $author->name,
            $author->email,
            $author->username,
            $rid,
            $event_time,
            $config,
            $private,
            $git_type
        );

        $subject->register(
            new Skip($commit_message, (int) $last_insert_id, $branch, $config)
        )->handle();

        if ($build_status ?? false) {
            Build::updateBuildStatus($last_insert_id, $build_status);

            return;
        }

        \Storage::put(
            'pcit/events/'.$git_type.'/'.$last_insert_id.'/event.json',
            $context->raw
        );
    }
}