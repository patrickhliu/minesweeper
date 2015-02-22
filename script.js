/****************************************************
*******************Minesweeper***********************
*******All code is written in vanilla JS*************
*****************************************************/

/****************************************************
*******************Variables*************************
*****************************************************/
var gameboard = document.querySelector('.gameboard');                   // gameboard is the container div containing all 9x9 or 12x12 squares
var selectBtn = document.querySelector('.selectBtn');                   // the 'submit' button on the radio button form
var newGameBtn = document.querySelector('.newGameBtn');                 // the 'new game' button above the game board
var gameOptions = document.getElementsByName('game-options');           // node list of the two radio button choices for 9x9 or 12x12
var flagDisplay = document.querySelector('.flagDisplay span');          // the # of bombs on the board shown in the "bombs left" box

var bombArr = [];               // array of objects, each object represents an individual square on the gameboard
var bombLoc = [];               // an array containing #s.  Each # is the square # that is a bomb
var rowNum = -1;                // row number for the game board, row #s start at 0.  Variable is first incrememented to start at row 0
var boardSize;                  // the # of rows/columns.  9 if "9x9", 12 if "12x12"
var numOfBombs;                 // either 10 or 40 bombs, based on users choice of "9x9" or "12x12"
var firstRow;                   // variable to store first row #, which will be 0
var lastRow;                    // variable to store last row #, which will either be 9 or 12
var firstCol;                   // variable to store first col #, which will be 0
var lastCol;                    // variable to store last col #, which will be 9 or 12
var allSq;                      // varible for nodelist of all individual squares in the game board.
var victory;                    // variable to store the # of clean squares needed to win the game
var victoryCount = 0;           // variable to keep track of the # of clean squares the user has gotten so far

var hour = 0;       // variables for the hour, minute & second number in timer
var min  = 0;
var sec  = 0;

/********************************************************************************************
*   event listener for when the user chooses a radio option and clicks the 'Submit' Button
********************************************************************************************/
selectBtn.addEventListener('click', function (e) {
    e.preventDefault();                                         // prevent the form submission

    for (var j=0; j<gameOptions.length; j++) {                  // loop through each radio button
        if (gameOptions[j].checked) {                           // if the radio button is selected
            switch(gameOptions[j].value) {                      // check the value of the selected radio button
                case '1':                                       // if 1, initialize variables for 9x9
                    boardSize = 9;
                    numOfBombs = 10;
                    firstRow = 0;
                    lastRow = boardSize-1;
                    firstCol = 0;
                    lastCol = boardSize-1;
                    break;  
                case '2':                                       // if 2, initialize variables for 12x12
                    boardSize = 12;
                    numOfBombs = 40;
                    firstRow = 0;
                    lastRow = boardSize-1;
                    firstCol = 0;
                    lastCol = boardSize-1;
                    break;
            }

          startGame();      // with variables initialized, call this function to generate the gameboard squares
        } 
    } 

    // once the user makes a choice...
    document.querySelector('form').classList.add('off');                // hide the radio button form
    document.querySelector('.panel').classList.remove('off')            // show the panel div (remaining flags, timer, new game button)
    document.querySelector('.gameboard').classList.remove('off')        // show the gameboard div
    flagDisplay.textContent = numOfBombs;                               // set flagDisplay element equal to remaining bombs, it'll be 10 or 40
    victory = (boardSize * boardSize) - numOfBombs;                     // set victory variable (# of clean squares user needs to find)

    // set interval function to increment the timer and display it
    setInterval(function() {
        sec++;

        if (sec < 10) {
            document.querySelector('.sec').textContent = '0' + sec; 
        }
        else if ( sec < 60) {
            document.querySelector('.sec').textContent = sec;       
        }
        else {
            sec = 0;
            min++;

            if ( min < 10 ) {
                document.querySelector('.min').textContent = '0' + min;         
                document.querySelector('.sec').textContent = '0' + sec; 
            }
            else if ( min < 60) {
                document.querySelector('.min').textContent = min;           
                document.querySelector('.sec').textContent = '0' + sec; 
            }
            else {
                sec = 0;
                min = 0;
                hour++;

                if (hour < 10) {
                    document.querySelector('.hour').textContent = '0' + hour;           
                    document.querySelector('.min').textContent = '0' + min; 
                    document.querySelector('.sec').textContent = '0' + sec; 
                }
                else {
                    document.querySelector('.hour').textContent = hour;         
                    document.querySelector('.min').textContent = '0' + min; 
                    document.querySelector('.sec').textContent = '0' + sec;     
                }
            }           
        }   
    }, 1000);   
})

/********************************************************************************************
*  Event handler for 'new game' button.  Some variables need to be re-intialized, 
*  then call the startGame() to generate the gameboard square div elements
********************************************************************************************/
newGameBtn.addEventListener('click', function() {
    victoryCount = 0;
    rowNum = -1;
    bombArr = [];
    bombLoc = [];
    gameboard.innerHTML = '';
    hour = 0;
    min = 0;
    sec = 0;
    document.querySelector('.hour').textContent = '0' + hour;           
    document.querySelector('.min').textContent = '0' + min; 
    document.querySelector('.sec').textContent = '0' + sec;
    startGame();
})

/********************
*  Helper Functions
********************/

// This function returns a random number in between a min - max pair of numbers that are passed in as arguments.
function randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// This function returns an array containing the id numbers of all surrouding squares for the single square that calls this function
function patternPick(pattern, sqNum) {          // pass in the string name of a wanted pattern, and the square id number of the square calling this function
    var temp = [];

    // switch statement calculates the id #'s of the surrouding squares that need to be checked.
    switch(pattern) {
        case '8':  // 8 means all 8 surrounding squares
            temp = [sqNum-(boardSize+1), sqNum-boardSize, sqNum-(boardSize-1), sqNum-1, sqNum+1, sqNum+(boardSize-1), sqNum+boardSize, sqNum+(boardSize+1)];
            break;
        case '5top':  // 5top means top left - top - top right - left - right
            temp = [sqNum-(boardSize+1), sqNum-boardSize, sqNum-(boardSize-1), sqNum-1, sqNum+1];
            break;
        case '5bot':  // 5bot means left - right - bottom left - bottom - bottom right
            temp = [sqNum-1, sqNum+1, sqNum+(boardSize-1), sqNum+boardSize, sqNum+(boardSize+1)];
            break;
        case '5right':  // 5right means top - bottom - top right - right - bottom right
            temp = [sqNum-boardSize, sqNum-(boardSize-1), sqNum+1, sqNum+boardSize, sqNum+(boardSize+1)];
            break;
        case '5left':  // 5left means top - bottom - top left - left - bottom left
            temp = [sqNum-(boardSize+1), sqNum-boardSize, sqNum-1, sqNum+(boardSize-1), sqNum+boardSize];
            break;
        case 'TL':    // TL means right - bottom - bottom right
            temp = [sqNum+1, sqNum+boardSize, sqNum+boardSize+1];
            break;
        case 'BL':  // BL means top - right - top right
            temp = [sqNum-boardSize, sqNum-(boardSize-1), sqNum+1];
            break;
        case 'TR':  // TR means left - bottom - bottom left
            temp = [sqNum-1, sqNum+(boardSize-1), sqNum+boardSize];
            break;
        case 'BR':  // BR means top - left - top left
            temp = [sqNum-(boardSize+1), sqNum-boardSize, sqNum-1];
            break;
    }

    return temp;
}

// This function is responsible for counting the number of bombs surrounding a square on the grid.
// function is passed the string name of the wanted pattern, bombCount is always passed in as 0, and the id # of the square calling this function
function countBombs(pattern, bombCount, sqNum) {        
    
    var patternArr = patternPick(pattern, sqNum);               // local array containing the id #'s of surrounding squares
    
    for (var i=0; i < patternArr.length; i++) {                 // cycle through the surrounding squares
        if(bombArr[ patternArr[i] ].marker ==='b') {            // if that surrouding square is a bomb...
            bombCount++;                                        // increment bombCount
        }       
    }

    return bombCount;                                           // return bombCount to calling square
}

// When the user clicks on a clean square (zero bombs surrouding it), then all surrounding bombs need to be revealed as well.
// This function takes care revealing those surrounding squares
function revealOthers(row, col, z) {                                              // pass in the row, col, and id# of the calling square
    var patternArr2 = [];                                                         // local array to store surrounding square id #'s 

    if (row > firstRow && row < lastRow && col > firstCol && col < lastCol) {     // based on what the row & col are, get the id #'s of surrounding squares
        patternArr2 = patternPick('8', z);
    }
    else if (row === firstRow && col !== firstCol && col !== lastCol) {
        patternArr2 = patternPick('5bot', z);
    }
    else if (row === lastRow && col !== firstCol && col !== lastCol) {
        patternArr2 = patternPick('5top', z);
        }
    else if (col === firstCol && row !== firstRow && row !== lastRow) {
        patternArr2 = patternPick('5right', z);
        }
    else if (col === lastCol && row !== firstRow && row !== lastRow) {
        patternArr2 = patternPick('5left', z);
        }
    else if (col === firstCol && row === firstRow) {
        patternArr2 = patternPick('TL', z);
        }
    else if (col === firstCol && row === lastRow) {
        patternArr2 = patternPick('BL', z);
    }
    else if (col === lastCol && row === firstRow) {
        patternArr2 = patternPick('TR', z);
    }
    else if (col === lastCol && row === lastRow) {
        patternArr2 = patternPick('BR', z);
    }

    // next line adds 'inspect' css class to the calling square.  this is a dummy class, it doesn't exist in the CSS file.
    // any 'zero' square will have surrounding squares revealed.  In turn, if any of those surrounding squares
    // turns out to be 'zero' as well, they need to call revealOthers() so all further surrounding squares are revealed.
    // squares marked with 'inspect' means that square has already had it's surrounding squares revealed, 
    // you don't need to call revealOthers() again for that square since it's already done it.
    // marking a square as 'inspect' will avoid recursive call stack errors.
    document.querySelector('.num_' + (z)).classList.add('inspect');             

    // loop through each surrounding square of the calling square, we're wanting to reveal them
    for (var i=0; i<patternArr2.length; i++) {

        // if the surrounding square hasn't been revealed...
        if ( !document.querySelector('.num_' + patternArr2[i]).classList.contains('reveal') ) {
            document.querySelector('.num_' + (patternArr2[i])).classList.add('reveal');                         // add 'reveal class'
            document.querySelector('.num_' + (patternArr2[i])).textContent = bombArr[patternArr2[i]].bCount;    // display the bombCount of that surrounding square
            victoryCount++;                                                                                     // increment victoryCount (# of clean squares so far)
            victoryCheck();                                                                                     // check if we've won the game
        }
    }

    // loop through each surrounding square of the calling square, if any are 'zero', 
    // check if the square has 'inspect' dummy class, meaning it's already has all surrounding squares revealed.
    // if not, then call revealOthers to reveal further surrounding squares
    for (var i=0; i<patternArr2.length; i++) {
        if ( bombArr[ patternArr2[i] ].bCount === 0 ) {         
            if( document.querySelector('.num_' + patternArr2[i]).classList.contains('inspect') ) {
            }
            else {
                revealOthers( bombArr[ patternArr2[i] ].row, bombArr[ patternArr2[i] ].col, bombArr[ patternArr2[i] ].marker)
            }           
        }
    }
}

// this function updates the "flags left" counter on screen
function updateBombs() {
    flagDisplay.textContent = numOfBombs;
}

// this function checks is user has un-covered the last clean square
// when that happens the user has won the game
function victoryCheck() {
    if (victoryCount === victory) {
        alert('You Win! ' + document.querySelector('.timeDisplay').textContent + ' Press OK to start a new game');
        window.location.assign('http://pliu82.github.io/minesweeper/');
    }
    else {
        
    }
}

/****************************************************
******************Main Code**************************
*****************************************************/
function startGame () {

// This for loop will fill the bombLoc array with the id #'s of bobm squares
for (var i = 0; i < numOfBombs; i ++) {                         // numOfbombs is either 10/40.  So there'll be 10/40 bomb squares
    var num = randomNum(0, ((boardSize * boardSize) - 1) );     // 9x9, squares 0-80.  12x12, squares 0-143.  get a random sq # from 0-80 or 0-143.
    
    if ( bombLoc.indexOf(num) !== -1) {                         // if the random number is already inside bombLoc array,
        i--;                                                    // decrement counter to try again with a different random number (need unique numbers)
    }
    else {
        bombLoc.push(num);                                      // else the random number isn't inside bombLoc, push it in there
    }
}

// this for loop generates all the square div elements inside the game board
// bombArr is an array containing objects.  Each object is for each square on the game board.
// each object has several properties:  marker (tells if square is bomb or not), row #, col #, bCount (count of bombs in surrounding squares)
for (var x = 0; x < (boardSize * boardSize); x ++) {                // We'll create either 81 (0-80) or 144 (0-143) squares total
    for (var y = 0; y < bombLoc.length; y++) {                      // At each square, 
        if ( bombLoc.indexOf(x) !== -1 ) {                          // check if that square id # is inside bombLoc.
            bombArr[x] = { marker: 'b', col: x % boardSize };       // if so, this particular square will have it's marker property set as 'b' for bomb
        }                                                           // also set col # property.
        else {
            bombArr[x] = { marker: x, col: x % boardSize };         // else it's marker property is set to it's square id #
        }
    }

    if (x % boardSize === 0) {                                      // row #s are multiples of the boardSize (eg: 0, 9, 18, etc...) 
        rowNum++;                                                   // so whenever we come across a square id # that's a multiple, that is a new row
    }                                                               // increment the rowNum variable

    bombArr[x].row = rowNum;                                        // set the row property equal to rowNum

    var newDiv = document.createElement('div');                     // create a new div for each square

    if ( x % boardSize === 0 ) {                                    // when we come across a new row, give it the 'new-row' class.  
        newDiv.className = 'new-row square num_' + x;               // It clears float in CSS to start on next line.
    }                                                               
    else {
        newDiv.className = 'square num_' + x;                       // else don't give it the 'new-row' class.
    }
    /*
    if ( bombArr[x].marker === 'b') {                             // this code is un-commented only when troubleshooting.
      newDiv.textContent = 'B';
    }
    */
    gameboard.appendChild(newDiv);                                  // append each new div element into gameboard
}

gameboard.style.width = (boardSize * 40) + 'px';                    // inline CSS to set the width of the container, whether it's 9 or 12 squares.

// This function cycles through each square, & for every square that isn't a bomb, calculates the # of surrounding bombs 
// Take that calculated # and store it into bombArr object as a property called 'bCount'
// The commented lines are used only when troubleshooting
for (var z = 0; z < (boardSize * boardSize); z++) { 
    if (bombArr[z].marker !== 'b') {
        if (bombArr[z].row > firstRow && bombArr[z].row < lastRow && bombArr[z].col > firstCol && bombArr[z].col < lastCol) {       
            //document.querySelector('.num_' + z).textContent = countBombs('8', 0, bombArr[z].marker);
            bombArr[z].bCount = countBombs('8', 0, bombArr[z].marker)
        }
        else if (bombArr[z].row === firstRow && bombArr[z].col !== firstCol && bombArr[z].col !== lastCol) {
            //document.querySelector('.num_' + z).textContent = countBombs('5bot', 0, bombArr[z].marker);
            bombArr[z].bCount = countBombs('5bot', 0, bombArr[z].marker);
        }
        else if (bombArr[z].row === lastRow && bombArr[z].col !== firstCol && bombArr[z].col !== lastCol) {
            //document.querySelector('.num_' + z).textContent = countBombs('5top', 0, bombArr[z].marker);
            bombArr[z].bCount = countBombs('5top', 0, bombArr[z].marker);
        }
        else if (bombArr[z].col === firstCol && bombArr[z].row !== firstRow && bombArr[z].row !== lastRow) {
            //document.querySelector('.num_' + z).textContent = countBombs('5right', 0, bombArr[z].marker);
            bombArr[z].bCount = countBombs('5right', 0, bombArr[z].marker);
        }
        else if (bombArr[z].col === lastCol && bombArr[z].row !== firstRow && bombArr[z].row !== lastRow) {
            //document.querySelector('.num_' + z).textContent = countBombs('5left', 0, bombArr[z].marker);
            bombArr[z].bCount = countBombs('5left', 0, bombArr[z].marker);
        }
        else if (bombArr[z].col === firstCol && bombArr[z].row === firstRow) {
            //document.querySelector('.num_' + z).textContent = countBombs('TL', 0, bombArr[z].marker);
            bombArr[z].bCount = countBombs('TL', 0, bombArr[z].marker);
        }
        else if (bombArr[z].col === firstCol && bombArr[z].row === lastRow) {
            //document.querySelector('.num_' + z).textContent = countBombs('BL', 0, bombArr[z].marker);
            bombArr[z].bCount = countBombs('BL', 0, bombArr[z].marker);
        }
        else if (bombArr[z].col === lastCol && bombArr[z].row === firstRow) {
            //document.querySelector('.num_' + z).textContent = countBombs('TR', 0, bombArr[z].marker);
            bombArr[z].bCount = countBombs('TR', 0, bombArr[z].marker);
        }
        else if (bombArr[z].col === lastCol && bombArr[z].row === lastRow) {
            //document.querySelector('.num_' + z).textContent = countBombs('BR', 0, bombArr[z].marker);
            bombArr[z].bCount = countBombs('BR', 0, bombArr[z].marker);
        }
    }   
}

// allSq is a node list containing all divs representing the squares
allSq = document.querySelectorAll('.square');


// cycle through each div and add event handlers for user interaction
for (var j = 0; j < allSq.length; j++) {
    allSq[j].addEventListener('contextmenu', (function(j) {                 // first event handler is when user right-clicks on a square
        return function() {     
            
            if (!this.classList.contains('reveal')) {                       // if square hasn't been revealed...
                this.classList.toggle('flag');                              // toggle flag class to denote that square cannot be left-clicked on    
            }
            else {
                alert('Can\'t flag a revealed square');
            }
            

            if ( this.classList.contains('flag') ) {                        // if that class is flagged / not flagged, then update the # of remaining flags
                numOfBombs--;   
                updateBombs();
                this.textContent = 'F';
            }
            else if ( !this.classList.contains('flag') && !this.classList.contains('reveal')) {
                numOfBombs++;   
                updateBombs();
                this.textContent = '';

                /*  Troubleshooting code only
                if (bombArr[j].bCount) {
                    this.textContent = bombArr[j].bCount;
                }
                else {
                    this.textContent = 'B';   
                }
                */
            }

        }       
    })(j));

    allSq[j].addEventListener('contextmenu', function(e) {                  // this event handler suppresses the windows menu on right click
            e.preventDefault();
        });     

    allSq[j].addEventListener('click', (function(j) {                       // event handler for left-clicks on squares
        return function () {
            
            // when square is not a bomb && it's not flagged && hasn't already been revealed...
            if (bombArr[j].marker !== 'b' && !this.classList.contains('flag') && !this.classList.contains('reveal')){                
                this.textContent = bombArr[j].bCount;                                           // show the squares bomb count
                this.classList.add('reveal');                                                   // reveal it
                victoryCount++;                                                                 // increment victoryCount (# of clean squares so far)
                victoryCheck();                                                                 // check if user has obtained victory yet

                if(bombArr[j].bCount === 0) {                                                // if it's a zero square...                
                    revealOthers(bombArr[j].row, bombArr[j].col, bombArr[j].marker );               // revealOthers() to reveal surrounding squares                    
                }
            }
            else if (allSq[j].classList.contains('flag')) {                                 // if square is flagged, alert user
                alert('You can\'t click on a flagged square');
            }
            else if ( bombArr[j].marker === 'b' ) {                                         // if square is a bomb...
                for (var a = 0; a < bombLoc.length; a++) {                                  // cycle through all bomb locations
                    allSq[ bombLoc[a] ].textContent = 'B';                                  // display B for bomb
                    allSq[ bombLoc[a] ].classList.add('bomb');                              // add CSS class styling
                }

                alert('BOMB! Press OK to start another game');                              // alert user game over
                window.location.assign('http://pliu82.github.io/minesweeper/');               // go back to home page
            }
        };
    })(j));
}

}//end startGame()