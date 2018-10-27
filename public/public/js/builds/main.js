const header = require('../common/header');
const footer = require('../common/footer');
const git = require('../common/git');
const title = require('./title');
const {
  url,
  url_array,
  baseUrl,
  git_type,
  username,
  repo,
  repo_full_name,
  git_repo_full_name,
  repo_full_name_url,
  type_from_url,
  baseTitle,
} = require('./data');

header.show();
footer.show();

function column_span_click(id) {
  let span_el = $('#' + id);
  span_el.css('color', 'green');
  span_el.css('border-bottom-style', 'solid');
}

function current() {
  column_span_click('current');

  $.ajax({
    type: "GET",
    url: '/api/repo/' + git_repo_full_name + '/build/current',
    success: function (data) {
      display('current', data);
    }
  });
}

function branches() {
  column_span_click('branches');

  $.ajax({
    type: "GET",
    url: '/api/repo/' + git_repo_full_name + '/branches',
    success: function (data) {
      display('branches', data);
    }
  });
}

function main() {
  column_span_click('builds');

  let build_id;

  if (8 === url_array.length) {
    build_id = url_array[7];
  }

  if (build_id) {
    $.ajax({
      type: 'GET',
      url: '/api/build/' + build_id,
      success: function (data) {
        display('builds', data);
      },
      error: function (data) {
        display('builds', 'error');
        console.log(data);
      }
    });

    return;
  }

  $.ajax({
    type: 'GET',
    url: '/api/repo/' + git_repo_full_name + '/builds',
    success: function (data) {
      display('builds', data);
    },
    error: function (data) {
      display('builds', 'error');
      console.log(data);
    }
  });
}

function pull_requests() {
  column_span_click('pull_requests');

  $.ajax({
    type: 'GET',
    url: '/api/repo/' + git_repo_full_name + '/builds?type=pr',
    success: function (data) {
      display('pull_requests', data);
    }
  })
}

function jobs() {
  console.log('jobs');
  $.ajax({
    type: "get",
    url: '/api/repo/' + git_repo_full_name + '/jobs/1',
    success: function (data) {
      display('jobs', data);
    }
  });
}

function settings() {
  console.log(location.href);
  $.ajax({
    type: "get",
    url: '/api/repo/' + repo_full_name + '/settings',
    headers: {
      'Authorization': 'token ' + Cookies.get(git_type + 'api_token')
    },
    success: function (data) {
      display('settings', data);
    }
  });
}

function requests() {
  console.log(location.href);
  $.ajax({
    type: "get",
    url: '/api/repo/' + repo_full_name + '/requests',
    herders: {
      'Authorization': 'token ' + Cookies.get(git_type + '_api+token')
    },
    success: function (data) {
      display('requests', data);
    }
  });
}

function caches() {
  console.log(location.href);
  $.ajax({
    type: "get",
    url: '/api/repo/' + repo_full_name + '/caches',
    headers: {
      'Authorization': 'token ' + Cookies.get(git_type + '_api_token')
    },
    success: function (data) {
      display('caches', data);
    }
  });
}

function triggerBuild() {
  console.log(location.href);
  $.ajax({
    type: "post",
    url: '/api/repo/' + repo_full_name + '/trigger',
    headers: {
      'Authorization': 'token ' + Cookies.get(git_type + '_api_token')
    },
    success: function (data) {
      display('triggerBuild', data);
    }
  });
}

function showLog(data) {
  console.log(data);
  let display_element = $("#display");
  let {
    id: build_id, build_status, commit_id, commit_message, branch, committer_name,
    compare, stopped_at, jobs
  } = data;

  if (null === stopped_at) {
    stopped_at = 'This build is ' + build_status;
  } else {
    let d;
    d = new Date(parseInt(stopped_at) * 1000);
    stopped_at = d.toLocaleString();
  }

  let commit_url = git.getCommitUrl(username, repo, commit_id);
  let div_element = $('<div class="build_data"></div>');

  div_element.append(() => {
    let build_id_element = $('<div class="build_id"></div>');
    build_id_element.append('');

    return build_id_element;
  });

  div_element.append(() => {
    let branch_element = $('<div class="branch"></div>');
    branch_element.append(branch);

    return branch_element;
  }).append(() => {
    let div_el = $('<a class="branch_url">Branch </a>');
    div_el.append(branch);
    div_el.attr('href', '');
    div_el.attr('target', '_block');
    div_el.attr('title', 'View branch on GitHub');
    return div_el;
  }).append(() => {

    let build_status_element = $('<div class="build_status"></div>');
    build_status_element.append(build_status);

    return build_status_element;
  }).append(() => {
    let commit_url_element = $('<a class="commit_url">Commit </a>');
    commit_url_element.append(commit_id.slice(0, 7));
    commit_url_element.attr('title', 'View commit on GitHub');
    commit_url_element.attr('href', commit_url);
    commit_url_element.attr('target', '_blank');

    return commit_url_element;
  });

  div_element.append(() => {
    let commit_message_element = $('<div class="commit_message"></div>');
    commit_message_element.append(commit_message);

    return commit_message_element;
  });

  div_element.append(() => {
    let committer_name_element = $('<div class="committer"></div>');
    committer_name_element.append(committer_name);

    return committer_name_element;
  });

  div_element.append(() => {
    let compare_element = $('<a class="compare">Compare </a>');
    compare_element.append('Compare').attr('title', 'View diff on GitHub').attr('href', compare);
    compare_element.attr('target', '_blank');

    return compare_element;
  });

  div_element.append(() => {
    let stopped_at_element = $('<div class="build_time"></div>');
    stopped_at_element.append('Ran for 7 min 17 sec');

    return stopped_at_element;
  }).append(() => {
    let div_el = $('<div class="build_time_ago"></div>');
    div_el.append('about 9 hours ago');

    return div_el;
  }).append(() => {
    let button_el = $('<button class="cancel_or_restart"></button>');
    button_el.append('button');
    return button_el;
  });

  display_element.append(div_element);

  if (jobs.length === 1) {
    let build_log = jobs[0]['build_log'];

    if (null === build_log) {
      build_log = 'This Build is ' + build_status;
    }

    display_element.append(`<pre>${build_log}</pre>`);

    return;
  }

  $.each(jobs, function (id, data) {
    let {build_log} = data;

    if (null === build_log) {
      build_log = 'This Build is ' + build_status;
    }

    let pre_element = $('<pre></pre>');
    pre_element.append(build_log);
    pre_element.css('background', 'black').css('color', 'white');

    display_element.append(pre_element);
  });
}

function display_builds(data, display_element) {
  if (8 === url_array.length) {
    if (0 === data.length || 'error' === data) {
      display_element.append('Oops, we couldn\'t find that build!');
    } else {
      showLog(data);
    }

  } else if (0 !== data.length) {
    let i = data.length + 1;
    let ul_el = $('<ul class="builds_list"></ul>');
    ul_el.innerHeight(i * 100);
    $.each(data, function (id, status) {
      i--;

      let {
        event_type, id: build_id, branch, committer_username,
        commit_message, commit_id, build_status, started_at, finished_at: stopped_at
      } = status;

      let commit_url = git.getCommitUrl(username, repo, commit_id);
      commit_id = commit_id.substr(0, 7);

      if (null == started_at) {
        started_at = 'Pending'
      } else {
        let d;
        d = new Date(parseInt(started_at) * 1000);
        started_at = d.toLocaleString();
      }

      if (null == stopped_at) {
        stopped_at = 'Pending'
      } else {
        let d;
        d = new Date(parseInt(stopped_at) * 1000);
        stopped_at = d.toLocaleString();
      }

      let li_el = $('<li></li>');

      li_el.append(() => {
        let div_element = $('<div class="build_id"></div>');
        div_element.append('');

        if (build_status === 'success') {
          div_element.css('background', '#39aa56');
        } else if (build_status === 'in_progress') {
          div_element.css('background', 'yellow');
        } else {
          div_element.css('background', '#db4545');
        }

        return div_element;
      });

      li_el.append(() => {
        let div_element = $('<div class="event_type"></div>');
        div_element.append(event_type);

        return div_element;
      }).append(() => {
        let div_element = $('<div class="branch"></div>');
        div_element.append(branch.slice(0, 10)).attr('title', branch);

        return div_element;
      }).append(() => {
        let div_el = $('<div class="committer"></div>');
        div_el.append(committer_username);

        return div_el;
      }).append(() => {
        let div_element = $('<div class="commit_message"></div>');
        div_element.append(commit_message.slice(0, 28)).attr('title', commit_message);

        return div_element;
      }).append(() => {
        let a_element = $('<a class="commit_id"></a>');
        a_element.append(commit_id);
        a_element.attr('href', commit_url).attr('title', 'View commit on GitHub');
        a_element.attr('target', '_block').addClass('commit_url');

        return a_element;
      }).append(() => {
        let a_element = $('<a class="build_status"></a>');
        a_element.append(`# ${build_id} ${build_status}`);
        a_element.attr('href', `${location.href}/${build_id}`);
        a_element.attr('target', '_block');

        return a_element;
      }).append(() => {
        let div_element = $('<div class="build_time"></div>');
        div_element.append(started_at);

        return div_element;
      }).append(() => {
        let div_element = $('<div></div>');
        div_element.append(stopped_at).addClass('build_time_ago');
        div_element.attr('title', 'Finished ');

        return div_element;
      }).append(() => {
        return (() => {
          let button_el = $('<button class="cancel_or_restart"></button>');
          button_el.append('button');

          return button_el;
        })();
      });

      ul_el.append(li_el);
    });
    display_element.append(ul_el);
  } else {
    display_element.append('Not Build Yet !');
  }
}

function display_branches(data, display_element) {
  if (0 === data.length) {
    display_element.append('Not Build Yet !');
  } else {
    console.log(data);
    $.each(data, function (num, branch) {

      display_element.append(branch);

      $.each(status, function (id, status) {
        id = id.replace('k', '');

        let stopped_at = status[3];

        if (null == stopped_at) {
          stopped_at = 'Pending';
        } else {
          let d;
          d = new Date(stopped_at * 1000);
          stopped_at = d.toLocaleString();
        }

        display_element.append(`<tr>
<td><a href="${main}/${id}" target='_blank'># ${id} </a></td>
<td>${nbsp}${status[0]}${nbsp}</td>
<td>${nbsp}${status[2]}${nbsp}</td>
<td>${nbsp}${stopped_at}${nbsp}</td>
<td><a href="${status[4]}" target='_black'>${status[1]}</a></td>
</tr>
`);
      });

      display_element.append("<hr>");

    })
  }
}

function display_pullRequests(data, display_element) {
  if (0 === data.length) {
    display_element.append('No pull request builds for this repository');
  } else {

    let ul_el = $('<ul class="pull_requests_list"></ul>');

    ul_el.height((data.length + 1) * 100);

    let i = data.length + 1;
    $.each(data, function (id, status) {
      i--;

      let {
        pull_request_number: pull_request_id, id: build_id, branch, committer_username,
        commit_message, commit_id, build_status, started_at, finished_at: stopped_at,
      } = status;

      let commit_url = git.getCommitUrl(username, repo, commit_id);

      let pull_request_url = git.getPullRequestUrl(username, repo, pull_request_id);

      commit_id = commit_id.substr(0, 7);

      if (null == started_at) {
        started_at = 'Pending'
      } else {
        let d;
        d = new Date(started_at * 1000);
        started_at = d.toLocaleString();
      }

      if (null == stopped_at) {
        stopped_at = 'Pending';
      } else {
        let d;
        d = new Date(stopped_at * 1000);
        stopped_at = d.toLocaleString();
      }

      let li_el = $('<li></li>');

      li_el.append(() => {
        let div_el = $('<div class="id"></div>');
        div_el.append();

        return div_el;
      }).append(() => {
        let div_el = $('<div class="build_id"></div>');
        div_el.append('');

        if (build_status === 'success') {
          div_el.css('background', '#39aa56');
        } else if (build_status === 'in_progress') {
          div_el.css('background', 'yellow');
        } else {
          div_el.css('background', '#db4545');
        }

        return div_el;
      }).append(() => {
        let a_el = $('<a class="pull_request_url"></a>');
        a_el.append(`#PR ${pull_request_id}`);
        a_el.attr('title', 'View pull request on GitHub');
        a_el.attr('href', pull_request_url);
        a_el.attr('target', '_block');

        return a_el;
      }).append(() => {
        let div_el = $('<div class="branch"></div>');
        div_el.append(branch);

        return div_el;
      }).append(() => {
        let div_el = $('<div class="committer"></div>');
        div_el.append(committer_username);

        return div_el;
      }).append(() => {
        let div_el = $('<div class="commit_message"></div>');
        div_el.append(commit_message);

        return div_el;
      }).append(() => {
        let a_el = $('<a class="commit_id"></a>');
        a_el.append(commit_id);
        a_el.attr('href', commit_url);
        a_el.attr('target', '_block');
        a_el.attr('title', 'View commit on GitHub');
        return a_el;
      }).append(() => {
        let a_el = $('<a class="build_status"></a>');
        a_el.append(build_status);
        a_el.attr('href', `${repo_full_name_url}/builds/${build_id}`);
        a_el.attr('target', '_block');

        return a_el;
      }).append(() => {
        let div_el = $('<div class="build_time"></div>');
        div_el.append(started_at);

        return div_el;
      }).append(() => {
        let div_el = $('<div class="build_time_ago"></div>');

        div_el.append(stopped_at);

        return div_el;
      }).append(() => {
        let button_el = $('<button class="cancel_or_restart"></button>');
        button_el.append('button');

        return button_el;
      });

      ul_el.append(li_el);

    });
    display_element.append(ul_el)
  }
}

function display_settings(data, display_element) {
  display_element.append('settings');
}

function display_requests(data, display_element) {
  display_element.append('requests');
}

function display_caches(data, display_element) {
  display_element.append('caches');
}

function display_triggerBuild(data, display_element) {
  display_element.append('triggerBuild');
}


function display(id, data) {
  let display_element = $("#display");

  display_element.empty();

  switch (id) {
    case 'current':
      if (0 === data.length) {
        display_element.append("Not Build Yet !");
      } else {
        showLog(data);
      }

      break;

    case 'builds':
      display_builds(data, display_element);

      break;
    case 'branches':
      display_branches(data, display_element);

      break;

    case "pull_requests":
      display_pullRequests(data, display_element);

      break;

    case 'settings':
      display_settings(data, display_element);
      break;

    case 'requests':
      display_requests(data, display_element);
      break;

    case 'caches':
      display_caches(data, display_element);
      break;

    case 'trigger_build':
      display_triggerBuild(data, display_element);
      break;
  }
}

// http://www.zhangxinxu.com/wordpress/2013/06/html5-history-api-pushstate-replacestate-ajax/
// 事件冒泡 点击了 子元素 会向上传递 即也点击了父元素

$(".column").click(function (event) {
  let id = event.target.id;

  if (id === 'more_options') {
    return;
  }

  console.log(id);

  if ('current' === id) {
    history.pushState({}, baseTitle, baseUrl + '/' + git_repo_full_name);

    history.replaceState(null, baseTitle, baseUrl + '/' + git_repo_full_name);
  } else {
    history.pushState({}, baseTitle, baseUrl + '/' + git_repo_full_name + '/' + id);

    history.replaceState(null, baseTitle, baseUrl + '/' + git_repo_full_name + '/' + id);
  }

  title.show(baseTitle, id);
});

function column_el_click(id) {
  switch (id) {
    case 'current':
      current();
      break;

    case 'branches':
      branches();

      break;

    case 'builds':
      main();

      break;

    case 'pull_requests':
      pull_requests();

      break;
  }
}

function mouseoutMethod(event) {
  event.target.style.color = 'black';
  event.target.style.borderBottomStyle = 'none';
}

function mouseoverMethod(event) {
  event.target.style.color = 'green';
  event.target.style.borderBottomStyle = 'solid';
}

let column_el = $('.column span');

// https://www.cnblogs.com/yangzhi/p/3576520.html
$(column_el).on({
  'click': function (event) {

    let target = event.target;
    let target_id = target.id;

    column_el_click(target_id);

    // 移除其他元素的颜色
    column_el.css('color', '#000000').css('border-bottom-style', 'none');
    // 启用其他元素的鼠标移出事件
    column_el.on({
      'mouseout': (event) => {
        mouseoutMethod(event);
      }
    });

    // 关闭该元素的鼠标移出事件
    $('#' + target_id).off('mouseout');

    // 最后对被点击元素
    target.style.color = 'green';
    target.style.borderBottomStyle = 'solid';

  },
  'mouseover': function (event) {
    mouseoverMethod(event);
  },
  'mouseout': function (event) {
    mouseoutMethod(event);
  }
});

$("#settings").on({
  'click': function (event) {
    settings();
  }
});

$("#caches").on({
  'click': function (event) {
    caches();
  }
});

$("#requests").on({
  'click': function (event) {
    requests();
  }
});

$("#trigger_build").on({
  'click': function (event) {
    triggerBuild();
  }
});

jQuery(document).ready(function () {

  title.show(baseTitle, type_from_url);

  let content = jQuery('<h2></h2>');

  content.append(() => {
    return git.format(git_type) + repo_full_name;
  }).append(() => {
    let a_element = $('<a></a>');
    let img_element = $('<img alt="status" src=""/>');

    img_element.attr('src', repo_full_name_url + '/status');
    a_element.append(img_element);
    a_element.attr('href', repo_full_name_url + '/getstatus');
    a_element.attr('target', '_black');

    return a_element;
  });

  $('#repo').append(content);

  console.log(type_from_url);

  switch (type_from_url) {
    case 'current':
      current();

      break;
    case 'branches':
      branches();

      break;

    case 'builds':
      main();

      break;

    case 'pull_requests':
      pull_requests();

      break;

    case 'jobs':
      jobs();
      break;

    case 'settings':
      settings();
      break;

    case 'request':
      requests();
      break;

    case 'caches':
      caches();
      break;
  }
});