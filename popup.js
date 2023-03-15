//background.js

//listen for message from content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "getAnswer") {
      //fetch answer from API
      fetch("https://api.openai.com/v1/engines/davinci-codex/completions", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer <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>"
          },
          body: JSON.stringify({
              prompt: request.question,
              max_tokens: 1,
              n: 1,
              stop: "\n",
              temperature: 0.7
          })
      })
      .then(response => response.json())
      .then(data => {
          //send answer back to content script
          sendResponse({answer: data.choices[0].text});
      })
      .catch(error => {
          console.error(error);
          sendResponse({answer: "Sorry, an error occurred while fetching the answer."});
      });
      
      //allow the message channel to stay open for asynchronous response
      return true;
    }
  });
  
  //popup.js
  
  //get the active tab and send message to content script to get question
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "getQuestion"}, function(response) {
      if (response && response.question) {
        //send message to background script to get answer from API
        chrome.runtime.sendMessage({action: "getAnswer", question: response.question}, function(response) {
          if (response && response.answer) {
            //display answer in popup
            document.getElementById("answer").textContent = response.answer;
          } else {
            //display error message in popup
            document.getElementById("answer").textContent = "Sorry, an error occurred while fetching the answer.";
          }
        });
      } else {
        //display error message in popup
        document.getElementById("answer").textContent = "Sorry, unable to get the question.";
      }
    });
  });
  
  //popup.css
  
  /* add your CSS styles here */
  
  