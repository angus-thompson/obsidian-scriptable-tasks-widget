


# obsidian-scriptable-tasks-widget
![A5927A3A-60DE-4A3A-8324-114FDF7CA5BB](https://user-images.githubusercontent.com/98095245/225629458-ec7bdbeb-2734-460a-ba18-7e3316a5894f.jpeg)

This is javascript code to display my tasks from obsidian in an iPad OS extra large widget using [Scriptable](https://scriptable.app)

There are a few steps to set up. First you need to designate a bookmarked path in the scriptable app. Then you can change the required variables in the script and it should basically work

That is assuming your daily notes are sorter into DailyNotes/Years/Months/dailynote.md format. If they aren't you might need to do some editing of the file finder function.

It is annoying having to launch the scriptable app each time a link is clicked, however I think this is just a limitation of how ios handles uri links.

This is my first Javascript project so I am sure there are lots of technical issue with it, however it runs and it works for what I need

Also, apparently there may be some issues if there are too many daily notes, however I have not run into this issue

Feel free to edit this, improve upon it, I'm not quite sure how github works but if you can submit improvements to here that would be appreciated.

Again it's not the prettiest and best solution probably, but its the best ive seen and can use.

(Also this assumes your scriptable files are accessible with the bookmarked path "Scriptable" -- this is for the checkmark images)

### **INSTALLATION STEPS**

Add the images to your scriptable folder
Change the variables Vault and Root to the required paths for accessing your obsidian files

Add a widget to your homescreen, in the widget paramaters type in the task lists that you would like to show (smaller widgets than extraLarge are really only good at showing one list) Format for this is -- Today|Tomorrow|Two Weeks etc.

Should be all good

Do note that spacing and things are hard coded and probable need to be edited depending on your phone or device. The values to edit this would be the widgetheight variable. Also textsize and max displayed lines are easily changable



