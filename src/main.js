import { getRequestHeaders } from './auth';
import moment from 'moment';

const googleApiUrl = "https://www.googleapis.com/drive/v3/files";
const pageSize = 25;
let nextToken = null;
let prevToken = new Array(null);

function listDriveFile(pageToken = null) {
    getRequestHeaders().then(headers => {
        const fetchParams = { method: 'GET',
            headers: headers,
            cache: 'default' };
        const queryFields = "name,thumbnailLink,modifiedTime,webViewLink,starred,id";
        let fetchUrl;
        let checked, checkbox, line, image;

        if (pageToken == null) {
            fetchUrl = `${googleApiUrl}?pageSize=${pageSize}&fields=files(${queryFields}),nextPageToken`;
        }
        else {
            fetchUrl = `${googleApiUrl}?pageSize=${pageSize}&pageToken=${pageToken}&fields=files(${queryFields}),nextPageToken`;
        }
        fetch(fetchUrl, fetchParams)
            .then(function(response) {
                return response.json();
            })
            .then(function(jsonResponse) {
                nextToken = jsonResponse.nextPageToken;

                document.getElementById('list').innerHTML = "";
                jsonResponse.files.forEach((file) => {
                    checked = (file.starred === true) ? "checked" : "";
                    checkbox = `<input id="${file.id}" type="checkbox" name="stars" ${checked}>`;
                    image = `<a href="${file.webViewLink}" target="_blank"><img src="${file.thumbnailLink}" /></a>`;
                    line = `${checkbox} ${file.name} (${moment(file.modifiedTime).fromNow()})<br />${image}<br /><hr />`;
                    document.getElementById('list').innerHTML += line;
                });
            });
        document.querySelector('#addFav').addEventListener("click", function(){starFile(true)});
        document.querySelector('#removeFav').addEventListener("click", function(){starFile(false)});
        document.querySelector('#prev').addEventListener("click", prevFiles);
        document.querySelector('#next').addEventListener("click", nextFiles);
    });
}

function starFile(isStar) {
    getRequestHeaders().then(headers => {
        const fetchParams = {
            method: 'PATCH',
            headers: headers,
            cache: 'default'
        };
        let checkbox = document.getElementsByName("stars");

        for (let i = 0; i < checkbox.length; i++) {
            if (checkbox[i].checked === true) {
                fetchParams.body = JSON.stringify({ starred: isStar });
                fetch(`${googleApiUrl}/${checkbox[i].id}`, fetchParams);
            }
        }
    });
}

function prevFiles() {
    listDriveFile(prevToken[prevToken.length - 2]);
    if (prevToken.length > 1)
        prevToken.pop();
}

function nextFiles() {
    prevToken.push(nextToken);
    listDriveFile(nextToken);
}

listDriveFile();
