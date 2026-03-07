document.addEventListener("DOMContentLoaded", function() {

    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    function validateUsername(username) {
        if (username.trim() == "") {
            alert("Username Cannot Be Empty");
            return false;
        }

        const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,29}$/;
        const isMatching = regex.test(username);

        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetcher(username) {

        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;



            const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
            const targetUrl = 'https://leetcode.com/graphql/';
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n",
                variables: { "username": `${username}` }
            })

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            
            if (!response.ok) {
                throw new Error("Unable to fetch the user details.");
            }
            const parserData = await response.json();
            console.log("Logging data : ", parserData);

            statsContainer.style.display = "block"

            displayUserData(parserData);
        }

        catch(error) {
            statsContainer.innerHTML = `<p>No Data Found</p>`;
        }
        finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;   
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parserData) {
        const totalQues = parserData.data.allQuestionsCount[0].count;
        const totalEasy = parserData.data.allQuestionsCount[1].count;
        const totalMed = parserData.data.allQuestionsCount[2].count;
        const totalHard = parserData.data.allQuestionsCount[3].count;

        const userTotal = parserData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const userEasy = parserData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const userMed = parserData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const userHard = parserData.data.matchedUser.submitStats.acSubmissionNum[3].count;


        updateProgress(userEasy, totalEasy, easyLabel, easyProgressCircle);
        updateProgress(userMed, totalMed, mediumLabel, mediumProgressCircle);
        updateProgress(userHard, totalHard, hardLabel, hardProgressCircle);
    }

    searchButton.addEventListener("click", function() {
        const username = usernameInput.value;
        console.log("Logging Username : ", username);
        if (validateUsername(username)) {
            fetcher(username);
        }
    })

})