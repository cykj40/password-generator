// Assignment code here
function generatePassword(){
    var length = window.prompt("choose password length between 8 and 128")
    char = "abcdefghijklmnopqrstuvwkyz123456789!@#$%^&*()-_=+ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    passwordText = [""]
     for(i=0;i < length; i++){
        passwordText += char.charAt(Math.floor(Math.random() * char.length)) 
       
     } return passwordText
    };
    
    
    
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