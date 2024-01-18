 // Get DOM elements
 let textarea = document.querySelector("#textarea");
 let level = document.querySelector("#level");
 let button = document.querySelector("#button");
 let gameBoard = document.querySelector(".gameBoard");
 let task = document.querySelector("#task");
 let scoreDisplay = document.querySelector("#score");
 let game = document.querySelector("#game");

 // Google sheets integration options
 let GOOGLE_SHEETS_ID = '1MGOuCvGzokBjuqsbMX3XVebwXfE-8utX5nlIr3LC0ik';
 let GOOGLE_SHEETS_NAME = "GameLeaderBoard";
 let GOOGLE_SHEETS_RANGE = "A2:D1000";
 let GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/' + GOOGLE_SHEETS_ID + "/gviz/tq?sheet=" + GOOGLE_SHEETS_NAME + '&range=' + GOOGLE_SHEETS_RANGE;

 // Nickname | Input and button
 let nickNameForm = document.querySelector("#nickName");
 let nickName = document.querySelector('#nickName input');
 let nickNameBtn = document.querySelector('#nickName button');

 // Group | Input and button
 let groupForm = document.querySelector("#guruh");
 let group = document.querySelector('#guruh input');
 let groupBtn = document.querySelector('#guruh button');

 // Initialize game state
 let gameLevel = parseInt(localStorage.getItem('gameLevel')) || 1;
 let storedNickname = localStorage.getItem('nickname');
 let storedGroup = localStorage.getItem('group');
 let nicknameMatch = storedNickname !== null && storedNickname !== '';
 let groupMatch = storedGroup !== null && storedGroup !== '';
 let score = (nicknameMatch && groupMatch) ? parseInt(localStorage.getItem('score')) || 0 : 0;
 let levelScores = [10, 20, 30];
 let questions = [
   `1-savol: Rasmlarni yonma-yon qil.`,
   `2-savol: Rasmlarni yonma-yon qilib, "justify-content orqali" centerga o'tkaz`,
   `3-savol: Rasmlarni "justify-content orqali" orasidan joy och`,
 ];
 let answers = [
   'display: flex;',
   'display: flex;\\s*justify-content:\\s*center;',
   'display: flex;\\s*justify-content:\\s*space-between;',
 ];

 // Check nickname and group existence in localStorage
 if (nicknameMatch && groupMatch) {
   // Both nickname and group exist, show the gameBoard
   nickNameForm.classList.add("hidden");
   groupForm.classList.add("hidden");
   game.classList.add("flex");
 } else if (nicknameMatch) {
   // Only nickname exists, show the groupForm
   nickNameForm.classList.add("hidden");
   groupForm.classList.add('flex');
 } else {
   // Neither nickname nor group exist, show the nickNameForm
   nickNameForm.classList.add('flex');
   groupForm.classList.add("hidden");
   game.classList.add("hidden");
 }

 // Set initial UI state
 level.textContent = `Game Level - ${gameLevel}`;
 task.innerHTML = questions[gameLevel - 1];
 updateScoreDisplay();

 // Event listener for the "Next Level" button
 button.addEventListener("click", () => {
   if (checkAnswer(textarea.value.trim(), answers[gameLevel - 1])) {
     // Correct answer
     score += levelScores[gameLevel - 1];
     localStorage.setItem('score', score);
     updateScoreDisplay();
     showCorrectAnswerFeedback();
     if (gameLevel < questions.length) {
       gameLevel++;
       localStorage.setItem('gameLevel', gameLevel);
       level.textContent = `Game Level - ${+gameLevel}`;
       task.innerHTML = questions[gameLevel - 1];
       textarea.value = "";
     } else {
       level.textContent = "GAME OVER or LEVEL COMPLETED";
       task.innerHTML = "";
       textarea.disabled = true;
       button.disabled = true;
     }
   } else {
     // Incorrect answer
     level.textContent = "Incorrect Answer!";
     showIncorrectAnswerFeedback();
     score -= 5;
     updateScoreDisplay();
   }
   submitToGooogleSheets()
 });

 // Event listener for Enter key press in textarea
 textarea.addEventListener("keydown", (e) => {
   if (e.key === "Enter") {
     gameBoard.style.cssText = `${textarea.value}`;
   }
 });

 // Event listener for nickname form submission
 nickNameBtn.addEventListener("click", (e) => {
   e.preventDefault();
   localStorage.setItem('nickname', nickName.value);
   storedNickname = localStorage.getItem('nickname');
   nicknameMatch = storedNickname !== null && storedNickname !== '';

   nickNameForm.classList.add("hidden");
   nickNameForm.classList.remove("flex");

   groupForm.classList.add('flex');
   groupForm.classList.remove('hidden');
 });

 // Event listener for group form submission
 groupBtn.addEventListener("click", (e) => {
   e.preventDefault();
   localStorage.setItem('group', group.value);
   storedGroup = localStorage.getItem('group');
   groupMatch = storedGroup !== null && storedGroup !== '';

   groupForm.classList.remove("flex");
   groupForm.classList.add("hidden");

   game.classList.add("flex");
   game.classList.remove("hidden");
 });

 // Function to update the score display
 function updateScoreDisplay() {
   scoreDisplay.textContent = `${score}`;
 }

 // Function to show correct answer feedback
 function showCorrectAnswerFeedback() {
   textarea.classList.remove('shadow-red-700');
   textarea.classList.add('shadow-amber-700');
 }

 // Function to show incorrect answer feedback
 function showIncorrectAnswerFeedback() {
   level.textContent = "Incorrect Answer!";
   textarea.classList.add('shadow-red-700');
   textarea.classList.remove('shadow-amber-700');
 }

 // Function to check if a string matches a regular expression
 function checkAnswer(input, answer) {
   const regex = new RegExp(answer, 'i'); // Case-insensitive match
   return regex.test(input);
 }

 // Include the code for initializing the Google API client and using the Sheets API
 gapi.load('client', initClient);

 function initClient() {
   // Initialize the Google Sheets API client with OAuth2
   gapi.client.init({
     clientId: '1005351879282-4sto82ljptcq33v93f8lkfiq7q3rbm3v.apps.googleusercontent.com',
     scope: 'https://www.googleapis.com/auth/spreadsheets',
   }).then(() => {
     // Now you can use the Google Sheets API with OAuth2
     addData();
   });
 }

 function addData() {
   let values = [
     [gameLevel, storedNickname, storedGroup]
   ];

   // The ID of the spreadsheet.
   let spreadsheetId = '1MGOuCvGzokBjuqsbMX3XVebwXfE-8utX5nlIr3LC0ik';

   // The range of the spreadsheet.
   let range = 'GameLeaderBoard!A2:D1000';

   // Call the Sheets API to append the data
   gapi.client.sheets.spreadsheets.values.append({
     spreadsheetId: spreadsheetId,
     range: range,
     valueInputOption: 'RAW',
     insertDataOption: 'INSERT_ROWS',
     resource: {
       values: values
     }
   }).then((response) => {
     console.log('Data added successfully', response);
   }, (error) => {
     console.error('Error adding data', error);
   });
 }

 addData();