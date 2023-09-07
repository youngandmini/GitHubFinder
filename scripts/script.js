
import {Octokit} from "https://esm.sh/octokit";

import {config} from "./config.js";
/*
You have to create config.js code like below.
config.js should be located to same directory with this "script.js" file.
YOUR_GITHUB_PERSONAL_ACCESS_TOKEN have to be alternated as your token generated from "https://github.com/settings/tokens".
Please be careful not to expose your token to others!

export const config = {
    PERSONAL_ACCESS_TOKEN: YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
}
*/

const PERSONAL_ACCESS_TOKEN = config.PERSONAL_ACCESS_TOKEN;

class User {
    constructor() {
        this.username = document.getElementById("username");

        this.img = document.getElementById("user_img");
        this.company = document.getElementById("company");
        this.blog = document.getElementById("blog");
        this.location = document.getElementById("location");
        this.since = document.getElementById("since");
        this.repos = document.getElementById("repos");
        this.gists = document.getElementById("gists");
        this.followers = document.getElementById("followers");
        this.following = document.getElementById("following");

        this.userUrl = document.getElementById("user_url");
    }
}



const searchButton = document.getElementById("search_button");
searchButton.addEventListener("click", (event) => {

    const user = new User();
    const username = document.getElementById("search_target_username").value;


    setUserInfo(username, user);
    setUserRepos(username);

    // setUserInfo에서 해당 user가 존재하는지 확인한 후에 호출되도록 변경
    // setGrassImg(username);
});


function setGrassImg(username) {
    const grass_img = document.getElementById("grass_img");
    grass_img.src = "https://ghchart.rshah.org/4179e1/" + username;

    grass_img.style.display = "block";
}

async function getUserInfo(username) {

    const octokit = new Octokit({
        auth: PERSONAL_ACCESS_TOKEN
    });

    try {
        return await octokit.request(
            "GET /users/{username}",
            {username: username});
    } catch (e) {
        console.log(e.message);
        return null
    }
}

async function getUserRepos(username) {

    const octokit = new Octokit({
        auth: PERSONAL_ACCESS_TOKEN
    });

    try {
        return await octokit.request(
            "GET /users/{username}/repos?type=public&sort=updated&per_page=6", {
                username: username});
    } catch (e) {
        console.log(e.message);
        return null
    }
}


function setUserInfo(username, user) {
    const userInfo = getUserInfo(username);
    const userNotFoundMessage = document.getElementById("user_not_found_message");
    console.info(userInfo);

    userInfo.then(result => {

        if (result == null) {
            userNotFoundMessage.textContent = "[" + username + "] doesn't exist. Try with correct username."
            userNotFoundMessage.style.display = "block";
            return;
        }
        userNotFoundMessage.style.display = "none";

        user.username.textContent = username + "'s GitHub";
        user.img.src = result?.data.avatar_url;
        user.company.textContent = result?.data.company;

        user.blog.textContent = result?.data.blog;
        user.location.textContent = result?.data.location;
        user.since.textContent = result?.data.created_at.slice(0, 10);
        user.repos.textContent = result?.data.public_repos;
        user.gists.textContent = result?.data.public_gists;
        user.followers.textContent = result?.data.followers;
        user.following.textContent = result?.data.following;


        // replace userUrl to userUrlClone before addEventListener
        // for remove eventListener of existing userUrl
        const userUrlClone = user.userUrl.cloneNode(true);
        user.userUrl.parentNode.replaceChild(userUrlClone, user.userUrl);
        user.userUrl = userUrlClone;

        user.userUrl.addEventListener("click", (event) => {
            window.open(result?.data.html_url);
        });

        setGrassImg(username);
    });
}

function setUserRepos(username) {
    const userRepos = getUserRepos(username)
    // console.info(userRepos);

    userRepos.then(result => {
        if (result == null) {
            return;
        }

        const ul = document.getElementById("latest_repos");
        ul.innerHTML = "";

        for (let i = 0; i < 6; i++) {
            // console.info(result?.data[i]);

            if (result?.data[i] === undefined) {
                continue;
            }
            const repoUrl = result?.data[i].html_url;
            let li = document.createElement("li");

            let div = document.createElement("div");
            div.textContent = result?.data[i].name;
            div.onclick = function(){
                window.open(repoUrl);
            }

            let stars = document.createElement("button");
            stars.classList.add("stars");
            stars.textContent = "stars:" + result?.data[i].stargazers_count;

            let watchers = document.createElement("button");
            watchers.classList.add("watchers");
            watchers.textContent = "watchers:" + result?.data[i].watchers;

            let forks = document.createElement("button");
            forks.classList.add("forks");
            forks.textContent = "forks:" + result?.data[i].forks;

            li.appendChild(div);
            li.appendChild(stars);
            li.appendChild(watchers);
            li.appendChild(forks);

            ul.appendChild(li);
        }
    });
}
