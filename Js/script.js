// Assignment code here
function generatePassword(){
  var lowerCaseSet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
  var upperCaseSet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
  var numberSet = ["0","1","2","3","4","5","6","7","8","9"];
  var special =[ "!","@","#","$","%","^","&","*","(",")","_","-","+","=","{","}","[","]","|",";",":","<",">","?","/"];
  var selectedArray = [];

  var passwordLength = prompt("How many characters would you like your password to be? (8-128)");
  if (passwordLength < 8 || passwordLength > 128){
    alert("Please enter a number between 8 and 128");
    return;
  }
  
  var lowerCase = confirm("Would you like to include lowercase letters?");
  var upperCase = confirm("Would you like to include uppercase letters?");
  var numbers = confirm("Would you like to include numbers?");
  var specialCharacters = confirm("Would you like to include special characters?");

  // only add to selectedArray if user confirms
  if (lowerCase === false && upperCase === false && numbers === false && specialCharacters === false){
    alert("Please select at least one character type");
    return;
  }
  if (lowerCase === true){
    selectedArray = selectedArray.concat(lowerCaseSet);
  }
  if (upperCase === true){
    selectedArray = selectedArray.concat(upperCaseSet);
  }
  if (numbers === true){
    selectedArray = selectedArray.concat(numberSet);
  }
  if (specialCharacters === true){
    selectedArray = selectedArray.concat(special);
  }
  var password = "";
  for (var i = 0; i < passwordLength; i++){
    var randomIndex = Math.floor(Math.random() * selectedArray.length);
    password = password + selectedArray[randomIndex];
  }
  return password;
}

// Get references to the #generate element
var generateBtn = document.querySelector("#generate");

// Write password to the #password input
function writePassword() {
  var password = generatePassword();
  var passwordText = document.querySelector("#password");

  passwordText.value = password;

}

// Add event listener to generate button
generateBtn.addEventListener("click", writePassword);




    
    
  