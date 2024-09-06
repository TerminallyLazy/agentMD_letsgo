document.addEventListener('DOMContentLoaded', function() {
    const summarizeLabResults = document.getElementById('summarizeLabResults');
    const terminalModal = document.getElementById('terminalModal');
    const terminalOutput = document.getElementById('terminalOutput');
    const terminalInput = document.getElementById('terminalInput');
    const closeTerminal = document.getElementById('closeTerminal');
    const startVoiceButton = document.getElementById('startVoice');
    const stopVoiceButton = document.getElementById('stopVoice');
    let isProcessing = false;
    let recognition;
    let synthesis;

    // Initialize connection with background script
    const port = chrome.runtime.connect({name: "popup"});

    // Initialize Web Speech API
    function initSpeechRecognition() {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = function(event) {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const command = result[0].transcript;
                terminalInput.value = command;
                sendCommand(command);
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
        };
    }

    function initSpeechSynthesis() {
        synthesis = window.speechSynthesis;
    }

    initSpeechRecognition();
    initSpeechSynthesis();

    startVoiceButton.addEventListener('click', function() {
        recognition.start();
        startVoiceButton.disabled = true;
        stopVoiceButton.disabled = false;
    });

    stopVoiceButton.addEventListener('click', function() {
        recognition.stop();
        startVoiceButton.disabled = false;
        stopVoiceButton.disabled = true;
    });

    summarizeLabResults.addEventListener('click', function() {
        terminalModal.style.display = 'block';
        terminalOutput.innerHTML = ''; // Clear previous output

        // Send message to background script to start processing
        chrome.runtime.sendMessage({action: 'start'}, function(response) {
            if (chrome.runtime.lastError) {
                handleResponse({ error: 'Failed to start processing: ' + chrome.runtime.lastError.message });
            } else {
                handleResponse({ result: response.output });
            }
        });
    });

    // Listen for messages from the background script
    port.onMessage.addListener(function(msg) {
        if (msg.action === 'update') {
            handleResponse({ result: msg.output });
        }
    });

    function sendCommand(command) {
        console.log("DEBUG: Sending command:", command);
        chrome.runtime.sendMessage({ action: 'sendCommand', command: command }, (response) => {
            if (chrome.runtime.lastError) {
                handleResponse({ error: 'Failed to send command: ' + chrome.runtime.lastError.message });
            } else {
                handleResponse({ result: response.output });
            }
        });
    }

    terminalInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const command = terminalInput.value;
            terminalOutput.innerHTML += `<div class="user-input">> ${command}</div>`;
            terminalInput.value = '';
            isProcessing = true;
            sendCommand(command);
        }
    });

    function handleResponse(response) {
        if (response.error) {
            console.error(response.error);
            terminalOutput.innerHTML += `<div class="error">Error: ${response.error}</div>`;
        } else {
            console.log("DEBUG: Received response:", response.result);
            try {
                const jsonResponse = typeof response.result === 'string' ? JSON.parse(response.result) : response.result;
                const formattedJson = JSON.stringify(jsonResponse, null, 2);
                terminalOutput.innerHTML += `<div class="agent-response"><pre>${formattedJson}</pre></div>`;
                speakResponse(jsonResponse.response || formattedJson);
            } catch (e) {
                console.log("DEBUG: Received response:", response.result);
                terminalOutput.innerHTML += `<div class="agent-response">${response.result.replace(/\n/g, ' ').replace(/\s+/g, ' ')}</div>`;
                speakResponse(response.result);
            }
        }
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function speakResponse(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        synthesis.speak(utterance);
    }

    closeTerminal.addEventListener('click', function() {
        terminalModal.style.display = 'none';
        recognition.stop();
        synthesis.cancel();
    });

    // Add a message listener for receiving updates from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'UPDATE') {
            handleResponse({ result: message.data });
        }
    });
});


    // const apiKeyButton = document.getElementById('apiKey');
    // apiKeyButton.addEventListener('click', () => {
    //     chrome.runtime.sendMessage({type: 'INITIATE_OAUTH'});
    // });

// function initiateOAuth() {
//     const clientId = 'YOUR_CLIENT_ID';
//     const redirectUri = encodeURIComponent('YOUR_REDIRECT_URI');
//     const scopes = encodeURIComponent('patients:summary:read clinical:read labs:read');
//     const authUrl = `https://drchrono.com/o/authorize/?redirect_uri=${redirectUri}&response_type=code&client_id=${clientId}&scope=${scopes}`;

//     chrome.tabs.create({ url: authUrl });
// }

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.type === 'AUTH_SUCCESS') {
//         updateUIForAuthenticatedState();
//     }
// });

// function updateUIForAuthenticatedState() {
//     const apiKeyButton = document.getElementById('apiKey');
//     chrome.storage.local.get(['access_token'], function(result) {
//         if (result.access_token) {
//             // Authentication successful, set to default color
//             apiKeyButton.style.backgroundColor = '';
//         } else {
//             // Authentication unsuccessful, set to red
//             apiKeyButton.style.backgroundColor = 'red';
//         }
//     });
// }


// function makeApiCall(endpoint) {
//     chrome.storage.local.get(['access_token', 'expires_at'],
// function(result) {
//     if (result.access_token && result.expires_at > Date.now()) {
//     // Token is valid, make the API call
//     fetch(`https://drchrono.com/api/${endpoint}`, {
//         headers: {
//         'Authorization': `Bearer ${result.access_token}`
//         }
//     })
//     .then(response => response.json())
//     .then(data => {
//         // Process the data with your AI agent
//         processWithAIAgent(data);
//     })
//     .catch(error => console.error('API call error:', error));
// } else {
//     // Token is expired or not present, refresh or re-authenticate
//     refreshToken();
//     }
//     });
// }

// function refreshToken() {
//     chrome.storage.local.get(['refresh_token', 'client_id', 'client_secret'], function(result) {
//         if (result.refresh_token) {
//             const tokenUrl = 'https://drchrono.com/o/token/';
//             const clientId = result.client_id;
//             const clientSecret = result.client_secret;

//             fetch(tokenUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded',
//                 },
//                 body: `grant_type=refresh_token&refresh_token=${result.refresh_token}&client_id=${clientId}&client_secret=${clientSecret}`,
//             })
//             .then(response => response.json())
//             .then(data => {
//                 chrome.storage.local.set({
//                     access_token: data.access_token,
//                     refresh_token: data.refresh_token,
//                     expires_at: Date.now() + (data.expires_in * 1000)
//                 }, () => {
//                     console.log('Tokens refreshed and stored');
//                     // You might want to retry the original API call here
//                 });
//             })
//             .catch(error => {
//                 console.error('Error refreshing token:', error);
//                 // If refresh fails, we might need to re-authenticate
//                 initiateOAuth();
//             });
//         } else {
//             // No refresh token, need to re-authenticate
//             initiateOAuth();
//         }
//     });
// }

//     async function processWithAIAgent(data) {
//     // Implement AI agent logic
//     try {
//         const response_1 = await new Promise((resolve, reject) => {
//             fetch('http://localhost:3000/process', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(data)
//             })
//                 .then(response => {
//                     if (!response.ok) {
//                         throw new Error('Network response was not ok');
//                     }
//                     return response.json();
//                 })
//                 .then(result_1 => {
//                     // Process the result from the AI agent
//                     console.log('AI agent processed data:', result_1);

//                     // You can add more logic here to handle different types of results
//                     if (result_1.summary) {
//                         // If there's a summary, we might want to display it
//                         displayResult(result_1.summary);
//                     }

//                     if (result_1.recommendations) {
//                         // If there are recommendations, we might want to display them separately
//                         displayRecommendations(result_1.recommendations);
//                     }

//                     // Resolve the promise with the processed result
//                     resolve(result_1);
//                 })
//                 .catch(error => {
//                     console.error('Error in AI agent processing:', error);
//                     displayResult('Error occurred while processing data.');
//                     reject(error);
//                 });
//         });
//         const result_3 = response_1.json();
//         // Display or use the AI-processed result
//         displayResult(result_3);
//     } catch (error_1) {
//         return console.error('AI processing error:', error_1);
//     }
// }


// function displayResult(result) {
// // Update your UI with the result
//     const terminalOutput = document.getElementById('terminalOutput');
//     terminalOutput.innerHTML += `<div class="agent-response">${result}</div>`;
// }
