************************************************************************
****************************READ ME FIRST*******************************

To run test gamereward sdk project:

1. Create application:
+Go to gamereward developer portal: https://gamereward/io/developer
+Create your application with type: UNMANAGED USER APP
+Add server script to your app with name:testscript, the content of script in the file serverscript.js
+Open application detail to copy the appid and api secret for your app.

2. Run Test

a. Config the application:
+Open file test.js
+Change the value of two variable:
reward.init('[YOUR APP ID]', '[YOUR APP SECRET KEY]',[true: for real net,false: for testnet]);
b. Run:
   node test
c. NOTES: For some action you need transfer GRD to the application wallet and player wallet to test function

************************THANKS FOR USING OUR SERVICE*********************


  