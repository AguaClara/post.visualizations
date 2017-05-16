# post.visualizations
Visualization app for the Plant Operations Smartphone Tracker (POST) team of AguaClara. This app is used by AguaClara plant operators to visualize their plant performance data submitted with the post.collect application. 

## Developing
We use both [Jekyll](http://jekyllrb.com/) and [Phonegap](http://phonegap.com/) to build a web app that we can send to the [Playstore here](https://play.google.com/store/apps/details?id=org.aguaclara.post.visualizations). Jekyll enables us to reduce code duplication by using include statements and layouts, and organizes our website/app structure. Jekyll reads the _config.yml document located in the root of the repo to determine which folder jekyll uses as source to build the website. Jekyll builds the resulting website in the specified destination folder (the www folder). Therefore only files in the "source" folder should be edited, whereas editing a file in the "www" folder will just get overwritten the next time Jekyll is ran to build the static site. Once you are done editing a source file, you can test the code by running `jekyll serve` to start a server on your localhost (you must have [Jekyll installed locally](https://jekyllrb.com/docs/installation/) for this to work). Once satisfied, you can build the apk using the cordova command line tool with the following command: `cordova build android`. That will generate a development apk.

## Running in the Android emulator
You can run the app in the Android emulator with this comand: `cordova run android`. By default, your emulator will run extremely slowly. We recommend installing the Intel x_86 system image to get 10x better performance using [this guide.](http://stackoverflow.com/questions/2662650/making-the-android-emulator-run-faster) 

## Generating a signed APK
You should just need to run `cordova build android --release` and Cordova will build an unsigned APK and put it in `platforms\android\build\outputs\apk`. The path to the un-signed apk will show up in the terminal (may be different). If you're recieving an error, you can add the `-d` flag to see why. Now you need to sign your app. You should follow [this guide](http://stackoverflow.com/questions/26449512/how-to-create-a-signed-apk-file-using-cordova-command-line-interface) (step 5) for signing. Long story short: `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore <keystorename <Unsigned APK file> <Keystore Alias name>` Find the keystore and keystore password and alias in the drive Passwords/Certs folder.
  

## Upload apk
* Make sure you increment the version code from the last time the apk was uploaded. The version code is located in the config.xml file in the first tag. 
* You need a signed release apk ready to upload to the store for this step (see above)
* simply sign onto the POST AguaClara email account (credentials in drive) and upload the apk
* upload to beta first, "promote" to production after verification

## Adding plugins or platforms
We don't save the platforms and plugins file to github, and therefore we need to save a state of supported platforms and plugins to the config file of Cordova. This can be done by running `$cordova platform save` and `$cordova plugin save`. Now the updated state is saved in the config.xml file.
