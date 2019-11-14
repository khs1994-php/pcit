<?php

declare(strict_types=1);

namespace PCIT\Coding\Service\Repositories;

use Exception;
use PCIT\GitHub\Service\CICommon;

class WebhooksClient
{
    use CICommon;

    /**
     * @return mixed
     *
     * @throws Exception
     */
    public function getWebhooks(bool $raw = false, string $username, string $project)
    {
        $url = $this->api_url.'/user/'.$username.'/project/'.$project.'/git/hooks';

        $json = $this->curl->get($url);

        if (true === $raw) {
            return $json;
        }

        $obj = json_decode($json);

        $code = $obj->code;

        if (0 === $code) {
            return json_encode($obj->data);
        }

        throw new Exception('Project Not Found', 404);
    }

    /**
     * @param $data
     *
     * @return mixed
     *
     * @throws Exception
     */
    public function setWebhooks($data, string $username, string $repo, string $id)
    {
        $url = $this->api_url.'/user/'.$username.'/project/'.$repo.'/git/hook/'.$id;

        return $json = $this->curl->post($url);
    }

    /**
     * @return mixed
     *
     * @throws Exception
     */
    public function unsetWebhooks(string $username, string $repo, string $id)
    {
        $url = sprintf('/user/%s/project/%s/git/hook/%s', $username, $repo, $id);

        return $this->curl->delete($url);
    }

    public function getStatus(string $url, string $username, string $repo_name)
    {
        return 1;
    }
}
