/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    readLanguageOptionsFromFile: function(languageDetailsFilename, successCallback, failureCallback) {
        var httpRequest = new XMLHttpRequest();

        if (!httpRequest) {
          return failureCallback('Cannot create an XMLHTTP instance');
        }

        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200 || httpRequest.status === 0) {
                    var languageData = JSON.parse(httpRequest.responseText);
                    return successCallback(languageData);
                } else {
                    return failureCallback('There was a problem reading from the file. status: [' + httpRequest.status + ']');
                }

            }
        };

        httpRequest.open('GET', languageDetailsFilename);
        httpRequest.send();
    },
    promptUserToOpenLanguage: function(langCode, languageOptions) {
        var languageSupported = false;
        for (var i = 0; i < languageOptions.length; i++) {
            var languageEntity = languageOptions[i];
            if (languageEntity.entityName === langCode) {
                languageSupported = true;
                navigator.notification.confirm(
                    languageEntity.dialogText,              // message
                    function (buttonIndex) {
                        if (buttonIndex === 1) {
                            console.log('confirmed use of language: [' + langCode + ']' );
                            app.navigateToLanguageRoot(langCode);
                        }
                        else {
                            document.body.className = 'visible';
                        }
                    },                             // callback to invoke with index of button pressed
                    languageEntity.dialogTitle,                             // title
                    [languageEntity.dialogYes, languageEntity.dialogNo]     // buttonLabels
                );
            }
        }
        if (languageSupported === false) {
            document.body.className = 'visible';
        }
    },
    navigateToLanguageRoot: function(langCode) {
        localStorage.setItem('aemmLastSelectedLangauge', langCode);
        console.log('last selected language set to: [' + langCode + ']');
        // TODO: could check to make sure the Entity exists here before trying to navigate to it
        window.location.href = 'navto://' + langCode;
        console.log('navigated to: [' + langCode + ']');
        window.setTimeout(function() {
            document.body.className = 'visible';
        }, 400);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {

        // Figure out which language was used last (if any)
        var lastSelectedLang = localStorage.getItem('aemmLastSelectedLangauge') || 'none';
        console.log('last selected language was: [' + lastSelectedLang + ']');
        document.getElementById('previousLanguage').textContent = lastSelectedLang;
        if (lastSelectedLang !== 'none') {
            app.navigateToLanguageRoot(lastSelectedLang);
        }


        // Read language options from file
        app.readLanguageOptionsFromFile('languageOptions.json', 
            function success(languageOptions) {
                // Figure out device preferred language
                navigator.globalization.getPreferredLanguage(function win(properties) {
                    var preferredLang = properties.value;
                    console.log('detected device language was: [' + preferredLang + ']');
                    document.getElementById('deviceLanguage').textContent = preferredLang;
                    
                    if (lastSelectedLang === 'none') {
                        app.promptUserToOpenLanguage(preferredLang, languageOptions);
                    }
                }, function fail(error) {
                    console.error(error);
                });

                // List the available langauge options
                var languageListElement = document.getElementById('languageOptions');

                for (var i = 0; i < languageOptions.length; i++) {
                    var languageEntity = languageOptions[i];

                    var newLanguageDiv = document.createElement('div');
                    newLanguageDiv.textContent = languageEntity.title;
                    newLanguageDiv.className = 'languageElement';
                    newLanguageDiv.dataset.entityName = languageEntity.entityName;

                    newLanguageDiv.addEventListener('click', function(event) {
                        event.stopPropagation();
                        var languageElement = this;
                        console.log('clicked on name: [' + languageElement.dataset.entityName + ']' );
                        app.navigateToLanguageRoot(languageElement.dataset.entityName);
                    });

                    languageListElement.appendChild(newLanguageDiv);
                }
            },
            function failure(error) {
                console.error(error);
            }
        );
    }
};

app.initialize();