# post.visualizations
Visualization Website for the Plant Operations Smartphone Tracker (POST) team of AguaClara. This app is used by AguaClara plant operators to visualize their plant performance data submitted with the post.collect application. 

## Developing
We use both [Jekyll](http://jekyllrb.com/) and [Phonegap](http://phonegap.com/) to build a web app that we can send to the [Playstore here](https://play.google.com/store/apps/details?id=org.aguaclara.post.visualizations). Jekyll enables us to reduce code duplication by using include statements and layouts, and organizes our website/app structure. Jekyll reads the _config.yml document located in the root of the repo to determine which folder jekyll uses as source. When Jekyll is ran, it will build the resulting website in a statically accessible manner in the specified destination folder (the www folder). Therefore only files in the "source" folder should be edited, whereas editing a file in the "www" folder will just get overwritten the next time Jekyll is ran to build the static site. Once you are done editing a source file, you can test the code by running `jekyll serve` to start a server on your localhost (you must have [Jekyll installed locally](https://jekyllrb.com/docs/installation/) for this to work). Once satisfied, you can build the apk using the cordova command line tool with the following command: `cordova build android`. That will generate a development apk. To make a signed apk, follow [this wiki page](https://github.com/AguaClara/POST/wiki/Signing-the-APK-and-uploading-to-Play-Store)

## Running in the Android emulator
You can run the app in the Android emulator with this comand: `cordova run android`. By default, your emulator will run extremely slowly. We recommend installing the Intel x_86 system image to get 10x better performance using [this guide.](http://stackoverflow.com/questions/2662650/making-the-android-emulator-run-faster) 

## Generating a signed APK
You should just need to run `cordova build android --release` and it will request the password for the keystore, which is located in the password doc. The path to the signed apk will show up in the terminal. If you're recieving an error, you can add the `-d` flag. This command looks for the keystore in the location specified here in the /platforms/android/release-signing.properties file. 

## Upload apk
* You need a signed release apk ready to upload to the store for this step (see above)
* simply sign onto the POST AguaClara email account (credentials in drive) and upload the apk to [here](https://play.google.com/apps/publish/?dev_acc=18423817182957885233#ApkPlace:p=tmp.18423817182957885233.1463749987830)
